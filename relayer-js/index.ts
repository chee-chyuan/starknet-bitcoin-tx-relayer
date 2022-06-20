import * as dotenv from "dotenv";
import path from "path";
import { readFileSync } from "fs";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import * as starknet from "starknet";
import { Account, Contract, ec, stark, json, Abi, number } from "starknet";

const main = async () => {
  const provider = new starknet.Provider({
    baseUrl: process.env.GATEWAY_URL!,
    feederGatewayUrl: "feeder_gateway",
    gatewayUrl: "gateway",
  });

  const tx_relayer_abi = json.parse(
    readFileSync("../frontend/src/shared/tx_relayer_abi.json").toString("ascii")
  );

  const txRelayer2 = new starknet.Contract(
    tx_relayer_abi,
    process.env.TX_RELAYER!,
    provider
  );

  console.log("hi");

  // const args = [
  //   number.toFelt("0x1"),
  //   number.toFelt(1),
  //   number.toFelt(1),
  //   number.toFelt(1),
  //   number.toFelt(1),
  //   number.toFelt(1),
  // ];

  const args = [1];

  // const isVerified = await txRelayer2.call("verify_txs_in_block", [args]);
  const isVerified = await txRelayer2.verify_txs_in_block(1, 1, [1,1], [1,1,1,1]);
  console.log(isVerified);

  // // new random account
  // const starkKeyPair = ec.genKeyPair();
  // const starkKeyPub = ec.getStarkKey(starkKeyPair);

  // const argentJsonPath = path.join(__dirname, "..", "ArgentAccount.json");
  // const compiledArgentAccount = json.parse(
  //   readFileSync(argentJsonPath).toString("ascii")
  // );
  // const accountResponse = await provider.deployContract({
  //   contract: compiledArgentAccount,
  //   addressSalt: starkKeyPub,
  // });
  // await provider.waitForTransaction(accountResponse.transaction_hash);

  // const accountContract = new Contract(
  //   compiledArgentAccount.abi,
  //   accountResponse.address!
  // );
  // const initializeResponse = await accountContract.initialize(starkKeyPub, "0");

  // await provider.waitForTransaction(initializeResponse.transaction_hash);

  // const account = new Account(provider, accountResponse.address!, starkKeyPair);

  // const fileName = process.env.BUILD_FILE!;
  // const fileDirectory = process.env.BUILD_DIRECTORY!;
  // const filePath = path.join(__dirname, "..", "..", fileDirectory, fileName);

  // const compiledTxRelayer = starknet.json.parse(
  //   readFileSync(filePath).toString("ascii")
  // );

  // const txRelayerResponse = await provider.deployContract({
  //   contract: compiledTxRelayer,
  //   constructorCalldata: [accountResponse.address!],
  // });

  // await provider.waitForTransaction(txRelayerResponse.transaction_hash);
  // const txRelayerAddress = txRelayerResponse.address!;
  // const txRelayer = new Contract(compiledTxRelayer.abi, txRelayerAddress); // there is a 3rd param for provider, try that next

  // const { code, transaction_hash: setRelayerTxHash } =
  //   await account.execute(
  //     {
  //       contractAddress: txRelayerAddress,
  //       entrypoint: "set_relayer",
  //       calldata: ["1", "1"],
  //     },
  //     undefined,
  //     { maxFee: 0 }
  //   );

  // console.log(`Waiting for Tx to be Accepted on Starknet - SetRelayer...`);
  // await provider.waitForTransaction(setRelayerTxHash);

  // owner
  // const ownerContract = process.env.OWNER_ADDRESS!;
  // const ownerAddress = process.env.OWNER_PUBLIC_KEY!;
  // const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY!;
  // const ownerKeyPair = ec.genKeyPair(ownerPrivateKey);
  // const accountContractCode = await provider.getCode(ownerContract);
  // //   const ownerAccountContract = new Contract(
  // //     accountContractCode.abi,
  // //     ownerContract,
  // //     provider
  // //   );

  // const ownerAccountContract = new Account(
  //   provider,
  //   ownerContract,
  //   ownerKeyPair
  // );

  // //relayer
  // const relayerContract = process.env.RELAYER_ADDRESS!;
  // const relayerAddress = process.env.RELAYER_PUBLIC_KEY!;
  // const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY!;
  // const relayerKeyPair = ec.genKeyPair(relayerPrivateKey);
  // const relayerAccountContract = new Account(
  //   provider,
  //   relayerContract,
  //   relayerKeyPair
  // );

  // const fileName = process.env.BUILD_FILE!;
  // const fileDirectory = process.env.BUILD_DIRECTORY!;
  // const filePath = path.join(__dirname, "..", "..", fileDirectory, fileName);

  // const compiledTxRelayer = starknet.json.parse(
  //   readFileSync(filePath).toString("ascii")
  // );

  // const txRelayerResponse = await provider.deployContract({
  //   contract: compiledTxRelayer,
  //   constructorCalldata: [ownerAddress],
  // });
  // console.log(
  //   "Waiting for Tx to be Accepted on Starknet - Contract Deployment..."
  // );
  // await provider.waitForTransaction(txRelayerResponse.transaction_hash);
  // const txRelayerAddress = txRelayerResponse.address!;
  // const txRelayer = new Contract(compiledTxRelayer.abi, txRelayerAddress);

  // const MAX_FEE = 1000;

  // // const xxxx=  ownerAccountContract.invokeFunction

  // //#### commented code #####
  // const { code, transaction_hash: setRelayerTxHash } =
  //   await ownerAccountContract.execute(
  //     {
  //       contractAddress: txRelayerAddress,
  //       entrypoint: "set_relayer",
  //       calldata: [relayerAddress, 1],
  //     },
  //     undefined,
  //     { maxFee: MAX_FEE }
  //   );

  // console.log(`Waiting for Tx to be Accepted on Starknet - SetRelayer...`);
  // await provider.waitForTransaction(setRelayerTxHash);

  // const isRelayer = txRelayer.get_is_relayer(relayerAddress);
};

main();
