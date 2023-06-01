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
      <div style={{ width: "100%", display: "flex", justifyContent: "center", margin: "2rem 0 5rem 0" }}>
        <ConnectButton />
      </div>
      <Tabs value={tab} onChange={handleChange} centered>
        <Tab value={TabEnum.SWAP} label="Swap" />
        <Tab value={TabEnum.LIQUIDITY} label="Liquidity" />
        <Tab value={TabEnum.FAUCET} label="Faucet" />
        <Tab value={TabEnum.STAKER} label="Staker" />
      </Tabs>
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
  );
}

export default App;
