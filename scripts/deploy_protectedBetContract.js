const { ethers } = require("hardhat");
const { transaction_receipt } = require("./transaction_receipt.js");
const {
  TestToken_Address,
  AMM_Address,
} = require("../MEVsimulation/constant.js");

async function main() {
  // contract parameters
  const initialPot = await ethers.parseUnits("0.000001");
  const _betRate = ethers.parseEther("0.00002");
  const _token = TestToken_Address;
  const _rateContract = AMM_Address;
  const _deadline1 = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
   const _deadline2 = Math.floor(Date.now() / 1000)+60 ; // to test the close function

  // deploy contract
  const ProtectedBetContract = await ethers.getContractFactory(
    "ProtectedBetContract"
  );
  const deployTx = await ProtectedBetContract.deploy(
    _betRate,
    _token,
    _rateContract,
    _deadline2,
    { value: initialPot }
  );
  //const testContract= await deployTx.waitForDeployment();
  const transaction = await deployTx.deploymentTransaction().wait();

  // show gas consumption and transaction fee
  await transaction_receipt(
    transaction.hash,
    "deploy",
    null
  );
  console.log(transaction);
}

main()
  .then(() => {
    console.log(" script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n  failed with error:");
    console.error(error);
    process.exit(1);
  });
