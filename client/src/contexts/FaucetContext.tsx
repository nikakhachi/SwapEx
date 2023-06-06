import React, { createContext, PropsWithChildren, useEffect } from "react";
import { useContractRead, useAccount, useContractWrite, useContractEvent } from "wagmi";
import { TOKEN0_FAUCET_ADDRESS, FAUCET_ABI, TOKEN1_FAUCET_ADDRESS } from "../contracts/Faucet";
import { BigNumberish } from "ethers";
import { ERC20_ABI } from "../contracts/ERC20";
import { bigNumberToNumber } from "../utils";

type FaucetContextType = {
  token0WithdrawableAmountPerCall: number;
  token1WithdrawableAmountPerCall: number;
  token0WithdrawAvailableTimestamp: Date;
  token1WithdrawAvailableTimestamp: Date;
  withdrawToken0: () => void;
  withdrawToken1: () => void;
  balanceOfToken0: number;
  balanceOfToken1: number;
};

export const FaucetContext = createContext<FaucetContextType | null>(null);

export const FaucetProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { address } = useAccount();
  const { data: token0Address } = useContractRead({
    address: TOKEN0_FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "token",
  });
  const { data: token1Address } = useContractRead({
    address: TOKEN1_FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "token",
  });
  const { data: token0WithdrawableAmountPerCall } = useContractRead({
    address: TOKEN0_FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "withdrawableAmount",
  });
  const { data: token1WithdrawableAmountPerCall } = useContractRead({
    address: TOKEN1_FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "withdrawableAmount",
  });
  const { data: token0WithdrawalTime, refetch: fetchToken0WithdrawalTime } = useContractRead({
    address: TOKEN0_FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "withdrawalTimes",
    args: [address],
    watch: true,
  });
  const { data: token1WithdrawalTime, refetch: fetchToken1WithdrawalTime } = useContractRead({
    address: TOKEN1_FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "withdrawalTimes",
    args: [address],
    watch: true,
  });
  const { write: withdrawToken0Tx, isSuccess: onToken0WithdrawalSuccess } = useContractWrite({
    address: TOKEN0_FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "withdraw",
  });
  const { write: withdrawToken1Tx, isSuccess: onToken1WithdrawalSuccess } = useContractWrite({
    address: TOKEN1_FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "withdraw",
  });
  const { data: balanceOfToken0 } = useContractRead({
    address: token0Address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [TOKEN0_FAUCET_ADDRESS],
    watch: true,
  });
  const { data: balanceOfToken1 } = useContractRead({
    address: token1Address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [TOKEN1_FAUCET_ADDRESS],
    watch: true,
  });

  useEffect(() => {
    if (address || onToken0WithdrawalSuccess || onToken1WithdrawalSuccess) {
      fetchToken0WithdrawalTime();
      fetchToken1WithdrawalTime();
    }
  }, [address, onToken0WithdrawalSuccess, onToken1WithdrawalSuccess]);

  const withdrawToken0 = () => {
    withdrawToken0Tx();
  };

  const withdrawToken1 = () => {
    withdrawToken1Tx();
  };

  const value = {
    token0WithdrawableAmountPerCall: bigNumberToNumber(token0WithdrawableAmountPerCall as BigNumberish),
    token1WithdrawableAmountPerCall: bigNumberToNumber(token1WithdrawableAmountPerCall as BigNumberish),
    token0WithdrawAvailableTimestamp: new Date(Number(token0WithdrawalTime || 0) * 1000),
    token1WithdrawAvailableTimestamp: new Date(Number(token1WithdrawalTime || 0) * 1000),
    withdrawToken0,
    withdrawToken1,
    balanceOfToken0: bigNumberToNumber(balanceOfToken0 as BigNumberish),
    balanceOfToken1: bigNumberToNumber(balanceOfToken1 as BigNumberish),
  };

  return <FaucetContext.Provider value={value}>{children}</FaucetContext.Provider>;
};
