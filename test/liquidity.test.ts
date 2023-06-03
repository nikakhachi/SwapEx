import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { CELESTIA_AMOUNT_PER_WITHDRAW, deploySwapExFixture, INITIAL_CELESTIA_SUPPLY, INITIAL_LUMINA_SUPPLY } from ".";
import { BigNumber } from "ethers";

const sqrt = (value: BigNumber) => {
  const ONE = ethers.BigNumber.from(1);
  const TWO = ethers.BigNumber.from(2);
  let z = value.add(ONE).div(TWO);
  let y = value;
  while (z.sub(y).isNegative()) {
    y = z;
    z = value.div(z).add(z).div(TWO);
  }
  return y;
};

describe("Liquidity", async function () {
  it("Should emit LiquidityAdded() and LiquidityRemoved() event", async function () {
    const { celestia, lumina, swapEx, owner } = await loadFixture(deploySwapExFixture);

    const CELESTIA_TO_PROVIDE = ethers.utils.parseUnits("10");
    const LUMINA_TO_PROVIDE = ethers.utils.parseUnits("20");

    await celestia.approve(swapEx.address, CELESTIA_TO_PROVIDE);
    await lumina.approve(swapEx.address, LUMINA_TO_PROVIDE);

    const tx1 = await swapEx.addLiquidity(CELESTIA_TO_PROVIDE, LUMINA_TO_PROVIDE);
    const timestamp1 = (await ethers.provider.getBlock(tx1.blockHash as string)).timestamp;

    await expect(tx1).to.emit(swapEx, "LiquidityAdded").withArgs(owner.address, CELESTIA_TO_PROVIDE, LUMINA_TO_PROVIDE, timestamp1);

    const tx2 = await swapEx.removeAllLiquidity();
    const timestamp2 = (await ethers.provider.getBlock(tx2.blockHash as string)).timestamp;

    await expect(tx2).to.emit(swapEx, "LiquidityRemoved").withArgs(owner.address, CELESTIA_TO_PROVIDE, LUMINA_TO_PROVIDE, timestamp2);
  });
  it("Add Initial Liquidity", async function () {
    const { celestia, lumina, swapEx, owner } = await loadFixture(deploySwapExFixture);

    const CELESTIA_TO_PROVIDE = ethers.utils.parseUnits("5502");
    const LUMINA_TO_PROVIDE = ethers.utils.parseUnits("6681");

    await celestia.approve(swapEx.address, CELESTIA_TO_PROVIDE);
    await lumina.approve(swapEx.address, LUMINA_TO_PROVIDE);

    await swapEx.addLiquidity(CELESTIA_TO_PROVIDE, LUMINA_TO_PROVIDE);

    expect(await swapEx.reserve0()).to.eq(CELESTIA_TO_PROVIDE);
    expect(await swapEx.reserve1()).to.eq(LUMINA_TO_PROVIDE);

    expect(await swapEx.balanceOf(owner.address)).to.eq(sqrt(CELESTIA_TO_PROVIDE.mul(LUMINA_TO_PROVIDE))); // Formula for all shares = sqrt(reserve0 * reserve1)
  });
  it("Add Liquidity (On Existing)", async function () {
    const { celestia, lumina, swapEx, owner, otherAccount, luminaFaucet, celestiaFaucet } = await loadFixture(deploySwapExFixture);

    const INITIAL_CELESTIA_TO_PROVIDE = ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY));
    const INITIAL_LUMINA_TO_PROVIDE = ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY));

    await celestia.approve(swapEx.address, INITIAL_CELESTIA_TO_PROVIDE);
    await lumina.approve(swapEx.address, INITIAL_LUMINA_TO_PROVIDE);

    await swapEx.addLiquidity(INITIAL_CELESTIA_TO_PROVIDE, INITIAL_LUMINA_TO_PROVIDE);

    await luminaFaucet.connect(otherAccount).withdraw();
    await celestiaFaucet.connect(otherAccount).withdraw();

    const CELESTIA_TO_PROVIDE = ethers.utils.parseUnits(String(CELESTIA_AMOUNT_PER_WITHDRAW / 2));
    const LUMINA_TO_PROVIDE = await swapEx.secondTokenLiquidityAmount(celestia.address, CELESTIA_TO_PROVIDE);

    await celestia.connect(otherAccount).approve(swapEx.address, CELESTIA_TO_PROVIDE);
    await lumina.connect(otherAccount).approve(swapEx.address, LUMINA_TO_PROVIDE);

    const reserve0BeforeAddingLiquidity = await swapEx.reserve0();
    const reserve1BeforeAddingLiquidity = await swapEx.reserve1();
    const totalSharesBeforeAddingLiquidity = await swapEx.totalSupply();

    await swapEx.connect(otherAccount).addLiquidity(CELESTIA_TO_PROVIDE, LUMINA_TO_PROVIDE);

    const shares = await swapEx.balanceOf(otherAccount.address);

    // shares = (_amount0 * totalSupply()) / reserve0
    // or _amount1 and reserve1
    expect(shares.toString()).to.be.oneOf([
      CELESTIA_TO_PROVIDE.mul(totalSharesBeforeAddingLiquidity).div(reserve0BeforeAddingLiquidity).toString(),
      LUMINA_TO_PROVIDE.mul(totalSharesBeforeAddingLiquidity).div(reserve1BeforeAddingLiquidity).toString(),
    ]);
    expect(await swapEx.reserve0()).to.eq(CELESTIA_TO_PROVIDE.add(INITIAL_CELESTIA_TO_PROVIDE));
    expect(await swapEx.reserve1()).to.eq(LUMINA_TO_PROVIDE.add(INITIAL_LUMINA_TO_PROVIDE));
  });
  it("Remove All Initial Liquidity Without Swaps", async function () {
    const { celestia, lumina, swapEx, owner } = await loadFixture(deploySwapExFixture);

    const INITIAL_CELESTIA_TO_PROVIDE = ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY));
    const INITIAL_LUMINA_TO_PROVIDE = ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY));

    await celestia.approve(swapEx.address, INITIAL_CELESTIA_TO_PROVIDE);
    await lumina.approve(swapEx.address, INITIAL_LUMINA_TO_PROVIDE);

    await swapEx.addLiquidity(INITIAL_CELESTIA_TO_PROVIDE, INITIAL_LUMINA_TO_PROVIDE);
    await swapEx.removeAllLiquidity();

    expect(await swapEx.reserve0()).to.eq(0);
    expect(await swapEx.reserve1()).to.eq(0);
    expect(Number(ethers.utils.formatUnits(await swapEx.balanceOf(owner.address)))).to.eq(0);
    expect(await celestia.balanceOf(owner.address)).to.eq(INITIAL_CELESTIA_TO_PROVIDE);
    expect(await lumina.balanceOf(owner.address)).to.eq(INITIAL_LUMINA_TO_PROVIDE);
  });
  it("Remove Part Of Liquidity Without Swaps", async function () {
    const { celestia, lumina, swapEx, owner } = await loadFixture(deploySwapExFixture);

    // Divided by 5 to avoid odd number for shares, because here we are testing
    // removing 50% of the shares and we want shares to be correctly dividable by 2
    const INITIAL_CELESTIA_TO_PROVIDE = ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY / 5));
    const INITIAL_LUMINA_TO_PROVIDE = ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY / 5));

    await celestia.approve(swapEx.address, INITIAL_CELESTIA_TO_PROVIDE);
    await lumina.approve(swapEx.address, INITIAL_LUMINA_TO_PROVIDE);

    await swapEx.addLiquidity(INITIAL_CELESTIA_TO_PROVIDE, INITIAL_LUMINA_TO_PROVIDE);

    const celestiaBalanceBeforeRemovingLiquidity = await celestia.balanceOf(owner.address);
    const luminaBalanceBeforeRemovingLiquidity = await lumina.balanceOf(owner.address);

    const shares = await swapEx.balanceOf(owner.address);

    const N_SHARES_DIV_BY = 2;

    await swapEx.removeLiquidity(shares.div(N_SHARES_DIV_BY));

    const celestiaBalanceAfterRemovingLiquidity = await celestia.balanceOf(owner.address);
    const luminaBalanceAfterRemovingLiquidity = await lumina.balanceOf(owner.address);

    expect(await swapEx.reserve0()).to.eq(INITIAL_CELESTIA_TO_PROVIDE.div(N_SHARES_DIV_BY));
    expect(await swapEx.reserve1()).to.eq(INITIAL_LUMINA_TO_PROVIDE.div(N_SHARES_DIV_BY));
    expect(await swapEx.balanceOf(owner.address)).to.eq(shares.div(N_SHARES_DIV_BY));
    expect(celestiaBalanceAfterRemovingLiquidity.sub(celestiaBalanceBeforeRemovingLiquidity)).to.eq(
      INITIAL_CELESTIA_TO_PROVIDE.div(N_SHARES_DIV_BY)
    );
    expect(luminaBalanceAfterRemovingLiquidity.sub(luminaBalanceBeforeRemovingLiquidity)).to.eq(
      INITIAL_LUMINA_TO_PROVIDE.div(N_SHARES_DIV_BY)
    );
  });
  it("Remove All Initial Liquidity With Swaps", async function () {
    const { celestia, lumina, swapEx, owner, otherAccount, celestiaFaucet } = await loadFixture(deploySwapExFixture);

    const INITIAL_CELESTIA_TO_PROVIDE = ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY));
    const INITIAL_LUMINA_TO_PROVIDE = ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY));

    await celestia.approve(swapEx.address, INITIAL_CELESTIA_TO_PROVIDE);
    await lumina.approve(swapEx.address, INITIAL_LUMINA_TO_PROVIDE);

    await swapEx.addLiquidity(INITIAL_CELESTIA_TO_PROVIDE, INITIAL_LUMINA_TO_PROVIDE);

    await celestiaFaucet.connect(otherAccount).withdraw();
    await celestia.connect(otherAccount).approve(swapEx.address, ethers.utils.parseEther(String(CELESTIA_AMOUNT_PER_WITHDRAW)));
    await swapEx.connect(otherAccount).swap(celestia.address, ethers.utils.parseEther(String(CELESTIA_AMOUNT_PER_WITHDRAW)));

    const reserve0BeforeRemovingLiquidity = await swapEx.reserve0();
    const reserve1BeforeRemovingLiquidity = await swapEx.reserve1();

    expect(reserve0BeforeRemovingLiquidity).greaterThan(INITIAL_CELESTIA_TO_PROVIDE);
    expect(reserve1BeforeRemovingLiquidity).lessThan(INITIAL_LUMINA_TO_PROVIDE);

    await swapEx.removeAllLiquidity();

    expect(await swapEx.reserve0()).to.eq(0);
    expect(await swapEx.reserve1()).to.eq(0);
    expect(Number(ethers.utils.formatUnits(await swapEx.balanceOf(owner.address)))).to.eq(0);
    expect(await celestia.balanceOf(owner.address)).to.eq(reserve0BeforeRemovingLiquidity);
    expect(await lumina.balanceOf(owner.address)).to.eq(reserve1BeforeRemovingLiquidity);
  });
  it("Remove Part Of Liquidity With Swaps", async function () {
    const { celestia, lumina, swapEx, owner, otherAccount, celestiaFaucet } = await loadFixture(deploySwapExFixture);

    // Divided by 5 to avoid odd number for shares, because here we are testing
    // removing 50% of the shares and we want shares to be correctly dividable by 2
    const INITIAL_CELESTIA_TO_PROVIDE = ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY / 5));
    const INITIAL_LUMINA_TO_PROVIDE = ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY / 5));

    await celestia.approve(swapEx.address, INITIAL_CELESTIA_TO_PROVIDE);
    await lumina.approve(swapEx.address, INITIAL_LUMINA_TO_PROVIDE);

    await swapEx.addLiquidity(INITIAL_CELESTIA_TO_PROVIDE, INITIAL_LUMINA_TO_PROVIDE);

    await celestiaFaucet.connect(otherAccount).withdraw();
    await celestia.connect(otherAccount).approve(swapEx.address, ethers.utils.parseEther(String(CELESTIA_AMOUNT_PER_WITHDRAW)));
    // Divided by 6 to avoid odd numbers in reserve0 and reserve1 after the swap is done,
    // Because when removing only 50% of the shares, we want to test if the tokens are
    // Transfered correctly to the LP. So if the even one reserve is odd,
    // Dividing them by 2 (because we are withdrawing 50% of shares) will have incorrect result,
    // because there are no decimals in Solidity. 6 is a randomly chosen.
    await swapEx.connect(otherAccount).swap(celestia.address, ethers.utils.parseEther(String(CELESTIA_AMOUNT_PER_WITHDRAW / 6)));

    const reserve0BeforeRemovingLiquidity = await swapEx.reserve0();
    const reserve1BeforeRemovingLiquidity = await swapEx.reserve1();

    expect(reserve0BeforeRemovingLiquidity).greaterThan(INITIAL_CELESTIA_TO_PROVIDE);
    expect(reserve1BeforeRemovingLiquidity).lessThan(INITIAL_LUMINA_TO_PROVIDE);

    const shares = await swapEx.balanceOf(owner.address);

    const N_SHARES_DIV_BY = 2;

    const celestiaBalanceBeforeRemovingLiquidity = await celestia.balanceOf(owner.address);
    const luminaBalanceBeforeRemovingLiquidity = await lumina.balanceOf(owner.address);

    await swapEx.removeLiquidity(shares.div(N_SHARES_DIV_BY));

    const celestiaBalanceAfterRemovingLiquidity = await celestia.balanceOf(owner.address);
    const luminaBalanceAfterRemovingLiquidity = await lumina.balanceOf(owner.address);

    expect(await swapEx.reserve0()).to.eq(reserve0BeforeRemovingLiquidity.div(N_SHARES_DIV_BY));
    expect(await swapEx.reserve1()).to.eq(reserve1BeforeRemovingLiquidity.div(N_SHARES_DIV_BY));
    expect(await swapEx.balanceOf(owner.address)).to.eq(shares.div(N_SHARES_DIV_BY));

    expect(celestiaBalanceAfterRemovingLiquidity.sub(celestiaBalanceBeforeRemovingLiquidity)).to.eq(
      reserve0BeforeRemovingLiquidity.div(N_SHARES_DIV_BY)
    );
    expect(luminaBalanceAfterRemovingLiquidity.sub(luminaBalanceBeforeRemovingLiquidity)).to.eq(
      reserve1BeforeRemovingLiquidity.div(N_SHARES_DIV_BY)
    );
  });
});
