# Noninterference in Smart Contracts: MEV Detection and Protection

A research implementation demonstrating formal verification methods for detecting and mitigating Maximal Extractable Value (MEV) attacks in smart contracts using noninterference theory and unwinding conditions.

## 🔬 Research Overview

This project implements the methodology described in the paper "Noninterference in Smart Contracts: MEV Detection and Protection", which explores how formal verification methods—particularly noninterference based on unwinding conditions—can be applied to detect and localize MEV vulnerabilities in DeFi smart contracts. As a case study, we analyze a betting service contract by first modeling it in a concurrent imperative language to illustrate how MEV attack scenarios unfold, and then implementing the vulnerable contract and its dependencies in Solidity with tests that allow users to reproduce and observe these attacks in practice. Building on the insights from this analysis, we design and implement a protection layer using chainlink oracle, extend the betting contract with this verification mechanism, and demonstrate through testing how the improved version successfully restricts MEV opportunities compared to the original vulnerable implementation.

### Key Contributions

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
|   |     ├── claimWin.js  
|   |     ├── get_bet_state.js 
|   |     └── placeBet.js  
|   ├── protectedBetContract/  
|   |     ├── claimWin.js 
|   |     ├── get_protectBet_state.js 
|   |     └── placeBet.js
|   ├── beforeEach.js      
|   └── constant.js
├── contracts/
│   ├── interfaces/
|   |     └── IRateContract.sol   
|   ├── AMM.sol                 
│   ├── BetContract.sol         
│   ├── Exchange.sol           
│   ├── ProtectedBetContract               
|   └──testToken.sol          
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
## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **[Node.js](https://nodejs.org/en)** (v22.19.0 or higher)  
- **[Hardhat](https://hardhat.org)** (v2.26.3 or higher) Development environment for compiling, testing, and deploying smart contracts.  
- **Ethereum Wallet (e.g., [MetaMask](https://metamask.io/en-GB))** Used to manage accounts and interact with deployed contracts.  
- **Ethereum RPC Provider (e.g., [Alchemy](https://www.alchemy.com) or [Infura](https://www.infura.io))** Provides an RPC endpoint (API key + URL) to connect your project to the Ethereum blockchain (testnet or mainnet). You’ll need to create a free account with one of these providers to obtain an API key.

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
