import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { DEFAULT_STAKING_DURATION, TOTAL_STAKING_REWARDS, deployStakerFixture } from ".";

describe("Staker", async function () {
  it("Should emit Stake() and Withdraw() event", async function () {
    const DURATION = 2;
    const { staker, celestia, user1 } = await loadFixture(deployStakerFixture);
    await celestia.transfer(staker.address, ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)));
    await staker.setRewards(ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)), DURATION);

    const STAKE_AMOUNT = ethers.utils.parseEther("1");

    const tx1 = await staker.connect(user1).stake({ value: STAKE_AMOUNT });
    const timestamp1 = (await ethers.provider.getBlock(tx1.blockHash as string)).timestamp;

    const tx2 = await staker.connect(user1).withdraw();
    const timestamp2 = (await ethers.provider.getBlock(tx2.blockHash as string)).timestamp;

    await expect(tx1).to.emit(staker, "Stake").withArgs(user1.address, STAKE_AMOUNT, timestamp1);
    await expect(tx2).to.emit(staker, "Withdraw").withArgs(user1.address, STAKE_AMOUNT, timestamp2);
  });
  it("Should Set Rewards", async function () {
    const { staker, celestia } = await loadFixture(deployStakerFixture);
    await celestia.transfer(staker.address, ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)));
    const tx = await staker.setRewards(ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)), DEFAULT_STAKING_DURATION);

    const blockTimestamp = (await ethers.provider.getBlock(tx.blockHash as string)).timestamp;

    expect(await staker.duration()).to.eq(DEFAULT_STAKING_DURATION);
    expect(await staker.rewardRate()).to.eq(ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)).div(DEFAULT_STAKING_DURATION));
    expect((await staker.lastUpdateTime()).toNumber()).to.eq(blockTimestamp);
    expect((await staker.finishAt()).toNumber()).to.eq(blockTimestamp + DEFAULT_STAKING_DURATION);
  });
  it("Should Not Set Rewards (insufficient funds)", async function () {
    const { staker, celestia } = await loadFixture(deployStakerFixture);
    await celestia.transfer(staker.address, ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS - 1)));
    await expect(staker.setRewards(ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)), DEFAULT_STAKING_DURATION)).reverted;
  });
  it("Should Not Stake with 0 ETH", async function () {
    const { staker, user1 } = await loadFixture(deployStakerFixture);
    await expect(staker.connect(user1).stake()).reverted;
  });
  it("Should Not Stake After Reward Giving is Finished", async function () {
    const { staker, user1, celestia } = await loadFixture(deployStakerFixture);
    const DURATION = 2;
    await celestia.transfer(staker.address, ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)));
    await staker.setRewards(ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)), DURATION);
    await new Promise((res) => setTimeout(res, DURATION * 1000));
    await expect(staker.connect(user1).stake({ value: ethers.utils.parseEther("1") })).reverted;
  });
  it("Should Not Stake if Already Staked", async function () {
    const { staker, user1, celestia } = await loadFixture(deployStakerFixture);
    await celestia.transfer(staker.address, ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)));
    await staker.setRewards(ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)), DEFAULT_STAKING_DURATION);
    await staker.connect(user1).stake({ value: ethers.utils.parseEther("1") });
    await expect(staker.connect(user1).stake({ value: ethers.utils.parseEther("1") })).reverted;
  });
  it("Should Not Withdraw if Staked Amount is 0", async function () {
    const { staker, user1, celestia } = await loadFixture(deployStakerFixture);
    await celestia.transfer(staker.address, ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)));
    await staker.setRewards(ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)), DEFAULT_STAKING_DURATION);
    await expect(staker.connect(user1).withdraw()).reverted;
  });
  it("Should Not Get Rewards if Rewards is 0", async function () {
    const { staker, user1, celestia } = await loadFixture(deployStakerFixture);
    await celestia.transfer(staker.address, ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)));
    await staker.setRewards(ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)), DEFAULT_STAKING_DURATION);
    await expect(staker.connect(user1).getRewards()).reverted;
  });
  it("Staking and Withdrawing (1 staker only)", async function () {
    const DURATION = 2;
    const { staker, celestia, user1 } = await loadFixture(deployStakerFixture);
    await celestia.transfer(staker.address, ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)));
    const tx1 = await staker.setRewards(ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)), DURATION);
    const setRewardsTimestamp = (await ethers.provider.getBlock(tx1.blockHash as string)).timestamp;

    const tx2 = await staker.connect(user1).stake({ value: ethers.utils.parseEther("1") });
    const stakeTimestamp = (await ethers.provider.getBlock(tx2.blockHash as string)).timestamp;
    const stakedDurationInRewardsInterval = setRewardsTimestamp + DURATION - stakeTimestamp;

    await new Promise((res) => setTimeout(res, DURATION * 1000));

    await staker.connect(user1).withdraw();
    await staker.connect(user1).getRewards();

    expect(Number(ethers.utils.formatEther(await celestia.balanceOf(user1.address)))).to.eq(
      (TOTAL_STAKING_REWARDS / DURATION) * stakedDurationInRewardsInterval
    );
  });
  it("Staking and Withdrawing (multiple stakers)", async function () {
    const DURATION = 5;
    const { staker, celestia, user1, user2, user3 } = await loadFixture(deployStakerFixture);
    await celestia.transfer(staker.address, ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)));
    await staker.setRewards(ethers.utils.parseUnits(String(TOTAL_STAKING_REWARDS)), DURATION);

    await staker.connect(user1).stake({ value: ethers.utils.parseEther("1") });
    await staker.connect(user2).stake({ value: ethers.utils.parseEther("10") });
    await staker.connect(user3).stake({ value: ethers.utils.parseEther("10") });

    await new Promise((res) => setTimeout(res, DURATION * 1000));

    await staker.connect(user1).withdraw();
    await staker.connect(user2).withdraw();
    await staker.connect(user3).withdraw();

    await staker.connect(user1).getRewards();
    await staker.connect(user2).getRewards();
    await staker.connect(user3).getRewards();

    const user1Balance = Number(ethers.utils.formatEther(await celestia.balanceOf(user1.address)));
    const user2Balance = Number(ethers.utils.formatEther(await celestia.balanceOf(user2.address)));
    const user3Balance = Number(ethers.utils.formatEther(await celestia.balanceOf(user3.address)));

    expect(user1Balance).greaterThan(user3Balance);
    expect(user2Balance).greaterThan(user1Balance);
    expect(user2Balance).greaterThan(user3Balance);
  });
});
