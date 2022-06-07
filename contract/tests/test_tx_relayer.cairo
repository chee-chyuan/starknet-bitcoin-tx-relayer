%lang starknet
from starkware.cairo.common.cairo_builtins import HashBuiltin
from tests.utils.tx_relayer_interface import ITxRelayer

func setup{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}(
owner_address:felt
) -> (contract_address:felt):
    alloc_locals

    local contract_address : felt
    let owner_address = 1
    %{ 
        ids.contract_address = deploy_contract("./src/tx_relayer.cairo", [ids.owner_address]).contract_address
    %}
    return (contract_address=contract_address)
end

@external
func test_owner_initialized_correctly{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}():
    let owner_address = 1
    let (contract_address) = setup(owner_address)
    let (owner_res) = ITxRelayer.get_owner(contract_address=contract_address)
    assert owner_res = owner_address

    return ()
end