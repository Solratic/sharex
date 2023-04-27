import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const ShraexFactory = await ethers.getContractFactory("Sharex");
  const sharex = await ShraexFactory.deploy();
  await sharex.deployed();
  
  console.log(`Sharex deployed to: ${sharex.address} | Deployer: ${deployer.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
