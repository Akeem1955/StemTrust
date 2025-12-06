import { BlockfrostProvider, serializePlutusScript } from '@meshsdk/core';
import { applyParamsToScript } from '@meshsdk/core-csl';
import dotenv from 'dotenv';
import fs from 'fs';
import blueprint from "./smartcontract/plutus.json";

dotenv.config();

async function check() {
    const output: string[] = [];

    const provider = new BlockfrostProvider(process.env.BLOCKFROST!);
    const validator = blueprint.validators.find((v: any) => v.title === 'stemtrust.stem_trust.spend');
    const scriptCbor = applyParamsToScript(validator!.compiledCode, []);
    const scriptAddr = serializePlutusScript({ code: scriptCbor, version: 'V3' }).address;

    output.push('Script Address: ' + scriptAddr);

    const utxos = await provider.fetchAddressUTxOs(scriptAddr);
    output.push('\nUTXOs at script:');
    output.push('Count: ' + utxos.length);

    utxos.forEach((u: any, i: number) => {
        const lovelace = u.output.amount.find((a: any) => a.unit === 'lovelace');
        output.push(`${i}: ${parseInt(lovelace?.quantity || '0') / 1_000_000} ADA`);
        output.push(`   TxHash: ${u.input.txHash}`);
    });

    fs.writeFileSync('check_result.txt', output.join('\n'), 'utf8');
    console.log('Result written to check_result.txt');
}

check().catch(e => {
    fs.writeFileSync('check_result.txt', 'Error: ' + e.message, 'utf8');
    console.error(e);
});
