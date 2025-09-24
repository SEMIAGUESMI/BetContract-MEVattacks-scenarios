// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IRateContract.sol";

/**
 * @title BetContract
 * @dev Smart contract for betting on token exchange rates
 * Implementation
 */
contract BetContract {
    // State variables
    address public owner;
    address public rateContract;
    address public token;
    uint256 public betRate;
    uint256 public deadline;
    uint256 public betWallet;
    uint256 public initialPot;
    
    address public currentPlayer;
    uint256 public playerBet;
    
    // Events
    event BetPlaced(address indexed player, uint256 amount);
    event BetWon(address indexed player, uint256 amount);
    event BetClosed(address indexed owner, uint256 amount);
    event ContractInitialized(address indexed owner, uint256 initialPot, uint256 betRate, uint256 deadline);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier beforeDeadline() {
        require(block.timestamp < deadline, "Deadline has passed");
        _;
    }
    
    modifier afterDeadline() {
        require(block.timestamp >= deadline, "Deadline has not passed yet");
        _;
    }
    
    modifier noBetActive() {
        require(currentPlayer == address(0), "A bet is already active");
        _;
    }
    
    modifier onlyCurrentPlayer() {
        require(msg.sender == currentPlayer, "Only current player can call this");
        _;
    }
    
    /**
     * @dev Constructor - initializes the bet contract
     * @param _betRate The rate threshold for winning bets
     * @param _token Token address to bet on
     * @param _rateContract Address of the rate contract (AMM or Exchange)
     * @param _deadline Deadline for placing and claiming bets
     */
    constructor(
        uint256 _betRate,
        address _token,
        address _rateContract,
        uint256 _deadline
    ) payable {
        require(msg.value>0, "Must send initial pot amount ");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_rateContract != address(0), "Rate contract address cannot be zero");
        
        // Verify rate contract supports the token pair
        require(
            IRateContract(_rateContract).supportsExchange(_token,address(0)), 
            "Rate contract does not support ETH/token exchange"
            
        );
        
       owner = msg.sender;
        betWallet = msg.value;
        initialPot = msg.value;
        betRate = _betRate;
        token = _token;
        rateContract = _rateContract;
        deadline = _deadline;
        
        emit ContractInitialized(owner, initialPot, _betRate, _deadline);
    }
    
    /**
     * @dev Place a bet - player must match the current bet wallet amount
     */
    function placeBet() external payable beforeDeadline  {
        require(msg.value == betWallet, "Bet amount must equal current bet wallet");
        require(msg.sender != owner, "Owner cannot place bets");
        
        currentPlayer = msg.sender;
        playerBet = msg.value;
        betWallet += msg.value; // Double the pot
        
        emit BetPlaced(msg.sender, msg.value);
    }
    
    /**
     * @dev Claim win - player wins if current rate exceeds bet rate
     * This is where MEV vulnerability exists in unprotected version
     */
    function claimWin() external beforeDeadline onlyCurrentPlayer {
        uint256 currentRate = IRateContract(rateContract).getRate(token, address(0));
        
        if (currentRate > betRate) {
            // Player wins the entire pot
            uint256 winAmount = betWallet;
            betWallet = 0;
            currentPlayer = address(0);
            playerBet = 0;
            
            (bool success, ) = msg.sender.call{value: winAmount}("");
            require(success, "Transfer failed");
            
            emit BetWon(msg.sender, winAmount);
        } 
    }
    
    /**
     * @dev Close bet after deadline - owner can claim remaining funds
     */
    function closeBet() external afterDeadline onlyOwner {
        uint256 amount = betWallet;
        betWallet = 0;
        currentPlayer = address(0);
        playerBet = 0;
        
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit BetClosed(owner, amount);
    }
    
    /**
     * @dev Get current contract state
     */
    function getState() external view returns (
        address _owner,
        address _currentPlayer,
        uint256 _betWallet,
        uint256 _betRate,
        uint256 _deadline,
        uint256 _currentRate,
        bool _betActive
    ) {
        uint256 currentRate = 0;
        if (rateContract != address(0)) {
            currentRate = IRateContract(rateContract).getRate(address(0), token);
        }
        
        return (
            owner,
            currentPlayer,
            betWallet,
            betRate,
            deadline,
            currentRate,
            currentPlayer != address(0)
        );
    }
}