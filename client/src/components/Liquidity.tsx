import { FC, useContext, useState } from "react";
import { SwapExContext } from "../contexts/SwapExContext";

export const Liquidity: FC = () => {
  const [token0ToProvide, setToken0ToProvide] = useState(0);
  const [token1ToProvide, setToken1ToProvide] = useState(0);

  const [sharesToRemove, setSharesToRemove] = useState(0);
  const swapExContext = useContext(SwapExContext);

  const addLiquidity = () => {
    swapExContext?.addLiquidity(token0ToProvide, token1ToProvide);
  };

  const removeLiquidity = () => {
    swapExContext?.removeLiquidity(sharesToRemove);
  };

  return (
    <div style={{ border: "1px solid white", padding: "0.5rem 2rem", marginTop: "2rem" }}>
      <h4>LIQUIDITY</h4>
      <p>LP Tokens: {swapExContext?.lpTokenAmount}</p>
      {swapExContext?.lpTokenAmount !== 0 && (
        <div>
          <input value={sharesToRemove} onChange={(e) => setSharesToRemove(Number(e.target.value))} type="number" />
          <div>
            <button onClick={removeLiquidity}>Remove Liquidity</button>
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
        <button onClick={addLiquidity}>Add Liquidity</button>
      </div>
    </div>
  );
};
