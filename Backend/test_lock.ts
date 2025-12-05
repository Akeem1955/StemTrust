import { MeshWallet, BlockfrostProvider, MeshTxBuilder, serializePlutusScript, mConStr0, deserializeAddress, list, integer, byteString,Data } from '@meshsdk/core';
import { applyParamsToScript, toPlutusData } from '@meshsdk/core-csl';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import blueprint from "./smartcontract/plutus.json";

dotenv.config();

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
    key: {
        type: 'mnemonic',
        words: mnemonic.split(' '),
    },
});

// Load blueprint

function getScript() {
    // Find the stem_trust validator
    const validator = blueprint.validators.find((v: any) => v.title === 'stemtrust.stem_trust.spend');
    if (!validator) {
        throw new Error('Validator stemtrust.stem_trust.spend not found in blueprint.');
    }

    const scriptCbor = applyParamsToScript(
        validator.compiledCode,
        []
    );

    const scriptAddr = serializePlutusScript(
        { code: scriptCbor, version: 'V3' },
    ).address;
    
    console.log('Script Address ---> ' + scriptAddr);
    return { scriptCbor, scriptAddr };
}

function getTxBuilder() {
    return new MeshTxBuilder({
        fetcher: provider,
        submitter: provider,
    });
}

function buildMilestone(percentage: number) {
    // Milestone { percentage: Int } -> Constr 0 [Int]
    return mConStr0([integer(BigInt(percentage)) as any]);
}

function buildDatum(params: {
    organization: string;
    researcher: string;
    members: string[];
    totalFunds: number;
    milestones:number[];
    currentMilestone: number;
}) {
    const {
        organization,
        researcher,
        members,
        totalFunds,
        milestones,
        currentMilestone
    } = params;

    console.log("DEBUG organization:", organization);
    console.log("DEBUG researcher:", researcher);
    console.log("DEBUG members:", members);
    console.log("DEBUG milestones:", milestones);
    console.log("DEBUG totalFunds:", totalFunds);
    console.log("DEBUG currentMilestone:", currentMilestone);

    // StemTrustDatum { ... } -> Constr 0 [Org, Res, Members, Total, Milestones, Current]
    console.log("Nah so you ddey")

    // mConStr0([signerHash])
    //const datum = mConStr0([organization]);
    const datum: Data = {
        alternative: 0,
        fields: [
            organization,
            researcher,
            members,
            totalFunds,
            milestones,
            currentMilestone
              // asset name of token in hex
        ],
    };
    return datum

    //ending
    // return mConStr0([
    //     { bytes: organization },
    //     { bytes: researcher },
    //     list(members.map(m => ({ bytes: m }))) as any, 
    //     integer(BigInt(totalFunds * 1_000_000)) as any, // Store total funds in Lovelace
    //     list(milestones.map(m => buildMilestone(m.percentage))) as any,
    //     integer(BigInt(currentMilestone)) as any
    // ]);
}
function safeStringify(obj: any) {
  return JSON.stringify(obj, (_, v) =>
    typeof v === "bigint" ? v.toString() : v
  );
}


async function main() {
    // Mock Data
    const walletAddress = (await wallet.getUsedAddresses())[0];
    const signerHash = deserializeAddress(walletAddress).pubKeyHash;
    
    console.log('Wallet Address:', walletAddress);
    console.log('Signer Hash:', signerHash);

    const totalFunding = 50; // ADA
    const milestones = [
        { fundingPercentage: 15 },
        { fundingPercentage: 20 },
        { fundingPercentage: 30 },
        { fundingPercentage: 20 },
        { fundingPercentage: 15 }
    ];

    const datum = buildDatum({
        organization: signerHash, // Use signer as mock org
        researcher: signerHash,   // Use signer as mock researcher
        members: [signerHash],    // Use signer as mock member
        totalFunds: totalFunding,
        milestones: [1,2],
        currentMilestone: 0
    });
    try {
        const plutusData = toPlutusData(datum);
        console.log("✓ Datum is valid Plutus Data:", plutusData);
    } catch (e) {
        console.error("❌ Datum conversion failed:", e);
    }
    

    const assets = [
        {
            unit: 'lovelace',
            quantity: (totalFunding * 1_000_000).toString(),
        },
    ];

    const { scriptAddr } = getScript();
    const utxos = await wallet.getUtxos();

    console.log('Building Transaction...');
    const txBuilder = getTxBuilder();
    console.log(safeStringify(datum));


    await txBuilder
        .txOut(scriptAddr, assets)
        .txOutInlineDatumValue(datum)
        .changeAddress(walletAddress)
        .selectUtxosFrom(utxos)
        .complete();

    const unsignedTx = txBuilder.txHex;
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    console.log(`Transaction submitted! Hash: ${txHash}`);
}

main().catch(console.error);
