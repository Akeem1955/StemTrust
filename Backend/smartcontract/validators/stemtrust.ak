use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, VerificationKey}
use cardano/assets.{lovelace_of}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}

pub type Milestone {
  percentage: Int,
}

pub type StemTrustDatum {
  organization: VerificationKeyHash,
  researcher: VerificationKeyHash,
  members: List<VerificationKeyHash>,
  total_funds: Int,
  milestones: List<Milestone>,
  current_milestone: Int,
}

pub type Action {
  Claim
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
    _redeemer: Action,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(datum) = datum_opt
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
    expect signed_members * 100 > total_members * 75

    // STEP 4: Validate Funds Release
    expect Some(milestone) = list.at(datum.milestones, datum.current_milestone)

    let release_amount = datum.total_funds * milestone.percentage / 100
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
