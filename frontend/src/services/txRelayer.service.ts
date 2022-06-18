import { Contract, number, Result } from "starknet";

export const getCurrentBlockNumber = async (
  contract: Contract
): Promise<Result> => {
  const blockNumber = await contract.call("get_latest_block_number");
  return blockNumber;
};

export const formatAndVerifyMerklePath = async (
  contract: Contract,
  blockNumber: number,
  index: number,
  unformattedPath: string
): Promise<Result> => {
  if (unformattedPath.startsWith("[")) {
    unformattedPath = unformattedPath.substring(1);
  }
  if (unformattedPath.endsWith("]")) {
    unformattedPath = unformattedPath.substring(0, unformattedPath.length - 1);
  }

  const paths = unformattedPath.split(",");
  //TODO: might need to remove ' or " in the string here. we will test later

  const leaf = paths[0];
  const merklePath = paths.slice(2);
  const res = verifyMerklePath(contract, blockNumber, index, leaf, merklePath);
  return res;
};

export const verifyMerklePath = async (
  contract: Contract,
  blockNumber: number,
  index: number,
  leaf: string,
  merklePath: string[]
): Promise<Result> => {
  const leafUint256 = convertHexToUint256(leaf);
  const merklePathLength = merklePath.length;
  const merklePathUint256 = merklePath.map((path) => {
    return convertHexToUint256(path);
  });
  const merklePathUint256Flat = merklePathUint256.flat();

  const args = [
    blockNumber,
    index,
    ...leafUint256,
    merklePathLength,
    ...merklePathUint256Flat,
  ];

  const isVerified = await contract.call("verify_txs_in_block", [args]);
  return isVerified;
};

const convertHexToUint256 = (hexVal: string): bigint[] => {
  if (hexVal.startsWith("0x")) {
    hexVal = hexVal.slice(2);
  }

  const noOfZerosToPad = hexVal.length % 64;
  if (noOfZerosToPad != 0) {
    const toPad = "0".repeat(noOfZerosToPad);
    hexVal = toPad + hexVal;
  }
  const words: string[] = [];
  for (let i = 0; i < hexVal.length; i += 32) {
    const word = hexVal.slice(i, i + 32);
    words.push("0x" + word);
  }

  const wordsUint256 = words.map((word) => {
    return BigInt(word);
  });

  return wordsUint256;
};
