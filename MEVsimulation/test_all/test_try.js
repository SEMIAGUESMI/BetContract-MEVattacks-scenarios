const { ethers } = require("ethers");
const { oracle_contract } = require("./beforeEach.js");

(async () => {
console.log("value3:", await oracle_contract.reserve());
  
const tx = await oracle_contract.requestVolumeData2();
await tx.wait();

console.log("value3:", await oracle_contract.reserve());
})();
