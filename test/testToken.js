const { expect } = require("chai");
const { formatUnits } = require("ethers");
const { ethers } = require("hardhat");

describe("TestToken", function () {
  let testToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // Constants
  const INITIAL_SUPPLY = ethers.parseUnits("1000000"); // 1 million tokens
  const TOKEN_NAME = "Test Token";
  const TOKEN_SYMBOL = "TEST";
  const DECIMALS = 18;

  beforeEach(async function(){
    // Get the ContractFactory and Signers
    [owner, addr1, addr2, ...addrs]= await ethers.getSigners();

    //deploy the contract
    const TestToken = await ethers.getContractFactory("TestToken");
    testToken = await TestToken.deploy(); 
  })
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      console.log(owner.address);
      console.log(await testToken.getAddress());
      expect(await testToken.owner()).to.equal(owner.address)
    });

    it("should assign the right total supply of tokens to the owner", async function(){
        const ownerBalance = await testToken.balanceOf(owner.address)
        expect(await testToken.totalSupply()).to.equal(ownerBalance)
    })

    it("should have the correct name, symbol and decimals", async function(){
        expect(await testToken.symbol()).to.equal(TOKEN_SYMBOL);
        expect(await testToken.decimals()).to.equal(DECIMALS);
        expect(await testToken.name()).to.equal(TOKEN_NAME);
    })
  });
  describe("transactions", async function(){
    //transfer token from owner to addr1 
    it("should transfer tokens between accounts", async function (){
        const transferAmount = ethers.parseUnits("50");

        await testToken.transfer(addr1.address, transferAmount);
        const addr1Balance = await testToken.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(transferAmount)

        //transfer tokens from addr1 to addr2
        await testToken.connect(addr1).transfer(addr2,transferAmount)
        const addr2Balance = await testToken.balanceOf(addr2)
        expect(addr2Balance).to.equal(transferAmount)
        expect(await testToken.balanceOf(addr1.address)).to.equal(0)
    })
  })
  describe("allowances", async function(){
    it("it should approve and transfer from", async function(){
        const approveAmount = ethers.parseUnits("100");
        const transferAmount = ethers.parseUnits("50");
        //owner approves addr1 to spend tokens
        await testToken.approve(addr1.address, approveAmount);
        expect(await testToken.allowance(owner.address, addr1.address)).to.equal( approveAmount );
        await testToken.connect(addr1).transferFrom(owner.address, addr2.address,transferAmount )
        expect(await testToken.balanceOf(addr2.address)).to.equal(transferAmount)
    })

    it ("should fail transferFrom excceeeding allowance", async function(){
        
    const approveAmount = ethers.parseUnits("50");
      const transferAmount = ethers.parseUnits("100");

      await testToken.approve(addr1.address, approveAmount);

      await expect(
        testToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)
      ).to.be.revertedWith("ERC20: insufficient allowance");
        
    })
    
describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("1000");
      const initialSupply = await testToken.totalSupply();
      const initialBalance = await testToken.balanceOf(addr1.address);

      await testToken.mint(addr1.address, mintAmount);

      expect(await testToken.balanceOf(addr1.address)).to.equal(initialBalance + mintAmount);
      expect(await testToken.totalSupply()).to.equal(initialSupply + mintAmount);
    });

    it("Should fail if non-owner tries to mint", async function () {
      const mintAmount = ethers.parseUnits("1000");

      await expect(
        testToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    
  });
  })
})