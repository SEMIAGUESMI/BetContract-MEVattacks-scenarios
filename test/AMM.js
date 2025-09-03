const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AMM Contract", async function(){
    let testToken, amm;
  let owner, user1, user2, liquidityProvider;
  let deploymentGas;

  this.beforeEach(async function(){
   [ owner, user1, user2, liquidityProvider] = await ethers.getSigners(); 
   //deply TestToken contract
   const TestToken = await ethers.getContractFactory("TestToken")
   testToken = await TestToken.deploy();
   await testToken.waitForDeployment();

   //deply AMM contract
   const AMM = await ethers.getContractFactory("AMM")
   const deployTx = await AMM.deploy(await testToken.getAddress());
   amm= await deployTx.waitForDeployment();

   deploymentGas = (await deployTx.deploymentTransaction().wait()).gasUsed;

   // Distribute tokens to users
    await testToken.transfer(user1.address, ethers.parseEther("1000"));
    await testToken.transfer(user2.address, ethers.parseEther("1000"));
    await testToken.transfer(liquidityProvider.address, ethers.parseEther("5000"));
  });
  describe ("deployment", async function(){
    it ("should deploy with correct parameters", async function(){
        expect(await amm.tokenA()).to.equal(ethers.ZeroAddress);
        expect(await amm.tokenB()).to.equal(await testToken.getAddress());
        expect(await amm.totalLiquidity()).to.equal(0);

        console.log(`   AMM deployment gas: ${deploymentGas.toString()}`);

    })
  })
  describe("test addInitialLiquidity", async function(){
    it("should allow adding liquidity ", async function (){
    const tokenAmount = ethers.parseUnits("100");
    const etherAmount = ethers.parseUnits("100");

    // AMM wallet before adding liquidity
        const ammEthBalanceBefore = await ethers.provider.getBalance(await amm.getAddress());
        const ammTESTBalanceBefore = await testToken.balanceOf(await amm.getAddress());
        console.log("AMM ETH balance before:", ethers.formatEther(ammEthBalanceBefore), " AMM TEST balance before:", ethers.formatEther(ammTESTBalanceBefore) );

    // approve the AMM contract to transfer from liquidityProvider wallet
    await testToken.connect(liquidityProvider).approve(await amm.getAddress(), tokenAmount)
    expect(await testToken.allowance(liquidityProvider.address,await amm.getAddress())).to.equal(tokenAmount)

    //execute liquidity
    await expect(await amm.connect(liquidityProvider).addInitialLiquidity(tokenAmount, {value: etherAmount})).to.emit(amm, "LiquidityAdded").withArgs(liquidityProvider.address, etherAmount, tokenAmount, await amm.totalLiquidity());
    expect(await amm.reserveA()).to.equal(etherAmount)
    expect(await amm.reserveB()).to.equal(tokenAmount)

  })
    })
    describe("test add liquidity ", async function(){
        beforeEach(async function () {
      // Add initial liquidity
      const tokenAmount = ethers.parseEther("1000");
      const ethAmount = ethers.parseEther("1");
      
      await testToken.connect(liquidityProvider).approve(await amm.getAddress(), tokenAmount);
      await amm.connect(liquidityProvider).addInitialLiquidity(tokenAmount, { value: ethAmount });
    });

        it("should allow adding liquidity", async function(){
            const additionalEth = ethers.parseEther("0.5");
            const expectedTokens = ethers.parseEther("500");
            await testToken.connect(liquidityProvider).approve(await amm.getAddress(), expectedTokens);
            await expect(await amm.connect(liquidityProvider).addLiquidity(expectedTokens, {value:additionalEth})).to.emit(amm, "LiquidityAdded");

        })
    })
     describe("Swap Operations", function () {
    beforeEach(async function () {
      // Add initial liquidity: 1 ETH : 1000 TEST
      const tokenAmount = ethers.parseEther("1000");
      const ethAmount = ethers.parseEther("1");
      
      await testToken.connect(liquidityProvider).approve(await amm.getAddress(), tokenAmount);
      await amm.connect(liquidityProvider).addInitialLiquidity(tokenAmount, { value: ethAmount });
    });

    it("Should swap ETH for tokens", async function () {
      const ethIn = ethers.parseEther("0.1");
      const minTokensOut = ethers.parseEther("80"); // Account for slippage and fees
      
      const initialTokenBalance = await testToken.balanceOf(user1.address);
      
      await expect(
        amm.connect(user1).swapETHForTokens(minTokensOut, { value: ethIn })
      ).to.emit(amm, "Swap")
        .to.emit(amm, "RateUpdated");
      
      const finalTokenBalance = await testToken.balanceOf(user1.address);
      expect(finalTokenBalance - initialTokenBalance).to.be.greaterThan(minTokensOut);
    });

    it("Should swap tokens for ETH", async function () {
      const tokensIn = ethers.parseEther("100");
      const minEthOut = ethers.parseEther("0.08"); // Account for slippage and fees
      
      await testToken.connect(user1).approve(await amm.getAddress(), tokensIn);
      
      const initialEthBalance = await ethers.provider.getBalance(user1.address);
      
      const tx = await amm.connect(user1).swapTokensForETH(tokensIn, minEthOut);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      
      const finalEthBalance = await ethers.provider.getBalance(user1.address);
      
      // Should receive ETH minus gas costs
      expect(finalEthBalance + gasCost - initialEthBalance).to.be.greaterThan(minEthOut);
    });
   });
})