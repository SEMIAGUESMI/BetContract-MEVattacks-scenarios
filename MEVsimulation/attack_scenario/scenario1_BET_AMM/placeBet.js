// Malicious interaction - BET.sol + AMM.sol 
// scenario : placeBet(); swapETHForTokens(); claimWin()

// ********** Step 1: Player places bet */

const {
    BetContract_Address,
    signer,
    alchemyProvider,
    BetContract,
    AMM,
    TestToken,
    AMM_Address
} = require ("../../test_all/beforeEach.js");

 (async () => {
        console.log("amm_current_Rate TEST/ETHER", ethers.formatUnits(await AMM.getRate(TestToken, ethers.ZeroAddress)) ) 

        console.log("amm Balance token", await TestToken.balanceOf(AMM_Address) )
        console.log("amm balance ether", await alchemyProvider.getBalance(AMM_Address) 
    )  
        console.log("BetContract Rate", await BetContract.betRate() )  
  })();



