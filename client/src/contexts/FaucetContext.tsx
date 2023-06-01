import React, { createContext, PropsWithChildren, useEffect } from "react";
import { useContractRead, useAccount, useContractWrite } from "wagmi";
import { TOKEN0_FAUCET_ADDRESS, FAUCET_ABI, TOKEN1_FAUCET_ADDRESS } from "../contracts/Faucet";
import { ethers, BigNumberish } from "ethers";

type FaucetContextType = {
  token0WithdrawableAmountPerCall: number;
  token1WithdrawableAmountPerCall: number;
  token0WithdrawAvailableTimestamp: Date;
  token1WithdrawAvailableTimestamp: Date;
  withdrawToken0: () => void;
  withdrawToken1: () => void;
};

export const FaucetContext = createContext<FaucetContextType | null>(null);

export const FaucetProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { address } = useAccount();
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
    enabled: false,
    watch: true,
  });
  const { data: token1WithdrawalTime, refetch: fetchToken1WithdrawalTime } = useContractRead({
    address: TOKEN1_FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "withdrawalTimes",
    args: [address],
    enabled: false,
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
    token0WithdrawableAmountPerCall: Math.round(Number(ethers.formatUnits(token0WithdrawableAmountPerCall as BigNumberish))),
    token1WithdrawableAmountPerCall: Math.round(Number(ethers.formatUnits(token1WithdrawableAmountPerCall as BigNumberish))),
    token0WithdrawAvailableTimestamp: new Date(Number(token0WithdrawalTime || 0) * 1000),
    token1WithdrawAvailableTimestamp: new Date(Number(token1WithdrawalTime || 0) * 1000),
    withdrawToken0,
    withdrawToken1,
  };

  return <FaucetContext.Provider value={value}>{children}</FaucetContext.Provider>;
};
