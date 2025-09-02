// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IRateContract
 * @dev Interface for rate contracts (AMM or Exchange)
 * Based on the MEV Noninterference paper specifications
 */
interface IRateContract {
    /**
     * @dev Get the current exchange rate between two tokens
     * @param tokenA Address of the first token (or ETH represented as address(0))
     * @param tokenB Address of the second token
     * @return rate The exchange rate (tokenA/tokenB)
     */
    function getRate(address tokenA, address tokenB) external view returns (uint256 rate);
    
    /**
     * @dev Check if the contract supports exchange between two tokens
     * @param tokenA Address of the first token
     * @param tokenB Address of the second token
     * @return supported True if exchange is supported
     */
    function supportsExchange(address tokenA, address tokenB) external view returns (bool supported);
    
    /**
     * @dev Get the token pair information
     * @return tokenA First token in the pair
     * @return tokenB Second token in the pair
     */
    function getTokenPair() external view returns (address tokenA, address tokenB);
}