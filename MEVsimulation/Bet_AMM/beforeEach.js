//********* MEV Attack on AMM-based Bet Contract -- MEV ATTACK SIMULATION (AMM)  */
const { ethers } = require("ethers");

const { 
       BetContract_Address,
       TestToken_Address,
       AMM_Address,
       BetContract_Abi,
       TestToken_Abi,
       AMM_Abi } = require('../constant');

       const getEthereumContract = (address, abi, signer) => {
       const TransactionContract = new ethers.Contract(address, abi, signer);
       return TransactionContract
      }

    const alchemy = new ethers.AlchemyProvider("sepolia", { alchemy:process.env.API_KEY});

    const player = new ethers.Wallet(process.env.Player_PRIVATE_KEY, alchemy);
    const connectedWallet = player.connect(alchemy);
    const TestToken = getEthereumContract(TestToken_Address, TestToken_Abi, connectedWallet);
    const AMM = getEthereumContract(AMM_Address, AMM_Abi, connectedWallet);
    const BetContract = getEthereumContract(BetContract_Address, BetContract_Abi, connectedWallet);
    (async()=> {
        
console.log(process.env.API_KEY)

        
    })();
module.exports = {
    alchemy,
    player,
    TestToken,
    AMM,
    BetContract,
    BetContract_Address,

    TestToken_Address,
    AMM_Address,
    BetContract_Abi,
    TestToken_Abi,
    AMM_Abi
}