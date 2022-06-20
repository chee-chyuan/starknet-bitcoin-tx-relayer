import argparse
import json
from utils import create_merkle_root_with_path_keccak256_from_hex


def main():
    parser = argparse.ArgumentParser(description="Create merkle root and merkle path from txs")

    parser.add_argument("-t", "--txs", nargs='+',
                        help="List of transactions")
    parser.add_argument("-f", "--file", help="Path containing the array of txs. (In json array format)")
    parser.add_argument("-i", "--index", type=int,
                        default=None,
                        help="Transaction index")

    args = parser.parse_args()

    if args.txs != None and args.index != None:
        [merkle_root, merkle_path] = create_merkle_root_with_path_keccak256_from_hex(
            args.txs, args.index)
        print(f"MerkleRoot: {merkle_root}")
        print(f"MerklePath: {merkle_path}")
    if args.file != None and args.index != None:

        #open file at path and convert it to an array
        f = open(args.file)
        txs = json.load(f)

        [merkle_root, merkle_path] = create_merkle_root_with_path_keccak256_from_hex(
            txs, args.index)
        print(f"MerkleRoot: {merkle_root}")
        print(f"MerklePath: {merkle_path}")


if __name__ == "__main__":
    main()
