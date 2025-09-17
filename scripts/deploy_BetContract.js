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
      const rate_contract_address="0xA464A947813975627A02b43Ced597A18C5497776";
      const bet_rate = 11000;  // exchange rate ETH/TEST; 1 ETH = 11000 TEST
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
    const deployTx = await Bet.deploy(bet_rate, TestToken_address, rate_contract_address, deadline);
    const bet = await deployTx.waitForDeployment();
    const transaction = await deployTx.deploymentTransaction().wait();
     console.log(transaction)
     
     // show gas consumption and transaction fee
     await transaction_receipt(transaction.hash, estimatedGas )   
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
