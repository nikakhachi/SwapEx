import React, { createContext, PropsWithChildren, useEffect, useState } from "react";
import { useContractRead, useAccount, useContractWrite, useContractEvent, useWaitForTransaction } from "wagmi";
import { ethers, BigNumberish } from "ethers";
import { STAKER_ABI, STAKER_ADDRESS } from "../contracts/Staker";
import { ERC20_ABI } from "../contracts/ERC20";
import { bigNumberToNumber } from "../utils";

type StakerContextType = {
  totalRewardsToGive: number;
  finishAt: Date;
  stakedBalance: number;
  userRewards: number;
  stake: (amount: string) => void;
  withdraw: () => void;
  getRewards: () => void;
  rewardsTokenSymbol: string;
  totalStaked: number;
  isStakeLoading: boolean;
  isWithdrawLoading: boolean;
  isGetRewardsLoading: boolean;
};

export const StakerContext = createContext<StakerContextType | null>(null);

export const StakerProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isStakeLoading, setIsStakeLoading] = useState(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const [isGetRewardsLoading, setIsGetRewardsLoading] = useState(false);

  const { address } = useAccount();
  const { data: rewardsToken } = useContractRead({
    address: STAKER_ADDRESS,
    abi: STAKER_ABI,
    functionName: "rewardsToken",
  });
  const { data: totalRewardsToGive } = useContractRead({
    address: STAKER_ADDRESS,
    abi: STAKER_ABI,
    functionName: "totalRewardsToGive",
  });
  const { data: finishAt } = useContractRead({
    address: STAKER_ADDRESS,
    abi: STAKER_ABI,
    functionName: "finishAt",
  });
  const { data: stakedBalance, refetch: refetchStakedBalance } = useContractRead({
    address: STAKER_ADDRESS,
    abi: STAKER_ABI,
    functionName: "stakedBalanceOf",
    args: [address],
    enabled: false,
  });
  const { data: userRewards, refetch: refetchUserRewards } = useContractRead({
    address: STAKER_ADDRESS,
    abi: STAKER_ABI,
    functionName: "userRewards",
    args: [address],
    enabled: false,
  });
  const {
    write: stakeWrite,
    data: stakeWriteData,
    isError: onStakeWriteError,
  } = useContractWrite({
    address: STAKER_ADDRESS,
    abi: STAKER_ABI,
    functionName: "stake",
  });
  const stakeTx = useWaitForTransaction({ hash: stakeWriteData?.hash });
  const {
    write: withdrawWrite,
    data: withdrawWriteData,
    isError: onWithdrawWriteError,
  } = useContractWrite({
    address: STAKER_ADDRESS,
    abi: STAKER_ABI,
    functionName: "withdraw",
  });
  const withdrawTx = useWaitForTransaction({ hash: withdrawWriteData?.hash });
  const {
    write: getRewardsWrite,
    data: getRewardsWriteData,
    isError: onGetRewardsWriteError,
  } = useContractWrite({
    address: STAKER_ADDRESS,
    abi: STAKER_ABI,
    functionName: "getRewards",
  });
  const getRewardsTx = useWaitForTransaction({ hash: getRewardsWriteData?.hash });
  const { data: rewardsTokenSymbol, refetch: fetchRewardsTokenSymbol } = useContractRead({
    address: rewardsToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "symbol",
  });
  const { data: totalStaked, refetch: refetchTotalStaked } = useContractRead({
    address: STAKER_ADDRESS,
    abi: STAKER_ABI,
    functionName: "totalStaked",
  });
  useContractEvent({
    address: STAKER_ADDRESS,
    abi: STAKER_ABI,
    eventName: "Stake",
    listener(logs) {
      if ((logs[0] as any).args.staker.toUpperCase() !== address?.toUpperCase()) {
        refetchTotalStaked();
      }
    },
  });
  useContractEvent({
    address: STAKER_ADDRESS,
    abi: STAKER_ABI,
    eventName: "Withdraw",
    listener(logs) {
      if ((logs[0] as any).args.staker.toUpperCase() !== address?.toUpperCase()) {
        refetchTotalStaked();
      }
    },
  });

  useEffect(() => {
    if (address) {
      refetchStakedBalance();
      refetchUserRewards();
    }
  }, [address]);

  useEffect(() => {
    if (rewardsToken) {
      fetchRewardsTokenSymbol();
    }
  }, [rewardsToken]);

  useEffect(() => {
    if (getRewardsTx.status === "success") {
      refetchUserRewards();
    } else if (getRewardsTx.status === "error") {
      setIsGetRewardsLoading(false);
      alert("Error Getting Rewards");
    }
  }, [getRewardsTx.status]);

  useEffect(() => {
    if (onGetRewardsWriteError) {
      setIsGetRewardsLoading(false);
    }
  }, [onGetRewardsWriteError]);

  useEffect(() => {
    if (stakeTx.status === "success") {
      setIsStakeLoading(false);
      refetchStakedBalance();
      refetchTotalStaked();
    } else if (stakeTx.status === "error") {
      setIsStakeLoading(false);
      alert("Error Staking");
    }
  }, [stakeTx.status]);

  useEffect(() => {
    if (onStakeWriteError) {
      setIsStakeLoading(false);
    }
  }, [onStakeWriteError]);

  useEffect(() => {
    if (withdrawTx.status === "success") {
      setIsWithdrawLoading(false);
      refetchStakedBalance();
      refetchUserRewards();
      refetchTotalStaked();
    } else if (withdrawTx.status === "error") {
      setIsWithdrawLoading(false);
      alert("Error Withdrawing");
    }
  }, [withdrawTx.status]);

  useEffect(() => {
    if (onWithdrawWriteError) {
      setIsWithdrawLoading(false);
    }
  }, [onWithdrawWriteError]);

  const stake = (amount: string) => {
    setIsStakeLoading(true);
    stakeWrite({ value: ethers.parseEther(amount) });
  };

  const withdraw = () => {
    setIsWithdrawLoading(true);
    withdrawWrite();
  };

  const getRewards = () => {
    setIsGetRewardsLoading(true);
    getRewardsWrite();
  };

  const value = {
    totalRewardsToGive: bigNumberToNumber(totalRewardsToGive as BigNumberish),
    finishAt: new Date(Number(finishAt) * 1000),
    stakedBalance: bigNumberToNumber(stakedBalance as BigNumberish),
    userRewards: bigNumberToNumber(userRewards as BigNumberish),
    stake,
    withdraw,
    getRewards,
    rewardsTokenSymbol: rewardsTokenSymbol as string,
    totalStaked: bigNumberToNumber(totalStaked as BigNumberish),
    isStakeLoading,
    isWithdrawLoading,
    isGetRewardsLoading,
  };

  return <StakerContext.Provider value={value}>{children}</StakerContext.Provider>;
};
