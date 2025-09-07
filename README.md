# Noninterference in Smart Contracts: MEV Detection and Protection

A research implementation demonstrating formal verification methods for detecting and mitigating Maximal Extractable Value (MEV) attacks in smart contracts using noninterference theory and unwinding conditions.

## 🔬 Research Overview

This project implements the methodology described in the paper "Noninterference in Smart Contracts: MEV Detection and Protection". The research explores how formal verification methods, particularly noninterference based on unwinding conditions, can be applied to analyze MEV vulnerabilities in DeFi smart contracts.

### Key Contributions

- **Formal MEV Analysis**: Uses unwinding conditions to identify potential MEV attack vectors in smart contracts
- **Bet Contract Case Study**: Demonstrates MEV vulnerabilities in a betting contract interacting with AMM and Exchange rate contracts
- **Oracle-based Protection**: Implements Chainlink oracles to mitigate MEV opportunities
- **Downgrading Mechanism**: Allows controlled information flows in specific scenarios

## 🏗 Architecture

The project consists of three main components:

1. **Bet Contract**: The main contract vulnerable to MEV attacks
2. **Rate Contracts**: 
   - AMM Contract (vulnerable to manipulation)
   - Exchange Contract (owner-controlled rates)
3. **Oracle Protection Layer**: Chainlink-based MEV mitigation system

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Bet Contract  │    │  Rate Contract  │    │ Oracle Network  │
│                 │    │                 │    │                 │
│ - Constructor   │◄──►│ - AMM           │    │ - Chainlink     │
│ - Bet           │    │ - Exchange      │    │ - Alchemy API   │
│ - Win           │    │ - GetRate       │    │ - MEV Detection │
│ - Close         │    │ - Swap          │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** or **yarn**
- **Git**
- **MetaMask** or another Web3 wallet
- **Chainlink** account (for oracle functionality)
- **Alchemy** account (for blockchain data)

### Required Accounts

1. **Alchemy**: Create an account at [alchemy.com](https://www.alchemy.com) for blockchain API access
2. **Chainlink**: Register at [chain.link](https://chain.link) for oracle services
3. **Testnet Faucets**: Access to Ethereum testnets (Sepolia, Goerli) for testing

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/SEMIAGUESMI/MEV-unprotected-version.git
cd MEV-unprotected-version
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
# Blockchain Network Configuration
PRIVATE_KEY=your_wallet_private_key_here
INFURA_API_KEY=your_infura_api_key
ALCHEMY_API_KEY=your_alchemy_api_key

# Chainlink Oracle Configuration
CHAINLINK_TOKEN_ADDRESS=0x...
ORACLE_ADDRESS=0x...
JOB_ID=your_chainlink_job_id

# Network URLs
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
MAINNET_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY


### 4. Install Hardhat Globally (Optional)

```bash
npm install -g hardhat
```

## 📁 Project Structure

```
MEV-unprotected-version/
├── contracts/
│   ├── AMM.sol                 # Automated Market Maker
│   ├── BetContract.sol         # Main betting contract
│   ├── Exchange.sol            # Centralized exchange rate
│   ├── TestToken               # ERC20 Token
│   ├── Bet_protected.sol       # MEV protection oracle
│   │   
│   └── interfaces/
│       └── IRateContract.sol   # rate contract interface
├── scripts/
│   ├── deploy_AMM.js              
│   ├── deploy_BetContract.js 
|   ├── deploy_Exchange.js
|   ├──deploy_MEVPotectedBetContract.js              
│   └── deploy_TestToken.js                 
├── test/
│   ├── AMM.js             
│   ├── Bet.js 
|   ├── Exchange.js        
│   └── testToken.js         
├── oracle-service/             
│   ├── index.js
│   └── alchemy-adapter.js
├── /MEV simulation
│   ├── Bet_Exchange/
│   |    ├── Bet_Exchange.js              
|   └── constant.js   
├── hardhat.config.js
├── package.json
└── README.md
```
📊 Contract Details
BetContract.sol
A betting contract where users bet on token exchange rates:

* Owner funds initial pot
* Players bet equal amount to pot
* Winner determined by rate exceeding threshold
* Vulnerable to MEV when using AMM oracles

Key Functions:

placeBet(): Place a bet matching current pot
claimWin(): Claim winnings if rate exceeds threshold
closeBet(): Owner claims funds after deadline

AMM.sol
Automated Market Maker with constant product formula:

K = X * Y (constant product)
Dynamic rates based on reserves
Liquidity provider tokens

Key Functions:

addInitialLiquidity(): Add first liquidity
swapETHForTokens(): Swap ETH for tokens
swapTokensForETH(): Swap tokens for ETH
getRate(): Get current exchange rate

Exchange.sol
Owner-controlled exchange with fixed rates:

Owner sets exchange rates
Rates unaffected by trading volume
MEV resistant by design

Key Functions:

setRate(): Owner updates exchange rate
swapETHForTokens(): Swap at fixed rate
swapTokensForETH(): Swap at fixed rate
getRate(): Get current fixed rate

## 💻 Usage

### Basic Setup

1. **Compile Contracts**
```bash
npx hardhat compile
```

2. **Run Tests**
```bash
npx hardhat test
```

3. **Start Local Network**
```bash
npx hardhat node
```

4. **Deploy Contracts**
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### MEV Demonstration

Run the MEV attack simulation:

```bash
npx hardhat run scripts/demo.js --network localhost
```

This will demonstrate:
- Setting up a bet
- Manipulating AMM rates
- Extracting MEV through transaction ordering

## 🧪 Testing

### Run All Tests

```bash
npm test
# or
npx hardhat test
```

## 🚀 Deployment

### Local Deployment

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Deployment

```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to Goerli
npx hardhat run scripts/deploy.js --network goerli
```
