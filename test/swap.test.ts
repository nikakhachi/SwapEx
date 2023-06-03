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
import { Faucet, SwapEx, Token } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Swap", async function () {
  let celestia: Token;
  let lumina: Token;
  let swapEx: SwapEx;
  let celestiaFaucet: Faucet;
  let luminaFaucet: Faucet;
  let otherAccount: SignerWithAddress;

  beforeEach(async () => {
    ({ celestia, lumina, swapEx, celestiaFaucet, luminaFaucet, otherAccount } = await loadFixture(deploySwapExFixture));

    await celestia.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)));
    await lumina.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY)));

    await swapEx.addLiquidity(
      ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)),
      ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY))
    );
  });
  it("Should swap correct amount of Celestia -> Lumina", async function () {
    const reserveIn = await swapEx.reserve0();
    const reserveOut = await swapEx.reserve1();
    const amountIn = ethers.utils.parseUnits(String(CELESTIA_AMOUNT_PER_WITHDRAW));

    await celestiaFaucet.connect(otherAccount).withdraw();
    await celestia.connect(otherAccount).approve(swapEx.address, amountIn);

    const expectedPriceFromContract = await swapEx.calculateAmountOut(celestia.address, amountIn);

    const tx = await swapEx.connect(otherAccount).swap(celestia.address, amountIn);
    const timestamp = (await ethers.provider.getBlock(tx.blockHash as string)).timestamp;

    const amountInWithFees = amountIn.mul(995).div(1000); // 0.5% fees
    // y△ = (y * x△) / (x + x△)
    const expectedPrice = reserveOut.mul(amountInWithFees).div(reserveIn.add(amountInWithFees));

    await expect(tx)
      .to.emit(swapEx, "Swap")
      .withArgs(otherAccount.address, celestia.address, lumina.address, amountIn, expectedPrice, timestamp);

    expect(expectedPrice).to.eq(expectedPriceFromContract);
    expect(await lumina.balanceOf(otherAccount.address)).to.eq(expectedPrice);
    expect(await celestia.balanceOf(otherAccount.address)).to.eq(0);
  });
  it("Should swap correct amount of Lumina -> Celestia", async function () {
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
  it("Should Emit Swap() Event", async function () {
    const amountIn = ethers.utils.parseUnits(String(LUMINA_AMOUNT_PER_WITHDRAW));

    await luminaFaucet.connect(otherAccount).withdraw();
    await lumina.connect(otherAccount).approve(swapEx.address, amountIn);

    const expectedPriceFromContract = await swapEx.calculateAmountOut(lumina.address, amountIn);

    const tx = await swapEx.connect(otherAccount).swap(lumina.address, amountIn);
    const timestamp = (await ethers.provider.getBlock(tx.blockHash as string)).timestamp;

    await expect(tx)
      .to.emit(swapEx, "Swap")
      .withArgs(otherAccount.address, lumina.address, celestia.address, amountIn, expectedPriceFromContract, timestamp);
  });
});
