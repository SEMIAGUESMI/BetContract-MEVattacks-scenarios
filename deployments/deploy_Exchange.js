const {ethers} = require ("hardhat")

async function main () {
    const [deployer] = await ethers.getSigners();
    
    // constructor parameter

    const TestToken_address="0xe843bC5f5034F1FF926109e4F604aa6Ab976f9f2";
    const rate = 1
    const Exchange = await ethers.getContractFactory("Exchange");
    const deployTx = await Exchange.deploy(TestToken_address, rate);
    const exchange= await deployTx.waitForDeployment()
    
    const transaction = await deployTx.deploymentTransaction().wait()

    console.log("\n Exchange contract deployed successfully!");
    console.log("transaction object: ", transaction);
    console.log("transaction hash: ", transaction.hash);
    console.log("contract address: ", await exchange.getAddress())

    console.log("tokenB address: ",await exchange.tokenB())
    console.log("tokenA address: ",await exchange.tokenA())
  
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
