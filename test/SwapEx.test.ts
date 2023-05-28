import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock", function () {
  const INITIAL_CELESTIA_SUPPLY = 10010;
  const INITIAL_LUMINA_SUPPLY = 50050;
  const FREE_CELESTIA_FUNDS = 10;
  const FREE_LUMINA_FUNDS = 50;
  const INITIAL_CELESTIA_LIQUIDITY = INITIAL_CELESTIA_SUPPLY - FREE_CELESTIA_FUNDS;
  const INITIAL_LUMINA_LIQUIDITY = INITIAL_LUMINA_SUPPLY - FREE_LUMINA_FUNDS;

  async function deployOneYearLockFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Celestia = await ethers.getContractFactory("Celestia");
    const celestia = await Celestia.deploy(ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY)));

    const Lumina = await ethers.getContractFactory("Lumina");
    const lumina = await Lumina.deploy(ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY)));

    const SwapEx = await ethers.getContractFactory("SwapEx");
    const swapEx = await SwapEx.deploy(celestia.address, lumina.address);

    await celestia.transfer(otherAccount.address, ethers.utils.parseUnits(String(FREE_CELESTIA_FUNDS)));
    await lumina.transfer(otherAccount.address, ethers.utils.parseUnits(String(FREE_LUMINA_FUNDS)));

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

      await celestia.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_CELESTIA_LIQUIDITY)));
      await lumina.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_LUMINA_LIQUIDITY)));

      await swapEx.addLiquidity(
        ethers.utils.parseUnits(String(INITIAL_CELESTIA_LIQUIDITY)),
        ethers.utils.parseUnits(String(INITIAL_LUMINA_LIQUIDITY))
      );

      expect(await swapEx.reserve0()).to.eq(ethers.utils.parseUnits(String(INITIAL_CELESTIA_LIQUIDITY)));
      expect(await swapEx.reserve1()).to.eq(ethers.utils.parseUnits(String(INITIAL_LUMINA_LIQUIDITY)));

      expect(Number(ethers.utils.formatUnits(await swapEx.balanceOf(owner.address)))).to.eq(
        Math.sqrt(INITIAL_CELESTIA_LIQUIDITY * INITIAL_LUMINA_LIQUIDITY)
      );
    });
    it("Remove Liquidity", async function () {
      const { celestia, lumina, swapEx, owner } = await loadFixture(deployOneYearLockFixture);

      await celestia.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_CELESTIA_LIQUIDITY)));
      await lumina.approve(swapEx.address, ethers.utils.parseUnits(String(INITIAL_LUMINA_LIQUIDITY)));

      await swapEx.addLiquidity(
        ethers.utils.parseUnits(String(INITIAL_CELESTIA_LIQUIDITY)),
        ethers.utils.parseUnits(String(INITIAL_LUMINA_LIQUIDITY))
      );

      await swapEx.removeLiquidity(await swapEx.balanceOf(owner.address));

      expect(await swapEx.reserve0()).to.eq(0);
      expect(await swapEx.reserve1()).to.eq(0);

      expect(Number(ethers.utils.formatUnits(await swapEx.balanceOf(owner.address)))).to.eq(0);
    });
  });
});
