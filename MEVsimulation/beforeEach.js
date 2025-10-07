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

// player
const player = new ethers.Wallet(
  process.env.Player_PRIVATE_KEY,
  alchemyProvider
);

// deployer
const deployer = new ethers.Wallet(
  process.env.DEPLOYER_PRIVATE_KEY,
  alchemyProvider
);

// Contracts
const AMM = new ethers.Contract(AMM_Address, AMM_Abi, player);
const BetContract = new ethers.Contract(
  BetContract_Address,
  BetContract_Abi,
  deployer
);
const TestToken = new ethers.Contract(TestToken_Address, TestToken_Abi, player);
const ProtectedBetContract= new ethers.Contract(protectedBetContract_address, protectedBetContract_abi, deployer);

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

  player,
  alchemyProvider,
  deployer,

  BetContract_bytecode,
};
