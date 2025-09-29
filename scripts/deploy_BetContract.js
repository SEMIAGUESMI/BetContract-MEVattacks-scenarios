const {ethers} = require ("hardhat")
const {transaction_receipt} = require("./transaction_receipt.js")

async function main() {
      // constructor parameters
      const TestToken_address="0xe843bC5f5034F1FF926109e4F604aa6Ab976f9f2";
      const rate_contract_address="0x7B3FA1B861a5D1826CD50347E768B6a5950493a2";
      const bet_rate = ethers.parseEther("0.00003");  // exchange rate ETH/TEST; 1 ETH = 11000 TEST
      const initial_pot = ethers.parseEther("0.00000001");    // 0.00000001 ETH initial pot
      const deadline = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days

    //Deploy contract
    const Bet = await ethers.getContractFactory("BetContract");
    const deployTx = await Bet.deploy(bet_rate, TestToken_address, rate_contract_address, deadline, { value: initial_pot });
    const bet = await deployTx.waitForDeployment();
    const transaction = await deployTx.deploymentTransaction().wait();

     // show gas consumption and transaction fee
     await transaction_receipt(transaction.hash, "deploy", null ) 
     
     console.log(transaction)
}
main ()
.then(() => {
    console.log("\ script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n  failed with error:");
    console.error(error);
    process.exit(1);
  });
