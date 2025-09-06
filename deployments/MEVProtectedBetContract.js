// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
        
    // Configuration - UPDATE THESE VALUES
    const betRate = ethers.utils.parseEther("0.001");     // 0.001 ETH threshold
    const token = "0xA0b86a33E6C6aA65b0f5b7Ed86C3f3b9B8c9F5F5";  // Token address
    const rateContract = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Uniswap V2 Router
    const deadline = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours
    const linkToken = "0x514910771AF9Ca656af840dff83E8264EcF986CA";  // LINK token mainnet
    const oracle = "0x3cCad4715152693fE3BC4460591e3D3Fbd071b42";     //  oracle address
    const jobId = "0x4c7b7ffb66b344fbaa64995af81e355a00000000000000000000000000000000"; //  job ID
    const fee = ethers.utils.parseEther("0.1");           // 0.1 LINK
    const apiUrl = "https://api.com/getBackRunningTransaction"; //  API URL
    const initialPot = ethers.utils.parseEther("1.0");    // 1 ETH initial pot
    
    // Deploy contract
    const MEVProtectedBetContract = await ethers.getContractFactory("MEVProtectedBetContract");
    const deployTx = await MEVProtectedBetContract.deploy(
        betRate,
        token,
        rateContract,
        deadline,
        linkToken,
        oracle,
        jobId,
        fee,
        apiUrl,
        { value: initialPot }
    );
    
    const bet = await deployTx.waitForDeployment();

    const transaction = await deployTx.deploymentTransaction().wait();
    
    console.log("Contract deployed to:", bet.address);
    console.log("Remember to fund with LINK tokens!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});