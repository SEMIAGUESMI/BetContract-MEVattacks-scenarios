//******* Step 2: player claim win   */

const { ethers } = require("hardhat");
const {
  BetContract,
  AMM,
  TestToken_Address,
  alchemyProvider,
  BetContract_Address,
  player,
} = require("../beforeEach.js");
const { transaction_receipt } = require("../../scripts/transaction_receipt.js");
(async () => {
  try {
    // rates state
    const amm_rate = await AMM.getRate(TestToken_Address,ethers.ZeroAddress);
    const bet_rate = await BetContract.betRate();
    //state before executing claimWin
    const Bet_Walet1 = await alchemyProvider.getBalance(BetContract_Address);
    const player_address = await BetContract.currentPlayer();
    const player_wallet1 = await alchemyProvider.getBalance(player_address);

    console.log("• Rates ");
    console.table([
      {
        "AMM test price": `${ethers.formatUnits(amm_rate)}` ,
        " Bet rate": `${ethers.formatUnits(bet_rate)}`,
      },
    ]);

    //execute claimWin function
    const transaction = await BetContract.claimWin();
    await transaction.wait();
    console.log(transaction);

    //state after executing claimWin
    const Bet_Walet2 = await alchemyProvider.getBalance(BetContract_Address);
    const player_wallet2 = await alchemyProvider.getBalance(player_address);
   console.table([
      {
        contract: "BetContract",
        "contrcat address": BetContract_Address,
        "Transaction hash ": transaction.hash,
        function: "claimWin",
      },
    ]);
    console.log("• Rates ");
    console.table([
      {
        "AMM test price": `${ethers.formatUnits(amm_rate)}` ,
        " Bet rate": `${ethers.formatUnits(bet_rate)}`,
      },
    ]);
    console.log(" • state before executing claimWin ");
    console.table([
      {
        Bet_Walet: `${ethers.formatUnits(Bet_Walet1)} ETH `,
        player_wallet: `${ethers.formatUnits(player_wallet1)} ETH `,
      },
    ]);
    console.log(" • state after executing claimWin ");
    console.table([
      {
        Bet_Walet: `${ethers.formatUnits(Bet_Walet2)} ETH `,
        player_wallet: `${ethers.formatUnits(player_wallet2)} ETH `,
      },
    ]);
   await transaction_receipt(
      transaction.hash,
      "claimWin",
      BetContract_Address
    );  
    } catch (error) {
    console.error(error);
  }
})();
