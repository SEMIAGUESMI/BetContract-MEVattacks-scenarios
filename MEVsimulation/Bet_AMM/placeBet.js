// ********** Step 1: Player places bet */

const {
    alchemy,
    player,
    BetContract,
    BetContract_Address,
} = require ("./beforeEach.js");

 (async () => {
  const Bet_amount = await alchemy.getBalance(BetContract_Address)
  console.log(ethers.formatUnits(Bet_amount));
  console.log("player wallet before placing Bet", ethers.formatUnits(await alchemy.getBalance(player.address)) )
  const placeBet_transaction = await BetContract.placeBet({value: Bet_amount});
  await placeBet_transaction.wait()
  console.log("player wallet affter placing Bet", ethers.formatUnits(await alchemy.getBalance(player.address)) )
  console.log("BetContract wallet after placing Bet", ethers.formatUnits(await alchemy.getBalance(BetContract_Address)) )
  console.log(placeBet_transaction);
  })();