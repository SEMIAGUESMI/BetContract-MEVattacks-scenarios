const axios = require("axios");
const { ethers } = require("hardhat");

const { alchemyProvider } = require("../MEVsimulation/beforeEach.js");
const { formatEther } = require("ethers");

async function getETHPriceUSD() {
  try {
    const response = await axios.get(
      "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
    );
    return Number(response.data.data.rates.USD);
  } catch (error) {
    console.log("⚠️ Could not fetch ETH price:", error.message);
    return 3500;
  }
}
async function transaction_receipt(txHash, functionName, contractAddress_) {
 const receipt1 = await alchemyProvider.getTransaction(txHash);
  const receipt2 = await alchemyProvider.getTransactionReceipt(txHash);

  //prices
  const  price =await getETHPriceUSD();
  //fixed prices
  const GweiToDollar  = 0.008446194817; // price of GWEI / dollar in 6 october 2025 09:52
  const WeiToDollar = 0.000000000000004518; // price of GWEI / dollar in 6 october 2025 10:15
  const gas_price = 1000079 //Gwei 

  // Calculate fee
  const txFeeETH = receipt2.gasUsed * receipt1.gasPrice;
  //contract address
  let contractAddress = contractAddress_;
  if (functionName == "deploy") {
    contractAddress = receipt2.contractAddress;
  }
  console.log("• Transaction receipt fields: ")
  console.table([
    {
      "Contract Address": contractAddress,
      "Transaction Hash": receipt1.hash,
      Function: functionName,
    },
  ]);
  
console.table([
    {
      "Gas limit": receipt1.gasLimit.toString(),
      "Gas used": receipt2.gasUsed.toString(),
      "Gas price": `${receipt1.gasPrice.toString()} Wei` 
    },
  ]);
  console.table([
    {
      "Max fee per gas": `${receipt1.maxFeePerGas.toString()} Wei`,
      "Max priority fee per gas": `${receipt1.maxPriorityFeePerGas.toString()} Wei`,
       "Transaction fee": `${txFeeETH.toString()} Wei ($${
        (Number(txFeeETH) * WeiToDollar).toFixed(18)
      } USD)`,
    },
  ]); 
  console.log("• fixed gas price for fair comarison ")
  console.table([
    {
     "gas used": receipt2.gasUsed.toString(),
     "gas price (wei)" : `$${gas_price.toString()} Wei `,
     "gas price (Wei/USD)" : `$${WeiToDollar.toFixed(18)}`,
     "Totale gas used fee " : `$${((Number(receipt2.gasUsed)*gas_price)*WeiToDollar).toFixed(10)} `,
     
    },
  ]);

// Build JSON data
  const txData = {
    contractAddress: contractAddress,
    transactionHash: receipt1.hash,
    function: functionName,
    gas: {
      maxFeePerGas: receipt1.maxFeePerGas.toString(),
      maxPriorityFeePerGas: receipt1.maxPriorityFeePerGas.toString(),
      gasLimit: receipt1.gasLimit.toString(),
      gasUsed: receipt2.gasUsed.toString(),
      gasPrice: receipt1.gasPrice.toString()},
    transactionFee: {
      wei: txFeeETH.toString(),
      usd: (Number(txFeeETH) * WeiToDollar).toFixed(18),
    },
    fixed_gas_price :{
      gas_used: receipt2.gasUsed.toString(),
     gas_price_wei : gas_price.toString(),
     gas_price_Wei_to_USD : WeiToDollar.toFixed(18),
     Totale_gas_used_fee : ((Number(receipt2.gasUsed)*gas_price)*WeiToDollar).toFixed(4)
    }
    }
  // Output JSON
  console.log("📊 JSON Output:");
  console.log(JSON.stringify(txData, null, 2));
  return txData;
}
module.exports = { transaction_receipt };
