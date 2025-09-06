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
   
    function placeBet() external payable beforeDeadline noBetActive {
        require(msg.value == betWallet, "Bet amount must equal current bet wallet");
        require(msg.sender != owner(), "Owner cannot place bets");
        
        currentPlayer = msg.sender;
        playerBet = msg.value;
        playerBetBlock = block.number;
        betWallet += msg.value; // Double the pot
        
        emit BetPlaced(msg.sender, msg.value, block.number);
    }
    
    /**
     * @dev Claim win - player wins if current rate exceeds bet rate and no MEV detected
     * This function initiates the MEV check via Chainlink oracle
     */
    function claimWin() external beforeDeadline onlyCurrentPlayer {
        uint256 currentRate = IRateContract(rateContract).getRate(address(0), token);
        
        if (currentRate > betRate) {
            // Check for MEV transactions via oracle before paying out
            _requestTransactionCheck(currentPlayer, betWallet);
        } else {
            // Player loses, reset state
            currentPlayer = address(0);
            playerBet = 0;
            playerBetBlock = 0;
        }
    }
    
    /**
     * @dev Request transaction check from Chainlink oracle
     * @param player The player address to check
     * @param winAmount The amount the player would win if no MEV is detected
     */
    function _requestTransactionCheck(address player, uint256 winAmount) private {
        Chainlink.Request memory request = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillTransactionCheck.selector
        );
        
        // Set request parameters for the off-chain data provider
        request.add("fromBlock", uintToString(playerBetBlock));
        request.add("toBlock", "latest");
        request.add("fromAddress", addressToString(player));
        request.add("toAddress", addressToString(rateContract));
        request.add("url", apiUrl);
        
        bytes32 requestId = sendChainlinkRequest(request, fee);
        
        // Store request mapping
        requestToPlayer[requestId] = player;
        requestToWinAmount[requestId] = winAmount;
        
        emit OracleRequestSent(requestId, player);
    }
    
    /**
     * @dev Chainlink oracle callback function
     * @param requestId The request ID
     * @param hasMEVTransactions Boolean indicating if MEV transactions were found
     */
    function fulfillTransactionCheck(
        bytes32 requestId,
        bool hasMEVTransactions
    ) public recordChainlinkFulfillment(requestId) {
        address player = requestToPlayer[requestId];
        uint256 winAmount = requestToWinAmount[requestId];
        
        emit TransactionCheckCompleted(requestId, hasMEVTransactions);
        
        if (hasMEVTransactions) {
            // MEV detected - abort the bet
            emit BetAborted(player, "MEV transactions detected");
            _resetBetState();
        } else {
            // No MEV detected - pay the player
            _payoutWinner(player, winAmount);
        }
        
        // Clean up request mappings
        delete requestToPlayer[requestId];
        delete requestToWinAmount[requestId];
    }
    
    /**
     * @dev Pay out the winner
     * @param player The winning player
     * @param amount The amount to pay
     */
    function _payoutWinner(address player, uint256 amount) private {
        betWallet = 0;
        _resetBetState();
        
        (bool success, ) = player.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit BetWon(player, amount);
    }
    
    /**
     * @dev Reset bet state
     */
    function _resetBetState() private {
        currentPlayer = address(0);
        playerBet = 0;
        playerBetBlock = 0;
    }
    
    /**
     * @dev Close bet after deadline - owner can claim remaining funds
     */
    function closeBet() external afterDeadline onlyOwner {
        uint256 amount = betWallet;
        betWallet = 0;
        _resetBetState();
        
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Transfer failed");
        
        emit BetClosed(owner(), amount);
    }
    /**
     * @dev Utility function to convert uint to string
     */
    function uintToString(uint256 value) private pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    /**
     * @dev Utility function to convert address to string
     */
    function addressToString(address addr) private pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}
 