import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock", function () {
  const INITIAL_CELESTIA_SUPPLY = 1000;
  const INITIAL_LUMINA_SUPPLY = 5000;

  async function deployOneYearLockFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Celestia = await ethers.getContractFactory("Celestia");
    const celestia = await Celestia.deploy(ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)));

    const Lumina = await ethers.getContractFactory("Lumina");
    const lumina = await Lumina.deploy(ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY)));

    const SwapEx = await ethers.getContractFactory("SwapEx");
    const swapEx = await SwapEx.deploy(celestia.address, lumina.address);

    return { celestia, lumina, swapEx, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should work", async function () {
      await loadFixture(deployOneYearLockFixture);
    });
    it("Should set right token addresses", async function () {
      const { celestia, lumina, swapEx } = await loadFixture(deployOneYearLockFixture);

      expect(await swapEx.token0()).to.eq(celestia.address);
      expect(await swapEx.token1()).to.eq(lumina.address);
    });
    it("Should set right token reservers", async function () {
      const { swapEx } = await loadFixture(deployOneYearLockFixture);

      expect(await swapEx.reserve0()).to.eq(0);
      expect(await swapEx.reserve1()).to.eq(0);
    });
  });

  describe("Liquidity", async function () {
    it("Add Liquidity", async function () {
      const { celestia, lumina, swapEx, owner } = await loadFixture(deployOneYearLockFixture);

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
    it("Remove Liquidity", async function () {
      const { celestia, lumina, swapEx, owner } = await loadFixture(deployOneYearLockFixture);

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
  });
});
