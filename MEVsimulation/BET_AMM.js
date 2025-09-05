//********* MEV Attack on AMM-based Bet Contract -- MEV ATTACK SIMULATION (AMM)  */
const { 
       BetContract_Address,
       TestToken_Address,
       AMM_Address,
       BetContract_Abi,
       TestToken_Abi,
       AMM_Abi } = require('./constant');

       const getEthereumContract = (address, abi, signer) => {
       const TransactionContract = new ethers.Contract(address, abi, signer);
       return TransactionContract
      }
 (async () => {

    const alchemy = ethers.getDefaultProvider('sepolia', { alchemy: process.env.API_KEY });
    const player = new ethers.Wallet(process.env.Player_PRIVATE_KEY);
    const connectedWallet = player.connect(alchemy);
    const TestToken = getEthereumContract(TestToken_Address, TestToken_Abi, connectedWallet);
    const AMM = getEthereumContract(AMM_Address, AMM_Abi, connectedWallet);
    const BetContract = getEthereumContract(BetContract_Address, BetContract_Abi, connectedWallet);
    //console.log("TestToken  :  ", TestToken);
    //console.log("AMM object  :  ", AMM);
    //console.log("BetContract object  :  ", BetContract);

  // Step 1: Player places bet
  const Bet_amount = await alchemy.getBalance(BetContract_Address)
  console.log(Bet_amount);
  console.log("player wallet before placing Bet", ethers.formatUnits(await alchemy.getBalance(player.address)) )
  const placeBet_transaction = await BetContract.placeBet({value: Bet_amount});
  await placeBet_transaction.wait()
  console.log("player wallet affter placing Bet", ethers.formatUnits(await alchemy.getBalance(player.address)) )
  console.log("BetContract wallet after placing Bet", ethers.formatUnits(await alchemy.getBalance(BetContract_Address)) )
  console.log(placeBet_transaction);



  // Step 2: Player swaps in AMM 

  // Step 3: Player claims Win 


  
  })();