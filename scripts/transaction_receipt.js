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

  const ethPriceUSD = await getETHPriceUSD();
  // Calculate fee
  const txFeeETH = receipt2.gasUsed * receipt1.gasPrice;
  //contract address
  let contractAddress = contractAddress_;
  if (functionName == "deploy") {
    contractAddress = receipt2.contractAddress;
  }
  // Build JSON data
  const txData = {
    contractAddress: contractAddress,
    transactionHash: receipt1.hash,
    function: functionName,
    gas: {
      maxFeePerGas: {
        wei: receipt1.maxFeePerGas.toString(),
        usd: ethers.formatUnits(receipt1.maxFeePerGas) * ethPriceUSD,
      },
      maxPriorityFeePerGas: {
        wei: receipt1.maxPriorityFeePerGas.toString(),
        usd: ethers.formatUnits(receipt1.maxPriorityFeePerGas) * ethPriceUSD,
      },
      gasLimit: receipt1.gasLimit.toString(),
      gasUsed: receipt2.gasUsed.toString(),
      gasPrice: {
        wei: receipt1.gasPrice.toString(),
        usd: ethers.formatUnits(receipt1.gasPrice) * ethPriceUSD,
      },
    },
    transactionFee: {
      wei: txFeeETH.toString(),
      usd: ethers.formatUnits(txFeeETH) * ethPriceUSD,
    },
  };

  console.table([
    {
      "Contract Address": contractAddress,
      "Transaction Hash": receipt1.hash,
      Function: functionName,
    },
  ]);

  console.table([
    {
      "Max fee per gas": `${receipt1.maxFeePerGas.toString()} wei ($${
        ethers.formatUnits(receipt1.maxFeePerGas) * ethPriceUSD
      } USD)`,
      "Max priority fee per gas": `${receipt1.maxPriorityFeePerGas.toString()} wei ($${
        ethers.formatUnits(receipt1.maxPriorityFeePerGas) * ethPriceUSD
      } USD)`,
    },
  ]);

  console.table([
    {
      "Gas limit": receipt1.gasLimit.toString(),
      "Gas used": receipt2.gasUsed.toString(),
      "Gas price": `${receipt1.gasPrice.toString()} wei ($${
        ethers.formatUnits(receipt1.gasPrice) * ethPriceUSD
      } USD)`,
    },
  ]);

  console.table([
    {
      "Transaction fee": `${txFeeETH.toString()} wei ($${
        ethers.formatUnits(txFeeETH) * ethPriceUSD
      } USD)`,
    },
  ]);

  // Output JSON
  console.log("📊 JSON Output:");
  console.log(JSON.stringify(txData, null, 2));

  return txData;
}

module.exports = { transaction_receipt };
