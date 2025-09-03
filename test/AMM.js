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
  
})