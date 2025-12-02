import { BlockfrostProvider, MeshWallet } from '@meshsdk/core';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const blockfrost = process.env.BLOCKFROST;
    const mnemonic = process.env.mnemonic;

    if (!blockfrost || !mnemonic) {
        console.error("Missing BLOCKFROST or mnemonic in .env");
        return;
    }

    const provider = new BlockfrostProvider(blockfrost);
    const wallet = new MeshWallet({
        networkId: 0,
        fetcher: provider,
        submitter: provider,
        key: {
            type: 'mnemonic',
            words: mnemonic.split(' ')
        }
    });

    const address = await wallet.getChangeAddress();
    console.log("Wallet Address:", address);

    const lovelace = await wallet.getLovelace();
    console.log("Balance (Lovelace):", lovelace);
    console.log("Balance (ADA):", parseInt(lovelace) / 1000000);
}

main().catch(console.error);
