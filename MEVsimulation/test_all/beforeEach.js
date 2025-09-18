const { ethers } = require('ethers');

const {
 BetContract_Address,
 TestToken_Address,
 AMM_Address,
 BetContract_Abi,
 TestToken_Abi,
 AMM_Abi, 
 BetContract_bytecode,
} = require('../constant');

// Provider
const alchemyProvider = new ethers.JsonRpcProvider(process.env.API_URL);

// Signer
const signer = new ethers.Wallet(process.env.Player_PRIVATE_KEY, alchemyProvider);

// Contracts 
const AMM = new ethers.Contract(AMM_Address, AMM_Abi, signer);
const BetContract = new ethers.Contract(BetContract_Address, BetContract_Abi, signer);
const TestToken = new ethers.Contract(TestToken_Address, TestToken_Abi,signer);

module.exports = {
    TestToken,
    AMM,
    BetContract,
    BetContract_Address,

    TestToken_Address,
    AMM_Address,
    BetContract_Abi,
    TestToken_Abi,
    AMM_Abi,
    signer,
    alchemyProvider,
    BetContract_bytecode,
}