%lang starknet
from starkware.cairo.common.uint256 import Uint256

@contract_interface
namespace ITxRelayer:
    func get_owner() -> (owner: felt):
    end

    func set_relayer(address:felt, is_relayer:felt):
    end

    func get_is_relayer(address: felt) -> (res: felt):
    end

    func relayer_tx_root_by_block_number(
    block_number:felt, tx_root:Uint256
    ):
    end

    func get_latest_block_number() -> (res:felt):
    end

    func get_tx_root_by_block_number(block_number:felt) -> (res:Uint256):
    end

    func verify_txs_in_block(
    block_number:felt, index:felt, leaf:Uint256, path_len:felt, path:Uint256*
    ) -> (res:felt):
    end
end