//Chainlink adapter - node.js API 

import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json()); 

const PORT = process.env.PORT || 8080;
const ALCHEMY_URL ="https://eth-sepolia.g.alchemy.com/v2/cT304C27XrPf95sj_WtOe";

// converts hex blockNum like "0x8d6d4e" to number
const hexToNumber = (hex) => parseInt(hex, 16);

// transfer mapping
function mapTransfer(tx) {
  return {
    blockNumber: hexToNumber(tx.blockNum),
    txHash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    asset: tx.asset,
    category: tx.category,
    timestamp: tx.metadata?.blockTimestamp ?? null,
  };
}

// Call alchemy_getAssetTransfers
async function fetchAllTransfers({ fromAddress, toAddress, fromBlockHex, toBlockHex, categories }) {
  let transfers = [];
  let pageKey = undefined;

  do {
    const paramsObj = {
      fromBlock: fromBlockHex,
      toBlock: toBlockHex,
      fromAddress,
      toAddress,
      category: categories || ["external", "erc20", "erc721", "erc1155"],
      withMetadata: true,
    };
    if (pageKey) paramsObj.pageKey = pageKey;

    const resp = await axios.post(ALCHEMY_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "alchemy_getAssetTransfers",
      params: [paramsObj],
    });

    const result = resp.data.result;
    if (!result) break;

    transfers.push(...(result.transfers || []));
    pageKey = result.pageKey;
  } while (pageKey);

  return transfers;
}

// Main adapter endpoint: Chainlink - POST
app.post("/", async (req, res) => {
  try {
    const payload = req.body?.data ?? req.body ?? req.query;
    const from = payload.from || payload.fromAddress;
    const to = payload.to || payload.toAddress;
    const startBlock = payload.startBlock ?? payload.fromBlock ?? null;
    const categories = payload.category || payload.categories;
    if (!from || !to || !startBlock) {
      const jobRunID = req.body?.id ?? null;
      return res.status(400).json({
        jobRunID,
        status: "errored",
        error: "Missing params. Required: from, to, startBlock"
      });
    }
    // convert startBlock to hex, get latest block
    const fromBlockHex = "0x" + Number(startBlock).toString(16);

    const latestBlockResp = await axios.post(ALCHEMY_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_blockNumber",
      params: [],
    });
    const toBlockHex = latestBlockResp.data.result;

    const rawTransfers = await fetchAllTransfers({
      fromAddress: from,
      toAddress: to,
      fromBlockHex,
      toBlockHex,
      categories,
    });

    const mapped = rawTransfers.map(mapTransfer);

    const jobRunID = req.body?.id ?? null;
    const response = {
      jobRunID,
      data: {
        count: mapped.length,
        transfers: mapped
      },
      result: {
        count: mapped.length
      },
      statusCode: 200
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Adapter error:", err.response?.data || err.message || err);
    const jobRunID = req.body?.id ?? null;
    res.status(500).json({
      jobRunID,
      status: "errored",
      error: err.response?.data ?? err.message ?? "unknown error"
    });
  }
});

//GET endpoint for quick testing:
app.get("/txs", async (req, res) => {
  try {
    const { from, to, startBlock } = req.query;
    if (!from || !to || !startBlock) return res.status(400).send("Missing params: from,to,startBlock");

    const fromBlockHex = "0x" + Number(startBlock).toString(16);
    const latestBlockResp = await axios.post(ALCHEMY_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_blockNumber",
      params: [],
    });
    const toBlockHex = latestBlockResp.data.result;

    const rawTransfers = await fetchAllTransfers({
      fromAddress: from,
      toAddress: to,
      fromBlockHex,
      toBlockHex,
    });

    const mapped = rawTransfers.map(mapTransfer);

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(mapped, null, 2)); 
  } catch (err) {
    console.error(err);
    res.status(500).send(String(err));
  }
});

app.listen(PORT, () => {
  console.log(`✅ Chainlink adapter running on http://localhost:${PORT}`);
});

// http://localhost:8080/txs?from=0xEcBdA29a86b46e80402ef68aE0f15c9d3785FDF5&to=0x7B3FA1B861a5D1826CD50347E768B6a5950493a2&startBlock=9268558
/*curl -X POST http://localhost:8080/ \
  -H "Content-Type: application/json" \
  -d '{
        "id": "1",
        "data": {
          "from": "0xEcBdA29a86b46e80402ef68aE0f15c9d3785FDF5",
          "to": "0x7B3FA1B861a5D1826CD50347E768B6a5950493a2",
          "startBlock": 9268558
        }
      }'
*/