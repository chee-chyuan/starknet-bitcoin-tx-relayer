%lang starknet
from starkware.cairo.common.cairo_builtins import HashBuiltin
from tests.utils.tx_relayer_interface import ITxRelayer

const Owner_Address = 1
const Relayer_Address = 2

func setup{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}(
owner_address:felt
) -> (contract_address:felt):
    alloc_locals

    local contract_address : felt
    %{ 
        ids.contract_address = deploy_contract("./src/tx_relayer.cairo", [ids.owner_address]).contract_address
    %}
    return (contract_address=contract_address)
end

func setup_with_relayer{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}(
owner_address:felt, relayer_address:felt
) -> (contract_address:felt):
    let (contract_address) = setup(owner_address)

    %{ stop_prank_callable = start_prank(ids.Owner_Address, target_contract_address=ids.contract_address) %}
    ITxRelayer.set_relayer(contract_address=contract_address,address=relayer_address,is_relayer=1)
    %{ stop_prank_callable() %}

    return (contract_address=contract_address)
end

@external
func test_owner_initialized_correctly{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}():
    let (contract_address) = setup(Owner_Address)
    let (owner_res) = ITxRelayer.get_owner(contract_address=contract_address)
    assert owner_res = Owner_Address

    return ()
end

@external 
func test_fail_to_set_relayer_by_non_owner{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}():
    let (contract_address) = setup(Owner_Address)

    # %{ stop_prank_callable = start_prank(0, target_contract_address=ids.contract_address) %}
    %{ expect_revert(error_message="Ownable: caller is not the owner") %}
    ITxRelayer.set_relayer(contract_address=contract_address,address=Relayer_Address,is_relayer=1)
    # %{ stop_prank_callable() %}
    return ()
end

@external 
func test_able_to_set_relayer_by_owner{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}():
    let (contract_address) = setup(Owner_Address)

    let (is_relayer_before) = ITxRelayer.get_is_relayer(contract_address=contract_address,address=Relayer_Address)
    assert is_relayer_before = 0

    %{ stop_prank_callable = start_prank(ids.Owner_Address, target_contract_address=ids.contract_address) %}
    %{ expect_events({"name": "update_relayer", "data": [ids.Relayer_Address, 1]}) %}
    ITxRelayer.set_relayer(contract_address=contract_address,address=Relayer_Address,is_relayer=1)
    %{ stop_prank_callable() %}

    let(is_relayer_after) = ITxRelayer.get_is_relayer(contract_address=contract_address,address=Relayer_Address)
    assert is_relayer_after = 1

    return ()
end

@external
func test_fail_to_update_tx_root_by_non_relayer{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}():
    return ()
end

@external
func test_able_to_update_tx_root_by_relayer{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}():
    return ()
end

@external
func test_able_to_verify_proof{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}():
    return ()
end
