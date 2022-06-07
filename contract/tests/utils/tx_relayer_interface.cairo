%lang starknet

@contract_interface
namespace ITxRelayer:
    func get_owner() -> (owner: felt):
    end

    func get_latest_block_number() -> (res:felt):
    end

    func set_relayer(address:felt, is_relayer:felt):
    end

    func get_is_relayer(address: felt) -> (res: felt):
    end
end