"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
dotenv.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const starknet = __importStar(require("starknet"));
const starknet_1 = require("starknet");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const provider = new starknet.Provider({
        baseUrl: process.env.GATEWAY_URL,
        feederGatewayUrl: "feeder_gateway",
        gatewayUrl: "gateway",
    });
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
    const ownerContract = process.env.OWNER_ADDRESS;
    const ownerAddress = process.env.OWNER_PUBLIC_KEY;
    const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY;
    const ownerKeyPair = starknet_1.ec.genKeyPair(ownerPrivateKey);
    const accountContractCode = yield provider.getCode(ownerContract);
    //   const ownerAccountContract = new Contract(
    //     accountContractCode.abi,
    //     ownerContract,
    //     provider
    //   );
    const ownerAccountContract = new starknet_1.Account(provider, ownerContract, ownerKeyPair);
    //relayer
    const relayerContract = process.env.RELAYER_ADDRESS;
    const relayerAddress = process.env.RELAYER_PUBLIC_KEY;
    const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
    const relayerKeyPair = starknet_1.ec.genKeyPair(relayerPrivateKey);
    const relayerAccountContract = new starknet_1.Account(provider, relayerContract, relayerKeyPair);
    const fileName = process.env.BUILD_FILE;
    const fileDirectory = process.env.BUILD_DIRECTORY;
    const filePath = path_1.default.join(__dirname, "..", "..", fileDirectory, fileName);
    const compiledTxRelayer = starknet.json.parse((0, fs_1.readFileSync)(filePath).toString("ascii"));
    const txRelayerResponse = yield provider.deployContract({
        contract: compiledTxRelayer,
        constructorCalldata: [ownerAddress],
    });
    console.log("Waiting for Tx to be Accepted on Starknet - Contract Deployment...");
    yield provider.waitForTransaction(txRelayerResponse.transaction_hash);
    const txRelayerAddress = txRelayerResponse.address;
    const txRelayer = new starknet_1.Contract(compiledTxRelayer.abi, txRelayerAddress);
    const MAX_FEE = 1000;
    // const xxxx=  ownerAccountContract.invokeFunction
    //#### commented code #####
    const { code, transaction_hash: setRelayerTxHash } = yield ownerAccountContract.execute({
        contractAddress: txRelayerAddress,
        entrypoint: "set_relayer",
        calldata: [relayerAddress, 1],
    }, undefined, { maxFee: MAX_FEE });
    console.log(`Waiting for Tx to be Accepted on Starknet - SetRelayer...`);
    yield provider.waitForTransaction(setRelayerTxHash);
    const isRelayer = txRelayer.get_is_relayer(relayerAddress);
});
main();
//# sourceMappingURL=index.js.map