//---- swap Token to Ether  ----  */

const { ethers } = require("hardhat");
const {
  TestToken,
  BetContract,
  AMM,
  AMM_Address,
  alchemyProvider,
  TestToken_Address,
  signer,
} = require("../beforeEach.js");
(async () => {
  try {
    // state before executing swap
    const betRate = await BetContract.betRate();
    const test_ether_rate1 = await AMM.getRate(
      TestToken_Address,
      ethers.ZeroAddress,
    );
    const ether_test_rate1 = await AMM.getRate(
      ethers.ZeroAddress,
      TestToken_Address,
    );
    const amm_ether_Balance1 = await alchemyProvider.getBalance(AMM_Address);
    const amm_test_Balance1 = await TestToken.balanceOf(AMM_Address);
    console.log(" • State before executing swap function");
    console.table([
      {
        "AMM - ETHER Balance ": `${ethers.formatUnits(amm_ether_Balance1)} ETH`,
        "AMM - TEST Balance": `${ethers.formatUnits(amm_test_Balance1)} TEST`,
        "AMM - ETHER price": `${ethers.formatUnits(ether_test_rate1)} TEST `,
        "AMM - TEST price": `${ethers.formatUnits(test_ether_rate1)} ETH`,
        "Bet Rate": `${ethers.formatUnits(betRate)}`,
      },
    ]);

    //swap 10 TEST token for ? ether
    const amount_to_swap = ethers.parseUnits("100");

    //approve AMM contract to use TEST token
    const approval_transaction = await TestToken.approve(
      AMM_Address,
      amount_to_swap
    );
    await approval_transaction.wait();
    console.log(" ============Approval Transaction Completed===============");

    //check allowance
    const amountAllowance = await TestToken.allowance(
      signer.address,
      AMM_Address
    );
    console.log(
      "  Current Allowance:",
      ethers.formatUnits(amountAllowance),
      "TEST"
    );

    //execute swap function
    const trnsaction = await AMM.swapTokensForETH(amount_to_swap, 0);
    await trnsaction.wait();
    console.log(trnsaction);

    // state after executing swap function
    const test_ether_rate2 = await AMM.getRate(
      TestToken_Address,
      ethers.ZeroAddress,
    );
    const ether_test_rate2 = await AMM.getRate(
      ethers.ZeroAddress,
      TestToken_Address,
      
    );
    const amm_ether_Balance2 = await alchemyProvider.getBalance(AMM_Address);
    const amm_test_Balance2 = await TestToken.balanceOf(AMM_Address);

    // logs in a table
    console.table([
      {
        Contract: "AMM.sol",
        "Contract Address": AMM_Address,
        "Transaction Hash": trnsaction.hash,
        function: "swap",
      },
    ]);

    console.log(" • State before executing swap function");
    console.table([
      {
        "AMM - ETHER Balance ": `${ethers.formatUnits(amm_ether_Balance1)} ETH`,
        "AMM - TEST Balance": `${ethers.formatUnits(amm_test_Balance1)} TEST`,
        "AMM - ETHER price": `${ethers.formatUnits(ether_test_rate1)} TEST `,
        "AMM - TEST price": `${ethers.formatUnits(test_ether_rate1)} ETH`,
        "Bet Rate": `${ethers.formatUnits(betRate)}`,
      },
    ]);
    console.table([
      {
        "amount to swap": `${ethers.formatUnits(amount_to_swap)} TEST`,
      },
    ]);
    console.log(" • State after executing swap function ");
    console.table([
      {
        "AMM - ETHER Balance": `${ethers.formatUnits(amm_ether_Balance2)} ETH`,
        "AMM - TEST Balance": `${ethers.formatUnits(amm_test_Balance2)} TEST`,
        "AMM - ETHER price": `${ethers.formatUnits(ether_test_rate2)} TEST`,
        "AMM - TEST price ": `${ethers.formatUnits(test_ether_rate2)} ETH`,
        "Bet Rate": `${ethers.formatUnits(betRate)}`,
      },
    ]);
  } catch (error) {
    console.error(error);
  }
})();
