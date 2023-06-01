import { FC, useContext, useState } from "react";
import { SwapExContext } from "../contexts/SwapExContext";

enum TokenToSell {
  TOKEN0,
  TOKEN1,
}

type TokenDataType = {
  toSellAddress: string;
  toSellBalance: number;
  toSellSymbol: string;
  toBuyAddress: string;
  toBuyBalance: number;
  toBuySymbol: string;
};

export const Swap: FC = () => {
  const swapExContext = useContext(SwapExContext);

  const [tokenToSell, setTokenToSell] = useState(TokenToSell.TOKEN0);

  const [amountToSell, setAmountToSell] = useState(0);

  if (!swapExContext) return null;

  const tokenData: TokenDataType =
    tokenToSell === TokenToSell.TOKEN0
      ? {
          toSellAddress: swapExContext.token0Address,
          toSellBalance: swapExContext.balanceOfToken0,
          toSellSymbol: swapExContext.token0Symbol,
          toBuyAddress: swapExContext.token1Address,
          toBuyBalance: swapExContext.balanceOfToken1,
          toBuySymbol: swapExContext.token1Symbol,
        }
      : {
          toSellAddress: swapExContext.token1Address,
          toSellBalance: swapExContext.balanceOfToken1,
          toSellSymbol: swapExContext.token1Symbol,
          toBuyAddress: swapExContext.token0Address,
          toBuyBalance: swapExContext.balanceOfToken0,
          toBuySymbol: swapExContext.token0Symbol,
        };

  const approve = () => {
    swapExContext.approve(tokenData.toSellAddress, amountToSell);
  };

  const swap = () => {
    swapExContext.swap(tokenData.toSellAddress, amountToSell);
  };

  return (
    <div className="mt-12 flex flex-col" style={{ width: "500px" }}>
      <div className="bg-gray-200 rounded-3xl px-4 py-2 text-black w-full">
        <div className="flex justify-between">
          <input
            value={amountToSell}
            onChange={(e) => setAmountToSell(Number(e.target.value))}
            type="number"
            className="bg-gray-200 outline-0 text-2xl w-2/4"
          />
          <p className="text-2xl">{tokenData.toSellSymbol}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "right" }}>
          <p>Balance: {tokenData.toSellBalance}</p>
        </div>
      </div>
      <div className="w-full justify-center flex">
        <button
          className="text-xl  rounded-full w-8 h-8 "
          onClick={() => {
            if (tokenToSell === TokenToSell.TOKEN0) setTokenToSell(TokenToSell.TOKEN1);
            if (tokenToSell === TokenToSell.TOKEN1) setTokenToSell(TokenToSell.TOKEN0);
          }}
        >
          ↺
        </button>
      </div>
      <div className="bg-gray-200 rounded-3xl px-4 py-2 text-black w-full">
        <div className="flex justify-between">
          <input disabled className="bg-gray-200 outline-0 text-2xl w-36	text-gray-500" value={4.76} />
          <p className="text-2xl">{tokenData.toBuySymbol}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "right" }}>
          <p>Balance: {tokenData.toBuyBalance}</p>
        </div>
      </div>
      <div className="w-full flex justify-between mt-8">
        <button className="w-full bg-red-400 rounded-xl text-xl py-1" onClick={approve} style={{ marginRight: "1rem" }}>
          Approve
        </button>
        <button className="w-full bg-red-400 rounded-xl text-xl	py-1" onClick={swap}>
          Swap
        </button>
      </div>
    </div>
  );
};
