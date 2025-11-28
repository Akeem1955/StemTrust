
import {MeshWallet} from "@meshsdk/core";
import dotenv from "dotenv";
import { applyParamsToScript } from "@meshsdk/core-csl";
import {BlockfrostProvider,MeshTxBuilder,serializePlutusScript} from '@meshsdk/core';
import {deserializeAddress, mConStr0,stringToHex } from "@meshsdk/core";
import blueprint from "./smartcontract/plutus.json" with {type:'json'};

dotenv.config()
const blockfrost = process.env.BLOCKFROST
const provider = new BlockfrostProvider(blockfrost)
const mnemonic = process.env.mnemonic


const wallet = new MeshWallet({
    networkId: 0, // 0: testnet, 1: mainnet
    fetcher: provider,
    submitter: provider,
    key: {
        type: 'mnemonic',
        words: mnemonic.split(" "),
    },
});




function getScript() {
  const scriptCbor = applyParamsToScript(
    blueprint.validators[0].compiledCode,
    []
  );
 
  const scriptAddr = serializePlutusScript(
    { code: scriptCbor, version: "V3" },
  ).address;
  console.log("Script Adresss --->" + scriptAddr);
  //return scriptAddr;
  return { scriptCbor, scriptAddr};
}
 
// reusable function to get a transaction builder
function getTxBuilder() {
  return new MeshTxBuilder({
    fetcher: provider,
    submitter: provider,
  });
}
 
// reusable function to get a UTxO by transaction hash
async function getUtxoByTxHash(txHash) {
  const utxos = await provider.fetchUTxOs(txHash);
  if (utxos.length === 0) {
    throw new Error("UTxO not found");
  }
  return utxos[0];
}

 
async function unlockFunds() {
    const utxos = await wallet.getUtxos();
    const walletAddress = (await wallet.getUsedAddresses())[0];
    const collateral = (await wallet.getCollateral())[0];
    const { scriptCbor } = getScript();

    const signerHash = deserializeAddress(walletAddress).pubKeyHash;
  // redeemer value to unlock the funds
    const message = "Akeem1955";

 
  // get the utxo from the script address of the locked funds
    const txHashFromDesposit = "683306fadac36e53dea9769ede174af8691bea78e4a8205c706982826edd4576";
    const scriptUtxo = await getUtxoByTxHash(txHashFromDesposit);
    console.log("===== Script UTxO Info =====");
    console.log("TX Hash       :", scriptUtxo.input.txHash);
    console.log("Output Index  :", scriptUtxo.input.outputIndex);
    console.log("Address       :", scriptUtxo.output.address);
    console.log(
    "Assets        :",
    JSON.stringify(scriptUtxo.output.amount, null, 2) // pretty-print the array
    );
    const redeemerAmount =scriptUtxo.output.amount;
    console.log("=============================");



     // build transaction with MeshTxBuilder
    const txBuilder = getTxBuilder();
    await txBuilder
        .spendingPlutusScript("V3") // we used plutus v3
        .txIn( // spend the utxo from the script address
        scriptUtxo.input.txHash,
        scriptUtxo.input.outputIndex,
        scriptUtxo.output.amount,
        scriptUtxo.output.address
        )
        .txInScript(scriptCbor)
        .txInRedeemerValue(mConStr0([stringToHex(message)])) // provide the required redeemer value `Hello, World!`
        .txInDatumValue(mConStr0([signerHash])) // only the owner of the wallet can unlock the funds or any otheer signer we approved
        .requiredSignerHash(signerHash)
        .changeAddress(walletAddress)
        .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address
        )
        .selectUtxosFrom(utxos)
        .complete();
    const unsignedTx = txBuilder.txHex;
    
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);
    console.log(`${redeemerAmount} tADA unlocked from the contract at Tx ID: ${txHash}`);
    
}


async function main() {
  // assets to lock in the contract
  const assets = [
    {
      unit: "lovelace",
      quantity: "1000000000",
    },
  ];

  // get utxos and wallet address
  const utxos = await wallet.getUtxos();
  const walletAddress = (await wallet.getUsedAddresses())[0];
  const { scriptAddr } = getScript();

  // hash of the public key of the wallet (used in datum)
  const signerHash = deserializeAddress(walletAddress).pubKeyHash;

  // build transaction with MeshTxBuilder
  const txBuilder = getTxBuilder();
  await txBuilder
    .txOut(scriptAddr, assets) // send assets to validator
    .txOutDatumHashValue(mConStr0([signerHash])) // datum: constructor 0
    .changeAddress(walletAddress) // change back to wallet
    .selectUtxosFrom(utxos)
    .complete();

  const unsignedTx = txBuilder.txHex;

  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);

  console.log(`1 tADA locked into the contract at Tx ID: ${txHash}`);
}

unlockFunds();
