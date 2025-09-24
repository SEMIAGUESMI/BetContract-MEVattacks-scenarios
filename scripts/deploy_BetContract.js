const {ethers} = require ("hardhat")
const axios = require('axios');
const {
    alchemyProvider,
} = require ("../MEVsimulation/test_all/beforeEach.js");
const {transaction_receipt} = require("./transaction_receipt.js")
async function getETHPriceUSD() {
    try {
        const response = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=ETH');
        return Number(response.data.data.rates.USD);
    } catch (error) {
        console.log("⚠️ Could not fetch ETH price:", error.message);
        return 3500; // Update fallback to realistic value
    }
}
async function main() {
      // constructor parameters
      const TestToken_address="0xe843bC5f5034F1FF926109e4F604aa6Ab976f9f2";
      const rate_contract_address="0x8b0068cae3b550f49415e7d8a516cef45e9951c4";
      const bet_rate = ethers.parseEther("0.00009");  // exchange rate ETH/TEST; 1 ETH = 11000 TEST
      const initial_pot = ethers.parseEther("0.00000001");    // 0.00000001 ETH initial pot
      const deadline = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days

      const Bet = await ethers.getContractFactory("BetContract");

       // Estimate gas before deployment
       const deployTransaction = Bet.getDeployTransaction(
       bet_rate,
       TestToken_address,
       rate_contract_address,
       deadline,  
    { value: initial_pot }
     );
       const estimatedGas = await alchemyProvider.estimateGas(deployTransaction);

    //Deploy contract
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
