/**
 * End-to-End Test Script for StemTrust Fund Flow
 * 
 * This script tests the complete flow:
 * 1. Lock funds on blockchain (simulating project onboarding)
 * 2. Unlock funds (simulating milestone approval)
 * 
 * Run with: npx tsx test_full_flow.ts
 */

import { MeshWallet, BlockfrostProvider, MeshTxBuilder, serializePlutusScript, deserializeAddress, Data } from '@meshsdk/core';
import { applyParamsToScript } from '@meshsdk/core-csl';
import dotenv from 'dotenv';
import fs from 'fs';
import blueprint from "./smartcontract/plutus.json";

dotenv.config();

// ============ Configuration ============
const TEST_CONFIG = {
    totalFundsADA: 20,  // Small amount for testing
    milestones: [25, 25, 25, 25],  // 4 milestones, 25% each
    researcherAddress: 'addr_test1qrk47v4t4xlywf3eh8ae7s54s354k86c6rh8mu8utzm22ky28mcycq87r9qef4gdm8555ft8valqhxkgx3uypyt0v3lqsmpkfu'
};

// ============ Setup ============
const blockfrost = process.env.BLOCKFROST;
const mnemonic = process.env.mnemonic;

if (!blockfrost || !mnemonic) {
    throw new Error('Missing BLOCKFROST or mnemonic in .env');
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

// ============ Helpers ============
function log(msg: string) {
    console.log(`[${new Date().toISOString()}] ${msg}`);
}

// ============ Step 1: Lock Funds ============
async function lockFunds(): Promise<string> {
    log('=== STEP 1: LOCK FUNDS ===');

    const walletAddress = (await wallet.getUsedAddresses())[0];
    const signerHash = deserializeAddress(walletAddress).pubKeyHash;
    const { scriptCbor, scriptAddr } = getScript();

    log(`Wallet: ${walletAddress}`);
    log(`Signer Hash: ${signerHash}`);
    log(`Script Address: ${scriptAddr}`);

    // Build datum - same structure as lockFunds in smartContract.ts
    const datum: Data = {
        alternative: 0,
        fields: [
            signerHash,                    // organization
            signerHash,                    // researcher
            [signerHash],                  // members
            TEST_CONFIG.totalFundsADA,     // total_funds (in ADA!)
            TEST_CONFIG.milestones,        // milestones (percentages)
            0                              // current_milestone
        ],
    };

    log(`Datum: ${JSON.stringify(datum)}`);
    log(`Locking ${TEST_CONFIG.totalFundsADA} ADA...`);

    const lovelace = TEST_CONFIG.totalFundsADA * 1_000_000;

    const txBuilder = new MeshTxBuilder({ fetcher: provider, submitter: provider });
    await txBuilder
        .txOut(scriptAddr, [{ unit: 'lovelace', quantity: lovelace.toString() }])
        .txOutInlineDatumValue(datum)
        .changeAddress(walletAddress)
        .selectUtxosFrom(await wallet.getUtxos())
        .complete();

    const unsignedTx = txBuilder.txHex;
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    log(`✓ LOCKED! TxHash: ${txHash}`);
    log(`  View: https://preprod.cardanoscan.io/transaction/${txHash}`);

    return txHash;
}

// ============ Step 2: Wait for Confirmation ============
async function waitForConfirmation(txHash: string): Promise<void> {
    log('=== STEP 2: WAITING FOR CONFIRMATION ===');
    log('Waiting 60 seconds for block confirmation...');

    for (let i = 60; i > 0; i -= 10) {
        log(`  ${i} seconds remaining...`);
        await new Promise(r => setTimeout(r, 10000));
    }

    log('✓ Confirmation wait complete');
}

// ============ Step 3: Unlock Funds (Release Milestone 0) ============
async function unlockFunds(lockTxHash: string): Promise<string> {
    log('=== STEP 3: UNLOCK FUNDS (Release Milestone 0) ===');

    const walletAddress = (await wallet.getUsedAddresses())[0];
    const signerHash = deserializeAddress(walletAddress).pubKeyHash;
    const { scriptCbor, scriptAddr } = getScript();

    // Find the UTXO we locked
    const scriptUtxos = await provider.fetchAddressUTxOs(scriptAddr);
    log(`Found ${scriptUtxos.length} UTXOs at script address`);

    // Find our locked UTXO
    let scriptUtxo = scriptUtxos.find((u: any) => u.input.txHash === lockTxHash);
    if (!scriptUtxo) {
        log('WARNING: Could not find UTXO matching lock tx hash, using first available');
        scriptUtxo = scriptUtxos[0];
    }

    if (!scriptUtxo) {
        throw new Error('No UTXOs found at script address!');
    }

    const currentValue = parseInt(
        scriptUtxo.output.amount.find((a: any) => a.unit === 'lovelace')?.quantity || '0'
    );
    log(`Using UTXO: ${scriptUtxo.input.txHash}#${scriptUtxo.input.outputIndex}`);
    log(`Current value: ${currentValue / 1_000_000} ADA`);

    // Calculate release amount for milestone 0
    const milestoneIndex = 0;
    const milestonePercentage = TEST_CONFIG.milestones[milestoneIndex];
    const releaseAmount = Math.floor(TEST_CONFIG.totalFundsADA * 1_000_000 * milestonePercentage / 100);
    const remainingAmount = currentValue - releaseAmount;
    const isLastMilestone = milestoneIndex >= TEST_CONFIG.milestones.length - 1;

    log(`Milestone ${milestoneIndex}: ${milestonePercentage}%`);
    log(`Release: ${releaseAmount / 1_000_000} ADA`);
    log(`Remaining: ${remainingAmount / 1_000_000} ADA`);

    // Build redeemer - ApproveMilestone { milestone_index, voter_signatures }
    const redeemer: Data = {
        alternative: 0,
        fields: [milestoneIndex, [signerHash]]
    };
    log(`Redeemer: ${JSON.stringify(redeemer)}`);

    // Build next datum (for continuing output)
    const nextDatum: Data = {
        alternative: 0,
        fields: [
            signerHash,                    // organization
            signerHash,                    // researcher
            [signerHash],                  // members
            TEST_CONFIG.totalFundsADA,     // total_funds (stays same!)
            TEST_CONFIG.milestones,        // milestones
            milestoneIndex + 1             // current_milestone (incremented)
        ],
    };
    log(`Next Datum: ${JSON.stringify(nextDatum)}`);

    // Get wallet UTXOs for collateral
    const walletUtxos = await wallet.getUtxos();
    const collateralUtxo = walletUtxos.find((u: any) => {
        const lovelace = u.output.amount.find((a: any) => a.unit === 'lovelace');
        return lovelace && parseInt(lovelace.quantity) >= 5_000_000;
    });

    if (!collateralUtxo) {
        throw new Error('No collateral UTXO found (need 5+ ADA)');
    }

    // Build transaction
    log('Building transaction...');
    const txBuilder = new MeshTxBuilder({ fetcher: provider, submitter: provider });

    // Spend script UTXO
    await txBuilder
        .spendingPlutusScriptV3()
        .txIn(scriptUtxo.input.txHash, scriptUtxo.input.outputIndex)
        .txInInlineDatumPresent()
        .txInRedeemerValue(redeemer)
        .txInScript(scriptCbor);

    // Pay researcher
    txBuilder.txOut(TEST_CONFIG.researcherAddress, [
        { unit: 'lovelace', quantity: releaseAmount.toString() }
    ]);

    // Continuing output to script (if not last milestone and enough remaining)
    if (!isLastMilestone && remainingAmount > 2_000_000) {
        log(`Adding continuing output: ${remainingAmount / 1_000_000} ADA`);
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
    log('Transaction built!');

    // Sign and submit
    const unsignedTx = txBuilder.txHex;
    const signedTx = await wallet.signTx(unsignedTx);

    log('Submitting to blockchain...');
    const txHash = await wallet.submitTx(signedTx);

    log(`✓ RELEASED! TxHash: ${txHash}`);
    log(`  View: https://preprod.cardanoscan.io/transaction/${txHash}`);
    log(`  Released ${releaseAmount / 1_000_000} ADA to researcher!`);

    return txHash;
}

// ============ Main ============
async function main() {
    log('========================================');
    log('  StemTrust Full Flow Test');
    log('========================================\n');

    try {
        // Step 1: Lock funds
        const lockTxHash = await lockFunds();

        // Step 2: Wait for confirmation
        await waitForConfirmation(lockTxHash);

        // Step 3: Unlock funds
        const unlockTxHash = await unlockFunds(lockTxHash);

        log('\n========================================');
        log('  ✓ ALL STEPS COMPLETED SUCCESSFULLY!');
        log('========================================');
        log(`Lock TX: ${lockTxHash}`);
        log(`Unlock TX: ${unlockTxHash}`);

    } catch (error: any) {
        log('\n========================================');
        log('  ✗ ERROR OCCURRED');
        log('========================================');
        log(`Message: ${error?.message || 'Unknown error'}`);

        if (error?.data) {
            log(`Data: ${JSON.stringify(error.data).substring(0, 500)}`);
        }

        console.error(error);
    }
}

main();
