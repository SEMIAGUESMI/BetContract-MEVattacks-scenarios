
const {
   
    AMM,
    TestToken_Address,
} = require ("../../test_all/beforeEach.js");

 (async () => {

            console.log("support exchange rate", await AMM.supportsExchange(TestToken_Address, ethers.ZeroAddress)) 
            console.log("tokenA ", await AMM.tokenA())
            console.log("tokenB ", await AMM.tokenB())

    


 })();