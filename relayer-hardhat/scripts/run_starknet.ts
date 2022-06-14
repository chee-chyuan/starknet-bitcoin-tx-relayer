import { starknet } from "hardhat";

const main = async () => {
    const ADDRESS =
    "0x45ad65a5bd1d8cfa9c03f7babaebfc1c961a4cc1a176f8c8789669bc41a71a0";
  const PRIVATE_KEY = "0x3ed05abaafa81f122143338745e95db9";
  const account = await starknet.getAccountFromAddress(
    ADDRESS,
    PRIVATE_KEY,
    "OpenZeppelin"
  );

  console.log(account);

  const TxRelayerFactory = await starknet.getContractFactory("tx_relayer");
  const txRelayer = await TxRelayerFactory.deploy({ owner: ADDRESS });
  console.log(txRelayer);
  console.log(`txRelayer address: ${txRelayer.address}`);

  const invokeResponse = await account.invoke(
    txRelayer,
    "set_relayer",
    { address: ADDRESS, is_relayer: 1 },
    { maxFee: BigInt("65180000000000000") }
  );

  console.log("InvokeResponse");
  console.log(invokeResponse);

  const isRelayerResponse = await account.call(txRelayer, "get_is_relayer", {
    address: ADDRESS,
  });
  console.log("isRelayerResponse");
  console.log(isRelayerResponse);
};

main();
