import { FC, useCallback, useContext, useEffect, useState } from "react";
import { SwapExContext } from "../contexts/SwapExContext";
import { debounce } from "lodash";
import { Button } from "./Button";
import { CircularProgress } from "@mui/material";

export const Liquidity: FC = () => {
  const swapExContext = useContext(SwapExContext);

  const [token0ToProvide, setToken0ToProvide] = useState("0");
  const [token1ToProvide, setToken1ToProvide] = useState("0");

  const [primaryToken, setPrimaryToken] = useState(swapExContext?.token0Address as string);

  const [sharesToRemove, setSharesToRemove] = useState(0);

  const [debounceLocked, setDebounceLocked] = useState(false);

  const debounceFunc = useCallback(
    debounce((tokenOne: string, tokenOneAmount: string) => {
      swapExContext?.fetchSecondTokenAmountForRatio(tokenOne, tokenOneAmount);
    }, 1000),
    []
  );

  useEffect(() => {
    return () => {
      swapExContext?.resetSecondTokenAmountForRatio();
    };
  }, []);

  useEffect(() => {
    if (token0ToProvide && swapExContext?.token0Reserve && swapExContext?.token1Reserve && !debounceLocked) {
      setPrimaryToken(swapExContext?.token0Address as string);
      debounceFunc(swapExContext?.token0Address as string, token0ToProvide);
    }
  }, [token0ToProvide]);

  useEffect(() => {
    if (token1ToProvide && swapExContext?.token0Reserve && swapExContext?.token1Reserve && !debounceLocked) {
      setPrimaryToken(swapExContext?.token1Address as string);
      debounceFunc(swapExContext?.token1Address as string, token1ToProvide);
    }
  }, [token1ToProvide]);

  useEffect(() => {
    if (swapExContext?.secondTokenAmountForRatio) {
      setDebounceLocked(true);
      if (primaryToken === swapExContext?.token0Address) {
        setToken1ToProvide(swapExContext?.secondTokenAmountForRatio);
      } else if (primaryToken === swapExContext?.token1Address) {
        setToken0ToProvide(swapExContext?.secondTokenAmountForRatio);
      }
    }
  }, [swapExContext?.secondTokenAmountForRatio]);

  const addLiquidity = () => {
    swapExContext?.addLiquidity(token0ToProvide, token1ToProvide);
  };

  const removeLiquidity = () => {
    swapExContext?.removeLiquidity(sharesToRemove);
  };

  const removeAllLiquidity = () => {
    swapExContext?.removeAllLiquidity();
  };

  return (
    <>
      <p className="text-2xl">LP Tokens: {swapExContext?.lpTokenAmount}</p>
      {swapExContext?.lpTokenAmount !== 0 && (
        <div>
          <input
            className="text-2xl rounded-xl px-4 mt-2 mb-1"
            value={sharesToRemove}
            onChange={(e) => setSharesToRemove(Number(e.target.value))}
            type="number"
          />
          <div>
            <Button
              disabled={swapExContext?.removeLiquidityLoading}
              text={swapExContext?.removeLiquidityLoading ? <CircularProgress color="inherit" size="1rem" /> : "Remove Liquidity"}
              onClick={removeLiquidity}
              className="mt-2 mb-4 w-56"
            />
            <Button
              disabled={swapExContext?.removeLiquidityLoading}
              text={swapExContext?.removeLiquidityLoading ? <CircularProgress color="inherit" size="1rem" /> : "Remove All Liquidity"}
              onClick={removeAllLiquidity}
              className="mt-2 mb-4 ml-4 w-56"
            />
          </div>
        </div>
      )}
      <p className="text-xl">
        {swapExContext?.token0Symbol} Reserve: {swapExContext?.token0Reserve} tokens
      </p>
      <p className="text-xl">
        {swapExContext?.token1Symbol} Reserve: {swapExContext?.token1Reserve} tokens
      </p>

      <div className="flex gap-2 mb-1 mt-2">
        <p className="text-xl">{swapExContext?.token0Symbol} to provide: </p>
        <input
          className="text-xl rounded-xl px-2"
          value={token0ToProvide}
          onChange={(e) => {
            setDebounceLocked(false);
            setToken0ToProvide(e.target.value);
          }}
          type="number"
        />
      </div>

      <div className="flex gap-2">
        <p className="text-xl">{swapExContext?.token1Symbol} to provide: </p>
        <input
          className="text-xl rounded-xl px-2"
          value={token1ToProvide}
          onChange={(e) => {
            setDebounceLocked(false);
            setToken1ToProvide(e.target.value);
          }}
          type="number"
        />
      </div>
      <div>
        <div className="mt-2 flex gap-2">
          <Button
            disabled={swapExContext?.isTokenApproveForL0Loading}
            onClick={() => swapExContext?.approve(swapExContext.token0Address, token0ToProvide, "l0")}
            text={
              swapExContext?.isTokenApproveForL0Loading ? (
                <CircularProgress color="inherit" size="1rem" />
              ) : (
                `Approve ${swapExContext?.token0Symbol}`
              )
            }
            className="w-44"
          />
          <Button
            disabled={swapExContext?.isTokenApproveForL1Loading}
            onClick={() => swapExContext?.approve(swapExContext.token1Address, token1ToProvide, "l1")}
            text={
              swapExContext?.isTokenApproveForL1Loading ? (
                <CircularProgress color="inherit" size="1rem" />
              ) : (
                `Approve ${swapExContext?.token1Symbol}`
              )
            }
            className="w-44"
          />
        </div>
        <Button
          disabled={swapExContext?.addLiquidityLoading}
          onClick={addLiquidity}
          className="mt-4 mb-4 w-full"
          text={swapExContext?.addLiquidityLoading ? <CircularProgress color="inherit" size="1rem" /> : `Add Liquidity`}
        />
      </div>
    </>
  );
};
