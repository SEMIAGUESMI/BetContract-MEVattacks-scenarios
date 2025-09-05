
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
const AMM_Address = "0xA464A947813975627A02b43Ced597A18C5497776";
const AMM_Abi = AMM_Json.abi;
//BetContract with AMM
const BetContract_Json = require("../artifacts/contracts/BetContract.sol/BetContract.json");
const BetContract_Address = "0xA5f9931D095e7b9F8e363a0Ca99EA65072267b4f";
const BetContract_Abi = BetContract_Json.abi;
module.exports = {

       BetContract_Address,
       Exchange_Address,
       TestToken_Address,
       AMM_Address,

       BetContract_Abi,
       TestToken_Abi,
       Exchange_Abi,
       AMM_Abi
};