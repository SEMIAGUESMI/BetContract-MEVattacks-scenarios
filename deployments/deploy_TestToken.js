const { ethers } = require("hardhat");
async function main() {
  console.log("Starting TestToken deployment to Sepolia...\n");
  
  // Get the deployer account (MetaMask account)
  const [deployer] = await ethers.getSigners();
  console.log("deployer address:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("deployer balance:", ethers.formatUnits(balance), "ETH");

    // deploy the contract
    const TestToken = await ethers.getContractFactory("TestToken");
    const deployTx = await TestToken.deploy()
    const testToken = await deployTx.waitForDeployment();

    const transaction = await deployTx.deploymentTransaction().wait()
    
    console.log("\n TestToken contract deployed successfully!");

    console.log("Transaction Object : ", transaction);
    console.log("Transaction hash: ", transaction.hash);
    console.log("Contract address: ", await testToken.getAddress());

    const  name = await testToken.name();
    const symbol = await testToken.symbol();
    const decimals = await testToken.decimals();
    const totalSupply = await testToken.totalSupply();
    const owner = await testToken.owner();
    const deployerBalance = await testToken.balanceOf(deployer.address);
    
    console.log("Token name: ", name);
    console.log("Token symbol: ", symbol);
    console.log("Decimals: ", decimals.toString());
    console.log("Total supply: ", ethers.utils.formatEther(totalSupply), symbol);
    console.log("Contract owner: ", owner);
    console.log("Deployer balance: ", ethers.utils.formatEther(deployerBalance), symbol);
  
  }
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