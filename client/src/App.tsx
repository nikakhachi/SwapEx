import { useContext, useEffect, useState } from "react";
import "@rainbow-me/rainbowkit/styles.css";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SwapExContext } from "./contexts/SwapExContext";
import { shortenAddress } from "./utils";

function App() {
  const swapExContext = useContext(SwapExContext);

  const [tokenToSellSymbol, setTokenToSellSymbol] = useState("");
  const [tokenToSellAddress, setTokenToSellAddress] = useState("");
  const [tokenToBuySymbol, setTokenToBuySymbol] = useState("");
  const [tokenToBuyAddress, setTokenToBuyAddress] = useState("");

  const [amountToSell, setAmountToSell] = useState(0);
  const [token0ToProvide, setToken0ToProvide] = useState(0);
  const [token1ToProvide, setToken1ToProvide] = useState(0);

  const [sharesToRemove, setSharesToRemove] = useState(0);

  useEffect(() => {
    if (swapExContext?.token0Symbol) {
      setTokenToSellSymbol(swapExContext?.token0Symbol);
      setTokenToSellAddress(swapExContext?.token0Address);
      setTokenToBuySymbol(swapExContext?.token1Symbol);
      setTokenToBuyAddress(swapExContext?.token1Address);
    }
  }, [swapExContext?.token0Symbol]);

  return (
    <div>
      <ConnectButton />
      <div style={{ border: "1px solid white", padding: "0.5rem 2rem", marginTop: "2rem" }}>
        <h4>SWAP</h4>
        <p>
          Selling: {tokenToSellSymbol} ({shortenAddress(tokenToSellAddress)})
        </p>
        <p>
          Buying: {tokenToBuySymbol} ({shortenAddress(tokenToBuyAddress)})
        </p>
        <div>
          Amount to Sell <input value={amountToSell} onChange={(e) => setAmountToSell(Number(e.target.value))} type="number" />
        </div>
        <div style={{ marginTop: "1rem" }}>
          <button style={{ marginRight: "1rem" }}>Approve</button>
          <button>SWAP</button>
        </div>
      </div>
      <div style={{ border: "1px solid white", padding: "0.5rem 2rem", marginTop: "2rem" }}>
        <h4>LIQUIDITY</h4>
        <p>LP Tokens: {swapExContext?.lpTokenAmount}</p>
        {swapExContext?.lpTokenAmount === 0 && (
          <div>
            <input value={sharesToRemove} onChange={(e) => setSharesToRemove(Number(e.target.value))} type="number" />
            <div>
              <button>Remove Liquidity</button>
            </div>
          </div>
        )}
        <p>
          {swapExContext?.token0Symbol} Reserve: {swapExContext?.token0Reserve} tokens
        </p>
        <p>
          {swapExContext?.token1Symbol} Reserve: {swapExContext?.token1Reserve} tokens
        </p>
        <div>
          {swapExContext?.token0Symbol} to provide:{" "}
          <input value={token0ToProvide} onChange={(e) => setToken0ToProvide(Number(e.target.value))} type="number" />
        </div>
        <div>
          {swapExContext?.token1Symbol} to provide:{" "}
          <input value={token1ToProvide} onChange={(e) => setToken1ToProvide(Number(e.target.value))} type="number" />
        </div>
        <div>
          <button>Add Liquidity</button>
        </div>
      </div>
    </div>
  );
}

export default App;
