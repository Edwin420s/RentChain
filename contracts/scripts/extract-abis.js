const fs = require("fs");
const path = require("path");

// Main contracts to extract ABIs for
const MAIN_CONTRACTS = [
  "RentChainMain",
  "PropertyRegistry",
  "RentAgreement",
  "EscrowManager",
  "PaymentProcessor",
  "UserRegistry",
  "DisputeResolution",
  "ReviewSystem",
  "RentChainToken"
];

async function extractABIs() {
  console.log("🔍 Extracting contract ABIs...\n");

  const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
  const outputDir = path.join(__dirname, "..", "abis");
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const extractedABIs = {};

  for (const contractName of MAIN_CONTRACTS) {
    try {
      // Find the contract artifact file
      const artifactPath = findArtifactPath(artifactsDir, contractName);
      
      if (!artifactPath) {
        console.log(`⚠️  Could not find artifact for ${contractName}`);
        continue;
      }

      // Read the artifact
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      
      // Extract ABI
      const abi = artifact.abi;
      extractedABIs[contractName] = abi;

      // Save individual ABI file
      const abiPath = path.join(outputDir, `${contractName}.json`);
      fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
      
      console.log(`✅ Extracted ABI for ${contractName} (${abi.length} functions)`);
    } catch (error) {
      console.error(`❌ Error extracting ${contractName}:`, error.message);
    }
  }

  // Save combined ABIs file
  const combinedPath = path.join(outputDir, "contracts.json");
  fs.writeFileSync(combinedPath, JSON.stringify(extractedABIs, null, 2));
  console.log(`\n📦 Saved combined ABIs to ${combinedPath}`);

  // Copy to frontend
  const frontendAbiDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  if (!fs.existsSync(frontendAbiDir)) {
    fs.mkdirSync(frontendAbiDir, { recursive: true });
  }

  // Copy individual ABIs
  for (const contractName of MAIN_CONTRACTS) {
    if (extractedABIs[contractName]) {
      const sourcePath = path.join(outputDir, `${contractName}.json`);
      const destPath = path.join(frontendAbiDir, `${contractName}.json`);
      fs.copyFileSync(sourcePath, destPath);
    }
  }

  // Copy combined ABIs
  fs.copyFileSync(
    combinedPath,
    path.join(frontendAbiDir, "contracts.json")
  );

  console.log(`✅ Copied ABIs to frontend/src/contracts/\n`);
  console.log("🎉 ABI extraction complete!\n");
}

function findArtifactPath(baseDir, contractName) {
  // Common patterns for artifact locations
  const patterns = [
    path.join(baseDir, `${contractName}.sol`, `${contractName}.json`),
    path.join(baseDir, contractName, `${contractName}.json`),
  ];

  for (const pattern of patterns) {
    if (fs.existsSync(pattern)) {
      return pattern;
    }
  }

  // Search recursively
  try {
    const files = fs.readdirSync(baseDir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        const subPath = findArtifactPath(
          path.join(baseDir, file.name),
          contractName
        );
        if (subPath) return subPath;
      } else if (file.name === `${contractName}.json` && !file.name.endsWith('.dbg.json')) {
        return path.join(baseDir, file.name);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }

  return null;
}

extractABIs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
