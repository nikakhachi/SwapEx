import "@rainbow-me/rainbowkit/styles.css";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Liquidity } from "./components/Liquidity";
import { Swap } from "./components/Swap";
import { Faucet } from "./components/Faucet";
import { Staker } from "./components/Staker";

function App() {
  return (
    <div>
      <ConnectButton />
      <Faucet />
      <Swap />
      <Liquidity />
      <Staker />
    </div>
  );
}

export default App;
