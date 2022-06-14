import keccak256 from "keccak256";

export const createMerkleRootWithPathKeccak256 = (
  keccakTxs: string[],
  index: number
): [string, string[]] => {
  const merklePath: string[] = [keccakTxs[index]];

  while (true) {
    if (keccakTxs.length === 1) return [keccakTxs[0], merklePath];
    const newHashList = [];
    const len =
      keccakTxs.length % 2 !== 0 ? keccakTxs.length - 1 : keccakTxs.length;
    for (let i = 0; i < len; i += 2) {
      if (index === i) {
        merklePath.push(keccakTxs[index + 1]);
        index = index / 2;
      } else if (index === i + 1) {
        merklePath.push(keccakTxs[index - 1]);
        index = (index - 1) / 2;
      }

      const toHash = keccakTxs[i] + keccakTxs[i + 1];
      newHashList.push(keccak256(Buffer.from(toHash, "hex")).toString("hex"));
    }
    if (len < keccakTxs.length) {
      if (index === keccakTxs.length - 1) {
        merklePath.push(keccakTxs[index]);
        index = index / 2;
      }

      const toHash =
        keccakTxs[keccakTxs.length - 1] + keccakTxs[keccakTxs.length - 1];
      newHashList.push(keccak256(Buffer.from(toHash, "hex")).toString("hex"));
    }
    keccakTxs = newHashList;
  }
};

export const createMerkleRootWithPathKeccak256FromHex = (
  hexTxs: string[],
  index: number
): [string, string[]] => {
  const keccakTxs = hexTxs.map((val) =>
    keccak256(Buffer.from(val, "hex")).toString("hex")
  );
  return createMerkleRootWithPathKeccak256(keccakTxs, index);
};

export const convertHexToUint256 = (hexVal: string): bigint[] => {
  if (hexVal.startsWith("0x")) {
    hexVal = hexVal.slice(2);
  }

  const noOfZerosToPad = hexVal.length % 64;
  if (noOfZerosToPad !== 0) {
    const toPad = "0".repeat(noOfZerosToPad);
    hexVal = toPad + hexVal;
  }
  const words: string[] = [];
  for (let i = 0; i < hexVal.length; i += 32) {
    const word = hexVal.slice(i, i + 32);
    words.push("0x" + word);
  }

  const wordsUint256 = words.map((word) => {
    // eslint-disable-next-line node/no-unsupported-features/es-builtins
    return BigInt(word);
  });

  return wordsUint256;
};
