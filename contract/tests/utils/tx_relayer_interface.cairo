%lang starknet

@contract_interface
namespace ITxRelayer:
    func get_owner() -> (owner: felt):
    end

    func get_latest_block_number() -> (res:felt):
    end
end