import { network } from "hardhat";

const { ethers } = await network.create({
    network: "sepolia",
});

console.log("Deploying CraftChain to Sepolia...");

const [deployer] = await ethers.getSigners();

console.log("Deployer:", deployer.address);

const balance = await ethers.provider.getBalance(
    deployer.address
);

console.log(
    "Deployer balance:",
    ethers.formatEther(balance),
    "ETH"
);

const CraftChain = await ethers.getContractFactory(
    "CraftChain"
);

const craftChain = await CraftChain.deploy(
    deployer.address
);

await craftChain.waitForDeployment();

const contractAddress =
    await craftChain.getAddress();

console.log("CraftChain deployed to:");
console.log(contractAddress);