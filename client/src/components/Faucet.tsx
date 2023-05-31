import { FC, useContext } from "react";
import { SwapExContext } from "../contexts/SwapExContext";
import { FaucetContext } from "../contexts/FaucetContext";
import moment from "moment";

export const Faucet: FC = () => {
  const swapExContext = useContext(SwapExContext);
  const faucetContext = useContext(FaucetContext);

  const token0WithdrawAvailable = moment(faucetContext?.token0WithdrawAvailableTimestamp).diff(moment()) < 0;
  const token1WithdrawAvailable = moment(faucetContext?.token1WithdrawAvailableTimestamp).diff(moment()) < 0;

  const withdrawToken0 = () => {
    faucetContext?.withdrawToken0();
  };

  const withdrawToken1 = () => {
    faucetContext?.withdrawToken1();
  };

  return (
    <div style={{ border: "1px solid white", padding: "0.5rem 2rem", marginTop: "2rem" }}>
      <h4>Faucet</h4>
      <p>
        {swapExContext?.token0Symbol} amount per withdraw: {faucetContext?.token0WithdrawableAmountPerCall}
      </p>
      {token0WithdrawAvailable ? (
        <button onClick={withdrawToken0}>Withdraw</button>
      ) : (
        <p>Withdraw Available At {moment(faucetContext?.token0WithdrawAvailableTimestamp).format("DD/MM/YYYY, h:mm:ss a")}</p>
      )}
      <p>---</p>
      <p>
        {swapExContext?.token1Symbol} amount per withdraw: {faucetContext?.token1WithdrawableAmountPerCall}
      </p>
      {token1WithdrawAvailable ? (
        <button onClick={withdrawToken1}>Withdraw</button>
      ) : (
        <p>Withdraw Available At {moment(faucetContext?.token1WithdrawAvailableTimestamp).format("DD/MM/YYYY, hh:mm:ss")}</p>
      )}
    </div>
  );
};
