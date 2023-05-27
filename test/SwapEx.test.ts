import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock", function () {
  async function deployOneYearLockFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Celestia = await ethers.getContractFactory("Celestia");
    const celestia = await Celestia.deploy(ethers.utils.parseUnits("1000"));

    const Lumina = await ethers.getContractFactory("Lumina");
    const lumina = await Lumina.deploy(ethers.utils.parseUnits("5000"));

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
});
