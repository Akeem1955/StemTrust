use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/interval
use cardano/address.{Address, VerificationKey}
use cardano/assets.{from_lovelace, lovelace_of}
use cardano/transaction.{
  InlineDatum, Input, NoDatum, Output, OutputReference, Transaction,
}

pub type Milestone {
  percentage: Int,
}

pub type StemTrustDatum {
  organization: VerificationKeyHash,
  researcher: VerificationKeyHash,
  members: List<VerificationKeyHash>,
  total_funds: Int,
  milestones: List<Int>,
  current_milestone: Int,
}

pub type StemTrustRedeemer {
  ApproveMilestone {
    milestone_index: Int,
    voter_signatures: List<VerificationKeyHash>,
  }
  RejectMilestone {
    milestone_index: Int,
    voter_signatures: List<VerificationKeyHash>,
  }
  AdminReclaim { reason: ByteArray }
}

fn single_script_input(
  inputs: List<Input>,
  own_ref: OutputReference,
) -> Option<Input> {
  list.find(inputs, fn(input) { input.output_reference == own_ref })
}

fn inputs_at(inputs: List<Input>, address: Address) -> List<Input> {
  list.filter(inputs, fn(input) { input.output.address == address })
}

validator stem_trust {
  spend(
    datum_opt: Option<StemTrustDatum>,
    redeemer: StemTrustRedeemer,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(datum) = datum_opt
    // TODO: Handle other redeemer cases. Currently restricted to ApproveMilestone to match previous logic.
    expect ApproveMilestone { .. } = redeemer
    let Transaction { inputs, outputs, extra_signatories, .. } = self

    // STEP 1: Prevent Double-Satisfaction & Locate Input
    expect Some(own_input) = single_script_input(inputs, own_ref)

    // STEP 2: Address Filtering
    let script_inputs = inputs_at(inputs, own_input.output.address)
    expect list.length(script_inputs) == 1

    // STEP 3: Check Signatures (Organization + Voting)
    expect list.has(extra_signatories, datum.organization)

    let total_members = list.length(datum.members)
    let signed_members =
      list.count(
        datum.members,
        fn(member) { list.has(extra_signatories, member) },
      )

    // > 75% approval
    expect signed_members * 100 >= total_members * 75

    // STEP 4: Validate Funds Release
    expect Some(milestone) = list.at(datum.milestones, datum.current_milestone)

    let release_amount = datum.total_funds * milestone / 100
    let current_value = lovelace_of(own_input.output.value)

    let next_milestone_index = datum.current_milestone + 1
    let is_last_milestone =
      next_milestone_index >= list.length(datum.milestones)

    // Ensure researcher gets paid
    let researcher_payment =
      list.filter(
        outputs,
        fn(output) {
          output.address.payment_credential == VerificationKey(datum.researcher)
        },
      )
    let total_paid =
      list.foldl(
        researcher_payment,
        0,
        fn(out, acc) { acc + lovelace_of(out.value) },
      )
    expect total_paid >= release_amount

    if is_last_milestone {
      True
    } else {
      // Continuing output required
      expect Some(own_output) =
        list.find(
          outputs,
          fn(output) { output.address == own_input.output.address },
        )

      // Validate Output Value
      let expected_remaining = current_value - release_amount
      expect lovelace_of(own_output.value) >= expected_remaining

      // Validate Output Datum
      expect InlineDatum(output_datum_data) = own_output.datum
      expect output_datum: StemTrustDatum = output_datum_data

      expect output_datum.organization == datum.organization
      expect output_datum.researcher == datum.researcher
      expect output_datum.members == datum.members
      expect output_datum.total_funds == datum.total_funds
      expect output_datum.milestones == datum.milestones
      expect output_datum.current_milestone == next_milestone_index

      True
    }
  }

  else(_) {
    fail
  }
}

//
// Helpers

//
fn base_datum() -> StemTrustDatum {
  StemTrustDatum {
    organization: #"6f7267",
    // "org"
    researcher: #"726573",
    // "res"
    members: [#"6d31", #"6d32", #"6d33", #"6d34"],
    // "m1", "m2", "m3", "m4"
    total_funds: 100_000_000,
    milestones: [25,25,50],
    current_milestone: 0,
  }
}

fn approve_redeemer() -> StemTrustRedeemer {
  ApproveMilestone {
    milestone_index: 0,
    voter_signatures: [#"6d31", #"6d32", #"6d33"],
  }
  // 3/4 = 75%+
}

//
// TEST 1: Success case — single script input + valid release
//
fn mock_valid_tx() -> Transaction {
  let datum = base_datum()
  let release_amount = datum.total_funds * 25 / 100
  let remaining = datum.total_funds - release_amount
  let tx_id =
    #"0000000000000000000000000000000000000000000000000000000000000000"

  let own_ref = OutputReference { transaction_id: tx_id, output_index: 0 }
  let script_address =
    Address {
      payment_credential: VerificationKey(datum.organization),
      stake_credential: None,
    }

  let own_input =
    Input {
      output_reference: own_ref,
      output: Output {
        address: script_address,
        value: from_lovelace(datum.total_funds),
        datum: InlineDatum(datum),
        reference_script: None,
      },
    }

  let researcher_output =
    Output {
      address: Address {
        payment_credential: VerificationKey(datum.researcher),
        stake_credential: None,
      },
      value: from_lovelace(release_amount),
      datum: NoDatum,
      reference_script: None,
    }

  let script_output =
    Output {
      address: script_address,
      value: from_lovelace(remaining),
      datum: InlineDatum(StemTrustDatum { ..datum, current_milestone: 1 }),
      reference_script: None,
    }

  Transaction {
    inputs: [own_input],
    reference_inputs: [],
    outputs: [researcher_output, script_output],
    fee: 0,
    mint: from_lovelace(0),
    certificates: [],
    withdrawals: [],
    validity_range: interval.everything,
    extra_signatories: [datum.organization, #"6d31", #"6d32", #"6d33"],
    redeemers: [],
    datums: dict.empty,
    id: tx_id,
    votes: [],
    proposal_procedures: [],
    current_treasury_amount: None,
    treasury_donation: None,
  }
}

test test_valid_milestone_pass() {
  let datum = base_datum()
  let tx = mock_valid_tx()
  let tx_id =
    #"0000000000000000000000000000000000000000000000000000000000000000"
  let own_ref = OutputReference { transaction_id: tx_id, output_index: 0 }

  stem_trust.spend(Some(datum), approve_redeemer(), own_ref, tx)
}
//
// TEST 2: Failure case — double script inputs (double-satisfaction attack)
//
// fn mock_double_input_fail_tx() -> Transaction {

//   let datum = base_datum()
//   let tx_id = #"0000000000000000000000000000000000000000000000000000000000000000"
//   let tx_id2 = #"1111111111111111111111111111111111111111111111111111111111111111"

//   let own_ref = OutputReference { transaction_id: tx_id, output_index: 0 }
//   let other_ref = OutputReference { transaction_id: tx_id2, output_index: 1 }
//   let script_address = Address { payment_credential: VerificationKey(datum.organization), stake_credential: None }

//   let own_input =
//     Input {
//       output_reference: own_ref,
//       output: Output {
//         address: script_address,
//         value: from_lovelace(datum.total_funds),
//         datum: InlineDatum(datum),
//         reference_script: None,
//       },
//     }

//   let other_input =
//     Input {
//       output_reference: other_ref,
//       output: Output {
//         address: script_address,
//         value: from_lovelace(datum.total_funds),
//         datum: InlineDatum(datum),
//         reference_script: None,
//       },
//     }

//   Transaction {
//     inputs: [own_input, other_input],
//     reference_inputs: [],
//     outputs: [],
//     fee: 0,
//     mint: from_lovelace(0),
//     certificates: [],
//     withdrawals: [],
//     validity_range: interval.everything,
//     extra_signatories: [],
//     redeemers: [],
//     datums: dict.empty,
//     id: tx_id,
//     votes: [],
//     proposal_procedures: [],
//     current_treasury_amount: None,
//     treasury_donation: None,
//   }
// }

// test test_double_input_fails() {
//   let datum = base_datum()
//   let tx = mock_double_input_fail_tx()
//   let tx_id = #"0000000000000000000000000000000000000000000000000000000000000000"
//   let own_ref = OutputReference { transaction_id: tx_id, output_index: 0 }

//   !stem_trust.spend(
//     Some(datum),
//     approve_redeemer(),
//     own_ref,
//     tx
//   )
// }
