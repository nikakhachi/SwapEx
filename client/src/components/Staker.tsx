import { FC, useContext, useState } from "react";
import moment from "moment";
import { StakerContext } from "../contexts/StakerContext";
import { Button } from "./Button";
import { CircularProgress } from "@mui/material";
import { STAKER_ADDRESS } from "../contracts/Staker";

export const Staker: FC = () => {
  const stakerContext = useContext(StakerContext);

  const [ethToStake, setEthToStake] = useState("0");

  const isLate = moment(stakerContext?.finishAt).diff(moment()) < 0;

  const stake = () => {
    stakerContext?.stake(ethToStake);
  };

  const withdraw = () => {
    stakerContext?.withdraw();
  };

  const getRewards = () => {
    stakerContext?.getRewards();
  };

  return (
    <>
      <a
        href={`https://goerli.etherscan.io/address/${STAKER_ADDRESS}`}
        className="text-center mb-8 underline"
        target="_blank"
        rel="noreferrer"
      >
        ETHERSCAN
      </a>
      <p className="text-2xl">
        Total Rewards To Give - {stakerContext?.totalRewardsToGive} {stakerContext?.rewardsTokenSymbol}
      </p>
      <p className="text-2xl">
        {isLate ? "Ended" : "Ends"} At - {moment(stakerContext?.finishAt).format("DD/MM/YYYY, h:mm:ss a")}
      </p>
      <p className="mt-2 text-xl underline">Stake Ethereum in order to get rewards</p>
      <p className="mb-4 text-lg">Total Staked: {stakerContext?.totalStaked} ETH</p>
      <p className="text-xl mb-2">
        Rewards Earned: {stakerContext?.userRewards} {stakerContext?.rewardsTokenSymbol}
      </p>
      {stakerContext?.userRewards !== 0 && (
        <div>
          <Button
            disabled={stakerContext?.isGetRewardsLoading}
            className="mb-4 w-44"
            onClick={getRewards}
            text={stakerContext?.isGetRewardsLoading ? <CircularProgress color="inherit" size="1rem" /> : "Get Rewards"}
          />
        </div>
      )}
      {stakerContext?.stakedBalance ? (
        <>
          <p className="text-xl mb-2">Staked Amount: {stakerContext?.stakedBalance} ETH</p>
          <div>
            <Button
              disabled={stakerContext?.isWithdrawLoading}
              className="mt-2 mb-4 w-40"
              onClick={withdraw}
              text={stakerContext?.isWithdrawLoading ? <CircularProgress color="inherit" size="1rem" /> : "Withdraw"}
            />
          </div>
        </>
      ) : !isLate ? (
        <>
          <input className="text-2xl rounded-xl px-4" value={ethToStake} onChange={(e) => setEthToStake(e.target.value)} type="number" />
          <div>
            <Button
              disabled={stakerContext?.isStakeLoading}
              className="mt-2 mb-4 w-40"
              onClick={stake}
              text={stakerContext?.isStakeLoading ? <CircularProgress color="inherit" size="1rem" /> : "Stake"}
            />
          </div>
        </>
      ) : null}
    </>
  );
};
