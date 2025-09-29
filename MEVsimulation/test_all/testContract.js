// ********** Step 1: Player places bet */
const {
  TestConract,
  testContract_address
} = require("./beforeEach.js");

(async () => {
  console.log("volume : ", await TestConract.volume())
  console.log("reserve : ", await TestConract.reserve())
  console.log("player : ", await TestConract.player())
  console.log("player : ", await TestConract.rateContract())
   //const transaction = await TestConract.claimWin();
  //await transaction.wait();
 //console.log(transaction)
})();
