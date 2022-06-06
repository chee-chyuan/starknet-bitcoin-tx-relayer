import argparse
from utils import verify_merkle_root_keccak256


def main():
    parser = argparse.ArgumentParser(description="Verify Merkle Path")

    parser.add_argument("-r", "--root", type=str,
                        default=None,
                        help="Merkle root")
    parser.add_argument("-p", "--path", nargs='+',
                        help="Merkle path")
    parser.add_argument("-i", "--index", type=int,
                        default=None,
                        help="Transaction index")

    args = parser.parse_args()

    if args.path != None and args.index != None and args.root != None:
        res = verify_merkle_root_keccak256(args.root,
                                           args.path, args.index)
        print(f"Verify result: {res}")


if __name__ == "__main__":
    main()
