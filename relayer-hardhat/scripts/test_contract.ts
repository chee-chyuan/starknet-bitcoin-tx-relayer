/* eslint-disable node/no-unsupported-features/es-builtins */
/* eslint-disable node/no-unsupported-features/es-syntax */
import { starknet } from "hardhat";
import * as dotenv from "dotenv";
import path from "path";

const main = async () => {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });

  const ownerContractAddress = process.env.OWNER_ADDRESS!;
  const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY!;

  const ownerAccount = await starknet.getAccountFromAddress(
    ownerContractAddress,
    ownerPrivateKey,
    "OpenZeppelin"
  );
  console.log(`ownerAccount address: ${ownerAccount.address}`);

  const TestContractFactory = await starknet.getContractFactory(
    "test_contract"
  );
  const testContract = await TestContractFactory.deploy();
  console.log(`testContract address: ${testContract.address}`);

  console.log(`testContract: ${JSON.stringify(testContract)}`);
  //   const TestContractFactory2 = await starknet.getContractFactory("tx_relayer");
  //   const testContract2 = await TestContractFactory2.getContractAt(
  //     testContract.address
  //   );
  //   testContract.invoke()

  const yy = await ownerAccount.invoke(
    testContract,
    "store_felt_val",
    { val_felt: 1, val: { low: 1n, high: 0n } },
    { maxFee: BigInt("65180000000000000") }
  );
  console.log(`yy: ${yy}`);

  //   await ownerAccount.invoke(
  //     testContract,
  //     "store_felt",
  //     { val: 1 },
  //     { maxFee: BigInt("65180000000000000") }
  //   );

  const xx = await ownerAccount.call(testContract, "view_val");
  console.log(`xx: ${xx}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
