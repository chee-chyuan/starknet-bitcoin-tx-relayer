import { useFormik } from "formik";
import { useState } from "react";
import { Contract } from "starknet";
import * as Yup from "yup";
import { formatAndVerifyMerklePath } from "../services/txRelayer.service";

export interface TxRelayerProp {
  txRelayer: Contract;
}

function TxRelayerForm(props: TxRelayerProp) {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [hasValue, setHasValue] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      blockNumber: "",
      index: "",
      merklePath: "",
    },
    validationSchema: Yup.object({
      blockNumber: Yup.number().required("Required"),
      index: Yup.number().required("Required"),
      merklePath: Yup.string().required("Required"),
    }),
    onSubmit: (values) => {
      console.log(JSON.stringify(values, null, 2));
      // handle merkle Path
      // call contract
      formatAndVerifyMerklePath(
        props.txRelayer,
        parseInt(values.blockNumber),
        parseInt(values.index),
        values.merklePath
      )
        .then((res) => {
          setHasValue(true);
          setIsVerified(res[0].words[0]);
        })
        .catch((err) => {
          debugger;
          setHasValue(false);
        });

      // get and set result
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div x-show="open" className="flex justify-between  flex-col">
        <div className="mb-1">Block Number:</div>
        <input
          type="number"
          className="w-1/3 bg-gray-100 rounded p-2 mr-4 mb-3"
          id="blockNumber"
          name="blockNumber"
          onChange={formik.handleChange}
        />
        <div className="mb-1">Index:</div>
        <input
          type="number"
          className="w-1/3 bg-gray-100 rounded p-2 mr-4 mb-3"
          id="index"
          name="index"
          onChange={formik.handleChange}
        />
        <div className="mb-1">Merkle Path:</div>
        <input
          type="text"
          className="w-full bg-gray-100 rounded p-2 mr-4 mb-3"
          id="merklePath"
          name="merklePath"
          onChange={formik.handleChange}
        />
      </div>

      <button
        type="submit"
        className="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
      >
        Verify!
      </button>
      {hasValue && <div className="mt-2">Verify result: {isVerified}</div>}
    </form>
  );
}

export default TxRelayerForm;
