import { FC, useContext, useState } from "react";
import moment from "moment";
import { StakerContext } from "../contexts/StakerContext";
import { Button } from "./Button";

export const Staker: FC = () => {
  const stakerContext = useContext(StakerContext);

  const [ethToStake, setEthToStake] = useState(0);

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
          <Button text="Get Rewards" className="mb-4" onClick={getRewards} />
        </div>
      )}
      {stakerContext?.stakedBalance ? (
        <>
          <p className="text-xl mb-2">Staked Amount: {stakerContext?.stakedBalance} ETH</p>
          <div>
            <Button text="Withdraw" className="mt-2 mb-4" onClick={withdraw} />
          </div>
        </>
      ) : !isLate ? (
        <>
          <input className="text-2xl rounded-xl px-4" value={ethToStake} onChange={(e) => setEthToStake(Number(e.target.value))} />
          <div>
            <Button text="Stake" className="mt-2 mb-4" onClick={stake} />
          </div>
        </>
      ) : null}
    </>
  );
};
