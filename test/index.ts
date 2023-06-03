import { ethers } from "hardhat";

export const INITIAL_CELESTIA_SUPPLY = 10000;
export const INITIAL_LUMINA_SUPPLY = 50000;

export const CELESTIA_FAUCET_AMOUNT = 100;
export const CELESTIA_AMOUNT_PER_WITHDRAW = 10;
export const LUMINA_FAUCET_AMOUNT = 500;
export const LUMINA_AMOUNT_PER_WITHDRAW = 50;
export const FAUCET_COOLDOWN = 10; // 10 seconds

export const deploySwapExFixture = async () => {
  const [owner, otherAccount, account3, account4, account5] = await ethers.getSigners();

  const Celestia = await ethers.getContractFactory("Token");
  const celestia = await Celestia.deploy(
    "Celestia",
    "CEL",
    ethers.utils.parseUnits(String(INITIAL_CELESTIA_SUPPLY + CELESTIA_FAUCET_AMOUNT))
  );

  const CelestiaFaucet = await ethers.getContractFactory("Faucet");
  const celestiaFaucet = await CelestiaFaucet.deploy(
    celestia.address,
    ethers.utils.parseUnits(String(CELESTIA_AMOUNT_PER_WITHDRAW)),
    FAUCET_COOLDOWN
  );

  await celestia.transfer(celestiaFaucet.address, ethers.utils.parseUnits(String(CELESTIA_FAUCET_AMOUNT)));

  const Lumina = await ethers.getContractFactory("Token");
  const lumina = await Lumina.deploy("Lumina", "LUM", ethers.utils.parseUnits(String(INITIAL_LUMINA_SUPPLY + LUMINA_FAUCET_AMOUNT)));

  const LuminaFaucet = await ethers.getContractFactory("Faucet");
  const luminaFaucet = await LuminaFaucet.deploy(
    lumina.address,
    ethers.utils.parseUnits(String(LUMINA_AMOUNT_PER_WITHDRAW)),
    FAUCET_COOLDOWN
  );

  await lumina.transfer(luminaFaucet.address, ethers.utils.parseUnits(String(LUMINA_FAUCET_AMOUNT)));

  const SwapEx = await ethers.getContractFactory("SwapEx");
  const swapEx = await SwapEx.deploy(celestia.address, lumina.address);

  return { celestia, lumina, swapEx, owner, otherAccount, celestiaFaucet, luminaFaucet, account3, account4, account5 };
};
