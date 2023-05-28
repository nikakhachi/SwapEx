import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deploySwapExFixture, CELESTIA_AMOUNT_PER_WITHDRAW, LUMINA_AMOUNT_PER_WITHDRAW, FAUCET_COOLDOWN } from ".";

describe("Faucet", async function () {
  it("Should Withdraw", async function () {
    const { celestiaFaucet, luminaFaucet, celestia, lumina, otherAccount } = await loadFixture(deploySwapExFixture);

    await celestiaFaucet.connect(otherAccount).withdraw();
    await luminaFaucet.connect(otherAccount).withdraw();

    expect(Number(ethers.utils.formatUnits(await celestia.balanceOf(otherAccount.address)))).to.eq(CELESTIA_AMOUNT_PER_WITHDRAW);
    expect(Number(ethers.utils.formatUnits(await lumina.balanceOf(otherAccount.address)))).to.eq(LUMINA_AMOUNT_PER_WITHDRAW);
  });
  it("Should have cooldown", async function () {
    const { celestiaFaucet, luminaFaucet, otherAccount } = await loadFixture(deploySwapExFixture);

    await celestiaFaucet.connect(otherAccount).withdraw();
    await luminaFaucet.connect(otherAccount).withdraw();

    await expect(celestiaFaucet.connect(otherAccount).withdraw()).to.revertedWithCustomError(celestiaFaucet, "TooManyRequests");
    await expect(luminaFaucet.connect(otherAccount).withdraw()).to.revertedWithCustomError(luminaFaucet, "TooManyRequests");
  });
  it("Should withdraw after cooldown", async function () {
    const { celestiaFaucet, luminaFaucet, celestia, lumina, otherAccount } = await loadFixture(deploySwapExFixture);

    await celestiaFaucet.connect(otherAccount).withdraw();
    await luminaFaucet.connect(otherAccount).withdraw();

    await new Promise((res) => setTimeout(res, FAUCET_COOLDOWN * 1000));

    await celestiaFaucet.connect(otherAccount).withdraw();
    await luminaFaucet.connect(otherAccount).withdraw();

    expect(Number(ethers.utils.formatUnits(await celestia.balanceOf(otherAccount.address)))).to.eq(CELESTIA_AMOUNT_PER_WITHDRAW * 2);
    expect(Number(ethers.utils.formatUnits(await lumina.balanceOf(otherAccount.address)))).to.eq(LUMINA_AMOUNT_PER_WITHDRAW * 2);
  });
});
