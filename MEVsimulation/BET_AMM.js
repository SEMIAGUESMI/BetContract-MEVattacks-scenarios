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
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
    const connectedWallet = signer.connect(alchemy);
    const TestToken = getEthereumContract(TestToken_Address, TestToken_Abi, connectedWallet);
    const AMM = getEthereumContract(AMM_Address, AMM_Abi, connectedWallet);
    const BetContract = getEthereumContract(BetContract_Address, BetContract_Abi, connectedWallet);

    console.log("TestToken  :  ", TestToken);
    console.log("AMM object  :  ", AMM);
    console.log("BetContract object  :  ", BetContract);

  
  })();