const { ethers } = require("hardhat");
async function main() {
  console.log("Starting TestToken deployment to Sepolia...\n");
  
  // Get the deployer account (MetaMask account)
  const [deployer] = await ethers.getSigners();
  console.log("deployer address:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("deployer balance:", ethers.formatUnits(balance), "ETH");
  }

  // Execute deployment
main()
  .then(() => {
    console.log("\nDeployment script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n Deployment failed with error:");
    console.error(error);
    process.exit(1);
  });