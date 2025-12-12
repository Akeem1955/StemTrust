
import { MeshWallet, BlockfrostProvider, MeshTxBuilder, serializePlutusScript, deserializeAddress, Data } from '@meshsdk/core';
import { applyParamsToScript } from "@meshsdk/core-csl";
import fs from 'fs';
import path from 'path';

// Load blueprint
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

// Initialize immediately if env vars are present
if (process.env.BLOCKFROST && process.env.mnemonic) {
    initSmartContract();
}

export function getScript() {
    if (!blueprint) throw new Error("Blueprint not loaded");

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

    const totalFundsLovelace = totalFunds * 1_000_000;

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

    const txBuilder = new MeshTxBuilder({ fetcher: provider, submitter: provider });

    // Custom Input Selection: Accumulate UTXOs until target is met
    const utxos = await wallet.getUtxos();
    const targetLovelace = totalFundsLovelace + 5_000_000;

    console.log(`Target (inc. fees): ${targetLovelace / 1_000_000} ADA`);
    console.log(`Available UTXOs: ${utxos.length}`);

    const sortedUtxos = utxos.sort((a, b) => {
        const amountA = Number(a.output.amount.find(x => x.unit === 'lovelace')?.quantity || 0);
        const amountB = Number(b.output.amount.find(x => x.unit === 'lovelace')?.quantity || 0);
        return amountB - amountA; // Descending
    });

    let accumulated = 0;
    const inputsToUse = [];

    for (const u of sortedUtxos) {
        const amount = Number(u.output.amount.find(x => x.unit === 'lovelace')?.quantity || 0);
        if (amount === 0) continue;

        accumulated += amount;
        inputsToUse.push(u);

        if (accumulated >= targetLovelace) break;
    }

    if (accumulated >= targetLovelace) {
        console.log(`Selected ${inputsToUse.length} UTXOs covering ${accumulated / 1_000_000} ADA`);
        for (const input of inputsToUse) {
            txBuilder.txIn(
                input.input.txHash,
                input.input.outputIndex,
                input.output.amount,
                input.output.address
            );
        }
    } else {
        console.warn(`⚠️ Warning: Total wallet balance (${accumulated / 1_000_000} ADA) is less than target (${targetLovelace / 1_000_000} ADA).`);
    }

    await txBuilder
        .txOut(scriptAddr, [{ unit: 'lovelace', quantity: totalFundsLovelace.toString() }])
        .txOutInlineDatumValue(datum)
        .changeAddress(walletAddress)
        .selectUtxosFrom(utxos)
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
    releaseAmountADA: number, // Passed in ADA
    recipientAddress: string,
    lockTxHash: string,
    datumParams: {
        organization: string;
        researcher: string;
        members: string[];
        totalFunds: number; // In Lovelace
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

    // Find UTXOs at script
    let scriptUtxo: any = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
        const scriptUtxos = await provider.fetchAddressUTxOs(scriptAddr);
        console.log(`Attempt ${attempt}: Found ${scriptUtxos.length} UTXOs at script address`);

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
        throw new Error(`Could not find UTXO for txHash ${lockTxHash} after 5 attempts.`);
    }

    const currentValue = parseInt(
        scriptUtxo.output.amount.find((a: any) => a.unit === 'lovelace')?.quantity || '0'
    );
    console.log(`Using UTXO: ${scriptUtxo.input.txHash}#${scriptUtxo.input.outputIndex}`);

    const milestonePercentage = datumParams.milestones[milestoneIndex];
    const totalFundsLovelace = datumParams.totalFunds;
    const releaseAmount = Math.floor(totalFundsLovelace * milestonePercentage / 100);

    const remainingAmount = currentValue - releaseAmount;
    const isLastMilestone = milestoneIndex >= datumParams.milestones.length - 1;

    console.log(`\nMilestone ${milestoneIndex}: ${milestonePercentage}%`);
    console.log(`Release to researcher: ${releaseAmount / 1_000_000} ADA`);
    console.log(`Remaining in script: ${remainingAmount / 1_000_000} ADA`);

    const redeemer: Data = {
        alternative: 0,
        fields: [milestoneIndex, [signerHash]]
    };

    const nextDatum: Data = {
        alternative: 0,
        fields: [
            datumParams.organization,
            datumParams.researcher,
            datumParams.members,
            totalFundsLovelace,
            datumParams.milestones,
            milestoneIndex + 1
        ],
    };

    const walletUtxos = await wallet.getUtxos();
    const collateralUtxo = walletUtxos.find((u: any) => {
        const lovelace = u.output.amount.find((a: any) => a.unit === 'lovelace');
        return lovelace && parseInt(lovelace.quantity) >= 5_000_000;
    });

    if (!collateralUtxo) {
        throw new Error('No collateral UTXO found (need 5+ ADA)');
    }
    console.log(`Collateral: ${collateralUtxo.input.txHash}#${collateralUtxo.input.outputIndex}`);

    console.log('\nBuilding transaction...');
    const txBuilder = new MeshTxBuilder({ fetcher: provider, submitter: provider });

    await txBuilder
        .spendingPlutusScriptV3()
        .txIn(scriptUtxo.input.txHash, scriptUtxo.input.outputIndex)
        .txInInlineDatumPresent()
        .txInRedeemerValue(redeemer)
        .txInScript(scriptCbor);

    txBuilder.txOut(recipientAddress, [
        { unit: 'lovelace', quantity: releaseAmount.toString() }
    ]);

    if (!isLastMilestone && remainingAmount > 2_000_000) {
        console.log(`Adding continuing output: ${remainingAmount / 1_000_000} ADA`);
        txBuilder
            .txOut(scriptAddr, [
                { unit: 'lovelace', quantity: remainingAmount.toString() }
            ])
            .txOutInlineDatumValue(nextDatum);
    }

    txBuilder.requiredSignerHash(signerHash);

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

    const unsignedTx = txBuilder.txHex;
    const signedTx = await wallet.signTx(unsignedTx);
    console.log('✅ Transaction signed!');

    console.log('\nSubmitting to blockchain...');
    const txHash = await wallet.submitTx(signedTx);

    console.log(`\n🎉 SUCCESS! TxHash: ${txHash}`);
    console.log(`   View: https://preprod.cardanoscan.io/transaction/${txHash}`);

    return txHash;
}

export async function releaseFundsMock(milestoneId: string, amount: number, recipientAddress: string) {
    console.log(`[Mock Smart Contract] Releasing ${amount} ADA for milestone ${milestoneId} to ${recipientAddress}`);
    return "mock-tx-hash-release";
}

export async function getBackendWalletAddress(): Promise<string> {
    if (!wallet) throw new Error("Wallet not initialized");
    const addresses = await wallet.getUsedAddresses();
    return addresses[0];
}

export async function getBackendWalletPubKeyHash(): Promise<string> {
    const address = await getBackendWalletAddress();
    return deserializeAddress(address).pubKeyHash;
}

export async function getBackendWalletBalance(): Promise<number> {
    if (!wallet) throw new Error("Wallet not initialized");
    const balance = await wallet.getBalance();
    const lovelace = balance.find((a: any) => a.unit === 'lovelace');
    return lovelace ? parseInt(lovelace.quantity) / 1_000_000 : 0;
}

export { wallet, provider };
