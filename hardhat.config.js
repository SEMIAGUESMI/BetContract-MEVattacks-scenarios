require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: __dirname + "/.env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
     // url:"https://eth-sepolia.g.alchemy.com/v2/cT304C27XrPf95sj_WtOe",
     url:`https://eth-sepolia.g.alchemy.com/v2/${process.env.API_KEY}`,
      accounts:["ac7683e8b4c780d324770bfadef3b37e223e55169e455726c941b27ed5b59c40"],
      chainId: 11155111,
    }
  }
};
