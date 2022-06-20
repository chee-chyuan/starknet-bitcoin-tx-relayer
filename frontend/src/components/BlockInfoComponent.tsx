import { useEffect, useState } from "react";
import { Contract } from "starknet";
import { getCurrentBlockNumber } from "../services/txRelayer.service";

export interface BlockInfoProp {
  txRelayer: Contract;
}

function BlockInfo(props: BlockInfoProp) {
  const [currentBlockNumber, setCurrentBlockNumber] = useState<number>(0);
  useEffect(() => {
    setTimeout(() => {
      getCurrentBlockNumber(props.txRelayer)
        .then((res) => {
          setCurrentBlockNumber(res[0].words[0]);
        })
        .catch(() => {
          // for testing only
          setCurrentBlockNumber(currentBlockNumber + 1);
        });
    }, 3000);
  });

  return (
    <div className="mb-3">Current Bitcoin height: {currentBlockNumber}</div>
  );
}

export default BlockInfo;
