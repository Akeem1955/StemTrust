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
    write("=== StemTrust Unlock Test v4 (CORRECTED) ===\n");

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

    // Find the UTXO with 100 ADA (the one we locked with correct datum)
    const targetUtxo = scriptUtxos.find((u: any) => {
        const lovelace = u.output.amount.find((a: any) => a.unit === 'lovelace');
        return lovelace && parseInt(lovelace.quantity) === 100_000_000;
    });

    if (!targetUtxo) {
        write('ERROR: Could not find the 100 ADA UTXO with correct datum!');
        write('Available UTXOs:');
        scriptUtxos.forEach((u: any, i: number) => {
            const lovelace = u.output.amount.find((a: any) => a.unit === 'lovelace');
            write(`  ${i}: ${parseInt(lovelace?.quantity || '0') / 1_000_000} ADA`);
        });
        saveLog();
        return;
    }

    const scriptUtxo = targetUtxo;
    const currentValue = parseInt(
        scriptUtxo.output.amount.find((a: any) => a.unit === 'lovelace')?.quantity || '0'
    );
    write(`Using UTXO: ${scriptUtxo.input.txHash}#${scriptUtxo.input.outputIndex}`);
    write(`Current value: ${currentValue / 1_000_000} ADA`);

    // Unlock parameters - must match the locked datum!
    // From test_lock_v2.ts:
    const totalFundsLovelace = 100_000_000; // 100 ADA in lovelace
    const milestones = [10, 20, 30, 40]; // percentages
    const currentMilestoneIndex = 0;

    // Smart contract calculates: release_amount = total_funds * milestone / 100
    const milestonePercentage = milestones[currentMilestoneIndex];
    const releaseAmount = Math.floor(totalFundsLovelace * milestonePercentage / 100);
    const remainingAmount = currentValue - releaseAmount;

    write(`\nMilestone ${currentMilestoneIndex}: ${milestonePercentage}%`);
    write(`Release amount: ${releaseAmount / 1_000_000} ADA (${releaseAmount} lovelace)`);
    write(`Remaining: ${remainingAmount / 1_000_000} ADA`);

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
            signerHash,           // organization
            signerHash,           // researcher
            [signerHash],         // members
            totalFundsLovelace,   // total_funds (in lovelace!)
            milestones,           // milestones
            currentMilestoneIndex + 1  // current_milestone
        ],
    };
    write('Next Datum: ' + JSON.stringify(nextDatum));
    write('Is last milestone: ' + isLastMilestone);

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

        // Pay researcher (ourselves) - release amount
        txBuilder.txOut(walletAddress, [
            { unit: 'lovelace', quantity: releaseAmount.toString() }
        ]);

        // Continuing output to script if not last milestone
        if (!isLastMilestone && remainingAmount > 1_000_000) {
            write(`Adding continuing output: ${remainingAmount / 1_000_000} ADA`);
            txBuilder
                .txOut(scriptAddr, [
                    { unit: 'lovelace', quantity: remainingAmount.toString() }
                ])
                .txOutInlineDatumValue(nextDatum);
        } else {
            write('Last milestone or small remaining - no continuing output');
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
        write(`Released ${releaseAmount / 1_000_000} ADA to researcher!`);

    } catch (error: any) {
        write('\n=== ERROR ===');
        write('Message: ' + (error?.message || 'No message'));
        const errorInfo = error?.info || error?.data || error || 'No info';
        if (typeof errorInfo === 'string' && errorInfo.length > 500) {
            write('Info (truncated): ' + errorInfo.substring(0, 500) + '...');
        } else {
            write('Info: ' + JSON.stringify(errorInfo));
        }
    }

    saveLog();
}

main().catch(e => {
    log.push('Fatal error: ' + e.message);
    saveLog();
    console.error(e);
});
