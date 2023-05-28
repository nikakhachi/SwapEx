import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deploySwapExFixture,
  CELESTIA_FAUCET_AMOUNT,
  LUMINA_FAUCET_AMOUNT,
  CELESTIA_AMOUNT_PER_WITHDRAW,
  LUMINA_AMOUNT_PER_WITHDRAW,
  FAUCET_COOLDOWN,
} from ".";

describe("Deployment", function () {
  it("Should work", async function () {
    await loadFixture(deploySwapExFixture);
  });
  it("Should set right token addresses", async function () {
    const { celestia, lumina, swapEx } = await loadFixture(deploySwapExFixture);

    expect(await swapEx.token0()).to.eq(celestia.address);
    expect(await swapEx.token1()).to.eq(lumina.address);
  });
  it("Should set right token reservers", async function () {
    const { swapEx } = await loadFixture(deploySwapExFixture);

    expect(await swapEx.reserve0()).to.eq(0);
    expect(await swapEx.reserve1()).to.eq(0);
  });
  describe("Faucets", async function () {
    it("Should set balances", async function () {
      const { celestiaFaucet, luminaFaucet, celestia, lumina } = await loadFixture(deploySwapExFixture);

      expect(Number(ethers.utils.formatUnits(await celestia.balanceOf(celestiaFaucet.address)))).to.eq(CELESTIA_FAUCET_AMOUNT);
      expect(Number(ethers.utils.formatUnits(await lumina.balanceOf(luminaFaucet.address)))).to.eq(LUMINA_FAUCET_AMOUNT);
    });
    it("Should set withdrawable amounts", async function () {
      const { celestiaFaucet, luminaFaucet } = await loadFixture(deploySwapExFixture);

      expect(Number(ethers.utils.formatUnits(await celestiaFaucet.withdrawableAmount()))).to.eq(CELESTIA_AMOUNT_PER_WITHDRAW);
      expect(Number(ethers.utils.formatUnits(await luminaFaucet.withdrawableAmount()))).to.eq(LUMINA_AMOUNT_PER_WITHDRAW);
    });
    it("Should set cooldowns", async function () {
      const { celestiaFaucet, luminaFaucet } = await loadFixture(deploySwapExFixture);
      expect(await celestiaFaucet.cooldown()).to.eq(FAUCET_COOLDOWN);
      expect(await luminaFaucet.cooldown()).to.eq(FAUCET_COOLDOWN);
    });
  });
});
