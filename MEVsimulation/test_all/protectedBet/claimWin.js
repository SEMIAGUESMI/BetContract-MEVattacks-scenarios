//******* Step 2: player claim win   */

const { ethers } = require("hardhat");
const {
  TestToken,
  AMM,
  TestToken_Address,
  AMM_Address,
  alchemyProvider,
  BetContract_Address,
  signer,
  ProtectedBet,
  protectedBet_address,
} = require("./../beforeEach.js");
const {
  transaction_receipt,
} = require("../../../scripts/transaction_receipt.js");
(async () => {
  try {
   
    // rates state
    const amm_rate = await AMM.getRate(TestToken_Address, ethers.ZeroAddress);
    const bet_rate = await ProtectedBet.betRate();
    //state before executing claimWin
    const Bet_Walet1 = await alchemyProvider.getBalance(protectedBet_address);
    const player_address = await ProtectedBet.currentPlayer();
    const player_wallet1 = await alchemyProvider.getBalance(player_address);

    //execute claimWin function
    const transaction = await ProtectedBet.claimWin();
    await transaction.wait();
    console.log(transaction);

    //state after executing claimWin
    const Bet_Walet2 = await alchemyProvider.getBalance(protectedBet_address);
    const player_wallet2 = await alchemyProvider.getBalance(player_address);
    console.table([
      {
        contract: "BetContract",
        "contrcat address": protectedBet_address,
        "Transaction hash ": "tc", //transaction.hash,
        function: "claimWin",
      },
    ]);
    console.log("• Rates ");
    console.table([
      {
        "AMM test price": `${ethers.formatUnits(amm_rate)}`,
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
    /*
     await transaction_receipt(
      transaction.hash,
      "claimWin",
      protectedBet_address
    );*/
    
    const playerBetBlock = await ProtectedBet.playerBetBlock();
    const currentPlayer = await ProtectedBet.currentPlayer();
    const rateContract = await ProtectedBet.rateContract();
    const url_complete = await ProtectedBet.url_complete();
    const value_volume = await ProtectedBet.value_volume();
    const value_startBlock = await ProtectedBet.value_startBlock();
    const value_requestId = await ProtectedBet.value_requestId();
    const playerBet = await ProtectedBet.playerBet();


    console.log("playerBetBlock : ", playerBetBlock);
    console.log("currentPlayer : ", currentPlayer );
    console.log("rateContract : ", rateContract);
    console.log("url_complete : ", url_complete);
    console.log("value_volume : ", value_volume)
    console.log("value_startBlock : ", value_startBlock)
    console.log("value_requestId : ", value_requestId)
    console.log("playerBet : ", playerBet)
  } catch (error) {
    console.error(error);
  }
})();
