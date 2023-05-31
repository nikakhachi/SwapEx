import React, { createContext, PropsWithChildren, useEffect } from "react";
import { useContractRead, useAccount, useContractReads, useContractWrite } from "wagmi";
import { SWAPEX_ABI, SWAPEX_ADDRESS } from "../contracts/swapEx";
import { ethers } from "ethers";
import { BigNumberish } from "ethers";
import { ERC20_ABI } from "../contracts/ERC20";

type SwapExContextType = {
  token0Address: string;
  token1Address: string;
  token0Reserve: number;
  token1Reserve: number;
  token0Symbol: string;
  token1Symbol: string;
  lpTokenAmount: number;
  swap: (tokenIn: string, amountIn: number) => void;
  approve: (tokenAddress: string, amount: number) => void;
  removeLiquidity: (shares: number) => void;
  addLiquidity: (token0Amount: number, token1Amount: number) => void;
};

export const SwapExContext = createContext<SwapExContextType | null>(null);

export const SwapExProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { address } = useAccount();

  const { data: token0Address } = useContractRead({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "token0",
  });
  const { data: token1Address } = useContractRead({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "token1",
  });
  const { data: token0Reserve, refetch: refetchToken0Reserve } = useContractRead({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "reserve0",
  });
  const { data: token1Reserve, refetch: refetchToken1Reserve } = useContractRead({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "reserve1",
  });
  const { data: token0Symbol, refetch: fetchToken0Symbol } = useContractRead({
    address: token0Address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "symbol",
    enabled: false,
  });
  const { data: token1Symbol, refetch: fetchToken1Symbol } = useContractRead({
    address: token1Address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "symbol",
    enabled: false,
  });
  const { data: lpTokenAmount, refetch: fetchLpTokenAmount } = useContractRead({
    address: SWAPEX_ADDRESS as `0x${string}`,
    abi: SWAPEX_ABI,
    functionName: "balanceOf",
    args: [address],
    enabled: false,
  });
  const { write: approveToken0 } = useContractWrite({
    address: token0Address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "approve",
  });
  const { write: approveToken1 } = useContractWrite({
    address: token1Address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "approve",
  });
  const { write: swapTokens, isSuccess: onSwapSuccess } = useContractWrite({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "swap",
  });
  const { write: removeLiquidityTx, isSuccess: onRemoveLiquiditySuccess } = useContractWrite({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "removeLiquidity",
  });
  const { write: addLiquidityTx, isSuccess: onAddLiquiditySuccess } = useContractWrite({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "addLiquidity",
  });

  useEffect(() => {
    if (token0Address) {
      fetchToken0Symbol();
    }
  }, [token0Address]);

  useEffect(() => {
    if (token1Address) {
      fetchToken1Symbol();
    }
  }, [token1Address]);

  useEffect(() => {
    if (address) {
      fetchLpTokenAmount();
    }
  }, [address]);

  useEffect(() => {
    if (onSwapSuccess || onRemoveLiquiditySuccess || onAddLiquiditySuccess) {
      refetchToken0Reserve();
      refetchToken1Reserve();
    }
  }, [onSwapSuccess, onRemoveLiquiditySuccess, onAddLiquiditySuccess]);

  const swap = (tokenIn: string, amountIn: number) => {
    swapTokens({ args: [tokenIn, ethers.parseUnits(String(amountIn))] });
  };

  const approve = (tokenAddress: string, amount: number) => {
    if (tokenAddress === token0Address) {
      approveToken0({ args: [SWAPEX_ADDRESS, ethers.parseUnits(String(amount))] });
    } else if (tokenAddress === token1Address) {
      approveToken1({ args: [SWAPEX_ADDRESS, ethers.parseUnits(String(amount))] });
    }
  };

  const removeLiquidity = (shares: number) => {
    removeLiquidityTx({ args: [ethers.parseUnits(String(shares))] });
  };

  const addLiquidity = (token0Amount: number, token1Amount: number) => {
    addLiquidityTx({ args: [ethers.parseUnits(String(token0Amount)), ethers.parseUnits(String(token1Amount))] });
  };

  const value = {
    token0Address: token0Address as string,
    token1Address: token1Address as string,
    token0Reserve: Math.round(Number(ethers.formatUnits(token0Reserve as BigNumberish))),
    token1Reserve: Math.round(Number(ethers.formatUnits(token1Reserve as BigNumberish))),
    token0Symbol: token0Symbol as string,
    token1Symbol: token1Symbol as string,
    lpTokenAmount: !lpTokenAmount ? 0 : Math.round(Number(ethers.formatUnits(lpTokenAmount as BigNumberish))),
    swap,
    approve,
    addLiquidity,
    removeLiquidity,
  };

  return <SwapExContext.Provider value={value}>{children}</SwapExContext.Provider>;
};
