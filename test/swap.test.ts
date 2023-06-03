import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  CELESTIA_AMOUNT_PER_WITHDRAW,
  deploySwapExFixture,
  INITIAL_CELESTIA_SUPPLY,
  INITIAL_LUMINA_SUPPLY,
  LUMINA_AMOUNT_PER_WITHDRAW,
} from ".";

describe("Swap", async function () {
  it("Should swap correct amount of Celestia -> Lumina", async function () {
    const { celestia, lumina, swapEx, otherAccount, celestiaFaucet } = await loadFixture(deploySwapExFixture);

    await celestia.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)));
    await lumina.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY)));

    await swapEx.addLiquidity(
      ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)),
      ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY))
    );

    const reserveIn = await swapEx.reserve0();
    const reserveOut = await swapEx.reserve1();
    const amountIn = ethers.utils.parseUnits(String(CELESTIA_AMOUNT_PER_WITHDRAW));

    await celestiaFaucet.connect(otherAccount).withdraw();
    await celestia.connect(otherAccount).approve(swapEx.address, amountIn);

    const expectedPriceFromContract = await swapEx.calculateAmountOut(celestia.address, amountIn);

    await swapEx.connect(otherAccount).swap(celestia.address, amountIn);

    const amountInWithFees = amountIn.mul(995).div(1000); // 0.5% fees
    // y△ = (y * x△) / (x + x△)
    const expectedPrice = reserveOut.mul(amountInWithFees).div(reserveIn.add(amountInWithFees));

    expect(expectedPrice).to.eq(expectedPriceFromContract);
    expect(await lumina.balanceOf(otherAccount.address)).to.eq(expectedPrice);
    expect(await celestia.balanceOf(otherAccount.address)).to.eq(0);
  });
  it("Should swap correct amount of Lumina -> Celestia", async function () {
    const { celestia, lumina, swapEx, otherAccount, luminaFaucet } = await loadFixture(deploySwapExFixture);

    await celestia.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)));
    await lumina.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY)));

    await swapEx.addLiquidity(
      ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)),
      ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY))
    );

    const reserveIn = await swapEx.reserve1();
    const reserveOut = await swapEx.reserve0();
    const amountIn = ethers.utils.parseUnits(String(LUMINA_AMOUNT_PER_WITHDRAW));

    await luminaFaucet.connect(otherAccount).withdraw();
    await lumina.connect(otherAccount).approve(swapEx.address, amountIn);

    const expectedPriceFromContract = await swapEx.calculateAmountOut(lumina.address, amountIn);

    await swapEx.connect(otherAccount).swap(lumina.address, amountIn);

    const amountInWithFees = amountIn.mul(995).div(1000); // 0.5% fees
    // y△ = (y * x△) / (x + x△)
    const expectedPrice = reserveOut.mul(amountInWithFees).div(reserveIn.add(amountInWithFees));

    expect(expectedPrice).to.eq(expectedPriceFromContract);
    expect(await celestia.balanceOf(otherAccount.address)).to.eq(expectedPrice);
    expect(await lumina.balanceOf(otherAccount.address)).to.eq(0);
  });
});
