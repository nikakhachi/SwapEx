import "@rainbow-me/rainbowkit/styles.css";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Liquidity } from "./components/Liquidity";
import { Swap } from "./components/Swap";
import { Faucet } from "./components/Faucet";
import { Staker } from "./components/Staker";
import { Tabs, Tab } from "@mui/material";
import { useState } from "react";

enum TabEnum {
  SWAP,
  LIQUIDITY,
  FAUCET,
  STAKER,
}

function App() {
  const [tab, setTab] = useState(TabEnum.SWAP);

  const handleChange = (event: React.SyntheticEvent, newValue: TabEnum) => {
    setTab(newValue);
  };

  return (
    <div>
      <div className="w-full flex justify-center mt-4 mb-8">
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
