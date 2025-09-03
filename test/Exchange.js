const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Exchange Contract", function () {
  let testToken, exchange;
  let owner, user1, user2;
  let deploymentGas;
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy TestToken
    const TestToken = await ethers.getContractFactory("TestToken");
    testToken = await TestToken.deploy();
    await testToken.waitForDeployment();

    // Deploy Exchange with initial rate of 1 TEST = 0.001 ETH
    const Exchange = await ethers.getContractFactory("Exchange");
    const initialRate = ethers.parseEther("0.001");
    const deployTx = await Exchange.deploy(await testToken.getAddress(), initialRate);
    exchange = await deployTx.waitForDeployment();
    
    deploymentGas = (await deployTx.deploymentTransaction().wait()).gasUsed;

    // Setup initial liquidity
    const tokenAmount = ethers.parseUnits("1000");
    const ethAmount = ethers.parseUnits("1");
    
    await testToken.approve(await exchange.getAddress(), tokenAmount);
    await exchange.addLiquidity(tokenAmount, { value: ethAmount });
  });
  describe("Deployment", function () {
    it("Should deploy with correct parameters", async function () {
      expect(await exchange.owner()).to.equal(owner.address);
      expect(await exchange.tokenB()).to.equal(await testToken.getAddress());
      expect(await exchange.exchangeRate()).to.equal(ethers.parseEther("0.001"));
      expect(await exchange.exchangeActive()).to.equal(true);
      
      console.log(`   Exchange deployment gas: ${deploymentGas.toString()}`);
    });

    it("Should implement IRateContract interface", async function () {
      expect(await exchange.supportsExchange(ethers.ZeroAddress, await testToken.getAddress())).to.be.true;
      expect(await exchange.supportsExchange(await testToken.getAddress(), ethers.ZeroAddress)).to.be.true;
      expect(await exchange.supportsExchange(ethers.ZeroAddress, ethers.ZeroAddress)).to.be.false;
    });

    it("Should return correct token pair", async function () {
      const [tokenA, tokenB] = await exchange.getTokenPair();
      expect(tokenA).to.equal(ethers.ZeroAddress);
      expect(tokenB).to.equal(await testToken.getAddress());
    });
  });
describe("Rate Management", function () {
    it("Should allow owner to set rate", async function () {
      const newRate = ethers.parseEther("0.002");
      await exchange.setRate(newRate);
      
      expect(await exchange.exchangeRate()).to.equal(newRate);
      expect(await exchange.getRate(ethers.ZeroAddress, await testToken.getAddress())).to.equal(newRate);
    });

    it("Should prevent non-owner from setting rate", async function () {
      const newRate = ethers.parseEther("0.002");
      await expect(
        exchange.connect(user1).setRate(newRate)
      ).to.be.revertedWithCustomError(exchange, "OwnableUnauthorizedAccount");
    });

    it("Should prevent setting zero rate", async function () {
      await expect(
        exchange.setRate(0)
      ).to.be.revertedWith("Rate must be greater than zero");
    });

    it("Should emit RateUpdated event", async function () {
      const oldRate = await exchange.exchangeRate();
      const newRate = ethers.parseEther("0.002");
      
      await expect(exchange.setRate(newRate))
        .to.emit(exchange, "RateUpdated")
        .withArgs(oldRate, newRate, owner.address);
    });
  });
  describe("Liquidity Management", function () {
    it("Should allow owner to add liquidity", async function () {
      const tokenAmount = ethers.parseEther("500");
      const ethAmount = ethers.parseEther("0.5");
      
      await testToken.approve(await exchange.getAddress(), tokenAmount);
      
      const initialETHReserve = (await exchange.getExchangeInfo())._reserveA;
      const initialTokenReserve = (await exchange.getExchangeInfo())._reserveB;
      
      await expect(exchange.addLiquidity(tokenAmount, { value: ethAmount }))
        .to.emit(exchange, "LiquidityAdded")
        .withArgs(owner.address, ethAmount, tokenAmount);
      
      const finalETHReserve = (await exchange.getExchangeInfo())._reserveA;
      const finalTokenReserve = (await exchange.getExchangeInfo())._reserveB;
      
      expect(finalETHReserve - initialETHReserve).to.equal(ethAmount);
      expect(finalTokenReserve - initialTokenReserve).to.equal(tokenAmount);
    });
 });
   describe("Swap Operations", function () {
    beforeEach(async function () {
      // Give user1 some ETH and tokens for swapping
      await testToken.transfer(user1.address, ethers.parseEther("100"));
    });
     it("Should swap ETH for tokens", async function () {
      const ethAmount = ethers.parseEther("0.1");
      const minTokensOut = ethers.parseEther("90"); 
      
      const initialTokenBalance = await testToken.balanceOf(user1.address);
      
      await expect(
        exchange.connect(user1).swapETHForTokens(minTokensOut, { value: ethAmount })
      ).to.emit(exchange, "Swap");
      
      const finalTokenBalance = await testToken.balanceOf(user1.address);
      expect(finalTokenBalance).to.be.greaterThan(initialTokenBalance);
    });

    it("Should swap tokens for ETH", async function () {
      const tokenAmount = ethers.parseEther("100");
      const minETHOut = ethers.parseEther("0.09"); 
      
      await testToken.connect(user1).approve(await exchange.getAddress(), tokenAmount);
      
      const initialETHBalance = await ethers.provider.getBalance(user1.address);
      
      const tx = await exchange.connect(user1).swapTokensForETH(tokenAmount, minETHOut);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalETHBalance = await ethers.provider.getBalance(user1.address);
      expect(finalETHBalance + gasUsed).to.be.greaterThan(initialETHBalance);
    });
  });
    describe("Gas Cost Analysis", function () {
    it("Should measure gas costs for all operations", async function () {
      await testToken.transfer(user1.address, ethers.parseEther("100"));
      await testToken.connect(user1).approve(await exchange.getAddress(), ethers.parseEther("100"));
      
      // Set rate gas cost
      const setRateTx = await exchange.setRate(ethers.parseEther("0.002"));
      const setRateGas = (await setRateTx.wait()).gasUsed;
      console.log(`   Set rate gas: ${setRateGas.toString()}`);
      
      // Swap ETH for tokens gas cost
      const swapETHTx = await exchange.connect(user1).swapETHForTokens(0, { value: ethers.parseEther("0.1") });
      const swapETHGas = (await swapETHTx.wait()).gasUsed;
      console.log(`   Swap ETH for tokens gas: ${swapETHGas.toString()}`);
      
      // Swap tokens for ETH gas cost
      const swapTokenTx = await exchange.connect(user1).swapTokensForETH(ethers.parseEther("50"), 0);
      const swapTokenGas = (await swapTokenTx.wait()).gasUsed;
      console.log(`   Swap tokens for ETH gas: ${swapTokenGas.toString()}`);
      
      // Get rate gas cost (view function)
      const getRateGas = await exchange.getRate.estimateGas(ethers.ZeroAddress, await testToken.getAddress());
      console.log(`   Get rate gas: ${getRateGas.toString()}`);
    });
  });
});
