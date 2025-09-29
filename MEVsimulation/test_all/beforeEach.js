const { ethers } = require("ethers");
const {
  BetContract_Address,
  TestToken_Address,
  AMM_Address,
  BetContract_Abi,
  TestToken_Abi,
  AMM_Abi,
  BetContract_bytecode,
  protectedBet_abi,
  protectedBet_address,
  testContract_address,
  testContract_abi,  
} = require("../constant");

// Provider
const alchemyProvider = new ethers.JsonRpcProvider(process.env.API_URL);

// Signer
const signer = new ethers.Wallet(
  process.env.Player_PRIVATE_KEY,
  alchemyProvider
);
// Signer
const signer2 = new ethers.Wallet(
  process.env.SIGNER_PRIVATE_KEY,
  alchemyProvider
);

// Contracts
const AMM = new ethers.Contract(AMM_Address, AMM_Abi, signer);
const AMM_signer = new ethers.Contract(AMM_Address, AMM_Abi, signer2);
const BetContract = new ethers.Contract(
  BetContract_Address,
  BetContract_Abi,
  signer
);
const TestToken = new ethers.Contract(TestToken_Address, TestToken_Abi, signer);
const ProtectedBet = new ethers.Contract(protectedBet_address, protectedBet_abi, signer);
const TestConract = new ethers.Contract(testContract_address, testContract_abi, signer);
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
  signer2,
  ProtectedBet,
  protectedBet_address,
  AMM_signer,
  TestConract,
  testContract_address
};
