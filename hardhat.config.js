require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url:"https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY",
      accounts: ["YOUR PRIVATE KEY"],
      chainId: 11155111,
    }
  }
};
