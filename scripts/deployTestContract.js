const { ethers } = require("hardhat");
const { transaction_receipt } = require("./transaction_receipt.js");

async function main() {
  // deploy the contract
  const TestContract = await ethers.getContractFactory("TestContract");
  const value = await ethers.parseUnits("0.0000000001")
  const deployTx = await TestContract.deploy("0xEcBdA29a86b46e80402ef68aE0f15c9d3785FDF5","0x7b3fa1b861a5d1826cd50347e768b6a5950493a2", {value: value});
  const testContract= await deployTx.waitForDeployment();
  const transaction = await deployTx.deploymentTransaction().wait(); 
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
