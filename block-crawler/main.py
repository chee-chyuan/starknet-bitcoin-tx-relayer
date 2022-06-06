import json
import os
import sys
import requests
from dotenv import load_dotenv


def get_path_to_store_json(dir, file_name):
    json_directory = os.environ['JSON_DIRECTORY']
    is_dir_exist = os.path.exists(json_directory)
    if is_dir_exist != True:
        os.makedirs(json_directory)

    json_directory = os.path.join(json_directory, dir)
    is_dir_exist = os.path.exists(json_directory)
    if is_dir_exist != True:
        os.makedirs(json_directory)

    path_to_store = os.path.join(json_directory, file_name)
    return path_to_store


def write_json_to_file(data, path_to_store):
    with open(path_to_store, "w") as outfile:
        json.dump(data, outfile, indent=4)


def get_block_by_num(num):
    try:
        json_body = {
            "jsonrpc": "2.0",
            "method": "getblockhash",
            "params": [
                num
            ],
            "id": "getblock.io"
        }

        header = {
            "x-api-key": os.environ['GETBLOCK_API_KEY'], "Content-Type": "application/json"}

        r = requests.post('https://btc.getblock.io/mainnet/', json=json_body,
                          headers=header).json()

        if r["error"] is not None:
            print("[get_block_by_num]: ", r.error)
            return {"result": False}

        path = get_path_to_store_json("block", "block_{}.json".format(num))
        write_json_to_file(r, path)
        return {"result": True, "blockHash": r["result"]}
    except:
        print("[get_block_by_num]: ", sys.exc_info()[0])
        return {"result": False}


def get_block_info_by_hash(block_hash):
    try:
        json_body = {
            "jsonrpc": "2.0",
            "method": "getblock",
            "params": [
                block_hash
            ],
            "id": "getblock.io"
        }

        header = {
            "x-api-key": os.environ['GETBLOCK_API_KEY'], "Content-Type": "application/json"}

        r = requests.post('https://btc.getblock.io/mainnet/', json=json_body,
                          headers=header).json()

        if r["error"] is not None:
            print("[get_block_info_by_hash]: ", r["error"])
            return {"result": False}

        path = get_path_to_store_json(
            "blockInfo", "block_info_{}.json".format(r['result']["height"]))
        write_json_to_file(r['result'], path)
        return {"result": True}
    except:
        print("[get_block_info_by_hash]: ", sys.exc_info()[0])
        return {"result": False}


def main():
    load_dotenv()

    block_number = 737787
    while block_number < 737800:
        print(f"Current block number: {block_number}")
        block_hash_res = get_block_by_num(block_number)
        if block_hash_res["result"] == False:
            print(f"get_block_by_num failed at {block_number}")
            break

        block_info_res = get_block_info_by_hash(block_hash_res["blockHash"])
        if block_info_res["result"] == False:
            print(f"get_block_info_by_hash failed at {block_number}")
            break
        block_number = block_number + 1


if __name__ == "__main__":
    main()
