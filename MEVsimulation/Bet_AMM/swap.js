//******* Step 2: Attacker manipulates AMM rate by making large swap  */

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
    AMM_Abi
} = require ("./beforeEach.js");
(async () => {
             try {
                    console.log("AMM Contract:", AMM.target); // .target instead of address in ethers v6
                    
                    const current_AMM_rate = await AMM.getRate(ethers.ZeroAddress, TestToken_Address);
                    
                    // Convert BigNumber to readable format
                    console.log("Current AMM Rate:", current_AMM_rate.toString());
                    
                    // If it's a rate that should be formatted as ether (18 decimals)
                    // console.log("Current AMM Rate (formatted):", ethers.formatEther(current_AMM_rate));
                    
                } catch (error) {
                    console.error("Error fetching AMM rate:", error);
                }
})();