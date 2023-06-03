import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deploySwapExFixture, CELESTIA_AMOUNT_PER_WITHDRAW, LUMINA_AMOUNT_PER_WITHDRAW, FAUCET_COOLDOWN, CELESTIA_FAUCET_AMOUNT } from ".";

describe("Faucet", async function () {
  it("Should emit Withdraw() event", async function () {
    const { celestiaFaucet, otherAccount } = await loadFixture(deploySwapExFixture);

    const tx = await celestiaFaucet.connect(otherAccount).withdraw();
    const timestamp = (await ethers.provider.getBlock(tx.blockHash as string)).timestamp;

    await expect(tx).to.emit(celestiaFaucet, "Withdraw").withArgs(otherAccount.address, timestamp);
  });
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
  it("Should run out of funds", async function () {
    const { celestiaFaucet, otherAccount, account3, account4, account5 } = await loadFixture(deploySwapExFixture);

    for (let i = 0; i < CELESTIA_FAUCET_AMOUNT; i += CELESTIA_AMOUNT_PER_WITHDRAW * 5) {
      await celestiaFaucet.withdraw();
      await celestiaFaucet.connect(otherAccount).withdraw();
      await celestiaFaucet.connect(account3).withdraw();
      await celestiaFaucet.connect(account4).withdraw();
      await celestiaFaucet.connect(account5).withdraw();
      await new Promise((res) => setTimeout(res, FAUCET_COOLDOWN * 1000));
    }

    await expect(celestiaFaucet.connect(otherAccount).withdraw()).to.revertedWithCustomError(celestiaFaucet, "InsufficientFunds");
  });
});
