const {ethers} = require ("hardhat")
const {transaction_receipt} = require("./transaction_receipt.js")
const {
  TestToken_Address,
  AMM_Address
} = require("../MEVsimulation/constant.js");
async function main() {
      // constructor parameters
      const TestToken_address=TestToken_Address;
      const rate_contract_address=AMM_Address;
      const bet_rate = ethers.parseEther("0.00002");  // exchange rate ETH/TEST; 1 ETH = 11000 TEST
      const initial_pot = ethers.parseEther("0.000001");    // 0.00000001 ETH initial pot
      const deadline1 = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days
       const deadline2 = Math.floor(Date.now() / 1000)+60 ; // to test the close function
    //Deploy contract
    const Bet = await ethers.getContractFactory("BetContract");
    const deployTx1 = await Bet.deploy(bet_rate, TestToken_address, rate_contract_address, deadline2, { value: initial_pot });
    const bet = await deployTx1.waitForDeployment();
    const transaction1 = await deployTx1.deploymentTransaction().wait();

     // show gas consumption and transaction fee
     await transaction_receipt(transaction1.hash, "deploy", null ) 
     
     console.log(transaction1)

     // deploy contract
  const ProtectedBetContract = await ethers.getContractFactory(
    "ProtectedBetContract"
  );
  const deployTx2 = await ProtectedBetContract.deploy(
    bet_rate,
    TestToken_address,
    rate_contract_address,
    deadline,
    { value: initial_pot }
  );
  //const testContract= await deployTx.waitForDeployment();
  const transaction2 = await deployTx2.deploymentTransaction().wait();

  // show gas consumption and transaction fee
  await transaction_receipt(
    transaction2.hash,
    "deploy",
    null
  );
  console.log(transaction2);

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
