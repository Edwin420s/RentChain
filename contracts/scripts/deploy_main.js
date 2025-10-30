const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying RentChainMain...");

  // Load existing deployment addresses
  const deploymentPath = path.join(__dirname, "../deployments/scrollSepolia.json");
  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get contract factories
  const RentChainMain = await ethers.getContractFactory("RentChainMain");

  // Deploy RentChainMain with existing contract addresses
  const rentChainMain = await RentChainMain.deploy(
    deploymentData.contracts.RentChainToken,
    deploymentData.contracts.UserRegistry,
    deploymentData.contracts.PropertyRegistry,
    deploymentData.contracts.RentAgreement,
    deploymentData.contracts.EscrowManager,
    deploymentData.contracts.PaymentProcessor,
    deploymentData.contracts.DisputeResolution,
    deploymentData.contracts.ReviewSystem
  );

  await rentChainMain.waitForDeployment();
  const rentChainMainAddress = await rentChainMain.getAddress();

  console.log("RentChainMain deployed to:", rentChainMainAddress);

  // Update deployment file
  deploymentData.contracts.RentChainMain = rentChainMainAddress;
  deploymentData.timestamp = new Date().toISOString();

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
  console.log("Deployment addresses updated in", deploymentPath);

  // Verify deployment
  console.log("Verifying deployment...");
  const deployedContract = await ethers.getContractAt("RentChainMain", rentChainMainAddress);
  console.log("RentChainMain contract verified at:", await deployedContract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
