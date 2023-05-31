import { ethers } from "hardhat";

const CELESTIA_FOR_INITIAL_LIQUIDITY = 10000;
const CELESTIA_FOR_FAUCET = 200;
const CELESTIA_FOR_FAUCET_PER_WITHDRAW = 10;
const CELESTIA_FOR_STAKE_REWARDS = 5000;
const LUMINA_FOR_INITIAL_LIQUIDITY = 50000;
const LUMINA_FOR_FAUCET = 1000;
const LUMINA_FOR_FAUCET_PER_WITHDRAW = 50;
const FAUCET_COOLDOWN = 60;

async function main() {
  await ethers.provider.send("evm_setIntervalMining", [2000]);

  const Celestia = await ethers.getContractFactory("Token");
  const celestia = await Celestia.deploy(
    "Celestia",
    "CEL",
    ethers.utils.parseUnits(String(CELESTIA_FOR_FAUCET + CELESTIA_FOR_INITIAL_LIQUIDITY + CELESTIA_FOR_STAKE_REWARDS))
  );

  await celestia.deployed();
  console.log(`Celestia deployed to ${celestia.address}`);

  const CelestiaFaucet = await ethers.getContractFactory("Faucet");
  const celestiaFaucet = await CelestiaFaucet.deploy(
    celestia.address,
    ethers.utils.parseUnits(String(CELESTIA_FOR_FAUCET_PER_WITHDRAW)),
    FAUCET_COOLDOWN
  );

  await celestiaFaucet.deployed();
  console.log(`Celestia Faucet deployed to ${celestiaFaucet.address}`);

  await celestia.transfer(celestiaFaucet.address, ethers.utils.parseUnits(String(CELESTIA_FOR_FAUCET)));

  const Lumina = await ethers.getContractFactory("Token");
  const lumina = await Lumina.deploy("Lumina", "LUM", ethers.utils.parseUnits(String(LUMINA_FOR_FAUCET + LUMINA_FOR_INITIAL_LIQUIDITY)));

  await lumina.deployed();
  console.log(`Lumina deployed to ${lumina.address}`);

  const LuminaFaucet = await ethers.getContractFactory("Faucet");
  const luminaFaucet = await LuminaFaucet.deploy(
    lumina.address,
    ethers.utils.parseUnits(String(LUMINA_FOR_FAUCET_PER_WITHDRAW)),
    FAUCET_COOLDOWN
  );

  await luminaFaucet.deployed();
  console.log(`Lumina Faucet deployed to ${luminaFaucet.address}`);

  await lumina.transfer(luminaFaucet.address, ethers.utils.parseUnits(String(LUMINA_FOR_FAUCET)));

  const SwapEx = await ethers.getContractFactory("SwapEx");
  const swapEx = await SwapEx.deploy(celestia.address, lumina.address);

  await swapEx.deployed();
  console.log(`SwapEx deployed to ${swapEx.address}`);

  const Staker = await ethers.getContractFactory("Staker");
  const staker = await Staker.deploy(celestia.address);

  await staker.deployed();
  console.log(`Staker deployed to ${staker.address}`);

  await celestia.transfer(staker.address, ethers.utils.parseUnits(String(CELESTIA_FOR_STAKE_REWARDS)));

  await celestia.approve(swapEx.address, ethers.utils.parseUnits(String(CELESTIA_FOR_INITIAL_LIQUIDITY)));
  await lumina.approve(swapEx.address, ethers.utils.parseUnits(String(LUMINA_FOR_INITIAL_LIQUIDITY)));

  await swapEx.addLiquidity(
    ethers.utils.parseUnits(String(CELESTIA_FOR_INITIAL_LIQUIDITY)),
    ethers.utils.parseUnits(String(LUMINA_FOR_INITIAL_LIQUIDITY))
  );

  console.log("Liquidity Provided");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
