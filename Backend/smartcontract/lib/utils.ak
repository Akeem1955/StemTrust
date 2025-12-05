use aiken/collection/list
use cardano/address.{Address}
use cardano/transaction.{Input, Output, OutputReference, find_input}

pub fn inputs_at(inputs: List<Input>, address: Address) -> List<Input> {
  list.filter(inputs, fn(input) { input.output.address == address })
}

pub fn outputs_at(outputs: List<Output>, address: Address) -> List<Output> {
  list.filter(outputs, fn(output) { output.address == address })
}

pub fn single_script_input(
  inputs: List<Input>,
  own_ref: OutputReference,
) -> Option<Input> {
  expect Some(own_input) = find_input(inputs, own_ref)
  let script_address = own_input.output.address
  let script_inputs = inputs_at(inputs, script_address)
  when script_inputs is {
    [_single] -> Some(own_input)
    _ -> None
  }
}
