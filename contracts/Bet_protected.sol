// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IRateContract.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

/**
 * @title MEVProtectedBetContract
 * @dev Smart contract for betting on token exchange rates with MEV protection
 * Implementation based on MEV Noninterference paper using Chainlink oracles
 */
contract MEVProtectedBetContract is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;
    
    // State variables
    address public rateContract;
    address public token;
    uint256 public betRate;
    uint256 public deadline;
    uint256 public betWallet;
    uint256 public initialPot;
    
    address public currentPlayer;
    uint256 public playerBet;
    uint256 public playerBetBlock; // Block number when bet was placed
    
    // Chainlink oracle configuration
    bytes32 private jobId;
    uint256 private fee;
    string private apiUrl;
    
    // MEV protection state
    mapping(bytes32 => address) private requestToPlayer;
    mapping(bytes32 => uint256) private requestToWinAmount;
    
    // Events
    event BetPlaced(address indexed player, uint256 amount, uint256 blockNumber);
    event BetWon(address indexed player, uint256 amount);
    event BetAborted(address indexed player, string reason);
    event BetClosed(address indexed owner, uint256 amount);
    event ContractInitialized(address indexed owner, uint256 initialPot, uint256 betRate, uint256 deadline);
    event OracleRequestSent(bytes32 indexed requestId, address indexed player);
    event TransactionCheckCompleted(bytes32 indexed requestId, bool hasMEVTransactions);
    
    // Modifiers
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
     * @dev Constructor - initializes the MEV-protected bet contract
     * @param _betRate The rate threshold for winning bets
     * @param _token Token address to bet on
     * @param _rateContract Address of the rate contract (AMM or Exchange)
     * @param _deadline Deadline for placing and claiming bets
     * @param _link Chainlink token address
     * @param _oracle Chainlink oracle address
     * @param _jobId Chainlink job ID for transaction monitoring
     * @param _fee Oracle fee in LINK tokens
     * @param _apiUrl URL of the off-chain data provider
     */
    constructor(
        uint256 _betRate,
        address _token,
        address _rateContract,
        uint256 _deadline,
        address _link,
        address _oracle,
        bytes32 _jobId,
        uint256 _fee,
        string memory _apiUrl
    ) payable ConfirmedOwner(msg.sender) {
        require(msg.value > 0, "Must send initial pot amount");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_rateContract != address(0), "Rate contract address cannot be zero");
        
        // Verify rate contract supports the token pair
        require(
            IRateContract(_rateContract).supportsExchange(address(0), _token), 
            "Rate contract does not support ETH/token exchange"
        );
        
        // Initialize Chainlink
        setChainlinkToken(_link);
        setChainlinkOracle(_oracle);
        jobId = _jobId;
        fee = _fee;
        apiUrl = _apiUrl;
        
        // Initialize contract state
        betWallet = msg.value;
        initialPot = msg.value;
        betRate = _betRate;
        token = _token;
        rateContract = _rateContract;
        deadline = _deadline;
        
        emit ContractInitialized(owner(), initialPot, _betRate, _deadline);
    }
} 