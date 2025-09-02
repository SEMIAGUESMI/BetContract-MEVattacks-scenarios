// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IRateContract.sol";

/**
 * @title Exchange - Owner-Controlled Exchange
 * @dev Simple exchange where rates are set by the owner
 * MEV-resistant because rates cannot be manipulated by external users
 */
contract Exchange is IRateContract, Ownable, ReentrancyGuard {
    // State variables
    address public tokenA; // ETH represented as address(0) 
    address public tokenB; // ERC20 token
    
    uint256 public exchangeRate; // Rate scaled by 1e18 (ETH/Token ratio)
    uint256 public reserveA; // ETH reserve
    uint256 public reserveB; // Token reserve
    
    bool public exchangeActive;
    uint256 public lastRateUpdate;
    
    // Fee configuration (in basis points, 100 = 1%)
    uint256 public fee = 100; // 1% fee
    uint256 public constant MAX_FEE = 500; // 5% maximum fee
    
    // Events
    event RateUpdated(uint256 oldRate, uint256 newRate, address updatedBy);
    event ExchangeToggled(bool active);
    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB);
    event Swap(address indexed user, uint256 amountIn, uint256 amountOut, bool aToB);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    
    /**
     * @dev Constructor
     * @param _tokenB Address of the ERC20 token to pair with ETH
     * @param _initialRate Initial exchange rate (ETH/Token scaled by 1e18)
     */
    constructor(address _tokenB, uint256 _initialRate) Ownable(msg.sender) {
        require(_tokenB != address(0), "Token address cannot be zero");
        require(_initialRate > 0, "Initial rate must be greater than zero");
        
        tokenA = address(0); // ETH
        tokenB = _tokenB;
        exchangeRate = _initialRate;
        exchangeActive = true;
        lastRateUpdate = block.timestamp;
        
        emit RateUpdated(0, _initialRate, msg.sender);
    }
    
    /**
     * @dev Set new exchange rate (only owner)
     * @param newRate New exchange rate (scaled by 1e18)
     */
    function setRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "Rate must be greater than zero");
        
        uint256 oldRate = exchangeRate;
        exchangeRate = newRate;
        lastRateUpdate = block.timestamp;
        
        emit RateUpdated(oldRate, newRate, msg.sender);
    }
    
    /**
     * @dev Toggle exchange active status (only owner)
     * @param active New active status
     */
    function setExchangeActive(bool active) external onlyOwner {
        exchangeActive = active;
        emit ExchangeToggled(active);
    }
    
    /**
     * @dev Update trading fee (only owner)
     * @param newFee New fee in basis points (100 = 1%)
     */
    function setFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        
        uint256 oldFee = fee;
        fee = newFee;
        
        emit FeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Add liquidity (only owner)
     * @param tokenAmount Amount of tokens to add
     */
    function addLiquidity(uint256 tokenAmount) external payable onlyOwner {
        require(msg.value > 0 && tokenAmount > 0, "Must provide both ETH and tokens");
        
        // Transfer tokens from owner
        require(
            IERC20(tokenB).transferFrom(msg.sender, address(this), tokenAmount),
            "Token transfer failed"
        );
        
        reserveA += msg.value;
        reserveB += tokenAmount;
        
        emit LiquidityAdded(msg.sender, msg.value, tokenAmount);
    }
    
    /**
     * @dev Remove liquidity (only owner)
     * @param amountA Amount of ETH to remove
     * @param amountB Amount of tokens to remove
     */
    function removeLiquidity(uint256 amountA, uint256 amountB) external onlyOwner nonReentrant {
        require(amountA <= reserveA, "Insufficient ETH reserves");
        require(amountB <= reserveB, "Insufficient token reserves");
        
        if (amountA > 0) {
            reserveA -= amountA;
            (bool success, ) = msg.sender.call{value: amountA}("");
            require(success, "ETH transfer failed");
        }
        
        if (amountB > 0) {
            reserveB -= amountB;
            require(IERC20(tokenB).transfer(msg.sender, amountB), "Token transfer failed");
        }
        
        emit LiquidityRemoved(msg.sender, amountA, amountB);
    }
    
    /**
     * @dev Swap ETH for tokens at fixed rate
     * @param minTokensOut Minimum tokens expected (slippage protection)
     */
    function swapETHForTokens(uint256 minTokensOut) external payable nonReentrant {
        require(exchangeActive, "Exchange is not active");
        require(msg.value > 0, "Must send ETH");
        
        // Calculate tokens out based on fixed rate
        uint256 tokensBeforeFee = (msg.value * 1e18) / exchangeRate;
        uint256 feeAmount = (tokensBeforeFee * fee) / 10000;
        uint256 tokensOut = tokensBeforeFee - feeAmount;
        
        require(tokensOut >= minTokensOut, "Insufficient output amount");
        require(tokensOut <= reserveB, "Insufficient token reserves");
        
        // Update reserves
        reserveA += msg.value;
        reserveB -= tokensOut;
        
        // Transfer tokens to user
        require(IERC20(tokenB).transfer(msg.sender, tokensOut), "Token transfer failed");
        
        emit Swap(msg.sender, msg.value, tokensOut, true);
    }
    
    /**
     * @dev Swap tokens for ETH at fixed rate
     * @param tokenAmount Amount of tokens to swap
     * @param minETHOut Minimum ETH expected (slippage protection)
     */
    function swapTokensForETH(uint256 tokenAmount, uint256 minETHOut) external nonReentrant {
        require(exchangeActive, "Exchange is not active");
        require(tokenAmount > 0, "Must provide tokens");
        
        // Calculate ETH out based on fixed rate
        uint256 ethBeforeFee = (tokenAmount * exchangeRate) / 1e18;
        uint256 feeAmount = (ethBeforeFee * fee) / 10000;
        uint256 ethOut = ethBeforeFee - feeAmount;
        
        require(ethOut >= minETHOut, "Insufficient output amount");
        require(ethOut <= reserveA, "Insufficient ETH reserves");
        
        // Transfer tokens from user
        require(
            IERC20(tokenB).transferFrom(msg.sender, address(this), tokenAmount),
            "Token transfer failed"
        );
        
        // Update reserves
        reserveB += tokenAmount;
        reserveA -= ethOut;
        
        // Transfer ETH to user
        (bool success, ) = msg.sender.call{value: ethOut}("");
        require(success, "ETH transfer failed");
        
        emit Swap(msg.sender, tokenAmount, ethOut, false);
    }
    
    /**
     * @dev Get current exchange rate
     * @param _tokenA First token address
     * @param _tokenB Second token address
     * @return rate Current exchange rate (scaled by 1e18)
     */
    function getRate(address _tokenA, address _tokenB) public view override returns (uint256 rate) {
        require(
            (_tokenA == address(0) && _tokenB == tokenB) || 
            (_tokenA == tokenB && _tokenB == address(0)), 
            "Invalid token pair"
        );
        
        return exchangeRate;
    }
    
    /**
     * @dev Check if exchange between two tokens is supported
     * @param _tokenA First token address
     * @param _tokenB Second token address
     * @return supported True if exchange is supported
     */
    function supportsExchange(address _tokenA, address _tokenB) external view override returns (bool supported) {
        return (_tokenA == address(0) && _tokenB == tokenB) || (_tokenA == tokenB && _tokenB == address(0));
    }
    
    /**
     * @dev Get the token pair
     * @return _tokenA ETH (address(0))
     * @return _tokenB Token address
     */
    function getTokenPair() external view override returns (address _tokenA, address _tokenB) {
        return (tokenA, tokenB);
    }
    
    /**
     * @dev Get current reserves and rate info
     * @return _reserveA ETH reserve
     * @return _reserveB Token reserve
     * @return _rate Current exchange rate
     * @return _lastUpdate Last rate update timestamp
     */
    function getExchangeInfo() external view returns (
        uint256 _reserveA,
        uint256 _reserveB,
        uint256 _rate,
        uint256 _lastUpdate
    ) {
        return (reserveA, reserveB, exchangeRate, lastRateUpdate);
    }
    
    /**
     * @dev Calculate output amount for a swap with fees
     * @param amountIn Input amount
     * @param isETHToToken True if swapping ETH for tokens
     * @return amountOut Output amount after fees
     */
    function getAmountOut(uint256 amountIn, bool isETHToToken) external view returns (uint256 amountOut) {
        require(amountIn > 0, "Input amount must be greater than zero");
        
        if (isETHToToken) {
            // ETH to Token
            uint256 tokensBeforeFee = (amountIn * 1e18) / exchangeRate;
            uint256 feeAmount = (tokensBeforeFee * fee) / 10000;
            amountOut = tokensBeforeFee - feeAmount;
        } else {
            // Token to ETH
            uint256 ethBeforeFee = (amountIn * exchangeRate) / 1e18;
            uint256 feeAmount = (ethBeforeFee * fee) / 10000;
            amountOut = ethBeforeFee - feeAmount;
        }
    }
    
    /**
     * @dev Receive ETH directly
     */
    receive() external payable {
        // Allow contract to receive ETH
    }
}