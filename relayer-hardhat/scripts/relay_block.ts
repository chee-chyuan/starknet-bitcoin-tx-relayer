/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable camelcase */
/* eslint-disable node/no-unsupported-features/es-builtins */
import { starknet } from "hardhat";
import * as dotenv from "dotenv";
import path from "path";
import { readFileSync } from "fs";
import { StarknetContract } from "@shardlabs/starknet-hardhat-plugin/dist/src/types";
import { Account } from "@shardlabs/starknet-hardhat-plugin/dist/src/account";
// eslint-disable-next-line node/no-missing-import
import {
  convertHexToUint256Array,
  convertHexToUint256,
  createMerkleRootWithPathKeccak256FromHex,
} from "./utils/utils";

interface Setup {
  blockInfoDirectory: string;
  startBlock: number;
  endBlock: number;
  ownerAccount: Account;
  relayerAccount: Account;
  txRelayer: StarknetContract;
}

const setup = async (): Promise<Setup> => {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
  const blockInfoDirectory = path.join(
    __dirname,
    "..",
    "..",
    process.env.JSON_DIRECTORY!,
    "blockInfo"
  );

  const startBlock = parseInt(process.env.STARTING_BLOCK!);
  const endBlock = parseInt(process.env.ENDING_BLOCK!);

  const ownerContractAddress = process.env.OWNER_ADDRESS!;
  const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY!;

  const relayerContractAddress = process.env.RELAYER_ADDRESS!;
  const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY!;

  const ownerAccount = await starknet.getAccountFromAddress(
    ownerContractAddress,
    ownerPrivateKey,
    "OpenZeppelin"
  );

  const relayerAccount = await starknet.getAccountFromAddress(
    relayerContractAddress,
    relayerPrivateKey,
    "OpenZeppelin"
  );

  const TxRelayerFactory = await starknet.getContractFactory("tx_relayer");
  const txRelayer = await TxRelayerFactory.getContractAt(
    process.env.TX_RELAYER!
  );

  return {
    blockInfoDirectory,
    startBlock,
    endBlock,
    ownerAccount,
    relayerAccount,
    txRelayer,
  };
};

interface Uint256Hardhat {
  low: BigInt;
  high: BigInt;
}

const relayMerkleRoot = async (
  txRelayer: StarknetContract,
  relayerAccount: Account,
  blockNumber: number,
  merkleRoot: Uint256Hardhat
) => {
  await relayerAccount.invoke(
    txRelayer,
    "relay_tx_root_by_block_number",
    {
      block_number: blockNumber,
      tx_root: merkleRoot,
    },
    { maxFee: BigInt("65180000000000000") }
  );
};

const main = async () => {
  const {
    ownerAccount,
    relayerAccount,
    txRelayer,
    startBlock,
    endBlock,
    blockInfoDirectory,
  } = await setup();

  // maybe i can move this invoke function during deployment, we will see
  await ownerAccount.invoke(
    txRelayer,
    "set_relayer",
    { address: relayerAccount.address, is_relayer: 1 },
    { maxFee: BigInt("65180000000000000") }
  );

  for (let i = startBlock; i <= endBlock; i++) {
    console.log(`[RelayBlock] Relaying block ${i}`);
    const fileName = `block_info_${i}.json`;
    const fullPath = path.join(blockInfoDirectory, fileName);

    try {
      const fileData = readFileSync(fullPath, "utf8");
      const jsonObject = JSON.parse(fileData);
      const txs: string[] = jsonObject.tx;

      // index is irrelavant here, we just need the root
      const [merkleRoot] = createMerkleRootWithPathKeccak256FromHex(txs, 0);

      console.log(`merkletRoot = ${merkleRoot}`);
      const merkleRootUint256 = convertHexToUint256Array(merkleRoot);

      // speed improvement, we can use multi invoke
      // await relayMerkleRoot(txRelayer, ownerAccount, i, {
      //   low: BigInt("10"),
      //   high: BigInt("10"),
      // });

      const relayTxRoot = await relayerAccount.invoke(
        txRelayer,
        "relay_tx_root_by_block_number",
        {
          block_number: i,
          tx_root: { low: merkleRootUint256[1], high: merkleRootUint256[0] },
        },
        { maxFee: BigInt("65180000000000000") }
      );

      console.log(`relayTxRoot: ${relayTxRoot}`);
    } catch (exception) {
      console.log(`[RelayBlock] Error: ${exception}`);
      console.log("[RelayBlock] Stopping the relayer now");
      break;
    }
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
