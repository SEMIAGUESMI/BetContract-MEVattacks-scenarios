const {ethers} = require ("hardhat")

async  function main (){
    const deployer =await ethers.getSigners();

    // constructor parameters
    const TestToken_address="0xe843bC5f5034F1FF926109e4F604aa6Ab976f9f2";
    const AMM = await ethers.getContractFactory("AMM");
   const deployTx = await AMM.deploy(TestToken_address);
    const amm = await deployTx.waitForDeployment();

    const transaction = await deployTx.deploymentTransaction().wait();

    console.log("\n AMM contract deployed successfully!");
    console.log("transaction object: ", transaction);
    console.log("transaction hash: ", transaction.hash);
    console.log("contract address: ", await amm.getAddress())

    console.log("tokenB address: ",await amm.tokenB())
    console.log("tokenA address: ",await amm.tokenA())
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