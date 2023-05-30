import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const TOTAL_REWARDS = 1000;
const DEFAULT_DURATION = 10;

const deployStakerFixture = async () => {
  const [owner, user1, user2, user3] = await ethers.getSigners();

  const Celestia = await ethers.getContractFactory("Token");
  const celestia = await Celestia.deploy("Celestia", "CEL", ethers.utils.parseUnits(String(TOTAL_REWARDS)));

  const Staker = await ethers.getContractFactory("Staker");
  const staker = await Staker.deploy(celestia.address);

  return { staker, celestia, owner, user1, user2, user3 };
};

describe("Staker", async function () {
  it("Should Set Rewards", async function () {
    const { staker, celestia } = await loadFixture(deployStakerFixture);
    await celestia.transfer(staker.address, ethers.utils.parseUnits(String(TOTAL_REWARDS)));
    const tx = await staker.setRewards(ethers.utils.parseUnits(String(TOTAL_REWARDS)), DEFAULT_DURATION);

    const blockTimestamp = (await ethers.provider.getBlock(tx.blockHash as string)).timestamp;

    expect(await staker.duration()).to.eq(DEFAULT_DURATION);
    expect(await staker.rewardRate()).to.eq(ethers.utils.parseUnits(String(TOTAL_REWARDS)).div(DEFAULT_DURATION));
    expect((await staker.lastUpdateTime()).toNumber()).to.eq(blockTimestamp);
    expect((await staker.finishAt()).toNumber()).to.eq(blockTimestamp + DEFAULT_DURATION);
  });
  it("Should Not Set Rewards (insufficient funds)", async function () {
    const { staker, celestia } = await loadFixture(deployStakerFixture);
    await celestia.transfer(staker.address, ethers.utils.parseUnits(String(TOTAL_REWARDS - 1)));
    await expect(staker.setRewards(ethers.utils.parseUnits(String(TOTAL_REWARDS)), DEFAULT_DURATION)).reverted;
  });
  it("Staking and Withdrawing (1 staker only)", async function () {
    const DURATION = 2;
    const { staker, celestia, user1 } = await loadFixture(deployStakerFixture);
    await celestia.transfer(staker.address, ethers.utils.parseUnits(String(TOTAL_REWARDS)));
    const tx1 = await staker.setRewards(ethers.utils.parseUnits(String(TOTAL_REWARDS)), DURATION);
    const setRewardsTimestamp = (await ethers.provider.getBlock(tx1.blockHash as string)).timestamp;

    const tx2 = await staker.connect(user1).stake({ value: ethers.utils.parseEther("1") });
    const stakeTimestamp = (await ethers.provider.getBlock(tx2.blockHash as string)).timestamp;
    const stakedDurationInRewardsInterval = setRewardsTimestamp + DURATION - stakeTimestamp;

    await new Promise((res) => setTimeout(res, DURATION * 1000));

    await staker.connect(user1).withdraw();
    await staker.connect(user1).getRewards();

    expect(Number(ethers.utils.formatEther(await celestia.balanceOf(user1.address)))).to.eq(
      (TOTAL_REWARDS / DURATION) * stakedDurationInRewardsInterval
    );
  });
});
