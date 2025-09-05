
// ADD INITIAL LIQUIDITY TO AMM ✨

const { ethers } = require("hardhat");

const {
    TestToken,
    AMM,
    TestToken_Address,
    AMM_Address,
    signer,
    alchemyProvider
} = require("./beforeEach.js");

(async () => {
    try {
        
        const current_AMM_rate1 = await AMM.getRate(ethers.ZeroAddress, TestToken_Address);
        console.log(" Initial AMM Rate:", current_AMM_rate1.toString(), "ETH/TEST");
        
        const ether_amount = ethers.parseUnits("0.0000001", "ether");
        const testToken_amount = ethers.parseUnits("100", 18);
        
        console.log(" ETH Amount:", ethers.formatEther(ether_amount), "ETH");
        console.log(" TestToken Amount:", ethers.formatUnits(testToken_amount, 18), "TEST");

        const approvalTx = await TestToken.approve(AMM_Address, testToken_amount);
        await approvalTx.wait();
        console.log(" Approval Transaction Completed");

        const currentAllowance = await TestToken.allowance(signer.address, AMM_Address);
        console.log("  Current Allowance:", ethers.formatUnits(currentAllowance, 18), "TEST");

        const liquidityTx = await AMM.addInitialLiquidity(testToken_amount, { value: ether_amount});
        await liquidityTx.wait();
        console.log(" Liquidity Added Successfully!");
        console.log(" Transaction Hash:", liquidityTx.hash);

        const current_AMM_rate2 = await AMM.getRate(ethers.ZeroAddress, TestToken_Address);
        console.log(" Updated AMM Rate:", current_AMM_rate2.toString(), "ETH/TEST");

        const ammEtherBalance = await alchemyProvider.getBalance(AMM_Address);
        const ammTokenBalance = await TestToken.balanceOf(AMM_Address);

        //════════════════  AMM WALLET BALANCES ════════════════");
        console.log(" ETH Balance before adding liquidity:", ethers.formatEther(ammEtherBalance), "ETH");
        console.log(" TestToken Balance before adding liquidity:", ethers.formatUnits(ammTokenBalance, 18), "TEST");

    } catch (error) {
        console.error("\n Error occurred during AMM operation:");
        console.error(error.message);
       
        
        if (error.transaction) {
            console.error("Failed Transaction:", error.transaction);
        }
    }
})();