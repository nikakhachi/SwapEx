import React, { createContext, PropsWithChildren, useEffect, useState } from "react";
import { useContractRead, useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
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
  withdrawToken0Loading: boolean;
  withdrawToken1Loading: boolean;
};

export const FaucetContext = createContext<FaucetContextType | null>(null);

export const FaucetProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [withdrawToken0Loading, setWithdrawToken0Loading] = useState(false);
  const [withdrawToken1Loading, setWithdrawToken1Loading] = useState(false);

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
  const {
    write: withdrawToken0Write,
    isSuccess: onToken0WithdrawalSuccess,
    data: withdrawToken0WriteData,
    isError: onToken0WithdrawalError,
  } = useContractWrite({
    address: TOKEN0_FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "withdraw",
  });
  const withdrawToken0Tx = useWaitForTransaction({
    hash: withdrawToken0WriteData?.hash,
  });
  const {
    write: withdrawToken1Write,
    isSuccess: onToken1WithdrawalSuccess,
    data: withdrawToken1WriteData,
    isError: onToken1WithdrawalError,
  } = useContractWrite({
    address: TOKEN1_FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "withdraw",
  });
  const withdrawToken1Tx = useWaitForTransaction({
    hash: withdrawToken1WriteData?.hash,
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
    if (onToken0WithdrawalError) setWithdrawToken0Loading(false);
  }, [onToken0WithdrawalError]);

  useEffect(() => {
    if (onToken1WithdrawalError) setWithdrawToken1Loading(false);
  }, [onToken1WithdrawalError]);

  useEffect(() => {
    if (withdrawToken0Tx.status === "success") {
      setWithdrawToken0Loading(false);
      fetchToken0WithdrawalTime();
    } else if (withdrawToken0Tx.status === "error") {
      setWithdrawToken0Loading(false);
      alert("Error Withdrawing From Token 0");
    }
  }, [withdrawToken0Tx.status]);

  useEffect(() => {
    if (withdrawToken1Tx.status === "success") {
      setWithdrawToken1Loading(false);
      fetchToken1WithdrawalTime();
    } else if (withdrawToken1Tx.status === "error") {
      setWithdrawToken1Loading(false);
      alert("Error Withdrawing From Token 1");
    }
  }, [withdrawToken1Tx.status]);

  useEffect(() => {
    if (address || onToken0WithdrawalSuccess || onToken1WithdrawalSuccess) {
      fetchToken0WithdrawalTime();
      fetchToken1WithdrawalTime();
    }
  }, [address, onToken0WithdrawalSuccess, onToken1WithdrawalSuccess]);

  const withdrawToken0 = () => {
    setWithdrawToken0Loading(true);
    withdrawToken0Write();
  };

  const withdrawToken1 = () => {
    setWithdrawToken1Loading(true);
    withdrawToken1Write();
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
    withdrawToken0Loading,
    withdrawToken1Loading,
  };

  return <FaucetContext.Provider value={value}>{children}</FaucetContext.Provider>;
};
