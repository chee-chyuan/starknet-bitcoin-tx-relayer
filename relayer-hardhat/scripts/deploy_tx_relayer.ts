import { starknet } from "hardhat";
import * as dotenv from "dotenv";
import path from "path";

const main = async () => {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
  const ownerAddress = process.env.OWNER_ADDRESS!;

  const TxRelayerFactory = await starknet.getContractFactory("tx_relayer");
  const txRelayer = await TxRelayerFactory.deploy({ owner: ownerAddress });
  console.log(`txRelayer address: ${txRelayer.address}`);
};
main()
  .then(() => (process.exitCode = 0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
