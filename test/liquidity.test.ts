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

describe("Liquidity", async function () {
  describe("No existing liquidity prior", async function () {
    it("Add Liquidity", async function () {
      const { celestia, lumina, swapEx, owner } = await loadFixture(deploySwapExFixture);

      await celestia.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)));
      await lumina.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY)));

      await swapEx.addLiquidity(
        ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)),
        ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY))
      );

      expect(await swapEx.reserve0()).to.eq(ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)));
      expect(await swapEx.reserve1()).to.eq(ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY)));

      expect(Number(ethers.utils.formatUnits(await swapEx.balanceOf(owner.address)))).to.eq(
        Math.sqrt(INITIAL_CELESTIA_SUPPLY * INITIAL_LUMINA_SUPPLY)
      );
    });
    it("Remove Liquidity Without Swaps", async function () {
      const { celestia, lumina, swapEx, owner } = await loadFixture(deploySwapExFixture);

      await celestia.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)));
      await lumina.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY)));

      await swapEx.addLiquidity(
        ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)),
        ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY))
      );

      await swapEx.removeLiquidity(await swapEx.balanceOf(owner.address));

      expect(await swapEx.reserve0()).to.eq(0);
      expect(await swapEx.reserve1()).to.eq(0);

      expect(Number(ethers.utils.formatUnits(await swapEx.balanceOf(owner.address)))).to.eq(0);
    });
    it("Remove Liquidity With Swaps/Fees", async function () {
      const { celestia, lumina, swapEx, owner, luminaFaucet, otherAccount } = await loadFixture(deploySwapExFixture);

      await celestia.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)));
      await lumina.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY)));

      await swapEx.addLiquidity(
        ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)),
        ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY))
      );

      const luminaToSell = ethers.utils.parseUnits("10");
      await luminaFaucet.connect(otherAccount).withdraw();
      await lumina.connect(otherAccount).approve(swapEx.address, luminaToSell);

      await swapEx.connect(otherAccount).swap(lumina.address, luminaToSell);

      await swapEx.removeLiquidity(await swapEx.balanceOf(owner.address));

      expect(await swapEx.reserve0()).to.eq(0);
      expect(await swapEx.reserve1()).to.eq(0);

      expect(Number(ethers.utils.formatUnits(await swapEx.balanceOf(owner.address)))).to.eq(0);

      const celestiaOfProvider = await celestia.balanceOf(owner.address);
      const luminaOfProvider = await lumina.balanceOf(owner.address);

      expect(Number(ethers.utils.formatUnits(luminaOfProvider))).to.eq(
        INITIAL_LUMINA_SUPPLY + Number(ethers.utils.formatUnits(luminaToSell))
      );
      expect(Number(ethers.utils.formatUnits(celestiaOfProvider))).lessThan(INITIAL_CELESTIA_SUPPLY);
    });
  });
  describe("Existing liquidity prior", async function () {
    it("Add Liquidity", async function () {
      const { celestia, lumina, swapEx, owner, otherAccount, luminaFaucet, celestiaFaucet } = await loadFixture(deploySwapExFixture);

      await celestia.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)));
      await lumina.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY)));

      await swapEx.addLiquidity(
        ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)),
        ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY))
      );

      await luminaFaucet.connect(otherAccount).withdraw();
      await celestiaFaucet.connect(otherAccount).withdraw();

      await celestia.connect(otherAccount).approve(swapEx.address, ethers.utils.parseUnits(String(CELESTIA_AMOUNT_PER_WITHDRAW)));
      await lumina.connect(otherAccount).approve(swapEx.address, ethers.utils.parseUnits(String(LUMINA_AMOUNT_PER_WITHDRAW)));

      await swapEx
        .connect(otherAccount)
        .addLiquidity(
          ethers.utils.parseUnits(String(CELESTIA_AMOUNT_PER_WITHDRAW)),
          ethers.utils.parseUnits(String(LUMINA_AMOUNT_PER_WITHDRAW))
        );

      const reserve0BeforeRemovingLiquidity = await swapEx.reserve0();
      const reserve1BeforeRemovingLiquidity = await swapEx.reserve1();
      const totalShares = await swapEx.totalSupply();

      const shares = await swapEx.balanceOf(otherAccount.address);

      //   shares = Math.min(
      //     (_amount0 * totalSupply()) / reserve0,
      //     (_amount1 * totalSupply()) / reserve1
      // );
      expect(shares.toString()).to.be.oneOf([
        ethers.utils.parseUnits(String(CELESTIA_AMOUNT_PER_WITHDRAW)).mul(totalShares).div(reserve0BeforeRemovingLiquidity).toString(),
        ethers.utils.parseUnits(String(LUMINA_AMOUNT_PER_WITHDRAW)).mul(totalShares).div(reserve1BeforeRemovingLiquidity).toString(),
      ]);
    });
  });
});
