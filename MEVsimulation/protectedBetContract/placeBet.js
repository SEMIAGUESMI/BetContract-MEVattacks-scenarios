// ********** Step 1: Player places bet */
const {
  protectedBetContract_address,
  ProtectedBetContract,
  player,
  alchemyProvider,
} = require("./../beforeEach.js");
const { transaction_receipt } = require("../../scripts/transaction_receipt.js");

(async () => {
  //state before executing placeBet function
  const Bet_amount = await alchemyProvider.getBalance(protectedBetContract_address);
  player_wallet_1 = await alchemyProvider.getBalance(player.address);
  protectedBetContract_wallet_1 = await alchemyProvider.getBalance(protectedBetContract_address);

  //execute placeBet function
  const transaction = await ProtectedBetContract.placeBet({ value: Bet_amount });
  await transaction.wait();
  const receipt = await alchemyProvider.getTransactionReceipt(transaction.hash);

  //state before executing placeBet function
  player_wallet_2 = await alchemyProvider.getBalance(player.address);
  protectedBetContract_wallet_2 = await alchemyProvider.getBalance(protectedBetContract_address);

  // logs in a table
  console.table([
    {
      Contract: "ProtectedBet.sol",
      "Contract Address": protectedBetContract_address,
      "Transaction Hash": transaction.hash,
      Function: "placeBet",
    },
  ]);
  console.log(" • State before executing place Bet function");
  console.table([
    {
      "Player wallet": `${ethers.formatUnits(player_wallet_1)} ETH`,
      "Bet Contract wallet": `${ethers.formatUnits(protectedBetContract_wallet_1)} ETH`,
    },
  ]);
  console.table([
    {
      "amount to bet with ": `${ethers.formatUnits(Bet_amount)} ETH`,
    },
  ]);
  console.log(" • State after executing place Bet function");
  console.table([
    {
      "Player wallet": `${ethers.formatUnits(player_wallet_2)} ETH`,
      "Bet Contract wallet": `${ethers.formatUnits(protectedBetContract_wallet_2)} ETH`,
    },
  ]);

  //json output
  const outputJson = {
    initialState: {
      "Player wallet": `${ethers.formatUnits(player_wallet_1)} ETH`,
      "Bet Contract wallet": `${ethers.formatUnits(protectedBetContract_wallet_1)}`,
    },
    betAmount: {
      "amount to bet with": `${ethers.formatUnits(Bet_amount)} ETH`,
    },
    afterPlaceBet: {
      "Player wallet": `${ethers.formatUnits(player_wallet_2)} ETH`,
      "Bet Contract wallet": `${ethers.formatUnits(protectedBetContract_wallet_2)}`,
    },
  };

  console.log("JSON Output:", JSON.stringify(outputJson, null, 2));
  console.log(" • Transaction : ", transaction);

  // show gas consumption and transaction fee
  await transaction_receipt(transaction.hash, "placeBet", protectedBetContract_address );
})();
