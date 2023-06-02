import { FC, useCallback, useContext, useEffect, useState } from "react";
import { SwapExContext } from "../contexts/SwapExContext";
import { debounce } from "lodash";

export const Liquidity: FC = () => {
  const swapExContext = useContext(SwapExContext);

  const [token0ToProvide, setToken0ToProvide] = useState(0);
  const [token1ToProvide, setToken1ToProvide] = useState(0);

  const [primaryToken, setPrimaryToken] = useState(swapExContext?.token0Address as string);

  const [sharesToRemove, setSharesToRemove] = useState(0);

  const debounceFunc = useCallback(
    debounce((tokenOne: string, tokenOneAmount: number) => {
      swapExContext?.fetchSecondTokenAmountForRatio(tokenOne, tokenOneAmount);
    }, 1000),
    []
  );

  useEffect(() => {
    if (token0ToProvide) {
      setPrimaryToken(swapExContext?.token0Address as string);
      debounceFunc(swapExContext?.token0Address as string, token0ToProvide);
    }
  }, [token0ToProvide]);

  useEffect(() => {
    if (token1ToProvide) {
      setPrimaryToken(swapExContext?.token1Address as string);
      debounceFunc(swapExContext?.token1Address as string, token1ToProvide);
    }
  }, [token1ToProvide]);

  useEffect(() => {
    if (swapExContext?.secondTokenAmountForRatio) {
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
            <button className="mt-2 bg-red-400 rounded-xl text-md py-1 px-8 mb-4" onClick={removeLiquidity}>
              Remove Liquidity
            </button>
            <button className="mt-2 bg-red-400 rounded-xl text-md py-1 px-8 mb-4 ml-4" onClick={removeAllLiquidity}>
              Remove All Liquidity
            </button>
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
          onChange={(e) => setToken0ToProvide(Number(e.target.value))}
          type="number"
        />
      </div>

      <div className="flex gap-2">
        <p className="text-xl">{swapExContext?.token1Symbol} to provide: </p>
        <input
          className="text-xl rounded-xl px-2"
          value={token1ToProvide}
          onChange={(e) => setToken1ToProvide(Number(e.target.value))}
          type="number"
        />
      </div>
      <div>
        <div className="mt-2 flex gap-2">
          <button
            className="bg-red-400 rounded-xl text-md py-1 px-8"
            onClick={() => swapExContext?.approve(swapExContext.token0Address, token0ToProvide)}
          >
            Approve {swapExContext?.token0Symbol}
          </button>
          <button
            className="bg-red-400 rounded-xl text-md py-1 px-8"
            onClick={() => swapExContext?.approve(swapExContext.token1Address, token1ToProvide)}
          >
            Approve {swapExContext?.token1Symbol}
          </button>
        </div>
        <button className="mt-4 bg-red-400 rounded-xl text-md py-1 px-8 mb-4 w-full" onClick={addLiquidity}>
          Add Liquidity
        </button>
      </div>
    </>
  );
};
