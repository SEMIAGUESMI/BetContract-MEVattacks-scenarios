// ********** Step 1: Player places bet */
const {
   protectedBetContract_address,
  ProtectedBetContract,
  alchemyProvider,
  deployer,
} = require("../beforeEach.js");
const { transaction_receipt } = require("../../scripts/transaction_receipt.js");

(async () => {
  //state before executing placeBet function

  const Bet_wallet_1 = await alchemyProvider.getBalance(protectedBetContract_address);
  const owner_wallet_1 = await alchemyProvider.getBalance(deployer.address);
  const deadline = await ProtectedBetContract.deadline();
  console.log(deadline);
  // Get current timestamp in seconds
  const now = Math.floor(Date.now() / 1000);
  console.log(now);
  // Convert contract deadline to number for comparison
  const deadlineValue = Number(deadline);
  // check deadline if it is expired
  const isExpired = now > deadlineValue;
  console.log(`Is expired: ${isExpired}`);

  //execute placeBet function
  const transaction = await ProtectedBetContract.closeBet();
  await transaction.wait();
  const receipt = await alchemyProvider.getTransactionReceipt(transaction.hash);

  //state before executing placeBet function
   const Bet_wallet_2 = await alchemyProvider.getBalance(protectedBetContract_address);
  const owner_wallet_2 = await alchemyProvider.getBalance(deployer.address);

  // logs in a table
  console.table([
    {
      Contract: "BetContract.sol",
      "Contract Address": protectedBetContract_address,
      "Transaction Hash": receipt.hash,
      Function: "closeBet",
    },
  ]);
  console.log(" • State before executing place Bet function");
  console.table([
    {
      "owner wallet": `${ethers.formatUnits(owner_wallet_1)} ETH`,
      "Bet Contract wallet": `${ethers.formatUnits(Bet_wallet_1)} ETH`,
    },
  ]);
 
  console.log(" • State after executing place Bet function");
  console.table([
    {
      "owner wallet": `${ethers.formatUnits(owner_wallet_2)} ETH`,
      "Bet Contract wallet": `${ethers.formatUnits(Bet_wallet_2)} ETH`,
    },
  ]);

   console.log(" • Transaction : ", transaction);

  // show gas consumption and transaction fee
  await transaction_receipt(transaction.hash, "closeBet", protectedBetContract_address);
})();
