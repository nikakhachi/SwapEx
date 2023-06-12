import { FC, useContext } from "react";
import { SwapExContext } from "../contexts/SwapExContext";
import { FaucetContext } from "../contexts/FaucetContext";
import moment from "moment";
import { Button } from "./Button";
import { CircularProgress } from "@mui/material";
import { TOKEN0_FAUCET_ADDRESS, TOKEN1_FAUCET_ADDRESS } from "../contracts/Faucet";

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
    <>
      <div>
        <p className="text-2xl">
          {swapExContext?.token0Symbol}{" "}
          <span className="text-sm">
            Enjoy {faucetContext?.token0WithdrawableAmountPerCall} {swapExContext?.token0Symbol} when you make a request{" "}
            <a
              href={`https://goerli.etherscan.io/address/${TOKEN0_FAUCET_ADDRESS}`}
              className="text-center underline"
              target="_blank"
              rel="noreferrer"
            >
              (ETHERSCAN)
            </a>
          </span>
        </p>
        <div className="mt-2">
          <Button
            disabled={!token0WithdrawAvailable || faucetContext?.withdrawToken0Loading}
            text={
              faucetContext?.withdrawToken0Loading ? (
                <CircularProgress size="1rem" color="inherit" />
              ) : (
                `Send Me ${swapExContext?.token0Symbol}`
              )
            }
            onClick={withdrawToken0}
            className={`${!token0WithdrawAvailable && "bg-gray-500 text-gray-800"} w-44`}
          />

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
            Enjoy {faucetContext?.token1WithdrawableAmountPerCall} {swapExContext?.token1Symbol} when you make a request{" "}
            <a
              href={`https://goerli.etherscan.io/address/${TOKEN1_FAUCET_ADDRESS}`}
              className="text-center underline"
              target="_blank"
              rel="noreferrer"
            >
              (ETHERSCAN)
            </a>
          </span>
        </p>
        <div className="mt-2">
          <Button
            disabled={!token1WithdrawAvailable || faucetContext?.withdrawToken1Loading}
            text={
              faucetContext?.withdrawToken1Loading ? (
                <CircularProgress size="1rem" color="inherit" />
              ) : (
                `Send Me ${swapExContext?.token1Symbol}`
              )
            }
            onClick={withdrawToken1}
            className={`${!token1WithdrawAvailable && "bg-gray-500 text-gray-800"} w-44`}
          />
          <p className="text-xs mt-1">Faucet Balance: {faucetContext?.balanceOfToken1}</p>
          {!token1WithdrawAvailable && (
            <p className="text-sm mt-1">
              Withdraw Available At {moment(faucetContext?.token1WithdrawAvailableTimestamp).format("DD/MM/YYYY, h:mm:ss a")}
            </p>
          )}
        </div>
      </div>
    </>
  );
};
