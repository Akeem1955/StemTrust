import { MeshWallet, BlockfrostProvider, MeshTxBuilder, serializePlutusScript, deserializeAddress, Data } from '@meshsdk/core';
import { applyParamsToScript } from "@meshsdk/core-csl";
import fs from 'fs';
import path from 'path';

// Load blueprint
// Assuming running from Backend root
const blueprintPath = path.resolve(process.cwd(), 'smartcontract/plutus.json');
let blueprint: any;

try {
    if (fs.existsSync(blueprintPath)) {
        blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf-8'));
    } else {
        console.warn(`Blueprint not found at ${blueprintPath}`);
    }
} catch (e) {
    console.error("Error loading blueprint:", e);
}

let provider: BlockfrostProvider;
let wallet: MeshWallet;

export function initSmartContract() {
    const blockfrost = process.env.BLOCKFROST;
    const mnemonic = process.env.mnemonic;

    if (blockfrost && mnemonic) {
        provider = new BlockfrostProvider(blockfrost);
        wallet = new MeshWallet({
            networkId: 0, // 0: testnet, 1: mainnet
            fetcher: provider,
            submitter: provider,
            key: {
                type: 'mnemonic',
                words: mnemonic.split(" "),
            },
        });
    } else {
        console.warn("Blockchain environment variables missing (BLOCKFROST, mnemonic). Smart contract features will be disabled.");
    }
}

// Initialize immediately if env vars are present (for backward compatibility if imported after dotenv)
if (process.env.BLOCKFROST && process.env.mnemonic) {
    initSmartContract();
}

export function getScript() {
    if (!blueprint) throw new Error("Blueprint not loaded");

    // Find the stem_trust validator
    const validator = blueprint.validators.find((v: any) => v.title === "stemtrust.stem_trust.spend");

    if (!validator) {
        throw new Error("Validator 'stemtrust.stem_trust.spend' not found in blueprint.");
    }

    const scriptCbor = applyParamsToScript(
        validator.compiledCode,
        []
    );

    const scriptAddr = serializePlutusScript(
        { code: scriptCbor, version: "V3" },
    ).address;

    return { scriptCbor, scriptAddr };
}

export function getTxBuilder() {
    if (!provider) throw new Error("Provider not initialized");
    return new MeshTxBuilder({
        fetcher: provider,
        submitter: provider,
    });
}

// Export buildDatum for consistency with frontend/other parts
// But internal logic uses direct object construction to match test_project_flow.ts
export function buildDatum(params: {
    organization: string;
    researcher: string;
    members: string[];
    totalFunds: number;
    milestones: number[];
    currentMilestone: number;
}) {
    const datum = {
        alternative: 0,
        fields: [
            params.organization,
            params.researcher,
            params.members,
            params.totalFunds,
            params.milestones,
            params.currentMilestone
        ],
    };
    return datum;
}

// ============ Step 1: Lock Funds ============
export async function lockFunds(
    totalFunds: number,  // Input in ADA
    milestones: { percentage: number }[],
    organizationHash: string,
    researcherHash: string,
    members: string[]
) {
    if (!wallet) throw new Error("Wallet not initialized");

    console.log('═══════════════════════════════════════════════════════');
    console.log('  STEP 1: LOCK FUNDS (Backend Implementation)');
    console.log('═══════════════════════════════════════════════════════');

    const walletAddress = (await wallet.getUsedAddresses())[0];
    const signerHash = deserializeAddress(walletAddress).pubKeyHash;
    const { scriptCbor, scriptAddr } = getScript();

    console.log(`Backend Wallet: ${walletAddress}`);
    console.log(`Backend PubKey Hash: ${signerHash}`);
    console.log(`Script Address: ${scriptAddr}`);

    // IMPORTANT: Store totalFunds in LOVELACE (matches working test_lock_v2.ts)
    const totalFundsLovelace = totalFunds * 1_000_000;

    // Use params if provided, otherwise default to signerHash for testing/custodial
    const org = organizationHash || signerHash;
    const researcher = researcherHash || signerHash;
    const mems = members && members.length > 0 ? members : [signerHash];
    const milestonePercentages = milestones.map(m => m.percentage);

    const datum: Data = {
        alternative: 0,
        fields: [
            org,                           // organization
            researcher,                    // researcher
            mems,                          // members
            totalFundsLovelace,            // total_funds in LOVELACE!!!
            milestonePercentages,          // milestone percentages
            0                              // current_milestone = 0
        ],
    };

    console.log(`\nDatum (for verification):`);
    console.log(`  organization: ${org}`);
    console.log(`  researcher: ${researcher}`);
    console.log(`  members: [${mems}]`);
    console.log(`  totalFunds: ${totalFundsLovelace} lovelace (${totalFunds} ADA)`);
    console.log(`  milestones: [${milestonePercentages.join(', ')}]%`);
    console.log(`  currentMilestone: 0`);

    console.log(`\nLocking ${totalFunds} ADA...`);

    const txBuilder = new MeshTxBuilder({ fetcher: provider, submitter: provider });
    await txBuilder
        .txOut(scriptAddr, [{ unit: 'lovelace', quantity: totalFundsLovelace.toString() }])
        .txOutInlineDatumValue(datum)
        .changeAddress(walletAddress)
        .selectUtxosFrom(await wallet.getUtxos())
        .complete();

    const unsignedTx = txBuilder.txHex;
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    console.log(`\n✅ LOCKED! TxHash: ${txHash}`);
    console.log(`   View: https://preprod.cardanoscan.io/transaction/${txHash}`);

    return txHash;
}

// ============ Step 3: Unlock Funds ============
export async function releaseFunds(
    milestoneIndex: number,
    releaseAmountADA: number, // Passed in ADA, converted to lovelace internally to match calculation
    recipientAddress: string,
    lockTxHash: string,  // The original lock transaction hash
    datumParams: {
        organization: string;
        researcher: string;
        members: string[];
        totalFunds: number; // In Lovelace (from DB/previous datum)
        milestones: number[];
        currentMilestone: number;
    }
) {
    if (!wallet || !provider) throw new Error("Wallet/Provider not initialized");

    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`  STEP 3: UNLOCK FUNDS (Release Milestone ${milestoneIndex})`);
    console.log('═══════════════════════════════════════════════════════');

    const walletAddress = (await wallet.getUsedAddresses())[0];
    const signerHash = deserializeAddress(walletAddress).pubKeyHash;
    const { scriptCbor, scriptAddr } = getScript();

    // Find UTXOs at script - RETRY until we find our exact UTXO
    let scriptUtxo: any = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
        const scriptUtxos = await provider.fetchAddressUTxOs(scriptAddr);
        console.log(`Attempt ${attempt}: Found ${scriptUtxos.length} UTXOs at script address`);

        // MUST find our exact locked UTXO (no fallback to wrong UTXO!)
        scriptUtxo = scriptUtxos.find((u: any) => u.input.txHash === lockTxHash);

        if (scriptUtxo) {
            console.log(`✅ Found our locked UTXO!`);
            break;
        }

        if (attempt < 5) {
            console.log(`⏳ UTXO not indexed yet, waiting 15s before retry...`);
            await new Promise(r => setTimeout(r, 15000));
        }
    }

    if (!scriptUtxo) {
        throw new Error(`Could not find UTXO for txHash ${lockTxHash} after 5 attempts. UTXO not yet indexed.`);
    }

    const currentValue = parseInt(
        scriptUtxo.output.amount.find((a: any) => a.unit === 'lovelace')?.quantity || '0'
    );
    console.log(`Using UTXO: ${scriptUtxo.input.txHash}#${scriptUtxo.input.outputIndex}`);
    console.log(`Current value in UTXO: ${currentValue / 1_000_000} ADA`);

    // Calculate release amount
    // NOTE: In the test script this was calc'd from CONFIG. Here we use the passed params which should match.
    // We trust datumParams.totalFunds is totalFundsLovelace
    const milestonePercentage = datumParams.milestones[milestoneIndex];
    const totalFundsLovelace = datumParams.totalFunds;
    const releaseAmount = Math.floor(totalFundsLovelace * milestonePercentage / 100);

    // Verify calculated release matches requested release (sanity check)
    // releaseAmountADA is passed from DB. releaseAmount is calc from percentages. They should be close.
    // We use the ONE calculated from percentages to be consistent with test script logic.

    const remainingAmount = currentValue - releaseAmount;
    const isLastMilestone = milestoneIndex >= datumParams.milestones.length - 1;

    console.log(`\nMilestone ${milestoneIndex}: ${milestonePercentage}%`);
    console.log(`Release to researcher: ${releaseAmount / 1_000_000} ADA`);
    console.log(`Remaining in script: ${remainingAmount / 1_000_000} ADA`);
    console.log(`Researcher: ${recipientAddress}`);

    // Build redeemer
    const redeemer: Data = {
        alternative: 0,  // ApproveMilestone
        fields: [milestoneIndex, [signerHash]] // Using signerHash (backend) as the signer in logic
    };
    // Note: In real backend usage, we might need real members. 
    // But since we are imitating the test solution where backend signs everything:
    // We will use [signerHash] as the signer list in the redeemer.
    // AND we must ensure the datum expects this signer (or the signer is in members).
    // In `projects.ts` we set members = [backendPubKeyHash]. So this aligns.

    console.log(`\nRedeemer: ApproveMilestone(${milestoneIndex}, [signer])`);

    // Build next datum
    const nextDatum: Data = {
        alternative: 0,
        fields: [
            datumParams.organization,
            datumParams.researcher,
            datumParams.members,
            totalFundsLovelace,     // LOVELACE, same as lock!
            datumParams.milestones,
            milestoneIndex + 1      // Increment milestone
        ],
    };
    console.log(`Next Datum: currentMilestone = ${milestoneIndex + 1}`);

    // Get wallet UTXOs
    const walletUtxos = await wallet.getUtxos();
    console.log(`\nWallet has ${walletUtxos.length} UTXOs`);

    const collateralUtxo = walletUtxos.find((u: any) => {
        const lovelace = u.output.amount.find((a: any) => a.unit === 'lovelace');
        return lovelace && parseInt(lovelace.quantity) >= 5_000_000;
    });

    if (!collateralUtxo) {
        throw new Error('No collateral UTXO found (need 5+ ADA)');
    }
    console.log(`Collateral: ${collateralUtxo.input.txHash}#${collateralUtxo.input.outputIndex}`);

    // Build transaction
    console.log('\nBuilding transaction...');
    const txBuilder = new MeshTxBuilder({ fetcher: provider, submitter: provider });

    // Spend script UTXO
    await txBuilder
        .spendingPlutusScriptV3()
        .txIn(scriptUtxo.input.txHash, scriptUtxo.input.outputIndex)
        .txInInlineDatumPresent()
        .txInRedeemerValue(redeemer)
        .txInScript(scriptCbor);

    // Pay researcher
    txBuilder.txOut(recipientAddress, [
        { unit: 'lovelace', quantity: releaseAmount.toString() }
    ]);

    // Continuing output if not last milestone
    if (!isLastMilestone && remainingAmount > 2_000_000) {
        console.log(`Adding continuing output: ${remainingAmount / 1_000_000} ADA`);
        txBuilder
            .txOut(scriptAddr, [
                { unit: 'lovelace', quantity: remainingAmount.toString() }
            ])
            .txOutInlineDatumValue(nextDatum);
    }

    // Required signer
    txBuilder.requiredSignerHash(signerHash);

    // Collateral
    txBuilder.txInCollateral(
        collateralUtxo.input.txHash,
        collateralUtxo.input.outputIndex,
        collateralUtxo.output.amount,
        collateralUtxo.output.address
    );

    txBuilder.changeAddress(walletAddress);
    txBuilder.selectUtxosFrom(walletUtxos);

    await txBuilder.complete();
    console.log('✅ Transaction built!');

    // Sign and submit
    const unsignedTx = txBuilder.txHex;
    const signedTx = await wallet.signTx(unsignedTx);
    console.log('✅ Transaction signed!');

    console.log('\nSubmitting to blockchain...');
    const txHash = await wallet.submitTx(signedTx);

    console.log(`\n🎉 SUCCESS! TxHash: ${txHash}`);
    console.log(`   View: https://preprod.cardanoscan.io/transaction/${txHash}`);
    console.log(`   Released ${releaseAmount / 1_000_000} ADA to researcher!`);

    return txHash;
}

// Legacy mock function for backward compatibility
export async function releaseFundsMock(milestoneId: string, amount: number, recipientAddress: string) {
    console.log(`[Mock Smart Contract] Releasing ${amount} ADA for milestone ${milestoneId} to ${recipientAddress}`);
    return "mock-tx-hash-release";
}

// Get backend wallet address (for organizations to send funds to)
export async function getBackendWalletAddress(): Promise<string> {
    if (!wallet) throw new Error("Wallet not initialized");
    const addresses = await wallet.getUsedAddresses();
    return addresses[0];
}

// Get backend wallet pubkey hash
export async function getBackendWalletPubKeyHash(): Promise<string> {
    const address = await getBackendWalletAddress();
    return deserializeAddress(address).pubKeyHash;
}

// Check backend wallet balance
export async function getBackendWalletBalance(): Promise<number> {
    if (!wallet) throw new Error("Wallet not initialized");
    const balance = await wallet.getBalance();
    const lovelace = balance.find((a: any) => a.unit === 'lovelace');
    return lovelace ? parseInt(lovelace.quantity) / 1_000_000 : 0;
}

// Export wallet for other uses
export { wallet, provider };
