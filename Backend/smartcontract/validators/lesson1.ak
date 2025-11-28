use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/primitive/string
use cardano/transaction.{OutputReference, Transaction}

pub type Datum {
  owner: VerificationKeyHash,
}


pub type Redeemer {
  passcode: ByteArray,
}


validator spendMoney {
  spend(
    datum: Option<Datum>,
    redeemer: Redeemer,
    ref: OutputReference,
    self: Transaction,
  ) {
    trace @"redeemer": string.from_bytearray(redeemer.passcode)
    expect Some(Datum { owner }) = datum
    let is_passcode = redeemer.passcode == "Akeem1955"
    let must_be_signed = list.has(self.extra_signatories, owner)
    is_passcode? && must_be_signed
  }
}


test spend_money_test(){
  let datum =
    Datum { owner: #"00000000000000000000000000000000000000000000000000000000" }
 
  let redeemer = Redeemer { passcode: "Akeem1955" }
 
  let placeholder_utxo = OutputReference { transaction_id: "", output_index: 0 }

  spendMoney.spend(Some(datum),redeemer,placeholder_utxo, Transaction { ..transaction.placeholder, extra_signatories: [datum.owner] },)
}

