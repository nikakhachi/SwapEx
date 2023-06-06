import "@rainbow-me/rainbowkit/styles.css";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Liquidity } from "./components/Liquidity";
import { Swap } from "./components/Swap";
import { Faucet } from "./components/Faucet";
import { Staker } from "./components/Staker";
import { Tabs, Tab } from "@mui/material";
import { useState } from "react";
import { AiFillGithub } from "react-icons/ai";

enum TabEnum {
  SWAP,
  LIQUIDITY,
  FAUCET,
  STAKER,
}

function App() {
  const [tab, setTab] = useState(TabEnum.SWAP);

  const handleChange = (_: React.SyntheticEvent, newValue: TabEnum) => {
    setTab(newValue);
  };

  return (
    <div>
      <div className="w-full flex justify-between mt-4 mb-8 pr-2">
        <ul className="flex gap-2 text-xl items-center pl-2">
          <li>
            <a href="https://github.com/nikakhachi/SwapEx" className="flex items-center gap-1" target="_blank" rel="noreferrer">
              <span className="text-2xl">
                <AiFillGithub />
              </span>
              Github
            </a>
          </li>
          <li>Etherscan</li>
        </ul>
        <ConnectButton />
      </div>
      <Tabs value={tab} onChange={handleChange} centered>
        <Tab value={TabEnum.SWAP} label="Swap" />
        <Tab value={TabEnum.LIQUIDITY} label="Liquidity" />
        <Tab value={TabEnum.FAUCET} label="Faucet" />
        <Tab value={TabEnum.STAKER} label="Staker" />
      </Tabs>
      <div className="w-full flex justify-center">
        <div className="mt-12 flex flex-col" style={{ width: "500px" }}>
          {tab === TabEnum.SWAP ? (
            <Swap />
          ) : tab === TabEnum.LIQUIDITY ? (
            <Liquidity />
          ) : tab === TabEnum.FAUCET ? (
            <Faucet />
          ) : tab === TabEnum.STAKER ? (
            <Staker />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
