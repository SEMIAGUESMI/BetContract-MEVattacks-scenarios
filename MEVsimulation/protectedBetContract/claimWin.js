//******* Step 2: player claim win   */

const { ethers } = require("hardhat");
const {
  AMM,
  TestToken_Address,
  alchemyProvider,
  protectedBetContract_address,
  ProtectedBetContract,
} = require("./../beforeEach.js");
const { transaction_receipt } = require("../../scripts/transaction_receipt.js");
(async () => {
  try {
    // rates state
    const amm_rate = await AMM.getRate(TestToken_Address, ethers.ZeroAddress);
    const bet_rate = await ProtectedBetContract.betRate();
    //state before executing claimWin
    const protectedBetContract_Walet1 = await alchemyProvider.getBalance(
      protectedBetContract_address
    );
    const player_address = await ProtectedBetContract.currentPlayer();
     const player_wallet1 = await alchemyProvider.getBalance(player_address);

    //execute claimWin function
    const transaction = await ProtectedBetContract.claimWin();
    await transaction.wait();
    console.log(transaction);

    //state after executing claimWin
    const protectedBetContract_Walet2 = await alchemyProvider.getBalance(
      protectedBetContract_address
    );
    const player_wallet2 = await alchemyProvider.getBalance(player_address);
    console.table([
      {
        contract: "ProtectedBetContract",
        "contrcat address": protectedBetContract_address,
        "Transaction hash ": transaction.hash,
        function: "claimWin",
      },
    ]);
    console.log("• Rates ");
    console.table([
      {
        "AMM rate (test price)": `${ethers.formatUnits(amm_rate)}`,
        " Bet rate": `${ethers.formatUnits(bet_rate)}`,
      },
    ]);
    console.log(" • state before executing claimWin ");
    console.table([
      {
        Bet_Walet: `${ethers.formatUnits(protectedBetContract_Walet1)} ETH `,
        player_wallet: `${ethers.formatUnits(player_wallet1)} ETH `,
      },
    ]);
    console.log(" • state after executing claimWin ");
    console.table([
      {
        Bet_Walet: `${ethers.formatUnits(protectedBetContract_Walet2)} ETH `,
        player_wallet: `${ethers.formatUnits(player_wallet2)} ETH `,
      },
    ]);

    await transaction_receipt(
      transaction.hash,
      "claimWin",
      protectedBetContract_address
    );

    const playerBetBlock = await ProtectedBetContract.playerBetBlock();
    const currentPlayer = await ProtectedBetContract.currentPlayer();
    const rateContract = await ProtectedBetContract.rateContract();
    const value_volume = await ProtectedBetContract.volume();
    const playerBet = await ProtectedBetContract.playerBet();

    console.log("playerBetBlock : ", playerBetBlock);
    console.log("currentPlayer : ", currentPlayer);
    console.log("rateContract : ", rateContract);
    console.log("value_volume : ", value_volume);
    console.log("playerBet : ", playerBet);
    console.log(
      "current playet after execution win",
      await ProtectedBetContract.currentPlayer()
    );
  } catch (error) {
    console.error(error);
  }
})();
