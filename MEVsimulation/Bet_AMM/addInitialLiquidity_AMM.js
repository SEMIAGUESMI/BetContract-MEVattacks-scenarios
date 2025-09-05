//******* ADD initial liquidity to AMM  */
const {ethers} = require ("hardhat");
const {
    alchemy,
    player,
    TestToken,
    AMM,
    BetContract,
    BetContract_Address,
    TestToken_Address,
    AMM_Address,
    BetContract_Abi,
    TestToken_Abi,
    AMM_Abi
} = require ("./beforeEach.js");
(async () => {
   // const current_AMM_rate1 = await AMM.getRate(ethers.ZeroAddress, TestToken_Address)
   // console.log("initial AMM rate: " , current_AMM_rate1, "ETH/TEST")


   const ether_amount= ethers.parseUnits("0.00001");
   const testToken_amount= ethers.parseUnits("1000");


    //approve the AMM contract to transfer testToken tokens from player wallet to itself
   // const tx = await TestToken.approve(AMM_Address, testToken_amount);
  /* 
   const transaction = await AMM.addInitialLiquidity(testToken_amount, {value : ether_amount})
    await transaction.wait()
    console.log(transaction);

    const current_AMM_rate2 = await AMM.getRate(ethers.ZeroAddress, TestToken_Address)
    console.log("updated AMM rate: " ,current_AMM_rate2, "ETH/TEST")
    
    //check AMM Balnce
    console.log("AMM ether wallet after swap = ", ethers.formatUnits(await alchemy.getBalance(AMM_Address)))
    console.log(ethers.formatUnits("AMM testToken wallet after swap = ", await TestToken.balanceOf(AMM_Address)))
*/

})();