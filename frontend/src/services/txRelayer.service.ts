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

  const paths = unformattedPath.split(",").map((path) => {
    return path.replaceAll('"', "").replaceAll("'", "").replaceAll(" ", "");
  });
  //TODO: might need to remove ' or " in the string here. we will test later

  const leaf = paths[0];
  const merklePath = paths.slice(1);
  const res = await verifyMerklePath(
    contract,
    blockNumber,
    index,
    leaf,
    merklePath
  );
  return res;
};

export const verifyMerklePath = async (
  contract: Contract,
  blockNumber: number,
  index: number,
  leaf: string,
  merklePath: string[]
): Promise<Result> => {
  debugger;
  const leafUint256 = convertHexToUint256(leaf);
  const leafUint256Hex = leafUint256.map((val) => {
    return "0x" + val.toString(16);
  });
  const merklePathUint256 = merklePath.map((path) => {
    return convertHexToUint256(path);
  });

  const isVerified = await contract.verify_txs_in_block(
    blockNumber,
    index,
    leafUint256Hex.reverse(),
    []
  );
  // const isVerified = await contract.verify_txs_in_block(blockNumber, index, leafUint256, merklePathUint256)
  return isVerified;
};

const convertHexToUint256 = (hexVal: string): bigint[] => {
  if (hexVal.startsWith("0x")) {
    hexVal = hexVal.slice(2);
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
