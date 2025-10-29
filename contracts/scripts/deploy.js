const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting ZuriRent deployment to Scroll zkEVM...\n");

  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  
  console.log("📍 Network:", network);
  console.log("👤 Deployer address:", deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Object to store all deployed contract addresses
  const deployedContracts = {};

  try {
    // 1. Deploy RentChainToken (Utility Token)
    console.log("📝 Deploying RentChainToken...");
    const RentChainToken = await hre.ethers.getContractFactory("RentChainToken");
    const rentToken = await RentChainToken.deploy();
    await rentToken.waitForDeployment();
    deployedContracts.RentChainToken = await rentToken.getAddress();
    console.log("✅ RentChainToken deployed to:", deployedContracts.RentChainToken, "\n");

    // 2. Deploy UserRegistry
    console.log("📝 Deploying UserRegistry...");
    const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
    const userRegistry = await UserRegistry.deploy();
    await userRegistry.waitForDeployment();
    deployedContracts.UserRegistry = await userRegistry.getAddress();
    console.log("✅ UserRegistry deployed to:", deployedContracts.UserRegistry, "\n");

    // 3. Deploy PropertyRegistry
    console.log("📝 Deploying PropertyRegistry...");
    const PropertyRegistry = await hre.ethers.getContractFactory("PropertyRegistry");
    const propertyRegistry = await PropertyRegistry.deploy();
    await propertyRegistry.waitForDeployment();
    deployedContracts.PropertyRegistry = await propertyRegistry.getAddress();
    console.log("✅ PropertyRegistry deployed to:", deployedContracts.PropertyRegistry, "\n");

    // 4. Deploy EscrowManager
    console.log("📝 Deploying EscrowManager...");
    const EscrowManager = await hre.ethers.getContractFactory("EscrowManager");
    const escrowManager = await EscrowManager.deploy();
    await escrowManager.waitForDeployment();
    deployedContracts.EscrowManager = await escrowManager.getAddress();
    console.log("✅ EscrowManager deployed to:", deployedContracts.EscrowManager, "\n");

    // 5. Deploy PaymentProcessor
    console.log("📝 Deploying PaymentProcessor...");
    const PaymentProcessor = await hre.ethers.getContractFactory("PaymentProcessor");
    const paymentProcessor = await PaymentProcessor.deploy();
    await paymentProcessor.waitForDeployment();
    deployedContracts.PaymentProcessor = await paymentProcessor.getAddress();
    console.log("✅ PaymentProcessor deployed to:", deployedContracts.PaymentProcessor, "\n");

    // 6. Deploy DisputeResolution
    console.log("📝 Deploying DisputeResolution...");
    const DisputeResolution = await hre.ethers.getContractFactory("DisputeResolution");
    const disputeResolution = await DisputeResolution.deploy();
    await disputeResolution.waitForDeployment();
    deployedContracts.DisputeResolution = await disputeResolution.getAddress();
    console.log("✅ DisputeResolution deployed to:", deployedContracts.DisputeResolution, "\n");

    // 7. Deploy ReviewSystem
    console.log("📝 Deploying ReviewSystem...");
    const ReviewSystem = await hre.ethers.getContractFactory("ReviewSystem");
    const reviewSystem = await ReviewSystem.deploy();
    await reviewSystem.waitForDeployment();
    deployedContracts.ReviewSystem = await reviewSystem.getAddress();
    console.log("✅ ReviewSystem deployed to:", deployedContracts.ReviewSystem, "\n");

    // 8. Deploy RentAgreement
    console.log("📝 Deploying RentAgreement...");
    const RentAgreement = await hre.ethers.getContractFactory("RentAgreement");
    const rentAgreement = await RentAgreement.deploy(
      deployedContracts.PropertyRegistry,
      deployedContracts.EscrowManager,
      deployedContracts.UserRegistry
    );
    await rentAgreement.waitForDeployment();
    deployedContracts.RentAgreement = await rentAgreement.getAddress();
    console.log("✅ RentAgreement deployed to:", deployedContracts.RentAgreement, "\n");

    // 9. Deploy RentChainMain (Main Orchestrator)
    console.log("📝 Deploying RentChainMain...");
    const RentChainMain = await hre.ethers.getContractFactory("RentChainMain");
    const rentChainMain = await RentChainMain.deploy();
    await rentChainMain.waitForDeployment();
    deployedContracts.RentChainMain = await rentChainMain.getAddress();
    console.log("✅ RentChainMain deployed to:", deployedContracts.RentChainMain, "\n");

    // Save deployment addresses to file
    const deploymentInfo = {
      network: network,
      chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
    };

    const deploymentPath = path.join(__dirname, "..", "deployments", `${network}.json`);
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("📄 Deployment info saved to:", deploymentPath, "\n");

    // Print summary
    console.log("═══════════════════════════════════════════════════════");
    console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════════════════════");
    console.log("\n📋 Deployed Contracts:\n");
    
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`   ${name.padEnd(25)} ${address}`);
    });

    console.log("\n═══════════════════════════════════════════════════════");
    console.log("📝 Next Steps:");
    console.log("═══════════════════════════════════════════════════════");
    console.log("1. Update frontend/.env with contract addresses");
    console.log("2. Update backend/.env with contract addresses");
    console.log("3. Verify contracts on Scrollscan:");
    console.log("   npx hardhat verify --network", network, deployedContracts.RentChainMain);
    console.log("4. Test the deployment");
    console.log("═══════════════════════════════════════════════════════\n");

    // Create .env template
    console.log("📝 Creating .env template...\n");
    const envTemplate = `# ZuriRent Contract Addresses (${network})
VITE_CONTRACT_ADDRESS_MAIN=${deployedContracts.RentChainMain}
VITE_CONTRACT_ADDRESS_PROPERTY_REGISTRY=${deployedContracts.PropertyRegistry}
VITE_CONTRACT_ADDRESS_RENT_AGREEMENT=${deployedContracts.RentAgreement}
VITE_CONTRACT_ADDRESS_ESCROW=${deployedContracts.EscrowManager}
VITE_CONTRACT_ADDRESS_PAYMENT=${deployedContracts.PaymentProcessor}
VITE_CONTRACT_ADDRESS_USER_REGISTRY=${deployedContracts.UserRegistry}
VITE_CONTRACT_ADDRESS_DISPUTE=${deployedContracts.DisputeResolution}
VITE_CONTRACT_ADDRESS_REVIEW=${deployedContracts.ReviewSystem}
VITE_CONTRACT_ADDRESS_TOKEN=${deployedContracts.RentChainToken}
`;

    const envPath = path.join(__dirname, "..", "deployments", `${network}.env`);
    fs.writeFileSync(envPath, envTemplate);
    console.log("✅ .env template created at:", envPath);
    console.log("\n🚀 ZuriRent is now deployed on Scroll zkEVM!\n");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
