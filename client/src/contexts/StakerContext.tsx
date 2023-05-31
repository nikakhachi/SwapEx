import React, { createContext, PropsWithChildren, useEffect } from "react";
import { useContractRead, useAccount, useContractWrite } from "wagmi";
import { ethers, BigNumberish } from "ethers";
import { STAKER_ABI, STAKER_ADDRESS } from "../contracts/Staker";

type StakerContextType = {
  totalRewardsToGive: number;
  finishAt: Date;
  stakedBalance: number;
  userRewards: number;
  stake: (amount: number) => void;
  withdraw: () => void;
  getRewards: () => void;
};

export const StakerContext = createContext<StakerContextType | null>(null);

export const StakerProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { address } = useAccount();
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
  });
  const { data: userRewards, refetch: refetchUserRewards } = useContractRead({
    address: STAKER_ADDRESS,
    abi: STAKER_ABI,
    functionName: "userRewards",
    args: [address],
  });
  const { write: stakeTx, isSuccess: onStakeSuccess } = useContractWrite({
    address: STAKER_ADDRESS,
    abi: STAKER_ABI,
    functionName: "stake",
  });
  const { write: withdrawTx, isSuccess: onWithdrawSuccess } = useContractWrite({
    address: STAKER_ADDRESS,
    abi: STAKER_ABI,
    functionName: "withdraw",
  });
  const { write: getRewardsTx, isSuccess: onGetRewardsSuccess } = useContractWrite({
    address: STAKER_ADDRESS,
    abi: STAKER_ABI,
    functionName: "getRewards",
  });

  useEffect(() => {
    if (address) {
      refetchStakedBalance();
      refetchUserRewards();
    }
  }, [address]);

  useEffect(() => {
    if (onGetRewardsSuccess) {
      refetchUserRewards();
    }
  }, [onGetRewardsSuccess]);

  useEffect(() => {
    if (onStakeSuccess) {
      refetchStakedBalance();
    }
  }, [onStakeSuccess]);

  useEffect(() => {
    if (onWithdrawSuccess) {
      refetchStakedBalance();
      refetchUserRewards();
    }
  }, [onWithdrawSuccess]);

  const stake = (amount: number) => {
    stakeTx({ value: ethers.parseEther(String(amount)) });
  };

  const withdraw = () => {
    withdrawTx();
  };

  const getRewards = () => {
    getRewardsTx();
  };

  const value = {
    totalRewardsToGive: Number(ethers.formatUnits(totalRewardsToGive as BigNumberish)),
    finishAt: new Date(Number(finishAt) * 1000),
    stakedBalance: Number(ethers.formatUnits(stakedBalance as BigNumberish)),
    userRewards: Number(ethers.formatUnits((userRewards as BigNumberish) || 0)),
    stake,
    withdraw,
    getRewards,
  };

  return <StakerContext.Provider value={value}>{children}</StakerContext.Provider>;
};
