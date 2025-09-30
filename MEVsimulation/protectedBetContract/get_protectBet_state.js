const { ethers } = require("hardhat");
const {
  ProtectedBetContract,
  protectedBetContract_address,
} = require("../beforeEach.js");

(async () => {
  const owner = await ProtectedBetContract.owner();
  const rateContract = await ProtectedBetContract.rateContract();
  const token = await ProtectedBetContract.token();
  const betRate = await ProtectedBetContract.betRate();
  const deadline = await ProtectedBetContract.deadline();
  const betWallet = await ProtectedBetContract.betWallet();
  const initialPot = await ProtectedBetContract.initialPot();
  const currentPlayer = await ProtectedBetContract.currentPlayer();
  const playerBet = await ProtectedBetContract.playerBet();
  const playerBetBlock=  await ProtectedBetContract.playerBetBlock();

  console.table([
    {
      "contract address": protectedBetContract_address,
      owner: owner,
      betWallet: ethers.formatUnits(betWallet) + " ETH",
    },
  ]);
  console.table([
    {
      rateContract: rateContract,
      token: token,
    },
  ]);
  console.table([
    {
      betRate: ethers.formatUnits(betRate),
      deadline: deadline,
      initialPot: ethers.formatUnits(initialPot) + " ETH",
    },
  ]);
  console.table([
    {
      currentPlayer: currentPlayer,
      playerBet: ethers.formatUnits(playerBet) + " ETH",
    },
  ]);
  console.table([
    {
      playerBetBlock: playerBetBlock,
      "API URL": `https://alchemy-api.onrender.com/?from=`+currentPlayer+"&to="+rateContract+"&startBlock="+playerBetBlock,
    },
  ]);
})();
