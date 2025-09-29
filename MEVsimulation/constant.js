
// TestToken
const TestToken_Json = require("../artifacts/contracts/TestToken.sol/TestToken.json");
const TestToken_Address = "0xe843bC5f5034F1FF926109e4F604aa6Ab976f9f2";
const TestToken_Abi = TestToken_Json.abi;

// Exchange 
const Exchange_Json = require("../artifacts/contracts/Exchange.sol/Exchange.json");
const Exchange_Address = "0xaeBd6a4d7F3e6a221e094863ad82CC96aC175b00";
const Exchange_Abi = Exchange_Json.abi;
// AMM
const AMM_Json = require("../artifacts/contracts/AMM.sol/AMM.json");
const AMM_Address = "0x7B3FA1B861a5D1826CD50347E768B6a5950493a2";
const AMM_Abi = AMM_Json.abi;
//BetContract with AMM
const BetContract_Json = require("../artifacts/contracts/BetContract.sol/BetContract.json");
const BetContract_Address = "0x2147d52fA508270Ac71096f8b6e240A3832E6912";
const BetContract_Abi = BetContract_Json.abi;
const BetContract_bytecode = BetContract_Json.bytecode;
//ProtectedBetContract
const protectedBetContract_Json = require("../artifacts/contracts/ProtectedBetContract.sol/ProtectedBetContract.json");
const protectedBetContract_address= "0xC365414f0a3424FDA64B0E578812e430E85233e5";
const protectedBetContract_abi = protectedBetContract_Json.abi;
module.exports = {
       BetContract_Address,
       Exchange_Address,
       TestToken_Address,
       AMM_Address,
       protectedBetContract_address,

       BetContract_Abi,
       TestToken_Abi,
       Exchange_Abi,
       AMM_Abi,
       protectedBetContract_abi,

       BetContract_bytecode,  
};