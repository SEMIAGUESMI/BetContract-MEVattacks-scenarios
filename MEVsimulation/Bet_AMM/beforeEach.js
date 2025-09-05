//********* MEV Attack on AMM-based Bet Contract -- MEV ATTACK SIMULATION (AMM)  */
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
    const alchemy = ethers.getDefaultProvider('sepolia', { alchemy: process.env.API_KEY });
    const player = new ethers.Wallet(process.env.Player_PRIVATE_KEY);
    const connectedWallet = player.connect(alchemy);
    const TestToken = getEthereumContract(TestToken_Address, TestToken_Abi, connectedWallet);
    const AMM = getEthereumContract(AMM_Address, AMM_Abi, connectedWallet);
    const BetContract = getEthereumContract(BetContract_Address, BetContract_Abi, connectedWallet);
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