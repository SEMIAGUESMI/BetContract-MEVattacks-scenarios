const { ethers } = require("hardhat");
const {
  BetContract_Address,
  BetContract
} = require("../beforeEach.js");

(async()=> {
    const owner = await BetContract.owner();
    const rateContract= await BetContract.rateContract();
    const token = await BetContract.token();
    const betRate = await BetContract.betRate();
    const deadline = await BetContract.deadline();
    const betWallet= await BetContract.betWallet();
    const initialPot= await BetContract.initialPot();
    const currentPlayer= await BetContract.currentPlayer();
    const playerBet= await BetContract.playerBet();

console.table([
    {
        "contract address": BetContract_Address,
        owner: owner,
        betWallet: ethers.formatUnits(betWallet)+ " ETH"
    }
]);
console.table([
    {
        "rateContract": rateContract,
        token: token,
    }
]);
console.table([
    {
        betRate: ethers.formatUnits(betRate),
        deadline: deadline,
        initialPot:ethers.formatUnits(initialPot) + " ETH",
    }
]);
console.table([
    {
        currentPlayer: currentPlayer,
        playerBet: ethers.formatUnits(playerBet) + " ETH",
    }
]);
})();