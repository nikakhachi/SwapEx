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
    <div className="mt-12 flex flex-col" style={{ width: "500px" }}>
      <div>
        <p className="text-2xl">
          {swapExContext?.token0Symbol}{" "}
          <span className="text-sm">
            Enjoy {faucetContext?.token0WithdrawableAmountPerCall} {swapExContext?.token0Symbol} when you make a request
          </span>
        </p>
        <div className="mt-2">
          <button
            disabled={!token0WithdrawAvailable}
            className={`bg-red-400 rounded-xl text-md py-1 px-8 ${!token0WithdrawAvailable && "bg-gray-600 text-gray-800"}`}
            onClick={withdrawToken0}
          >
            Send Me {swapExContext?.token0Symbol}
          </button>
          <p className="text-xs mt-1">Faucet Balance: {faucetContext?.balanceOfToken0}</p>
          {!token0WithdrawAvailable && (
            <p className="text-sm mt-1">
              Withdraw Available At {moment(faucetContext?.token0WithdrawAvailableTimestamp).format("DD/MM/YYYY, h:mm:ss a")}
            </p>
          )}
        </div>
      </div>
      <div className="mt-8">
        <p className="text-2xl">
          {swapExContext?.token1Symbol}{" "}
          <span className="text-sm">
            Enjoy {faucetContext?.token1WithdrawableAmountPerCall} {swapExContext?.token1Symbol} when you make a request
          </span>
        </p>
        <div className="mt-2">
          <button
            disabled={!token1WithdrawAvailable}
            className={`bg-red-400 rounded-xl text-md py-1 px-8 ${!token1WithdrawAvailable && "bg-gray-600 text-gray-800"}`}
            onClick={withdrawToken1}
          >
            Send Me {swapExContext?.token1Symbol}
          </button>
          <p className="text-xs mt-1">Faucet Balance: {faucetContext?.balanceOfToken1}</p>
          {!token1WithdrawAvailable && (
            <p className="text-sm mt-1">
              Withdraw Available At {moment(faucetContext?.token1WithdrawAvailableTimestamp).format("DD/MM/YYYY, h:mm:ss a")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
