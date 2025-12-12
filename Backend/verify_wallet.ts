
import { MeshWallet, BlockfrostProvider, deserializeAddress } from '@meshsdk/core';

async function main() {
    // Suppress console.log from libraries if any
    const originalLog = console.log;

    console.log("INITIALIZING...");
    const mnemonic = "guitar parade barrel cram canoe trim repair stumble alone put sort since electric isolate post sentence immune vital dolphin width twelve napkin magic devote";
    const provider = new BlockfrostProvider("preprod5P25YCSuWCXnr1nZoXyfUSQTJHz9ik3d");
    const wallet = new MeshWallet({
        networkId: 0,
        fetcher: provider,
        submitter: provider,
        key: {
            type: 'mnemonic',
            words: mnemonic.split(" "),
        },
    });

    console.log("FETCHING UTXOS...");
    const utxos = await wallet.getUtxos();

    const utxoCount = utxos.length;
    let totalLovelace = 0;
    const largeUtxos = [];

    for (const u of utxos) {
        const quantity = Number(u.output.amount.find(a => a.unit === 'lovelace')?.quantity || 0);
        totalLovelace += quantity;
        if (quantity > 10_000_000) { // > 10 ADA
            largeUtxos.push(quantity / 1_000_000);
        }
    }

    console.log("Checking wallet from deploy.sh mnemonic...");
    const usedAddresses = await wallet.getUsedAddresses();
    const address = usedAddresses[0];
    console.log("Used Address:", address);

    // Derive PubKeyHash
    const pkh = deserializeAddress(address).pubKeyHash;
    console.log("PubKeyHash:", pkh);
    console.log("---------- SUMMARY ----------");
    console.log(`UTXO Count: ${utxoCount}`);
    console.log(`Total ADA: ${totalLovelace / 1_000_000}`);
    console.log(`Large UTXOs (>10 ADA):`, largeUtxos);
    console.log("-----------------------------");
}

main().catch(e => console.error("ERROR:", e));
