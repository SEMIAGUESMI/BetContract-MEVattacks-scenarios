// ********** Step 1: Player places bet */

const {
    BetContract_Address,
    signer,
    alchemyProvider,
} = require ("./beforeEach.js");

 (async () => {
  const player=signer
  const Bet_amount = await alchemyProvider.getBalance(BetContract_Address)
  console.log(ethers.formatUnits(Bet_amount));
  console.log("player wallet before placing Bet", ethers.formatUnits(await alchemyProvider.getBalance(player.address)) )

  const placeBet_transaction = await BetContract.placeBet({value: Bet_amount});
  await placeBet_transaction.wait()
  console.log(placeBet_transaction);
  
  console.log("player wallet affter placing Bet", ethers.formatUnits(await alchemyProvider.getBalance(player.address)) )
  console.log("BetContract wallet after placing Bet", ethers.formatUnits(await alchemyProvider.getBalance(BetContract_Address)) )
 
  })();