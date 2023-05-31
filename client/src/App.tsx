import "@rainbow-me/rainbowkit/styles.css";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Liquidity } from "./components/Liquidity";
import { Swap } from "./components/Swap";

function App() {
  return (
    <div>
      <ConnectButton />
      <Swap />
      <Liquidity />
    </div>
  );
}

export default App;
