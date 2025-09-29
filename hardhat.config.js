require ( "@nomicfoundation/hardhat-toolbox");
require ("dotenv").config({ path: __dirname + "/.env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
    // url:"https://eth-sepolia.g.alchemy.com/v2/cT304C27XrPf95sj_WtOe",
     url:`https://eth-sepolia.g.alchemy.com/v2/${process.env.API_KEY}`,
      //accounts:["e9f47cd646e43e1c9bbce76659ad22c7ea19d5db9d1161519ecbbb617bddf372"],
      accounts: [`${process.env.SIGNER_PRIVATE_KEY}`],
      chainId: 11155111,
    }
  }
};
