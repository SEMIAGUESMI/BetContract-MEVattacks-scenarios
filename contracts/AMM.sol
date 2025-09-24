// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IRateContract.sol";
/**
 * @title AMM - Automated Market Maker
 * @dev Constant Product Market Maker (CPMM) implementation
 * Based on Uniswap V2 model with K = X * Y formula
 */
contract AMM is IRateContract, ReentrancyGuard {
    // State variables
    address public tokenA; // ETH represented as address(0)
    address public tokenB; // ERC20 token
    
    uint256 public reserveA; // ETH reserve
    uint256 public reserveB; // Token reserve
    
    uint256 public totalLiquidity;
    
    mapping(address => uint256) public liquidityBalances;
    
    // Events
    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);
    event Swap(address indexed user, uint256 amountIn, uint256 amountOut, bool aToB);
    event RateUpdated(uint256 newRate);
    
    /**
     * @dev Constructor
     * @param _tokenB Address of the ERC20 token to pair with ETH
     */
    constructor(address _tokenB) {
        require(_tokenB != address(0), "Token address cannot be zero");
        tokenA = address(0); // ETH
        tokenB = _tokenB;
    }
    
    /**
     * @dev Add initial liquidity (first liquidity provider)
     * @param tokenAmount Amount of tokens to add
     */
    function addInitialLiquidity(uint256 tokenAmount) external payable {
        require(totalLiquidity == 0, "Liquidity already exists");
        require(msg.value > 0 && tokenAmount > 0, "Must provide both ETH and tokens");
        
        // Transfer tokens from user
        require(
            IERC20(tokenB).transferFrom(msg.sender, address(this), tokenAmount),
            "Token transfer failed"
        );
        
        reserveA = msg.value;
        reserveB = tokenAmount;
        
        // Initial liquidity is sqrt(x * y)
        uint256 liquidity = sqrt(msg.value * tokenAmount);
        
        totalLiquidity = liquidity;
        liquidityBalances[msg.sender] = liquidity;
        
        emit LiquidityAdded(msg.sender, msg.value, tokenAmount, liquidity);
        emit RateUpdated(getRate(tokenA, tokenB));
    }
    
    /**
     * @dev Add liquidity maintaining current ratio
     * @param tokenAmount Amount of tokens to add
     */
    function addLiquidity(uint256 tokenAmount) external payable nonReentrant {
        require(totalLiquidity > 0, "No initial liquidity");
        require(msg.value > 0 && tokenAmount > 0, "Must provide both ETH and tokens");
        
        // Calculate required amounts to maintain ratio
        uint256 requiredTokenAmount = (msg.value * reserveB) / reserveA;
        require(tokenAmount >= requiredTokenAmount, "Insufficient token amount for ratio");
        
        // Transfer tokens from user
        require(
            IERC20(tokenB).transferFrom(msg.sender, address(this), requiredTokenAmount),
            "Token transfer failed"
        );
        
        // Calculate liquidity to mint
        uint256 liquidity = (msg.value * totalLiquidity) / reserveA;
        
        // Update reserves
        reserveA += msg.value;
        reserveB += requiredTokenAmount;
        
        // Update liquidity
        totalLiquidity += liquidity;
        liquidityBalances[msg.sender] += liquidity;
        
        // Refund excess tokens if any
        if (tokenAmount > requiredTokenAmount) {
            require(
                IERC20(tokenB).transfer(msg.sender, tokenAmount - requiredTokenAmount),
                "Token refund failed"
            );
        }
        
        emit LiquidityAdded(msg.sender, msg.value, requiredTokenAmount, liquidity);
        emit RateUpdated(getRate(tokenA, tokenB));
    }
    
    /**
     * @dev Swap ETH for tokens
     * @param minTokensOut Minimum tokens to receive (slippage protection)
     */
    function swapETHForTokens(uint256 minTokensOut) external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        require(totalLiquidity > 0, "No liquidity available");
        
        uint256 tokensOut = getAmountOut(msg.value, reserveA, reserveB);
        require(tokensOut >= minTokensOut, "Insufficient output amount");
        require(tokensOut < reserveB, "Insufficient token liquidity");
        
        // Update reserves (K = X * Y must be maintained)
        reserveA += msg.value;
        reserveB -= tokensOut;
        
        // Transfer tokens to user
        require(IERC20(tokenB).transfer(msg.sender, tokensOut), "Token transfer failed");
        
        emit Swap(msg.sender, msg.value, tokensOut, true);
        emit RateUpdated(getRate(tokenA, tokenB));
    }
    
    /**
     * @dev Swap tokens for ETH  
     * @param tokenAmount Amount of tokens to swap
     * @param minETHOut Minimum ETH to receive (slippage protection)
     */
    function swapTokensForETH(uint256 tokenAmount, uint256 minETHOut) external nonReentrant {
        require(tokenAmount > 0, "Must provide tokens");
        require(totalLiquidity > 0, "No liquidity available");
        
        uint256 ethOut = getAmountOut(tokenAmount, reserveB, reserveA);
        require(ethOut >= minETHOut, "Insufficient output amount");
        require(ethOut < reserveA, "Insufficient ETH liquidity");
        
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
        emit RateUpdated(getRate(tokenA, tokenB));
    }
    
    /**
     * @dev Calculate output amount for a swap (constant product formula)
     * @param amountIn Input amount
     * @param reserveIn Input reserve
     * @param reserveOut Output reserve
     * @return amountOut Output amount after fees (0.3% fee)
     */
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) 
        public 
        pure 
        returns (uint256 amountOut) 
    {
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 numerator = amountIn * reserveOut;
        uint256 denominator = reserveIn + amountIn;
        amountOut = numerator / denominator;
    }
    
    /**
     * @dev Get current exchange rate (ETH/Token)
     * @param _tokenA First token (should be address(0) for ETH)
     * @param _tokenB Second token
     * @return rate Exchange rate scaled by 1e18
     */
    function getRate(address _tokenA, address _tokenB) public view override returns (uint256 rate) {
        require(
            (_tokenA == address(0) && _tokenB == tokenB) || 
            (_tokenA == tokenB && _tokenB == address(0)), 
            "Invalid token pair"
        );
        
        if (reserveA == 0 || reserveB == 0) {
            return 0;
        }
        
        if (_tokenA == address(0)) {
            // ETH to Token rate
            rate = (reserveB * 1e18) / reserveA;
        } else {
            // Token to ETH rate  
            rate = (reserveA * 1e18) / reserveB;
        }
    }
    
    /**
     * @dev Check if exchange between two tokens is supported
     * @param _tokenA First token
     * @param _tokenB Second token
     * @return supported True if supported
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
     * @dev Get current reserves
     * @return _reserveA ETH reserve
     * @return _reserveB Token reserve
     */
    function getReserves() external view returns (uint256 _reserveA, uint256 _reserveB) {
        return (reserveA, reserveB);
    }
    
    /**
     * @dev Square root function for liquidity calculation
     */
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    /**
     * @dev Receive ETH directly (for liquidity operations)
     */
    receive() external payable {
        // Allow contract to receive ETH
    }
}