// ADD INITIAL LIQUIDITY TO AMM ✨
const { ethers } = require("hardhat");
const {
  TestToken,
  AMM,
  TestToken_Address,
  AMM_Address,
  signer,
  alchemyProvider,
} = require("../beforeEach.js");

(async () => {
  try {
    // display state before executing addInitialLiquidity
    const ether_test_rate1 = await AMM.getRate(
      ethers.ZeroAddress,
      TestToken_Address
    );
    const test_ether_rate1 = await AMM.getRate(
      TestToken_Address,
      ethers.ZeroAddress
    );
    const amm_ether_Balance1 = await alchemyProvider.getBalance(AMM_Address);
    const amm_test_Balance1 = await TestToken.balanceOf(AMM_Address);

    // amounts of TEST and ETHER to add
    const ether_amount = ethers.parseUnits("0.01");
    const testToken_amount = ethers.parseUnits("100");

    //approve AMM address to use testToken_amount
    const approvalTx = await TestToken.approve(AMM_Address, testToken_amount);
    await approvalTx.wait();
    console.log(" ============Approval Transaction Completed===============");

    const currentAllowance = await TestToken.allowance(
      signer.address,
      AMM_Address
    );
    console.log(
      "  Current Allowance:",
      ethers.formatUnits(currentAllowance),
      "TEST"
    );

    //execute addInitialLiquidity function
    const liquidityTx = await AMM.addInitialLiquidity(testToken_amount, {
      value: ether_amount,
    });
    await liquidityTx.wait();
    console.log(
      " *************** Liquidity Added Successfully! *******************"
    );
    const receipt = await alchemyProvider.getTransactionReceipt(
      liquidityTx.hash
    );
    console.log(" • Transaction : ", liquidityTx);

    // state after executing addInitialLiquidity
    const ether_test_rate2 = await AMM.getRate(
      ethers.ZeroAddress,
      TestToken_Address
    );
    const test_ether_rate2 = await AMM.getRate(
      TestToken_Address,
      ethers.ZeroAddress
    );
    const amm_ether_Balance2 = await alchemyProvider.getBalance(AMM_Address);
    const amm_test_Balance2 = await TestToken.balanceOf(AMM_Address);

    //logs in a table
    console.table([
      {
        Contract: "AMM.sol",
        "Contract Address": AMM_Address,
        "Transaction Hash": receipt.hash,
        Function: "addInitialLiquidity",
      },
    ]);
    console.log(" • State before executing addInitialLiquidity function");
    console.table([
      {
        "AMM - ETHER Balance ": `${ethers.formatUnits(amm_ether_Balance1)} ETH`,
        "AMM - TEST Balance": `${ethers.formatUnits(amm_test_Balance1)} ETH`,
        "AMM - ETHER price": `${ethers.formatUnits(ether_test_rate1)} TEST`,
        "AMM - TEST price": `${ethers.formatUnits(test_ether_rate1)} ETH`,
      },
    ]);
    console.table([
      {
        "ETHER amount to add": `${ethers.formatUnits(ether_amount)} ETH`,
        "TEST amount to add": `${ethers.formatUnits(testToken_amount)} TEST`,
      },
    ]);
    console.log(" • State after executing addInitialLiquidity function ");
    console.table([
      {
        "AMM - ETHER Balance": `${ethers.formatUnits(amm_ether_Balance2)} ETH`,
        "AMM - TEST Balance": `${ethers.formatUnits(amm_test_Balance2)} TEST`,
        "AMM - ETHER price": `${ethers.formatUnits(ether_test_rate2)} TEST`,
        "AMM - TEST price": `${ethers.formatUnits(test_ether_rate2)} ETH`,
      },
    ]);
  } catch (error) {
    console.error("\n Error occurred during AMM operation:");
    console.error(error.message);
    if (error.transaction) {
      console.error("Failed Transaction:", error.transaction);
    }
  }
})();
