import { MeshWallet, BlockfrostProvider, MeshTxBuilder, serializePlutusScript, mConStr0, stringToHex, deserializeAddress, list, integer, Data } from '@meshsdk/core';
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

const blockfrost = process.env.BLOCKFROST;
const mnemonic = process.env.mnemonic;

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

// --- Data Construction Helpers ---

function buildMilestone(percentage: number) {
    // Milestone { percentage: Int } -> Constr 0 [Int]
    return mConStr0([integer(percentage) as any]);
}

export function buildDatum(params: {
    organization: string;
    researcher: string;
    members: string[];
    totalFunds: number;
    milestones: number[];
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

    const datum: Data = {
        alternative: 0,
        fields: [
            organization,
            researcher,
            members,
            totalFunds,
            milestones,
            currentMilestone
        ],
    };
    return datum;
}

export async function lockFunds(
    totalFunds: number,
    milestones: { percentage: number }[],
    organizationHash: string,
    researcherHash: string,
    members: string[]
) {
    if (!wallet) throw new Error("Wallet not initialized");
    
    console.log("Locking funds...");
    const { scriptAddr } = getScript();
    const walletAddress = (await wallet.getUsedAddresses())[0];
    
    const datum = buildDatum({
        organization: organizationHash,
        researcher: researcherHash,
        members: members,
        totalFunds: totalFunds,
        milestones: milestones.map(m => m.percentage),
        currentMilestone: 0
    });

    const assets = [
        {
            unit: "lovelace",
            quantity: (totalFunds * 1_000_000).toString(), // Convert ADA to Lovelace
        },
    ];

    const txBuilder = getTxBuilder();
    await txBuilder
        .txOut(scriptAddr, assets)
        .txOutInlineDatumValue(datum)
        .changeAddress(walletAddress)
        .selectUtxosFrom(await wallet.getUtxos())
        .complete();

    const unsignedTx = txBuilder.txHex;
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    console.log(`Funds locked! Tx Hash: ${txHash}`);
    return txHash;
}

export async function releaseFunds(milestoneId: string, amount: number, recipientAddress: string) {
    console.log(`[Mock Smart Contract] Releasing ${amount} ADA for milestone ${milestoneId} to ${recipientAddress}`);
    // In a real implementation, this would:
    // 1. Find the script UTXO
    // 2. Construct a transaction with the correct redeemer (e.g. Approve)
    // 3. Sign and submit
    return "mock-tx-hash-release";
}

// Export wallet for other uses
export { wallet, provider };
