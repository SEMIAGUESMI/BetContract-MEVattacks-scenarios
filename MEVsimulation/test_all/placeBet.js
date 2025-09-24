// ********** Step 1: Player places bet */
const {
  BetContract_Address,
  signer,
  alchemyProvider,
  BetContract,
} = require("./beforeEach.js");
const { transaction_receipt } = require("../../scripts/transaction_receipt.js");

(async () => {
  //state before executing placeBet function

  const player = signer;
  const Bet_amount = await alchemyProvider.getBalance(BetContract_Address);
  player_wallet_1 = await alchemyProvider.getBalance(player.address);
  betContract_wallet_1 = await alchemyProvider.getBalance(BetContract_Address);

  //execute placeBet function
  const transaction = await BetContract.placeBet({ value: Bet_amount });
  await transaction.wait();
  const receipt = await alchemyProvider.getTransactionReceipt(transaction.hash);

  //state before executing placeBet function
  player_wallet_2 = await alchemyProvider.getBalance(player.address);
  betContract_wallet_2 = await alchemyProvider.getBalance(BetContract_Address);

  // logs in a table
  console.table([
    {
      Contract: "BetContract.sol",
      "Contract Address": BetContract_Address,
      "Transaction Hash": receipt.hash,
      Function: "placeBet",
    },
  ]);
  console.log(" • State before executing place Bet function");
  console.table([
    {
      "Player wallet": `${ethers.formatUnits(player_wallet_1)} ETH`,
      "Bet Contract wallet": `${ethers.formatUnits(betContract_wallet_1)} ETH`,
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
      "Bet Contract wallet": `${ethers.formatUnits(betContract_wallet_2)} ETH`,
    },
  ]);

  //json output
  const outputJson = {
    initialState: {
      "Player wallet": `${ethers.formatUnits(player_wallet_1)} ETH`,
      "Bet Contract wallet": `${ethers.formatUnits(betContract_wallet_1)}`,
    },
    betAmount: {
      "amount to bet with": `${ethers.formatUnits(Bet_amount)} ETH`,
    },
    afterPlaceBet: {
      "Player wallet": `${ethers.formatUnits(player_wallet_2)} ETH`,
      "Bet Contract wallet": `${ethers.formatUnits(betContract_wallet_2)}`,
    },
  };

  console.log("JSON Output:", JSON.stringify(outputJson, null, 2));
  console.log(" • Transaction : ", transaction);

  // show gas consumption and transaction fee
  await transaction_receipt(transaction.hash, "placeBet", BetContract_Address);
})();
