import { FC, useContext, useState } from "react";
import moment from "moment";
import { StakerContext } from "../contexts/StakerContext";

export const Staker: FC = () => {
  const stakerContext = useContext(StakerContext);

  const [ethToStake, setEthToStake] = useState(0);

  const isLate = moment(stakerContext?.finishAt).diff(moment()) > 0;

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
    <div className="mt-12 flex flex-col" style={{ width: "500px" }}>
      <p className="text-2xl">
        Total Rewards To Give - {stakerContext?.totalRewardsToGive} {stakerContext?.rewardsTokenSymbol}
      </p>
      <p className="text-2xl">
        {isLate ? "Ended" : "Ends"} At - {moment(stakerContext?.finishAt).format("DD/MM/YYYY, h:mm:ss a")}
      </p>
      <p className="mt-2 mb-2 text-xl underline">Stake Ethereum in order to get rewards</p>
      <p className="text-xl mb-2">
        Rewards Earned: {stakerContext?.userRewards} {stakerContext?.rewardsTokenSymbol}
      </p>
      {stakerContext?.userRewards !== 0 && (
        <div>
          <button className="bg-red-400 rounded-xl text-md py-1 px-8 mb-4" onClick={getRewards}>
            Get Rewards
          </button>
        </div>
      )}
      {stakerContext?.stakedBalance ? (
        <>
          <p className="text-xl mb-2">
            Staked Amount: {stakerContext?.stakedBalance} {stakerContext?.rewardsTokenSymbol}
          </p>
          <div>
            <button className="mt-2 bg-red-400 rounded-xl text-md py-1 px-8 mb-4" onClick={withdraw}>
              Withdraw
            </button>
          </div>
        </>
      ) : !isLate ? (
        <>
          <input className="text-2xl rounded-xl px-4" value={ethToStake} onChange={(e) => setEthToStake(Number(e.target.value))} />
          <div>
            <button className="mt-2 bg-red-400 rounded-xl text-md py-1 px-8 mb-4" onClick={stake}>
              Stake
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};
