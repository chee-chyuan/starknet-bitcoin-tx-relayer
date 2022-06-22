import React, { useEffect, useState } from "react";
// import path from "path";
import "./App.css";
import * as starknet from "starknet";
import { Contract, Abi } from "starknet";
import BlockInfo from "./components/BlockInfoComponent";
import tx_relayer_abi from "./shared/tx_relayer_abi.json";
import TxRelayerForm from "./components/TxRelayerFormComponent";
// import * as dotenv from "dotenv";

const TX_RELAYER_ADDR = "0x062aaa40e14d08208e8c8e4d68a27015259326fbe68bcf78fcfdc18a36f083f0";

function App() {
  const [txRelayer, setTxRelayer] = useState<Contract>();
  useEffect(() => {
    const starknetProvider = new starknet.Provider({
      baseUrl: "http://localhost:5050",
      feederGatewayUrl: "feeder_gateway",
      gatewayUrl: "gateway",
    });

    const txRelayer = new starknet.Contract(
      tx_relayer_abi as Abi,
      TX_RELAYER_ADDR,
      starknetProvider
    );

    setTxRelayer(txRelayer);
  }, []);

  return (
    <div className="App">
      <div className="container pt-12 md:pt-24 px-6 mx-auto flex flex-wrap flex-col md:flex-row items-center">
        <div className="flex flex-col w-full xl:w-2/5 justify-center lg:items-start overflow-y-hidden">
          <h1 className="my-4 text-3xl md:text-5xl text-purple-800 font-bold leading-tight text-center md:text-left slide-in-bottom-h1">
            Simple Starknet Tx Relayer
          </h1>
          <p className="leading-normal text-base md:text-2xl mb-8 text-center md:text-left slide-in-bottom-subtitle">
            A toy project to prove that your tx on bitcoin exists!
          </p>
        </div>

        <div className="w-full xl:w-3/5 py-6 overflow-y-hidden"></div>

        <div className="w-1/2 pt-5 pb-6 text-center md:text-left fade-in">
          <BlockInfo txRelayer={txRelayer!} />
          <TxRelayerForm txRelayer={txRelayer!} />
        </div>
      </div>
    </div>
  );
}

export default App;
