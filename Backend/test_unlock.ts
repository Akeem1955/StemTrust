import { MeshWallet, BlockfrostProvider, MeshTxBuilder, serializePlutusScript, deserializeAddress, Data } from '@meshsdk/core';
import { applyParamsToScript } from '@meshsdk/core-csl';
import dotenv from 'dotenv';
import fs from 'fs';
import blueprint from "./smartcontract/plutus.json";

dotenv.config();

const log: string[] = [];
function write(msg: string) {
    log.push(msg);
    console.log(msg);
}

function saveLog() {
    fs.writeFileSync('unlock_result.txt', log.join('\n'), 'utf8');
}

const blockfrost = process.env.BLOCKFROST;
const mnemonic = process.env.mnemonic;

if (!blockfrost || !mnemonic) {
    throw new Error('Missing env vars');
}

const provider = new BlockfrostProvider(blockfrost);
const wallet = new MeshWallet({
    networkId: 0,
    fetcher: provider,
    submitter: provider,
    key: { type: 'mnemonic', words: mnemonic.split(' ') },
});

function getScript() {
    const validator = blueprint.validators.find((v: any) => v.title === 'stemtrust.stem_trust.spend');
    const scriptCbor = applyParamsToScript(validator!.compiledCode, []);
    const scriptAddr = serializePlutusScript({ code: scriptCbor, version: 'V3' }).address;
    return { scriptCbor, scriptAddr };
}

async function main() {
    write("=== StemTrust Unlock Test v3 ===\n");

    const walletAddress = (await wallet.getUsedAddresses())[0];
    const signerHash = deserializeAddress(walletAddress).pubKeyHash;

    write('Wallet Address: ' + walletAddress);
    write('Signer Hash: ' + signerHash);

    const { scriptCbor, scriptAddr } = getScript();
    write('Script Address: ' + scriptAddr);

    // Fetch script UTXOs
    const scriptUtxos = await provider.fetchAddressUTxOs(scriptAddr);

    if (!scriptUtxos || scriptUtxos.length === 0) {
        write('ERROR: No UTXOs found at script address!');
        saveLog();
        return;
    }

    write(`\nFound ${scriptUtxos.length} UTXOs at script`);

    // Use the first UTXO
    const scriptUtxo = scriptUtxos[0];
    const currentValue = parseInt(
        scriptUtxo.output.amount.find((a: any) => a.unit === 'lovelace')?.quantity || '0'
    );
    write(`Using UTXO: ${scriptUtxo.input.txHash}#${scriptUtxo.input.outputIndex}`);
    write(`Current value: ${currentValue / 1_000_000} ADA`);

    // Unlock parameters - must match the locked datum exactly!
    const totalFunding = 50; // Same as test_lock.ts
    const totalFundsLovelace = totalFunding * 1_000_000;
    const milestones = [1, 2]; // Same as test_lock.ts (1% and 2%)
    const currentMilestoneIndex = 0;

    // Smart contract calculates: release_amount = total_funds * milestone / 100
    // The UTXO output minimum is ~1 ADA, but contract validates based on datum.total_funds
    const milestonePercentage = milestones[currentMilestoneIndex];
    const contractReleaseAmount = Math.floor(totalFundsLovelace * milestonePercentage / 100);

    // Minimum output is ~1 ADA, so we release that to the researcher
    // But the continuing output must be: current_value - contract_release_amount
    const releaseAmount = 1_000_000; // Minimum 1 ADA to researcher
    const contractRemaining = currentValue - contractReleaseAmount; // What contract expects for continuing output

    write(`\nMilestone ${currentMilestoneIndex}: ${milestonePercentage}%`);
    write(`Contract expects release: ${contractReleaseAmount / 1_000_000} ADA`);
    write(`Actual release to researcher: ${releaseAmount / 1_000_000} ADA`);
    write(`Continuing output (contract expects >= ${contractRemaining / 1_000_000} ADA)`);

    // Build redeemer
    const redeemer: Data = {
        alternative: 0, // ApproveMilestone
        fields: [currentMilestoneIndex, [signerHash]]
    };
    write('\nRedeemer: ' + JSON.stringify(redeemer));

    // Build next datum
    const isLastMilestone = currentMilestoneIndex >= milestones.length - 1;
    const nextDatum: Data = {
        alternative: 0,
        fields: [
            signerHash,      // organization
            signerHash,      // researcher
            [signerHash],    // members
            totalFunding,    // total_funds (NOT in lovelace!)
            milestones,      // milestones
            currentMilestoneIndex + 1  // current_milestone
        ],
    };
    write('Next Datum: ' + JSON.stringify(nextDatum));

    // Get wallet UTXOs
    const utxos = await wallet.getUtxos();
    write(`\nWallet UTXOs: ${utxos.length}`);

    const collateralUtxo = utxos.find((u: any) => {
        const lovelace = u.output.amount.find((a: any) => a.unit === 'lovelace');
        return lovelace && parseInt(lovelace.quantity) >= 5_000_000;
    });

    if (!collateralUtxo) {
        write('ERROR: No collateral UTXO (need 5+ ADA)');
        saveLog();
        return;
    }
    write(`Collateral: ${collateralUtxo.input.txHash}#${collateralUtxo.input.outputIndex}`);

    // Build transaction
    write('\n=== Building Transaction ===');
    const txBuilder = new MeshTxBuilder({ fetcher: provider, submitter: provider });

    try {
        // Spend script UTXO
        await txBuilder
            .spendingPlutusScriptV3()
            .txIn(scriptUtxo.input.txHash, scriptUtxo.input.outputIndex)
            .txInInlineDatumPresent()
            .txInRedeemerValue(redeemer)
            .txInScript(scriptCbor);

        // Pay researcher (ourselves) - at least the minimum
        txBuilder.txOut(walletAddress, [
            { unit: 'lovelace', quantity: releaseAmount.toString() }
        ]);

        // Continuing output to script - must be >= contractRemaining
        if (!isLastMilestone && contractRemaining > 2_000_000) {
            write(`Adding continuing output: ${contractRemaining / 1_000_000} ADA`);
            txBuilder
                .txOut(scriptAddr, [
                    { unit: 'lovelace', quantity: contractRemaining.toString() }
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
        txBuilder.selectUtxosFrom(utxos);

        await txBuilder.complete();
        write('Transaction built!');

        // Sign
        const unsignedTx = txBuilder.txHex;
        const signedTx = await wallet.signTx(unsignedTx);
        write('Transaction signed!');

        // Submit
        write('\nSubmitting to blockchain...');
        const txHash = await wallet.submitTx(signedTx);

        write('\n=== SUCCESS ===');
        write('TxHash: ' + txHash);
        write('View: https://preprod.cardanoscan.io/transaction/' + txHash);
        write(`Released ${releaseAmount / 1_000_000} ADA to researcher`);

    } catch (error: any) {
        write('\n=== ERROR ===');
        write('Message: ' + (error?.message || 'No message'));
        write('Info: ' + JSON.stringify(error?.info || error?.data || error || 'No info'));
        if (error?.stack) write('Stack: ' + error.stack.substring(0, 500));
    }

    saveLog();
}

main().catch(e => {
    log.push('Fatal error: ' + e.message);
    saveLog();
    console.error(e);
});
