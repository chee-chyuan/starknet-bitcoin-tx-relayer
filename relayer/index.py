
import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path
from starknet_py.net import Client
from starknet_py.net.networks import TESTNET, MAINNET
from starknet_py.net.account.account_client import AccountClient, KeyPair
from starknet_py.contract import Contract
from starknet_py.net.models import StarknetChainId, InvokeFunction
from starknet_py.utils.crypto.facade import sign_calldata
from starkware.starknet.public.abi import get_selector_from_name


async def main():
    load_dotenv()
    owner_private_key = os.environ['OWNER_PRIVATE_KEY']
    environment = os.environ['ENVIRONMENT']

    # setup stark environment
    if environment == "mainnet":
        client = Client(MAINNET)
    elif environment == "testnet":
        client = Client(TESTNET)
    elif environment == "devnet":
        gateway_url = os.environ['GATEWAY_URL']
        client = Client(gateway_url, chain=StarknetChainId.TESTNET)
    else:
        print(f"Please select an environment")
        return

    # setup owner and relay account
    owner_address = os.environ["OWNER_ADDRESS"]
    owner_contract = await Contract.from_address(owner_address, client)
    relayer_address = os.environ["RELAYER_ADDRESS"]
    relayer_contract = await Contract.from_address(relayer_address, client)

    owner_private_key = os.environ["OWNER_PRIVATE_KEY"]
    owner_key_pair = KeyPair.from_private_key(int(owner_private_key, 16))
    owner_account_client = AccountClient(
        owner_address, owner_key_pair, os.environ['GATEWAY_URL'], chain=StarknetChainId.TESTNET)

    # deploy contract
    directory = os.environ["BUILD_DIRECTORY"]
    compiled_file = os.environ["BUILD_FILE"]
    compiled = Path(directory, compiled_file).read_text("utf-8")
    owner_public_key = int(os.environ["OWNER_PUBLIC_KEY"], 16)
    constructor_args = [owner_public_key]
    deployment_result = await Contract.deploy(
        client, compiled_contract=compiled, constructor_args=constructor_args
    )

    await deployment_result.wait_for_acceptance()
    tx_relayer_contract = deployment_result.deployed_contract

    # set relayer by owner
    MAX_FEE = 10000
    relayer_public_key = int(os.environ["RELAYER_PUBLIC_KEY"], 16)

    # tx = {
    #     "contract_address": tx_relayer_contract.address,
    #     "entry_point_selector": get_selector_from_name("set_relayer"),
    #     "calldata": [relayer_public_key, 1],
    #     "max_fee": MAX_FEE,
    #     "signature": []
    # }
    tx = InvokeFunction(contract_address=tx_relayer_contract.address,
                        entry_point_selector=get_selector_from_name("set_relayer"),
                        calldata=[relayer_public_key, 1],
                        max_fee=MAX_FEE,
                        signature=[],
                        version=0)

    # tx = InvokeFunction(
    #         entry_point_selector=get_selector_from_name("__execute__"),
    #         calldata=wrapped_calldata,
    #         contract_address=self.address,
    #         signature=[r, s],
    #         max_fee=tx.max_fee,
    #         version=0,
    #     )

    # yyyy = await owner_account_client._prepare_invoke_function(tx)
    # zzzz = await client.add_transaction(yyyy)
    # await client.wait_for_tx(tx_hash=zzzz["transaction_hash"])
    # xxxx = await owner_account_client.add_transaction(tx)
    # calldata_py = [
    #     [
    #         {
    #             "to": tx.contract_address,
    #             "selector": tx.entry_point_selector,
    #             "data_offset": 0,
    #             "data_len": len(tx.calldata),
    #         }
    #     ],
    #     tx.calldata,
    #     nonce,
    # ]

    # tx_relayer_owner = await Contract.from_address(tx_relayer_contract.address, owner_account_client)
    # await (
    #     await tx_relayer_contract.functions["set_relayer"].invoke(address=relayer_public_key, is_relayer=1, max_fee=MAX_FEE)
    # ).wait_for_acceptance()

    # prepared_set_relayer = owner_contract.functions["__execute__"].prepare(

    # )

    # prepared_set_relayer = tx_relayer_contract.functions["set_relayer"].prepare(
    #     user=owner_public_key, address=relayer_public_key, is_relayer=1, max_fee=MAX_FEE
    # )
    # signature = sign_calldata(
    #     prepared_set_relayer.calldata, int(owner_private_key, 16))
    # tx = prepared_set_relayer._make_invoke_function(signature=signature)
    # response = await owner_account_client.add_transaction(tx=tx)

    # invocation = await prepared_set_relayer.invoke(signature)
    # await invocation.wait_for_acceptance()

    is_relayer = tx_relayer_contract.functions["get_is_relayer"].call(
        relayer_public_key)

    # get current block number from contract
    current_block = tx_relayer_contract.functions["get_latest_block_number"].call(
    )
    # get txs by block number
    # compute merkle root
    # submit to contract and wait for tx to get accepted
    return


if __name__ == "__main__":
    asyncio.run(main())
    # main()


# Account #0
# Address: 0x3aa9ff6bfee94841fe6df14ad6048df9e925832c41c059756b946d58bb10aaf
# Public key: 0x39b36e001283c9a984afcb6dade8a36ccc9dc95db6e708a21d6cfd74829445b
# Private key: 0x5ec5bc1de7b3948f059a3fe034a57acb

# Account #1
# Address: 0x62cb80780f9811c5d9a6b763b0bf7e8c62163e163026df9078ed4c17d3848c7
# Public key: 0x5a362bee26dad3b0ed86b5ce3149ed622ff9947f5ca54c98ac6142f583d1cb1
# Private key: 0x7fe4ee311a90dcbd4a269b22bc5bd8bf
