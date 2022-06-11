%lang starknet
from starkware.cairo.common.cairo_builtins import HashBuiltin, BitwiseBuiltin
from tests.utils.tx_relayer_interface import ITxRelayer
from starkware.cairo.common.uint256 import Uint256
from starkware.cairo.common.alloc import alloc

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

    %{ stop_prank_callable = start_prank(0, target_contract_address=ids.contract_address) %}
    %{ expect_revert(error_message="Ownable: caller is not the owner") %}
    ITxRelayer.set_relayer(contract_address=contract_address,address=Relayer_Address,is_relayer=1)
    %{ stop_prank_callable() %}
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
    let(contract_address) = setup_with_relayer(Owner_Address, Relayer_Address)
    %{
        stop_prank_callable = start_prank(ids.Owner_Address, target_contract_address=ids.contract_address)
        expect_revert(error_message="Caller is not a relayer") 
    %}
    ITxRelayer.relay_tx_root_by_block_number(
        contract_address=contract_address,block_number=1,tx_root=Uint256(0,1))
    %{ stop_prank_callable() %}
    return ()
end

@external
func test_able_to_update_tx_root_by_relayer{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}():
    let(contract_address) = setup_with_relayer(Owner_Address, Relayer_Address)
    %{
        stop_prank_callable = start_prank(ids.Relayer_Address, target_contract_address=ids.contract_address)
    %}
    ITxRelayer.relay_tx_root_by_block_number(
        contract_address=contract_address,block_number=1,tx_root=Uint256(0,1))
    %{ stop_prank_callable() %}
    let(tx_root) = ITxRelayer.get_tx_root_by_block_number(contract_address=contract_address,block_number=1)
    assert tx_root = Uint256(0,1)
    return ()
end

@external
func test_able_to_verify_proof{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}():
    alloc_locals
    let(contract_address) = setup_with_relayer(Owner_Address, Relayer_Address)
    local index: felt
    local path_len: felt
    local current_leaf: Uint256
    local root: Uint256
    local path_0: Uint256
    local path_1: Uint256
    %{
        import sys
        from binascii import unhexlify
        from pathlib import Path
        sys.path.append(str(Path().absolute()) + '/py_utils')
        import bitcoin_utils

        leaves = ["4d6df6b6661519d4e985ff3bd612bc92d3c649b013967c78ce6b2d5c2c969433"]
        index = 1
        merkle_root = "9a0c3ef9e981d270dc284ee985c94ae325bf79cbe7ea8d8bfefc6ed00e94222a"
        merkle_path = ['4d6df6b6661519d4e985ff3bd612bc92d3c649b013967c78ce6b2d5c2c969433', '0d8de9394218a1c86807978c05fa46491d69adf35ea20afd1dfb2e37b141259b']

        root = bitcoin_utils.convert_hex_to_uint256(merkle_root)
        ids.root.high = root[0]
        ids.root.low = root[1]

        ids.index = index
        ids.path_len = len(merkle_path)

        leaf = bitcoin_utils.convert_hex_to_uint256(leaves[0])
        ids.current_leaf.high = leaf[0]
        ids.current_leaf.low = leaf[1]

        path_0_uint256 = bitcoin_utils.convert_hex_to_uint256(merkle_path[0])
        path_1_uint256 = bitcoin_utils.convert_hex_to_uint256(merkle_path[1])

        ids.path_0.high = path_0_uint256[0]
        ids.path_0.low = path_0_uint256[1]

        ids.path_1.high = path_1_uint256[0]
        ids.path_1.low = path_1_uint256[1]
        # for i in range(len(merkle_path)):
        #     path = bitcoin_utils.convert_hex_to_uint256(merkle_path[i])
        #     # not sure if this works, try first
        #     memory[ids.path[i]] = (path[1], path[0])
        #     # memory[ids.path[i].high] = path[0]
        
        stop_prank_callable = start_prank(ids.Relayer_Address, target_contract_address=ids.contract_address)
    %}

    let (path:Uint256*) = alloc()
    assert path[0] = path_0
    assert path[1] = path_1

    ITxRelayer.relay_tx_root_by_block_number(
        contract_address=contract_address,block_number=1,tx_root=root)
    %{ stop_prank_callable() %}

    let (verify_result) = ITxRelayer.verify_txs_in_block(
        contract_address=contract_address,block_number=1,index=index,leaf=current_leaf,path_len=path_len,path=path
        )
    assert verify_result = 1

    let (incorrect_path:Uint256*) = alloc()
    assert incorrect_path[0] = path_0
    assert incorrect_path[1] = path_0

    # wrong result
    let (failed_result) = ITxRelayer.verify_txs_in_block(
        contract_address=contract_address,block_number=1,index=index,leaf=current_leaf,path_len=path_len,path=incorrect_path
        )
    assert failed_result = 0
    return ()
end
