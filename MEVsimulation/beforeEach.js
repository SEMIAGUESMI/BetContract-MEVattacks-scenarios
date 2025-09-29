const { ethers } = require("ethers");
const {
  BetContract_Address,
  TestToken_Address,
  AMM_Address,
  BetContract_Abi,
  TestToken_Abi,
  AMM_Abi,
  BetContract_bytecode,
  protectedBetContract_abi,
  protectedBetContract_address,  
} = require("./constant");

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
const ProtectedBetContract= new ethers.Contract(protectedBetContract_address, protectedBetContract_abi, signer);

module.exports = {
  TestToken,
  AMM,
  BetContract,
  ProtectedBetContract,
  
  BetContract_Address,
  TestToken_Address,
  AMM_Address,
  protectedBetContract_address,

  BetContract_Abi,
  TestToken_Abi,
  AMM_Abi,

  signer,
  alchemyProvider,
  signer2,
  AMM_signer,

  BetContract_bytecode,
};
