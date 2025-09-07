// alchemy-transaction-service.js
// Off-chain data provider service using Alchemy API
// This service acts as the external data provider in the MEV protection architecture

const express = require('express');
const axios = require('axios');
const app = express();

// Configuration
const config = {
    alchemyApiKey: process.env.ALCHEMY_API_KEY,
    alchemyBaseUrl: process.env.ALCHEMY_BASE_URL,
    port: process.env.PORT || 3000,
    chainlinkNodeUrl: process.env.CHAINLINK_NODE_URL
};

app.use(express.json());

/**
 * Main endpoint called by Chainlink oracle
 * Gets transaction history for MEV detection
 */
app.post('/getBackRunningTransaction', async (req, res) => {
    try {
        const { fromBlock, toBlock, fromAddress, toAddress } = req.body;
        
        // Validate required parameters
        if (!fromBlock || !toBlock || !fromAddress || !toAddress) {
            return res.status(400).json({
                error: 'Missing required parameters: fromBlock, toBlock, fromAddress, toAddress'
            });
        }

        console.log(`Checking transactions from ${fromAddress} to ${toAddress} between blocks ${fromBlock}-${toBlock}`);

        // Get transaction history using Alchemy API
        const transactions = await getPlayerTransactions(fromAddress, toAddress, fromBlock, toBlock);
        
        // Check if any MEV transactions found
        const hasMEVTransactions = transactions.length > 0;
        
        // Format response for Chainlink oracle
        const response = {
            hasMEVTransactions,
            transactionCount: transactions.length,
            transactions: transactions.map(tx => ({
                hash: tx.hash,
                blockNumber: tx.blockNumber,
                from: tx.from,
                to: tx.to,
                value: tx.value,
                gasUsed: tx.gasUsed
            })),
            timestamp: new Date().toISOString()
        };

        console.log(`MEV Check Result: ${hasMEVTransactions ? 'DETECTED' : 'CLEAN'} - ${transactions.length} transactions found`);
        
        res.json(response);

    } catch (error) {
        console.error('Error processing transaction check:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

/**
 * Get transactions from a specific address to a target address within block range
 */
async function getPlayerTransactions(fromAddress, toAddress, fromBlock, toBlock) {
    try {
        // Convert block numbers to hex if they're not already
        const fromBlockHex = typeof fromBlock === 'string' && fromBlock !== 'latest' 
            ? `0x${parseInt(fromBlock).toString(16)}` 
            : fromBlock;
        const toBlockHex = typeof toBlock === 'string' && toBlock !== 'latest' 
            ? `0x${parseInt(toBlock).toString(16)}` 
            : toBlock;

        // Use Alchemy's getAssetTransfers method for comprehensive transaction data
        const transfers = await getAssetTransfers(fromAddress, toAddress, fromBlockHex, toBlockHex);
        
        
        // Combine and deduplicate results
        const allTransactions = [...transfers, ...regularTransactions];
        const uniqueTransactions = removeDuplicateTransactions(allTransactions);
        
        return uniqueTransactions;

    } catch (error) {
        console.error('Error fetching player transactions:', error);
        throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
}

/**
 * Get asset transfers using Alchemy's getAssetTransfers method
 */
async function getAssetTransfers(fromAddress, toAddress, fromBlock, toBlock) {
    const url = `${config.alchemyBaseUrl}${config.alchemyApiKey}`;
    
    try {
        const response = await axios.post(url, {
            jsonrpc: '2.0',
            id: 1,
            method: 'alchemy_getAssetTransfers',
            params: [{
                fromBlock: fromBlock,
                toBlock: toBlock,
                fromAddress: fromAddress.toLowerCase(),
                toAddress: toAddress.toLowerCase(),
                category: ['external', 'internal', 'erc20', 'erc721', 'erc1155'],
                withMetadata: true,
                excludeZeroValue: false,
                maxCount: '0x3e8' // 1000 transactions max
            }]
        });

        if (response.data.error) {
            throw new Error(`Alchemy API error: ${response.data.error.message}`);
        }

        return response.data.result.transfers || [];

    } catch (error) {
        console.error('Error in getAssetTransfers:', error);
        throw error;
    }
}
// Start server
app.listen(config.port, () => {
    console.log(`MEV Transaction Monitor Service running on port ${config.port}`);
    console.log(`Alchemy API configured: ${!!config.alchemyApiKey}`);
    console.log(`Base URL: ${config.alchemyBaseUrl}`);
});

module.exports = app;