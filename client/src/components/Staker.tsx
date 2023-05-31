import { FC, useContext, useState } from "react";
import { SwapExContext } from "../contexts/SwapExContext";
import moment from "moment";
import { StakerContext } from "../contexts/StakerContext";

export const Staker: FC = () => {
  const swapExContext = useContext(SwapExContext);
  const stakerContext = useContext(StakerContext);

  const [ethToStake, setEthToStake] = useState(0);

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
    <div style={{ border: "1px solid white", padding: "0.5rem 2rem", marginTop: "2rem" }}>
      <h4>Staker</h4>
      <p>Total Rewards Given Out {stakerContext?.totalRewardsToGive}</p>
      <p>Ends At {moment(stakerContext?.finishAt).format("DD/MM/YYYY, h:mm:ss a")}</p>
      <p>Stake Ethereum in order to get {swapExContext?.token0Symbol} rewards</p>
      <p>Rewards Earned: {stakerContext?.userRewards}</p>{" "}
      {stakerContext?.userRewards !== 0 && (
        <div>
          <button onClick={getRewards}>Get Rewards</button>
        </div>
      )}
      {!stakerContext?.stakedBalance ? (
        <>
          <input value={ethToStake} onChange={(e) => setEthToStake(Number(e.target.value))} />
          <div>
            <button onClick={stake}>Stake</button>
          </div>
        </>
      ) : (
        <>
          <p>Staked Amount: {stakerContext?.stakedBalance}</p>
          <div>
            <button onClick={withdraw}>Withdraw</button>
          </div>
        </>
      )}
    </div>
  );
};
