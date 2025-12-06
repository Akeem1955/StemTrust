import { MeshWallet, BlockfrostProvider, MeshTxBuilder, serializePlutusScript, deserializeAddress, Data } from '@meshsdk/core';
import { applyParamsToScript } from '@meshsdk/core-csl';
import fs from 'fs';
import dotenv from 'dotenv';
import blueprint from "./smartcontract/plutus.json";

dotenv.config();

const log: string[] = [];
function write(msg: string) {
    log.push(msg);
    console.log(msg);
}

function saveLog() {
    fs.writeFileSync('lock_result.txt', log.join('\n'), 'utf8');
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
    if (!validator) throw new Error('Validator not found');
    const scriptCbor = applyParamsToScript(validator.compiledCode, []);
    const scriptAddr = serializePlutusScript({ code: scriptCbor, version: 'V3' }).address;
    return { scriptCbor, scriptAddr };
}

async function main() {
    write("=== StemTrust Lock Test (CORRECTED) ===\n");

    const walletAddress = (await wallet.getUsedAddresses())[0];
    const signerHash = deserializeAddress(walletAddress).pubKeyHash;

    write('Wallet Address: ' + walletAddress);
    write('Signer Hash: ' + signerHash);

    const { scriptCbor, scriptAddr } = getScript();
    write('Script Address: ' + scriptAddr);

    // CORRECTED: Use Lovelace for totalFunds (matching smart contract expectations)
    const totalFundingADA = 100; // 10 ADA for testing
    const totalFundsLovelace = totalFundingADA * 1_000_000; // 10,000,000 lovelace
    
    // Milestone percentages - each should give at least 1 ADA (10% of 10 ADA = 1 ADA)
    const milestones = [10, 20, 30, 40]; // 10%, 20%, 30%, 40% = 100%

    write(`\nLocking ${totalFundingADA} ADA (${totalFundsLovelace} lovelace)`);
    write(`Milestones: ${milestones.join('%, ')}%`);

    // Build datum with lovelace values
    const datum: Data = {
        alternative: 0,
        fields: [
            signerHash,           // organization
            signerHash,           // researcher (same for testing)
            [signerHash],         // members
            totalFundsLovelace,   // CORRECTED: total_funds in lovelace
            milestones,           // milestone percentages
            0                     // current_milestone (starting at 0)
        ],
    };
    write('\nDatum: ' + JSON.stringify(datum));

    // Get wallet UTXOs
    const utxos = await wallet.getUtxos();
    write(`\nWallet UTXOs: ${utxos.length}`);

    // Build transaction
    write('\n=== Building Lock Transaction ===');
    const txBuilder = new MeshTxBuilder({ fetcher: provider, submitter: provider });

    try {
        await txBuilder
            .txOut(scriptAddr, [
                { unit: 'lovelace', quantity: totalFundsLovelace.toString() }
            ])
            .txOutInlineDatumValue(datum)
            .changeAddress(walletAddress)
            .selectUtxosFrom(utxos)
            .complete();

        write('Transaction built!');

        const unsignedTx = txBuilder.txHex;
        const signedTx = await wallet.signTx(unsignedTx);
        write('Transaction signed!');

        write('\nSubmitting to blockchain...');
        const txHash = await wallet.submitTx(signedTx);

        write('\n=== SUCCESS ===');
        write('TxHash: ' + txHash);
        write('View: https://preprod.cardanoscan.io/transaction/' + txHash);
        write(`\nLocked ${totalFundingADA} ADA at script address`);
        write('This datum uses lovelace values and can be unlocked properly');

    } catch (error: any) {
        write('\n=== ERROR ===');
        write('Message: ' + (error?.message || 'No message'));
        write('Info: ' + JSON.stringify(error?.info || error?.data || error || 'No info'));
    }

    saveLog();
}

main().catch(e => {
    log.push('Fatal error: ' + e.message);
    saveLog();
    console.error(e);
});
