const axios = require("axios");
const {ethers} = require ("hardhat")

const {
    alchemyProvider,
} = require ("../MEVsimulation/test_all/beforeEach.js");
const { formatEther } = require("ethers");

async function getETHPriceUSD() {
    try {
        const response = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=ETH');
        return Number(response.data.data.rates.USD);
    } catch (error) {
        console.log("⚠️ Could not fetch ETH price:", error.message);
        return 3500;
    }
} 
async function transaction_receipt(txHash, estimatedGas){
   //const txHash = "0x2171049b354830cfb4508b3261e81d85ccd5d0a156b44256c4a43aa706c8e952";
   const receipt1 = await alchemyProvider.getTransaction(txHash);
   const receipt2 = await alchemyProvider.getTransactionReceipt(txHash);
   const ethPriceUSD = await getETHPriceUSD();

   console.table([
     { 
        "Contract Address": receipt2.contractAddress, 
        "Transaction Hash": receipt1.hash,
        "Function": "deploy",
     }
   ]);

   console.table([
     {  
        "Max fee per gas": `${receipt1.maxFeePerGas.toString()} wei (~$${(ethers.formatUnits(receipt1.maxFeePerGas) * ethPriceUSD)} USD)`,
        "Max priority fee per gas": `${receipt1.maxPriorityFeePerGas.toString()} wei (~$${(ethers.formatUnits(receipt1.maxPriorityFeePerGas) * ethPriceUSD)} USD)`
     }
   ]);

   console.table([
     {  
        "Estimated gas": estimatedGas.toString(),
        "Gas limit": receipt1.gasLimit.toString(),
        "Gas used": receipt2.gasUsed.toString(),
        "Gas price": `${receipt1.gasPrice.toString()} wei (~$${(ethers.formatUnits(receipt1.gasPrice) * ethPriceUSD)}/ USD)`
     }
   ]);

   const txFeeETH = (receipt2.gasUsed * receipt1.gasPrice);
   console.table([
     {  
        "Transaction fee": `${(receipt2.gasUsed * receipt1.gasPrice).toString()} wei (~$${ethers.formatUnits(txFeeETH )* ethPriceUSD} USD)`
     }
   ]);

}

module.exports = {transaction_receipt}
