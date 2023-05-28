import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock", function () {
  const INITIAL_CELESTIA_SUPPLY = 10000;
  const INITIAL_LUMINA_SUPPLY = 50000;

  const CELESTIA_FAUCET_AMOUNT = 100;
  const CELESTIA_AMOUNT_PER_WITHDRAW = 10;
  const LUMINA_FAUCET_AMOUNT = 500;
  const LUMINA_AMOUNT_PER_WITHDRAW = 50;
  const FAUCET_COOLDOWN = 10; // 10 seconds

  async function deployOneYearLockFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Celestia = await ethers.getContractFactory("Celestia");
    const celestia = await Celestia.deploy(ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY + CELESTIA_FAUCET_AMOUNT)));

    const CelestiaFaucet = await ethers.getContractFactory("Faucet");
    const celestiaFaucet = await CelestiaFaucet.deploy(
      celestia.address,
      ethers.utils.parseUnits(String(CELESTIA_AMOUNT_PER_WITHDRAW)),
      FAUCET_COOLDOWN
    );

    await celestia.transfer(celestiaFaucet.address, ethers.utils.parseUnits(String(CELESTIA_FAUCET_AMOUNT)));

    const Lumina = await ethers.getContractFactory("Lumina");
    const lumina = await Lumina.deploy(ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY + LUMINA_FAUCET_AMOUNT)));

    const LuminaFaucet = await ethers.getContractFactory("Faucet");
    const luminaFaucet = await LuminaFaucet.deploy(
      lumina.address,
      ethers.utils.parseUnits(String(LUMINA_AMOUNT_PER_WITHDRAW)),
      FAUCET_COOLDOWN
    );

    await lumina.transfer(luminaFaucet.address, ethers.utils.parseUnits(String(LUMINA_FAUCET_AMOUNT)));

    const SwapEx = await ethers.getContractFactory("SwapEx");
    const swapEx = await SwapEx.deploy(celestia.address, lumina.address);

    return { celestia, lumina, swapEx, owner, otherAccount, celestiaFaucet, luminaFaucet };
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
    describe("Faucets", async function () {
      it("Should set balances", async function () {
        const { celestiaFaucet, luminaFaucet, celestia, lumina } = await loadFixture(deployOneYearLockFixture);

        expect(Number(ethers.utils.formatUnits(await celestia.balanceOf(celestiaFaucet.address)))).to.eq(CELESTIA_FAUCET_AMOUNT);
        expect(Number(ethers.utils.formatUnits(await lumina.balanceOf(luminaFaucet.address)))).to.eq(LUMINA_FAUCET_AMOUNT);
      });
      it("Should set withdrawable amounts", async function () {
        const { celestiaFaucet, luminaFaucet } = await loadFixture(deployOneYearLockFixture);

        expect(Number(ethers.utils.formatUnits(await celestiaFaucet.withdrawableAmount()))).to.eq(CELESTIA_AMOUNT_PER_WITHDRAW);
        expect(Number(ethers.utils.formatUnits(await luminaFaucet.withdrawableAmount()))).to.eq(LUMINA_AMOUNT_PER_WITHDRAW);
      });
      it("Should set cooldowns", async function () {
        const { celestiaFaucet, luminaFaucet } = await loadFixture(deployOneYearLockFixture);
        expect(await celestiaFaucet.cooldown()).to.eq(FAUCET_COOLDOWN);
        expect(await luminaFaucet.cooldown()).to.eq(FAUCET_COOLDOWN);
      });
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
  describe("Faucet", async function () {
    it("Should Withdraw", async function () {
      const { celestiaFaucet, luminaFaucet, celestia, lumina, otherAccount } = await loadFixture(deployOneYearLockFixture);

      await celestiaFaucet.connect(otherAccount).withdraw();
      await luminaFaucet.connect(otherAccount).withdraw();

      expect(Number(ethers.utils.formatUnits(await celestia.balanceOf(otherAccount.address)))).to.eq(CELESTIA_AMOUNT_PER_WITHDRAW);
      expect(Number(ethers.utils.formatUnits(await lumina.balanceOf(otherAccount.address)))).to.eq(LUMINA_AMOUNT_PER_WITHDRAW);
    });
    it("Should have cooldown", async function () {
      const { celestiaFaucet, luminaFaucet, otherAccount } = await loadFixture(deployOneYearLockFixture);

      await celestiaFaucet.connect(otherAccount).withdraw();
      await luminaFaucet.connect(otherAccount).withdraw();

      await expect(celestiaFaucet.connect(otherAccount).withdraw()).to.revertedWithCustomError(celestiaFaucet, "TooManyRequests");
      await expect(luminaFaucet.connect(otherAccount).withdraw()).to.revertedWithCustomError(luminaFaucet, "TooManyRequests");
    });
    it("Should withdraw after cooldown", async function () {
      const { celestiaFaucet, luminaFaucet, celestia, lumina, otherAccount } = await loadFixture(deployOneYearLockFixture);

      await celestiaFaucet.connect(otherAccount).withdraw();
      await luminaFaucet.connect(otherAccount).withdraw();

      await new Promise((res) => setTimeout(res, FAUCET_COOLDOWN * 1000));

      await celestiaFaucet.connect(otherAccount).withdraw();
      await luminaFaucet.connect(otherAccount).withdraw();

      expect(Number(ethers.utils.formatUnits(await celestia.balanceOf(otherAccount.address)))).to.eq(CELESTIA_AMOUNT_PER_WITHDRAW * 2);
      expect(Number(ethers.utils.formatUnits(await lumina.balanceOf(otherAccount.address)))).to.eq(LUMINA_AMOUNT_PER_WITHDRAW * 2);
    });
  });
});
