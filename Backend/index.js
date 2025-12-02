import { MeshWallet, BlockfrostProvider, MeshTxBuilder, serializePlutusScript, mConStr0, stringToHex, deserializeAddress, mConStr, mInt, mList } from '@meshsdk/core';
import { applyParamsToScript } from "@meshsdk/core-csl";
import dotenv from "dotenv";
import fs from 'node:fs';

// Load blueprint
const blueprint = JSON.parse(fs.readFileSync('./smartcontract/plutus.json', 'utf-8'));

dotenv.config();

const blockfrost = process.env.BLOCKFROST;
// Note: In a real app, you might want to handle the case where env vars are missing
if (!blockfrost) {
    console.warn("Warning: BLOCKFROST environment variable is not set.");
}

const provider = new BlockfrostProvider(blockfrost || "YOUR_BLOCKFROST_KEY_HERE");
const mnemonic = process.env.mnemonic || "YOUR_MNEMONIC_HERE";

const wallet = new MeshWallet({
    networkId: 0, // 0: testnet, 1: mainnet (Preprod is 0)
    fetcher: provider,
    submitter: provider,
    key: {
        type: 'mnemonic',
        words: mnemonic.split(" "),
    },
});

function getScript() {
    // Find the stem_trust validator
    const validator = blueprint.validators.find(v => v.title === "stemtrust.stem_trust.spend");
    
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

function getTxBuilder() {
    return new MeshTxBuilder({
        fetcher: provider,
        submitter: provider,
    });
}

async function getUtxoByTxHash(txHash) {
    const utxos = await provider.fetchUTxOs(txHash);
    if (utxos.length === 0) {
        throw new Error("UTxO not found");
    }
    return utxos[0];
}

// --- Data Construction Helpers ---

function buildMilestone(percentage) {
    // Milestone { percentage: Int } -> Constr 0 [Int]
    return mConStr0([BigInt(percentage)]);
}

function buildDatum(params) {
    const {
        organization, // VerificationKeyHash (Hex String)
        researcher,   // VerificationKeyHash (Hex String)
        members,      // List<VerificationKeyHash>
        totalFunds,   // Int
        milestones,   // List<{ percentage: number }>
        currentMilestone // Int
    } = params;

    // StemTrustDatum { ... } -> Constr 0 [Org, Res, Members, Total, Milestones, Current]
    return mConStr0([
        organization,
        researcher,
        mList(members), // List of ByteArrays (strings)
        BigInt(totalFunds),
        mList(milestones.map(m => buildMilestone(m.percentage))),
        BigInt(currentMilestone)
    ]);
}

// --- Main Functions ---

async function lockFunds() {
    console.log("Locking funds...");
    const { scriptAddr } = getScript();
    const walletAddress = (await wallet.getUsedAddresses())[0];
    const signerHash = deserializeAddress(walletAddress).pubKeyHash;

    // Example Data
    const totalFunds = 10_000_000; // 10 ADA
    const milestones = [
        { percentage: 30 }, // 30%
        { percentage: 30 }, // 30%
        { percentage: 40 }  // 40%
    ];

    // For this example, we use the current wallet as both organization and researcher for simplicity,
    // and add it as a member so it can vote.
    const datum = buildDatum({
        organization: signerHash,
        researcher: signerHash, // In reality, this would be the researcher's PKH
        members: [signerHash],  // Organization members who can vote
        totalFunds: totalFunds,
        milestones: milestones,
        currentMilestone: 0
    });

    const assets = [
        {
            unit: "lovelace",
            quantity: totalFunds.toString(),
        },
    ];

    const txBuilder = getTxBuilder();
    await txBuilder
        .txOut(scriptAddr, assets)
        .txOutDatumHashValue(datum)
        .changeAddress(walletAddress)
        .selectUtxosFrom(await wallet.getUtxos())
        .complete();

    const unsignedTx = txBuilder.txHex;
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    console.log(`Funds locked! Tx Hash: ${txHash}`);
    return txHash;
}

async function unlockFunds(scriptTxHash, scriptOutputIndex = 0) {
    console.log(`Unlocking funds from Tx: ${scriptTxHash}...`);
    const { scriptCbor, scriptAddr } = getScript();
    const walletAddress = (await wallet.getUsedAddresses())[0];
    const collateral = (await wallet.getCollateral())[0];
    const signerHash = deserializeAddress(walletAddress).pubKeyHash;

    // Fetch the UTxO to spend
    // Note: In a real app, you'd filter UTxOs at the script address to find the right one
    // Here we assume we know the TxHash of the deposit
    let scriptUtxo;
    try {
        // We can't easily get a specific output by index via blockfrost provider helper sometimes, 
        // so we fetch all utxos for the script address and find the one matching our hash.
        const utxos = await provider.fetchAddressUTxOs(scriptAddr);
        scriptUtxo = utxos.find(u => u.input.txHash === scriptTxHash && u.input.outputIndex === scriptOutputIndex);
    } catch (e) {
        console.error("Error fetching script UTxOs:", e);
    }

    if (!scriptUtxo) {
        console.error("Script UTxO not found. Wait for block confirmation if you just locked.");
        return;
    }

    // Reconstruct the Datum from the UTxO or assume we know it. 
    // In a real app, you would parse the inline datum from the UTxO.
    // For this demo, we'll reconstruct the *expected* next state manually or 
    // ideally, we should read the datum from the chain.
    // Since parsing PlutusData from the chain response can be complex without the type definition,
    // we will assume the same parameters as 'lockFunds' but updated for the next step.
    
    // NOTE: To make this robust, we should decode the inline datum.
    // For now, we will proceed with the logic that we are the organization and we approve.

    // Redeemer: Action.Claim -> Constr 0 []
    const redeemer = mConStr0([]);

    // We need to calculate the output amount and remaining amount
    // This logic mirrors the smart contract.
    // Let's assume we are claiming the first milestone (index 0) of the example above.
    const totalFunds = 10_000_000;
    const milestones = [{ percentage: 30 }, { percentage: 30 }, { percentage: 40 }];
    const currentMilestoneIndex = 0;
    
    const releasePercentage = milestones[currentMilestoneIndex].percentage;
    const releaseAmount = (BigInt(totalFunds) * BigInt(releasePercentage)) / 100n;
    const remainingAmount = BigInt(scriptUtxo.output.amount[0].quantity) - releaseAmount;

    // Next Datum
    const nextDatum = buildDatum({
        organization: signerHash,
        researcher: signerHash,
        members: [signerHash],
        totalFunds: totalFunds,
        milestones: milestones,
        currentMilestone: currentMilestoneIndex + 1
    });

    const txBuilder = getTxBuilder();
    
    // Spend the script input
    txBuilder
        .spendingPlutusScript("V3")
        .txIn(
            scriptUtxo.input.txHash,
            scriptUtxo.input.outputIndex,
            scriptUtxo.output.amount,
            scriptUtxo.output.address
        )
        .txInScript(scriptCbor)
        .txInRedeemerValue(redeemer)
        .txInDatumValue(scriptUtxo.output.plutusData) // Pass the *current* datum (inline)
        .requiredSignerHash(signerHash); // Organization signature

    // Output to Researcher
    txBuilder.txOut(walletAddress, [{ unit: "lovelace", quantity: releaseAmount.toString() }]);

    // Output remaining to Script (if any)
    if (remainingAmount > 0n) {
        txBuilder
            .txOut(scriptAddr, [{ unit: "lovelace", quantity: remainingAmount.toString() }])
            .txOutDatumHashValue(nextDatum); // Updated datum
    }

    txBuilder
        .changeAddress(walletAddress)
        .txInCollateral(
            collateral.input.txHash,
            collateral.input.outputIndex,
            collateral.output.amount,
            collateral.output.address
        )
        .selectUtxosFrom(await wallet.getUtxos())
        .complete();

    const unsignedTx = txBuilder.txHex;
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    console.log(`Milestone claimed! Tx Hash: ${txHash}`);
}

// --- Execution ---

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
        if (command === 'lock') {
            await lockFunds();
        } else if (command === 'unlock') {
            const txHash = args[1];
            if (!txHash) {
                console.error("Please provide the TxHash of the locked funds.");
                return;
            }
            await unlockFunds(txHash);
        } else {
            console.log("Usage:");
            console.log("  node index.js lock");
            console.log("  node index.js unlock <txHash>");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
