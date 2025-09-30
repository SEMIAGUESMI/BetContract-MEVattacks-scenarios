# MEV Simulation (Bet Contract)

This directory contains all files needed to simulate and experience MEV attacks against the betting contract. The simulations are divided into two main scenarios:

- **Scenario 1 — Vulnerable BetContract:** runs the original, vulnerable `BetContract` to reproduce MEV attack behavior.  
- **Scenario 2 — Protected ProtectedBetContract:** runs the `ProtectedBetContract` (extended with an oracle verification layer) to demonstrate mitigation of MEV opportunities.

Each contract function used in the simulations has an associated script that also records gas consumption for the executed transaction.

---

## ⚠️ Important Notes before running
- **Deployment order matters.** Ensure contracts are deployed in the correct order and that `MEVSimulation/constants.js` is updated with the newly deployed contract addresses after each deployment.  

---

## Scenario 1 — Vulnerable BetContract

**Goal:** reproduce MEV attack steps using the original vulnerable `BetContract`.

**Typical steps:**

1. Place a bet:
 ```bash
npx hardhat run MEVSimulation/betContract/placeBet.js --network sepolia
```
2. Claim a win:

 ```bash
npx hardhat run MEVSimulation/betContract/claimWin.js --network sepolia
```
The success or outcome of claimWin depends on the current price/rate provided by the AMM contract. For a pure “fair execution” run, do not interact with the AMM rate contract between placeBet and claimWin.

---

To simulate an MEV attack that manipulates price, run scripts that modify the AMM state between these steps.

**Typical steps:**

1. Place a bet:
 ```bash
npx hardhat run MEVSimulation/betContract/placeBet.js --network sepolia
```
2. Swap Ether to Test to affect the AMM rate :
 ```bash
npx hardhat run MEVSimulation/AMM/swap_eth_to_test.js --network sepolia
```
***note*** swapping ETH → TEST means you buy TEST with ETH. In a constant-product AMM (K = x * y), this increases the ETH reserve (x) and decreases the TEST reserve (y), which raises the price of TEST relative to ETH (i.e., more ETH per TEST). In this project the BetContract bets on the price of TEST versus ETH — if the AMM price for TEST is higher before the claim deadline, the player may win. To simulate the opposite effect (increasing the ETH price), run the inverse swap script:

 ```bash
npx hardhat run MEVSimulation/AMM/swap_test_to_eth.js --network sepolia
```

3. Claim a win:

 ```bash
npx hardhat run MEVSimulation/betContract/claimWin.js --network sepolia
```
 
In this scenario, the `BetContract` risks losing its entire value because a player can perform a swap on the AMM to manipulate the TEST/ETH price and then claim an unfair win. This swap is effectively a **front-running / price-manipulation attack** — the attacker changes the AMM state to profit at the contract’s expense.
