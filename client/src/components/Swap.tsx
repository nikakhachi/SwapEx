import { FC, useCallback, useContext, useEffect, useState } from "react";
import { SwapExContext } from "../contexts/SwapExContext";
import { Button } from "./Button";
import { debounce } from "lodash";
import { CircularProgress } from "@mui/material";
import { decimalsLessOrEqualThan18 } from "../utils";
import { SWAPEX_ADDRESS } from "../contracts/swapEx";

enum TokenToSell {
  TOKEN0,
  TOKEN1,
}

type TokenDataType = {
  toSellAddress: string;
  toSellBalance: string;
  toSellSymbol: string;
  toBuyAddress: string;
  toBuyBalance: string;
  toBuySymbol: string;
};

export const Swap: FC = () => {
  const swapExContext = useContext(SwapExContext);

  const [tokenToSell, setTokenToSell] = useState(TokenToSell.TOKEN0);

  const [amountToSell, setAmountToSell] = useState("0");

  const [amountToGet, setAmountToGet] = useState("0");

  const debounceFunc = useCallback(
    debounce((tokenIn: string, tokenInAmount: string) => {
      swapExContext?.fetchTokenOutputForSwap(tokenIn, tokenInAmount);
    }, 100),
    []
  );

  useEffect(() => {
    swapExContext?.fetchBalances();
  }, []);

  useEffect(() => {
    debounceFunc(
      tokenToSell === TokenToSell.TOKEN0 ? (swapExContext?.token0Address as string) : (swapExContext?.token1Address as string),
      amountToSell
    );
  }, [tokenToSell, amountToSell]);

  useEffect(() => {
    if (swapExContext?.tokenOutputForSwap) {
      setAmountToGet(swapExContext?.tokenOutputForSwap);
    }
  }, [swapExContext?.tokenOutputForSwap]);

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
    swapExContext.approve(tokenData.toSellAddress, String(amountToSell), "swap");
  };

  const swap = () => {
    swapExContext.swap(tokenData.toSellAddress, amountToSell);
  };

  return (
    <>
      <a
        href={`https://goerli.etherscan.io/address/${SWAPEX_ADDRESS}`}
        className="text-center mb-8 underline"
        target="_blank"
        rel="noreferrer"
      >
        ETHERSCAN
      </a>
      <div className="bg-gray-200 rounded-3xl px-4 py-2 text-black w-full">
        <div className="flex justify-between">
          <input
            value={amountToSell}
            onChange={(e) => {
              if (decimalsLessOrEqualThan18(e.target.value)) setAmountToSell(e.target.value);
            }}
            type="number"
            className="bg-gray-200 outline-0 text-2xl w-2/4"
          />
          <p className="text-2xl">{tokenData.toSellSymbol}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "right" }}>
          <p>Balance: {Number(tokenData.toSellBalance)}</p>
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
          <input disabled className="bg-gray-200 outline-0 text-2xl w-72	text-gray-500" value={amountToGet} />
          <p className="text-2xl">{tokenData.toBuySymbol}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "right" }}>
          <p>Balance: {Number(tokenData.toBuyBalance)}</p>
        </div>
      </div>
      <div className="w-full flex justify-between mt-8">
        <Button
          text={swapExContext.isTokenApproveForSwapLoading ? <CircularProgress color="inherit" size="1rem" /> : "Approve"}
          onClick={approve}
          className="w-full mr-8"
          disabled={swapExContext.isTokenApproveForSwapLoading}
        />
        <Button
          text={swapExContext.isTokenSwapLoading ? <CircularProgress color="inherit" size="1rem" /> : "Swap"}
          onClick={swap}
          className="w-full"
          disabled={swapExContext.isTokenSwapLoading}
        />
      </div>
    </>
  );
};
