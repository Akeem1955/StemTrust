import { MeshWallet, BlockfrostProvider, MeshTxBuilder, serializePlutusScript, mConStr0, deserializeAddress, list, integer } from '@meshsdk/core';
import { applyParamsToScript } from "@meshsdk/core-csl";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

function buildMilestone(percentage: number) {
    return mConStr0([integer(BigInt(percentage)) as any]);
}

async function main() {
    const blueprintPath = path.resolve(process.cwd(), 'smartcontract/plutus.json');
    const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf-8'));

    const blockfrost = process.env.BLOCKFROST;
    const mnemonic = process.env.mnemonic;

    if (!blockfrost || !mnemonic) {
        throw new Error("Missing env vars");
    }

    const provider = new BlockfrostProvider(blockfrost);
    const wallet = new MeshWallet({
        networkId: 0,
        fetcher: provider,
        submitter: provider,
        key: {
            type: 'mnemonic',
            words: mnemonic.split(" "),
        },
    });

    const scriptCbor = applyParamsToScript(
        blueprint.validators[0].compiledCode,
        []
    );

    const scriptAddr = serializePlutusScript(
        { code: scriptCbor, version: "V3" },
    ).address;

    console.log("Script Address:", scriptAddr);

    const walletAddress = (await wallet.getUsedAddresses())[0];
    const signerHash = deserializeAddress(walletAddress).pubKeyHash;

    const assets = [
        {
            unit: "lovelace",
            quantity: "5000000", // 5 ADA
        },
    ];

    const txBuilder = new MeshTxBuilder({
        fetcher: provider,
        submitter: provider,
    });

    // Complex datum
    const organization = signerHash;
    const researcher = signerHash;
    const members = [signerHash];
    const totalFunds = 10000000;
    const milestones = [{ percentage: 50 }, { percentage: 50 }];
    const currentMilestone = 0;

    const datum = mConStr0([
        organization,
        researcher,
        totalFunds
    ]);

    // console.log("Datum structure:", JSON.stringify(datum, null, 2));

    console.log("Building transaction with complex datum (Hash)...");
    await txBuilder
        .txOut(scriptAddr, assets)
        .txOutDatumHashValue(datum)
        .changeAddress(walletAddress)
        .selectUtxosFrom(await wallet.getUtxos())
        .complete();

    console.log("Signing...");
    const unsignedTx = txBuilder.txHex;
    const signedTx = await wallet.signTx(unsignedTx);
    
    console.log("Submitting...");
    const txHash = await wallet.submitTx(signedTx);
    console.log(`Locked funds. Tx Hash: ${txHash}`);
}

main().catch(console.error);
