# Noninterference in Smart Contracts: MEV Detection and Protection

A research implementation demonstrating formal verification methods for detecting and mitigating Maximal Extractable Value (MEV) attacks in smart contracts using noninterference theory and unwinding conditions.

## 🔬 Research Overview

This project implements the methodology described in the paper "Noninterference in Smart Contracts: MEV Detection and Protection", which explores how formal verification methods—particularly noninterference based on unwinding conditions—can be applied to detect and localize MEV vulnerabilities in DeFi smart contracts. As a case study, we analyze a betting service contract by first modeling it in a concurrent imperative language to illustrate how MEV attack scenarios unfold, and then implementing the vulnerable contract and its dependencies in Solidity with tests that allow users to reproduce and observe these attacks in practice. Building on the insights from this analysis, we design and implement a protection layer using chainlink oracle, extend the betting contract with this verification mechanism, and demonstrate through testing how the improved version successfully restricts MEV opportunities compared to the original vulnerable implementation.

## Key Contributions

- **Formal MEV Analysis**: Applies unwinding conditions to systematically detect and explain potential MEV exploit paths in smart contracts.
- **Bet Contract Case Study**: Demonstrates MEV vulnerabilities in a betting contract interacting with AMM and Exchange rate contracts.
- **Oracle-based Protection**: Implements Chainlink oracles to mitigate MEV opportunities.
- **Downgrading Mechanism**: Allows controlled information flows in specific scenarios.

## 📁 Project Structure

```
BetContract-MEVattacks-scenarios/
├── /MEVsimulation
│   ├── AMM/
│   |    ├── addInitialLiquidity.js  
|   |    ├── swap_eth_to_test.js 
|   |    └── swap_test_to_eth.js  
|   ├── betContract/  
|   |    ├── claimWin.js  
|   |    ├── get_bet_state.js 
|   |    └── placeBet.js  
|   ├── protectedBetContract/  
|   |    ├── claimWin.js 
|   |    ├── get_protectBet_state.js 
|   |    └── placeBet.js
|   ├── beforeEach.js      
|   └── constant.js
├── contracts/
│   ├── interfaces/
|   |     └── IRateContract.sol   
|   ├── AMM.sol                 
│   ├── BetContract.sol         
│   ├── Exchange.sol           
│   ├── ProtectedBetContract               
|   └── testToken.sol          
├── scripts/
│   ├── deploy_AMM.js              
│   ├── deploy_BetContract.js 
|   ├── deploy_Exchange.js
|   ├── deploy_TestToken.js
|   ├── deploy_potectedBetContract.js             
│   └── transaction_receipt.js               
├── test/
│   ├── AMM.js             
│   ├── Bet.js 
|   ├── Exchange.js        
│   └── testToken.js         
├── README.md
├── hardhat.config.js
├── package-lock.json
├── package.json
└── trace_execution.js
```
## 🚀 Installation

### 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **[Node.js](https://nodejs.org/en)** (v22.19.0 or higher)  
- **[Hardhat](https://hardhat.org)** (v2.26.3 or higher) Development environment for compiling, testing, and deploying smart contracts.  
- **Ethereum Wallet (e.g., [MetaMask](https://metamask.io/en-GB))** Used to manage accounts and interact with deployed contracts.  **Note:** To test this repository, you will need **two accounts**: one for the deployer (owner) and one for the player. Make sure to create both accounts in your MetaMask wallet.
- **Ethereum RPC Provider (e.g., [Alchemy](https://www.alchemy.com) or [Infura](https://www.infura.io))** Provides an RPC endpoint (API key + URL) to connect your project to the Ethereum blockchain (testnet or mainnet). You’ll need to create a free account with one of these providers to obtain an API key.
- **Testnet Faucets**: Fund your wallet with testnet ether. For example, for the Sepolia testnet, you can use this faucet: [Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia).

### Setup Instructions
#### 1. Clone the Repository
```bash
git clone https://github.com/SEMIAGUESMI/BetContract-MEVattacks-scenarios.git
cd BetContract-MEVattacks-scenarios 
```
#### 2. Install Dependencies
Install all required Node.js packages:
```bash
npm install
```   
#### 3. Configure Environment Variables
Create a .env file in the root directory of the project:
```bash
touch .env
```
Add the following environment variables to your .env file:

```env
#Alchemy API Key
API_KEY=your_alchemy_api_key_here

#Your Ethereum RPC URL (Alchemy Sepolia endpoint)
API_URL=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_api_key_here

#Private key of the deployer account (from MetaMask)
DEPLOYER_PRIVATE_KEY=your_deployer_private_key_here

#Private key of the player account (from MetaMask)
Player_PRIVATE_KEY=your_player_private_key_her

⚠️ **Security Warning:** Never commit your `.env` file to version control. 
Ensure that `.env` is listed in your `.gitignore` file.
```
## ⚡ Usage

### 1. Compile Smart Contracts
   Compile the Solidity smart contracts:  
   ```bash
   npx hardhat compile
   ```
This will compile all contracts in the contracts/ directory.
### 2. Deploy Contracts
Deploy the contracts to your chosen network (local or testnet):

For local development (Hardhat Network):
```bash
npx hardhat node
```
In a separate terminal, deploy:

```bash 
npx hardhat run scripts/deploy_TestToken.js --network localhost
npx hardhat run scripts/deploy_AMM.js --network localhost
npx hardhat run scripts/deploy_Exchange.js --network localhost
npx hardhat run scripts/deploy_BetContract.js --network localhost
npx hardhat run scripts/deploy_protectedBetContract.js --network localhost
```
For Sepolia testnet:
```bash
npx hardhat run scripts/deploy_TestToken.js --network sepolia
npx hardhat run scripts/deploy_AMM.js --network sepolia
npx hardhat run scripts/deploy_Exchange.js --network sepolia
npx hardhat run scripts/deploy_BetContract.js --network sepolia
npx hardhat run scripts/deploy_protectedBetContract.js --network sepolia
```
**⚠️ Note:** Deploy the contracts in the following order:  

1. **TestToken.sol** – required first, as its address is needed by other contracts.  
2. **AMM.sol** and **Exchange.sol** – both require the deployed **TestToken** address as a constructor parameter.  
3. **BetContract.sol** and **ProtectedBetContract.sol** – both require the deployed **AMM** and **TestToken** addresses  as a constructor parameters.  

After each deployment, make sure to **update the `MEVSimulation/constants.js` file** with the new contract addresses.


