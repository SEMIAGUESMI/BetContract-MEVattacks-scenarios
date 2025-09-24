import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const ALCHEMY_URL =
  "https://eth-sepolia.g.alchemy.com/v2/cT304C27XrPf95sj_WtOe";

// API endpoint: get transfers from one address to another within block range
app.get("/txs", async (req, res) => {
  try {
    const { from, to, startBlock } = req.query;

    if (!from || !to || !startBlock) {
      return res
        .status(400)
        .json({ error: "Missing query params: from, to, startBlock" });
    }

    // Get latest block number
    const latestBlockData = await axios.post(ALCHEMY_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_blockNumber",
      params: [],
    });
    const latestBlock = latestBlockData.data.result; // hex string, fine as-is

    // Call alchemy_getAssetTransfers
    const { data } = await axios.post(ALCHEMY_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "alchemy_getAssetTransfers",
      params: [
        {
          fromBlock: "0x" + Number(startBlock).toString(16),
          toBlock: latestBlock,
          fromAddress: from,
          toAddress: to,
          category: ["external", "erc20", "erc721", "erc1155"], // choose what you want
          withMetadata: true, // adds blockTimestamp etc
        },
      ],
    });

    res.json(data.result.transfers);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

// http://localhost:3000/txs?from=0xEcBdA29a86b46e80402ef68aE0f15c9d3785FDF5&to=0x7B3FA1B861a5D1826CD50347E768B6a5950493a2&startBlock=9268558
