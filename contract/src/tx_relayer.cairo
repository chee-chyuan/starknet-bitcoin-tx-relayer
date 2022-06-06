%lang starknet
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.cairo_builtins import BitwiseBuiltin
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.uint256 import Uint256, uint256_eq
from starkware.cairo.common.cairo_keccak.keccak import finalize_keccak,keccak_uint256s_bigend
from starkware.cairo.common.alloc import alloc
from src.ownable import Ownable_initializer, Ownable_only_owner

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():
    let (owner) = get_caller_address()
    Ownable_initializer(owner)
    return ()
end

@storage_var
func latest_blocknumber() -> (block_number: felt):
end

@storage_var
func tx_roots(block_number:felt) -> (tx_root:Uint256):
end

@storage_var
func relayers(address: felt)-> (is_relayer: felt):
end

@event
func update_relayer(address: felt, is_relayer: felt):
end

@event 
func stored_tx_root(block_number:felt, tx_root:Uint256):
end

@external
func relayer_tx_root_by_block_number{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}(
block_number:felt, tx_root:Uint256
):
    only_relayer()
    tx_roots.write(block_number,tx_root)
    latest_blocknumber.write(block_number)
    stored_tx_root.emit(block_number=block_number, tx_root=tx_root)
    return ()
end

@view
func get_is_relayer{syscall_ptr:felt*, range_check_ptr, pedersen_ptr: HashBuiltin*}(
address: felt) -> (res: felt):
    let (res) = relayers.read(address)
    return (res=res)
end

@external
func set_relayer{syscall_ptr:felt*, range_check_ptr, pedersen_ptr: HashBuiltin*}(
address:felt, is_relayer:felt
):
    Ownable_only_owner()
    relayers.write(address, is_relayer)
    update_relayer.emit(address=address, is_relayer=is_relayer)
    return ()
end

@view
func get_latest_block_number{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}(
) -> (res:felt):
    let (res) = latest_blocknumber.read()
    return (res=res)
end

@view 
func get_tx_root_by_block_number{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}(
block_number:felt
) -> (res:Uint256):
    let (root) = tx_roots.read(block_number)
    return (res=root)
end

@view
func verify_txs_in_block{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*, bitwise_ptr:BitwiseBuiltin*}(
block_number:felt, index:felt, leaf:Uint256, path_len:felt, path:Uint256*
) -> (res:felt):
    alloc_locals

    let (local keccak_ptr_start) = alloc()
    let keccak_ptr = keccak_ptr_start

    let (root) = generate_merkle_root{keccak_ptr=keccak_ptr}(current_leaf=leaf, path=path, path_size=path_len, index=index)
    finalize_keccak(keccak_ptr_start=keccak_ptr_start, keccak_ptr_end=keccak_ptr)

    let (stored_tx_root) = get_tx_root_by_block_number(block_number=block_number)
    let (is_equal) = uint256_eq(stored_tx_root, root)
    return (res=is_equal)
end

func only_relayer{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}():
    let (caller) = get_caller_address()
    let (is_relayer) = relayers.read(caller)
    with_attr error_message("Ownable: caller is not the owner"):
        assert is_relayer = 1
    end
    return ()
end

func mod_2{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*}(val: felt)->(res: felt):
    if val == 0:
        return (res=val)
    end

    if val == 1:
        return (res=val)
    end
    
    let (res) = mod_2(val=val-2)
    return (res=res)
end

func generate_merkle_root{syscall_ptr:felt*, range_check_ptr, pedersen_ptr:HashBuiltin*, bitwise_ptr: BitwiseBuiltin*, keccak_ptr : felt*}(
current_leaf: Uint256, path: Uint256*, path_size:felt, index:felt
) -> (res: Uint256):
    alloc_locals
    if path_size == 0:
        return (res=current_leaf)
    end

    let (to_hash:Uint256*) = alloc()

    let (mod_res) = mod_2(index)
    local new_index
    if mod_res == 0:
        new_index = index

        assert to_hash[0] = current_leaf
        assert to_hash[1] = path[0]
    else:
        new_index = index - 1

        assert to_hash[0] = path[0]
        assert to_hash[1] = current_leaf
    end

    let (keccak_res) = keccak_uint256s_bigend(n_elements=2, elements=to_hash)

    let (root) = generate_merkle_root(
    current_leaf=keccak_res, path=&path[1], path_size=path_size-1, index=new_index/2)
    return (res=root)
end