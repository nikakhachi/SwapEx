import React, { createContext, PropsWithChildren, useEffect, useState } from "react";
import { useContractRead, useAccount, useContractWrite, useWaitForTransaction } from "wagmi";
import { SWAPEX_ABI, SWAPEX_ADDRESS } from "../contracts/swapEx";
import { ethers } from "ethers";
import { BigNumberish } from "ethers";
import { ERC20_ABI } from "../contracts/ERC20";
import { bigNumberToNumber, bigNumberToString } from "../utils";
import { writeContractAndWait } from "../utils/wagmi";

type SwapExContextType = {
  token0Address: string;
  token1Address: string;
  token0Reserve: string;
  token1Reserve: string;
  token0Symbol: string;
  token1Symbol: string;
  lpTokenAmount: string;
  swap: (tokenIn: string, amountIn: string) => void;
  approve: (tokenAddress: string, amount: string, approveFor: ApproveForTypes) => void;
  removeLiquidity: (shares: string) => void;
  removeAllLiquidity: () => void;
  addLiquidity: (token0Amount: string, token1Amount: string) => void;
  balanceOfToken0: string;
  balanceOfToken1: string;
  fetchBalances: () => void;
  secondTokenAmountForRatio: string;
  fetchSecondTokenAmountForRatio: (tokenOne: string, tokenOneAmount: string) => void;
  tokenOutputForSwap: string;
  fetchTokenOutputForSwap: (tokenIn: string, tokenInAmount: string) => void;
  resetSecondTokenAmountForRatio: () => void;
  isTokenApproveForSwapLoading: boolean;
  isTokenSwapLoading: boolean;
  removeLiquidityLoading: boolean;
  addLiquidityLoading: boolean;
  isTokenApproveForL0Loading: boolean;
  isTokenApproveForL1Loading: boolean;
};

type ApproveForTypes = "swap" | "l0" | "l1";

export const SwapExContext = createContext<SwapExContextType | null>(null);

export const SwapExProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { address } = useAccount();

  const [tokenOneInForLiquidity, setTokenOneInForLiqudiity] = useState("");
  const [tokenOneInAmountForLiquidity, setTokenOneInAmountForLiqudiity] = useState("0");

  const [tokenInForSwap, setTokenInForSwap] = useState("");
  const [tokenInAmountForSwap, setTokenInAmountForSwap] = useState("0");

  const [secondTokenAmountForRatio, setSecondTokenAmountForRatio] = useState("0");

  const [isTokenApproveForSwapLoading, setIsTokenApproveForSwapLoading] = useState(false);
  const [isTokenApproveForL0Loading, setIsTokenApproveForL0Loading] = useState(false); // L0 = Token 0 for liquidity
  const [isTokenApproveForL1Loading, setIsTokenApproveForL1Loading] = useState(false); // L1 = Token 1 for liquidity

  const [isTokenSwapLoading, setIsTokenSwapLoading] = useState(false);
  const [removeLiquidityLoading, setRemoveLiquidityLoading] = useState(false);
  const [addLiquidityLoading, setAddLiquidityLoading] = useState(false);

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
    watch: true,
  });
  const { data: token1Reserve, refetch: refetchToken1Reserve } = useContractRead({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "reserve1",
    watch: true,
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
    watch: true,
  });
  const {
    write: swapTokens,
    data: swapTokensData,
    isError: onSwapTokensError,
  } = useContractWrite({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "swap",
  });
  const swapTokensTx = useWaitForTransaction({ hash: swapTokensData?.hash });
  const {
    write: removeLiquidityWrite,
    data: removeLiquidityWriteData,
    isError: onRemoveLiquidityWriteError,
  } = useContractWrite({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "removeLiquidity",
  });
  const removeLiquidityTx = useWaitForTransaction({ hash: removeLiquidityWriteData?.hash });
  const {
    write: removeAllLiquidityWrite,
    data: removeAllLiquidityWriteData,
    isError: onRemoveAllLiquidityWriteError,
  } = useContractWrite({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "removeAllLiquidity",
  });
  const removeAllLiquidityTx = useWaitForTransaction({ hash: removeAllLiquidityWriteData?.hash });
  const {
    write: addLiquidityWrite,
    data: addLiquidityWriteData,
    isError: onAddLiquidityWriteError,
  } = useContractWrite({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "addLiquidity",
  });
  const addLiquidityTx = useWaitForTransaction({ hash: addLiquidityWriteData?.hash });
  const { data: balanceOfToken0, refetch: fetchBalanceOfToken0 } = useContractRead({
    address: token0Address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });
  const { data: balanceOfToken1, refetch: fetchBalanceOfToken1 } = useContractRead({
    address: token1Address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });
  const { data: tokenAmountForRatio, refetch: fetchTokenAmountForRatioTx } = useContractRead({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "secondTokenLiquidityAmount",
    args: [tokenOneInForLiquidity, ethers.parseEther(tokenOneInAmountForLiquidity)],
    enabled: false,
  });
  const { data: tokenOutputForSwap, refetch: fetchTokenOutputForSwapTx } = useContractRead({
    address: SWAPEX_ADDRESS,
    abi: SWAPEX_ABI,
    functionName: "calculateAmountOut",
    args: [tokenInForSwap, ethers.parseEther(tokenInAmountForSwap)],
    enabled: false,
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
    if (tokenOneInAmountForLiquidity !== "0") {
      fetchTokenAmountForRatioTx();
    }
  }, [tokenOneInAmountForLiquidity]);

  useEffect(() => {
    if (
      (tokenInAmountForSwap || tokenInForSwap) &&
      bigNumberToNumber(token0Reserve as BigNumberish) &&
      bigNumberToNumber(token1Reserve as BigNumberish)
    ) {
      fetchTokenOutputForSwapTx();
    }
  }, [tokenInAmountForSwap, tokenInForSwap]);

  useEffect(() => {
    if (tokenAmountForRatio) {
      setSecondTokenAmountForRatio(bigNumberToString(tokenAmountForRatio as BigNumberish));
    }
  }, [tokenAmountForRatio]);

  useEffect(() => {
    if (swapTokensTx.status === "success") {
      setIsTokenSwapLoading(false);
      fetchBalanceOfToken0();
      fetchBalanceOfToken1();
    } else if (swapTokensTx.status === "error") {
      setIsTokenSwapLoading(false);
      alert("Error Swapping Tokens");
    }
  }, [swapTokensTx.status]);

  useEffect(() => {
    if (onSwapTokensError) {
      setIsTokenSwapLoading(false);
    }
  }, [onSwapTokensError]);

  useEffect(() => {
    if (removeLiquidityTx.status === "success" || removeAllLiquidityTx.status === "success") {
      setRemoveLiquidityLoading(false);
      refetchToken0Reserve();
      refetchToken1Reserve();
    } else if (removeLiquidityTx.status === "error" || removeAllLiquidityTx.status === "error") {
      setRemoveLiquidityLoading(false);
      alert("Error Removing Liquidity");
    }
  }, [removeLiquidityTx.status, removeAllLiquidityTx.status]);

  useEffect(() => {
    if (onRemoveLiquidityWriteError || onRemoveAllLiquidityWriteError) {
      setRemoveLiquidityLoading(false);
    }
  }, [onRemoveLiquidityWriteError, onRemoveAllLiquidityWriteError]);

  useEffect(() => {
    if (addLiquidityTx.status === "success") {
      setAddLiquidityLoading(false);
      refetchToken0Reserve();
      refetchToken1Reserve();
    } else if (addLiquidityTx.status === "error") {
      setAddLiquidityLoading(false);
      alert("Error Adding Liquidity");
    }
  }, [addLiquidityTx.status]);

  useEffect(() => {
    if (onAddLiquidityWriteError) {
      setAddLiquidityLoading(false);
    }
  }, [onAddLiquidityWriteError]);

  const swap = (tokenIn: string, amountIn: string) => {
    setIsTokenSwapLoading(true);
    swapTokens({ args: [tokenIn, ethers.parseUnits(amountIn)] });
  };

  const approve = async (tokenAddress: string, amount: string, approveFor: ApproveForTypes) => {
    // TODO Make state setting simpler
    if (approveFor === "swap") setIsTokenApproveForSwapLoading(true);
    if (approveFor === "l0") setIsTokenApproveForL0Loading(true);
    if (approveFor === "l1") setIsTokenApproveForL1Loading(true);
    try {
      await writeContractAndWait({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [SWAPEX_ADDRESS, ethers.parseUnits(amount)],
      });
    } catch (error: any) {
      console.log(error);
    } finally {
      if (approveFor === "swap") setIsTokenApproveForSwapLoading(false);
      if (approveFor === "l0") setIsTokenApproveForL0Loading(false);
      if (approveFor === "l1") setIsTokenApproveForL1Loading(false);
    }
  };

  const removeLiquidity = (shares: string) => {
    setRemoveLiquidityLoading(true);
    removeLiquidityWrite({ args: [ethers.parseUnits(String(shares))] });
  };

  const removeAllLiquidity = () => {
    setRemoveLiquidityLoading(true);
    removeAllLiquidityWrite();
  };

  const addLiquidity = (token0Amount: string, token1Amount: string) => {
    setAddLiquidityLoading(true);
    addLiquidityWrite({ args: [ethers.parseUnits(token0Amount), ethers.parseUnits(token1Amount)] });
  };

  const fetchBalances = () => {
    fetchBalanceOfToken0();
    fetchBalanceOfToken1();
  };

  const fetchSecondTokenAmountForRatio = (tokenOne: string, tokenOneIn: string) => {
    setTokenOneInForLiqudiity(tokenOne);
    setTokenOneInAmountForLiqudiity(tokenOneIn);
  };

  const fetchTokenOutputForSwap = (tokenIn: string, tokenInAmount: string) => {
    setTokenInForSwap(tokenIn);
    setTokenInAmountForSwap(tokenInAmount);
  };

  const value = {
    token0Address: token0Address as string,
    token1Address: token1Address as string,
    token0Reserve: bigNumberToString(token0Reserve as BigNumberish),
    token1Reserve: bigNumberToString(token1Reserve as BigNumberish),
    token0Symbol: token0Symbol as string,
    token1Symbol: token1Symbol as string,
    lpTokenAmount: bigNumberToString(lpTokenAmount as BigNumberish),
    swap,
    approve,
    addLiquidity,
    removeLiquidity,
    balanceOfToken0: bigNumberToString(balanceOfToken0 as BigNumberish),
    balanceOfToken1: bigNumberToString(balanceOfToken1 as BigNumberish),
    fetchBalances,
    removeAllLiquidity,
    secondTokenAmountForRatio,
    fetchSecondTokenAmountForRatio,
    fetchTokenOutputForSwap,
    tokenOutputForSwap: bigNumberToString(tokenOutputForSwap as BigNumberish),
    resetSecondTokenAmountForRatio: () => setSecondTokenAmountForRatio("0"),
    isTokenApproveForSwapLoading,
    isTokenSwapLoading,
    removeLiquidityLoading,
    addLiquidityLoading,
    isTokenApproveForL0Loading,
    isTokenApproveForL1Loading,
  };

  return <SwapExContext.Provider value={value}>{children}</SwapExContext.Provider>;
};
