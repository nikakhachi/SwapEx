import { useEffect, useState } from "react";
import "./App.css";
import "@rainbow-me/rainbowkit/styles.css";

import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { SWAPEX_ABI } from "./contracts/swapEx";

function App() {
  const { address, isConnected } = useAccount();
  // const { data, isError, isLoading } = useContractRead({
  //   address: "0x0165878a594ca255338adfa4d48449f69242eb8f",
  //   abi: SWAPEX_ABI,
  //   functionName: "reserve0",
  // });

  // useEffect(() => {
  //   console.log(data);
  // }, []);

  return (
    <div>
      <pre>{JSON.stringify({ address, isConnected })}</pre>
      <ConnectButton />
    </div>
  );
}

export default App;
