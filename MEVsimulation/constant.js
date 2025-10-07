
// TestToken
const TestToken_Json = require("../artifacts/contracts/TestToken.sol/TestToken.json");
const TestToken_Address = "0xd66c9B9512ecfcFC79041D8eF71Fc6f7E0a549E7"; //put here the new deployed address 
const TestToken_Abi = TestToken_Json.abi;
// Exchange 
const Exchange_Json = require("../artifacts/contracts/Exchange.sol/Exchange.json");
const Exchange_Address = "0xaeBd6a4d7F3e6a221e094863ad82CC96aC175b00"; //put here the new deployed address 
const Exchange_Abi = Exchange_Json.abi;
// AMM
const AMM_Json = require("../artifacts/contracts/AMM.sol/AMM.json");
const AMM_Address = "0x49c8b763C1EDD2121932F0900dd904BDA1CE0083"; //put here the new deployed address 
const AMM_Abi = AMM_Json.abi;
//BetContract with AMM
const BetContract_Json = require("../artifacts/contracts/BetContract.sol/BetContract.json");
const BetContract_Address = "0x89d255E4318401b3A1fb993aBe15e11E7Cc64F44";//"0x02CaCBA3C1066370854496Eb71F05F442B6f75B4"; //put here the new deployed address 
const BetContract_Abi = BetContract_Json.abi;
const BetContract_bytecode = BetContract_Json.bytecode;
//ProtectedBetContract
const protectedBetContract_Json = require("../artifacts/contracts/ProtectedBetContract.sol/ProtectedBetContract.json");
const protectedBetContract_address= "0xC18cd80BB2e09a52642B5eDaE31829AF16e6c483"; //"0x17C96be2EfC274E9B5026C5082DD71c8cf39A365"; //put here the new deployed address 
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