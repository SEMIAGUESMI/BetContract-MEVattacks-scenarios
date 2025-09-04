
const {ethers} = require ("hardhat")

async  function main (){
    const deployer = await ethers.getSigners();

    // constructor parameters
    const TestToken_address="0xe843bC5f5034F1FF926109e4F604aa6Ab976f9f2";
    const rate_contract_address="0xA464A947813975627A02b43Ced597A18C5497776";
    const bet_rate = ethers.parseUnits("0.001", 18);  // 1 ETH = 1000 tokens 
    const initial_pot = ethers.parseEther("0.000001");    // 0.01 ETH initial pot
    const deadline = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days

    const Bet = await ethers.getContractFactory("BetContract");
    const deployTx = await Bet.deploy(bet_rate, TestToken_address,rate_contract_address,deadline, {value: initial_pot});
    const bet = await deployTx.waitForDeployment();

    const transaction = await deployTx.deploymentTransaction().wait();

    console.log("\n Bet contract deployed successfully!");
    console.log("transaction object: ", transaction);
    console.log("transaction hash: ", transaction.hash);
    console.log("contract address: ", await bet.getAddress())

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