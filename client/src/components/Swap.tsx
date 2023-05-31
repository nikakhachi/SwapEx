import { FC, useContext, useEffect, useState } from "react";
import { SwapExContext } from "../contexts/SwapExContext";
import { shortenAddress } from "../utils";

export const Swap: FC = () => {
  const swapExContext = useContext(SwapExContext);

  const [tokenToSellSymbol, setTokenToSellSymbol] = useState("");
  const [tokenToSellAddress, setTokenToSellAddress] = useState("");
  const [tokenToBuySymbol, setTokenToBuySymbol] = useState("");
  const [tokenToBuyAddress, setTokenToBuyAddress] = useState("");

  const [amountToSell, setAmountToSell] = useState(0);

  useEffect(() => {
    if (swapExContext?.token0Symbol) {
      setTokenToSellSymbol(swapExContext?.token0Symbol);
      setTokenToSellAddress(swapExContext?.token0Address);
      setTokenToBuySymbol(swapExContext?.token1Symbol);
      setTokenToBuyAddress(swapExContext?.token1Address);
    }
  }, [swapExContext?.token0Symbol]);

  const reorder = () => {
    if (tokenToSellAddress === swapExContext?.token0Address) {
      setTokenToSellSymbol(swapExContext?.token1Symbol);
      setTokenToSellAddress(swapExContext?.token1Address);
      setTokenToBuySymbol(swapExContext?.token0Symbol);
      setTokenToBuyAddress(swapExContext?.token0Address);
    } else if (tokenToSellAddress === swapExContext?.token1Address) {
      setTokenToSellSymbol(swapExContext?.token0Symbol);
      setTokenToSellAddress(swapExContext?.token0Address);
      setTokenToBuySymbol(swapExContext?.token1Symbol);
      setTokenToBuyAddress(swapExContext?.token1Address);
    }
  };

  const approve = () => {
    swapExContext?.approve(tokenToSellAddress, amountToSell);
  };

  const swap = () => {
    swapExContext?.swap(tokenToSellAddress, amountToSell);
  };

  return (
    <div style={{ border: "1px solid white", padding: "0.5rem 2rem", marginTop: "2rem" }}>
      <h4>SWAP</h4>
      <p>
        Selling: {tokenToSellSymbol} ({shortenAddress(tokenToSellAddress)})
      </p>
      <button onClick={reorder}>↺</button>
      <p>
        Buying: {tokenToBuySymbol} ({shortenAddress(tokenToBuyAddress)})
      </p>
      <div>
        Amount to Sell <input value={amountToSell} onChange={(e) => setAmountToSell(Number(e.target.value))} type="number" />
      </div>
      <div style={{ marginTop: "1rem" }}>
        <button onClick={approve} style={{ marginRight: "1rem" }}>
          Approve
        </button>
        <button onClick={swap}>SWAP</button>
      </div>
    </div>
  );
};
