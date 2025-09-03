const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BetContract", function () {
  let testToken, amm, exchange, betContractAMM, betContractExchange;
  let owner, player, player2, attacker;
  let deploymentGas = {};

  describe("BetContract", function () {
  let testToken, amm, exchange, betContractAMM, betContractExchange;
  let owner, player, player2, attacker;
  let deploymentGas = {};

  beforeEach(async function () {
    [owner, player, player2, attacker] = await ethers.getSigners();

    // Deploy TestToken
    const TestToken = await ethers.getContractFactory("TestToken");
    testToken = await TestToken.deploy();
    await testToken.waitForDeployment();

    // Deploy and setup AMM
    const AMM = await ethers.getContractFactory("AMM");
    amm = await AMM.deploy(await testToken.getAddress());
    await amm.waitForDeployment();

    // Add liquidity to AMM (1 ETH : 1000 TEST)
    const ammLiquidity = ethers.parseEther("1000");
    await testToken.approve(await amm.getAddress(), ammLiquidity);
    await amm.addInitialLiquidity(ammLiquidity, { value: ethers.parseEther("1") });

    // Deploy Exchange
    const Exchange = await ethers.getContractFactory("Exchange");
    const initialRate = ethers.parseEther("0.001");
    exchange = await Exchange.deploy(await testToken.getAddress(), initialRate);
    await exchange.waitForDeployment();

    // Add liquidity to Exchange
    const exchangeLiquidity = ethers.parseEther("500");
    await testToken.approve(await exchange.getAddress(), exchangeLiquidity);
    await exchange.addLiquidity(exchangeLiquidity, { value: ethers.parseEther("0.5") });

    // Deploy BetContracts
    const BetContract = await ethers.getContractFactory("BetContract");
    const initialPot = ethers.parseEther("1");
    const betRate = ethers.parseEther("0.0015"); // 1.5x the initial AMM rate
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    
    // ****** BetContract with AMM (vulnerable)
    const betAMMTx = await BetContract.deploy(betRate,
      await testToken.getAddress(),
      await amm.getAddress(), deadline, { value: initialPot }
    );
     betContractAMM = await betAMMTx.waitForDeployment();
    deploymentGas.betAMM = (await betAMMTx.deploymentTransaction().wait()).gasUsed;

    // ******** BetContract with Exchange (resistant)
      const betExchangeTx = await BetContract.deploy(
    betRate, await testToken.getAddress(),
      await exchange.getAddress(), deadline, { value: initialPot }
    );
    betContractExchange = await betExchangeTx.waitForDeployment();
    deploymentGas.betExchange = (await betExchangeTx.deploymentTransaction().wait()).gasUsed;
    // Distribute tokens to users
    await testToken.transfer(player.address, ethers.parseEther("500"));
    await testToken.transfer(attacker.address, ethers.parseEther("2000"));

});
 describe("Bet Placement", function () {
    it("Should allow valid bet placement", async function () {
      const betAmount = await betContractAMM.betWallet();
      
      await expect(
        betContractAMM.connect(player).placeBet({ value: betAmount })
      ).to.emit(betContractAMM, "BetPlaced")
        .withArgs(player.address, betAmount);
      
      const state = await betContractAMM.getState();
      expect(state._currentPlayer).to.equal(player.address);
      expect(state._betWallet).to.equal(betAmount * 2n); // Original + player's bet
    });

});
});
})