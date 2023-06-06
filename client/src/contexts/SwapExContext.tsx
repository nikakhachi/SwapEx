import React, { createContext, PropsWithChildren, useEffect, useState } from "react";
import { useContractRead, useAccount, useContractWrite, useContractEvent } from "wagmi";
import { SWAPEX_ABI, SWAPEX_ADDRESS } from "../contracts/swapEx";
import { ethers } from "ethers";
import { BigNumberish } from "ethers";
import { ERC20_ABI } from "../contracts/ERC20";
import { bigNumberToNumber } from "../utils";

type SwapExContextType = {
  token0Address: string;
  token1Address: string;
  token0Reserve: number;
  token1Reserve: number;
  token0Symbol: string;
  token1Symbol: string;
  lpTokenAmount: number;
  swap: (tokenIn: string, amountIn: number) => void;
  approve: (tokenAddress: string, amount: string) => void;
  removeLiquidity: (shares: number) => void;
  removeAllLiquidity: () => void;
  addLiquidity: (token0Amount: string, token1Amount: string) => void;
  balanceOfToken0: number;
  balanceOfToken1: number;
  fetchBalances: () => void;
  secondTokenAmountForRatio: string;
  fetchSecondTokenAmountForRatio: (tokenOne: string, tokenOneAmount: string) => void;
  tokenOutputForSwap: number;
  fetchTokenOutputForSwap: (tokenIn: string, tokenInAmount: number) => void;
  resetSecondTokenAmountForRatio: () => void;
};

export const SwapExContext = createContext<SwapExContextType | null>(null);

export const SwapExProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { address } = useAccount();

  const [tokenOneInForLiquidity, setTokenOneInForLiqudiity] = useState("");
  const [tokenOneInAmountForLiquidity, setTokenOneInAmountForLiqudiity] = useState("0");

  const [tokenInForSwap, setTokenInForSwap] = useState("");
  const [tokenInAmountForSwap, setTokenInAmountForSwap] = useState(0);

  const [secondTokenAmountForRatio, setSecondTokenAmountForRatio] = useState("0");

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
  const { write: removeAllLiquidityTx, isSuccess: onRemoveAllLiquiditySuccess } = useContractWrite({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "removeAllLiquidity",
  });
  const { write: addLiquidityTx, isSuccess: onAddLiquiditySuccess } = useContractWrite({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "addLiquidity",
  });
  const { data: balanceOfToken0, refetch: fetchBalanceOfToken0 } = useContractRead({
    address: token0Address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    enabled: false,
    args: [address],
  });
  const { data: balanceOfToken1, refetch: fetchBalanceOfToken1 } = useContractRead({
    address: token1Address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    enabled: false,
    args: [address],
  });
  const { data: tokenAmountForRatio, refetch: fetchTokenAmountForRatioTx } = useContractRead({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "secondTokenLiquidityAmount",
    args: [tokenOneInForLiquidity, ethers.parseEther(String(tokenOneInAmountForLiquidity))],
    enabled: false,
  });
  const { data: tokenOutputForSwap, refetch: fetchTokenOutputForSwapTx } = useContractRead({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "calculateAmountOut",
    args: [tokenInForSwap, ethers.parseEther(String(tokenInAmountForSwap))],
    enabled: false,
  });
  useContractEvent({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    eventName: "Swap",
    listener(logs) {
      if ((logs[0] as any).args.swapper.toUpperCase() !== address?.toUpperCase()) {
        console.log("swap event");
        refetchToken0Reserve();
        refetchToken1Reserve();
      }
    },
  });
  useContractEvent({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    eventName: "LiquidityAdded",
    listener(logs) {
      if ((logs[0] as any).args.lp.toUpperCase() !== address?.toUpperCase()) {
        console.log("liquidity add event");
        refetchToken0Reserve();
        refetchToken1Reserve();
      }
    },
  });
  useContractEvent({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    eventName: "LiquidityRemoved",
    listener(logs) {
      if ((logs[0] as any).args.lp.toUpperCase() !== address?.toUpperCase()) {
        console.log("liquidity removed event");
        refetchToken0Reserve();
        refetchToken1Reserve();
      }
    },
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
    if (address && token1Address && token0Address) {
      fetchBalanceOfToken0();
      fetchBalanceOfToken1();
    }
  }, [address, token1Address, token0Address]);

  useEffect(() => {
    if (onSwapSuccess || onRemoveLiquiditySuccess || onAddLiquiditySuccess || onRemoveAllLiquiditySuccess) {
      refetchToken0Reserve();
      refetchToken1Reserve();
      fetchBalanceOfToken0();
      fetchBalanceOfToken1();
      fetchLpTokenAmount();
    }
  }, [onSwapSuccess, onRemoveLiquiditySuccess, onAddLiquiditySuccess, onRemoveAllLiquiditySuccess]);

  useEffect(() => {
    if (tokenOneInAmountForLiquidity !== "0") {
      fetchTokenAmountForRatioTx();
    }
  }, [tokenOneInAmountForLiquidity]);

  useEffect(() => {
    if (tokenInAmountForSwap || tokenInForSwap) {
      fetchTokenOutputForSwapTx();
    }
  }, [tokenInAmountForSwap, tokenInForSwap]);

  useEffect(() => {
    if (tokenAmountForRatio) {
      setSecondTokenAmountForRatio(String(bigNumberToNumber(tokenAmountForRatio as BigNumberish)));
    }
  }, [tokenAmountForRatio]);

  const swap = (tokenIn: string, amountIn: number) => {
    swapTokens({ args: [tokenIn, ethers.parseUnits(String(amountIn))] });
  };

  const approve = (tokenAddress: string, amount: string) => {
    if (tokenAddress === token0Address) {
      approveToken0({ args: [SWAPEX_ADDRESS, ethers.parseUnits(amount)] });
    } else if (tokenAddress === token1Address) {
      approveToken1({ args: [SWAPEX_ADDRESS, ethers.parseUnits(amount)] });
    }
  };

  const removeLiquidity = (shares: number) => {
    removeLiquidityTx({ args: [ethers.parseUnits(String(shares))] });
  };

  const removeAllLiquidity = () => {
    removeAllLiquidityTx();
  };

  const addLiquidity = (token0Amount: string, token1Amount: string) => {
    addLiquidityTx({ args: [ethers.parseUnits(token0Amount), ethers.parseUnits(token1Amount)] });
  };

  const fetchBalances = () => {
    fetchBalanceOfToken0();
    fetchBalanceOfToken1();
  };

  const fetchSecondTokenAmountForRatio = (tokenOne: string, tokenOneIn: string) => {
    setTokenOneInForLiqudiity(tokenOne);
    setTokenOneInAmountForLiqudiity(tokenOneIn);
  };

  const fetchTokenOutputForSwap = (tokenIn: string, tokenInAmount: number) => {
    setTokenInForSwap(tokenIn);
    setTokenInAmountForSwap(tokenInAmount);
  };

  const value = {
    token0Address: token0Address as string,
    token1Address: token1Address as string,
    token0Reserve: bigNumberToNumber(token0Reserve as BigNumberish),
    token1Reserve: bigNumberToNumber(token1Reserve as BigNumberish),
    token0Symbol: token0Symbol as string,
    token1Symbol: token1Symbol as string,
    lpTokenAmount: bigNumberToNumber(lpTokenAmount as BigNumberish),
    swap,
    approve,
    addLiquidity,
    removeLiquidity,
    balanceOfToken0: bigNumberToNumber(balanceOfToken0 as BigNumberish),
    balanceOfToken1: bigNumberToNumber(balanceOfToken1 as BigNumberish),
    fetchBalances,
    removeAllLiquidity,
    secondTokenAmountForRatio,
    fetchSecondTokenAmountForRatio,
    fetchTokenOutputForSwap,
    tokenOutputForSwap: bigNumberToNumber(tokenOutputForSwap as BigNumberish),
    resetSecondTokenAmountForRatio: () => setSecondTokenAmountForRatio("0"),
  };

  return <SwapExContext.Provider value={value}>{children}</SwapExContext.Provider>;
};
