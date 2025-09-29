// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IRateContract.sol";

/**
 * @title ProtectedBetContract
 * @dev Smart contract for betting on token exchange rates with MEV protection
 * Implementation based on MEV Noninterference paper using Chainlink oracles
 */

contract ProtectedBetContract is ChainlinkClient, ConfirmedOwner {
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
    uint256 public playerBetBlock;

    //oracle configuration
    uint256 public volume;
    bytes32 private jobId;
    uint256 private fee;

    // Events
    event BetPlaced(address indexed player, uint256 amount);
    event BetWon(address indexed player, uint256 amount);
    event BetClosed(address indexed owner, uint256 amount);
    event ContractInitialized(
        address indexed owner,
        uint256 initialPot,
        uint256 betRate,
        uint256 deadline
    );
    event RequestVolume(bytes32 indexed requestId, uint256 volume);

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
        require(
            msg.sender == currentPlayer,
            "Only current player can call this"
        );
        _;
    }

    /**
     * @dev Constructor - initializes the bet contract
     * @param _betRate The rate threshold for winning bets
     * @param _token Token address to bet on
     * @param _rateContract Address of the rate contract (AMM or Exchange)
     * @param _deadline Deadline for placing and claiming bets
     */

    /**
     * @notice Initialize the link token and target oracle
     *
     * Sepolia Testnet details:
     * Link Token: 0x779877A7B0D9E8603169DdbD7836e478b4624789
     * Oracle: 0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD (Chainlink DevRel)
     * jobId: ca98366cc7314957b8c012c72f05aeeb (task for uint256 returned value)
     *
     */
    constructor(
        uint256 _betRate,
        address _token,
        address _rateContract,
        uint256 _deadline
    ) payable ConfirmedOwner(msg.sender) {
        require(msg.value > 0, "Must send initial pot amount ");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(
            _rateContract != address(0),
            "Rate contract address cannot be zero"
        );

        // Verify rate contract supports the token pair
        require(
            IRateContract(_rateContract).supportsExchange(_token, address(0)),
            "Rate contract does not support ETH/token exchange"
        );

        betWallet = msg.value;
        initialPot = msg.value;
        betRate = _betRate;
        token = _token;
        rateContract = _rateContract;
        deadline = _deadline;

        setChainlinkToken(0x779877A7B0D9E8603169DdbD7836e478b4624789);
        setChainlinkOracle(0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD);
        jobId = "ca98366cc7314957b8c012c72f05aeeb";
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18

        emit ContractInitialized(owner(), initialPot, _betRate, _deadline);
    }

    /**
     * @dev Place a bet - player must match the current bet wallet amount
     */
    function placeBet() external payable beforeDeadline {
        require(
            msg.value == betWallet,
            "Bet amount must equal current bet wallet"
        );
        require(msg.sender != owner(), "Owner cannot place bets");

        currentPlayer = msg.sender;
        playerBet = msg.value;
        betWallet += msg.value; // Double the pot
        playerBetBlock = block.number;
        emit BetPlaced(msg.sender, msg.value);
    }
    /**
     * @dev Claim win - player wins if current rate exceeds bet rate
     * This is where MEV vulnerability exists in unprotected version
     */
    function claimWin() external beforeDeadline onlyCurrentPlayer {
        uint256 currentRate = IRateContract(rateContract).getRate(
            token,
            address(0)
        );

        if (currentRate > betRate) {
            requestVolumeData();
        }
    }

    function requestVolumeData() public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );
        string memory fromaddress_ = adrToString(currentPlayer);
        string memory toAddress_ = adrToString(rateContract);
        string memory startBlock_ = uintToString(playerBetBlock);
        string memory baseUrl = "https://alchemy-api.onrender.com/";
        string memory urlreq = string(
            abi.encodePacked(
                baseUrl,
                "?from=",
                fromaddress_,
                "&to=",
                toAddress_,
                "&startBlock=",
                startBlock_
            )
        );

        req.add("get", urlreq);
        req.add("path", "result");
        req.addInt("times", 1);
        return sendChainlinkRequest(req, fee);
    }

    /**
     * Receive the response in the form of uint256
     */
    function fulfill(
        bytes32 _requestId,
        uint256 _volume
    ) public recordChainlinkFulfillment(_requestId) {
        emit RequestVolume(_requestId, _volume);
        if (_volume > 0) {
            currentPlayer = address(0);
            playerBet = 0;
        } else {
            uint256 winAmount = betWallet;
            address winPlayer = currentPlayer;
            betWallet = 0;
            currentPlayer = address(0);
            playerBet = 0;
            (bool success, ) = payable(winPlayer).call{value: winAmount}("");
            require(success, "Transfer failed");

            emit BetWon(winPlayer, winAmount);
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

        (bool success, ) = owner().call{value: amount}("");
        require(success, "Transfer failed");

        emit BetClosed(owner(), amount);
    }
    
    /**
     * @dev uintToString converte from uint to string
     */
    function uintToString(uint256 value) internal pure returns (string memory) {
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev adrToString convert address to string
     */
    function adrToString(address _addr) internal pure returns (string memory) {
        return Strings.toHexString(uint256(uint160(_addr)), 20);
    }

    /**
     * @dev Receive ETH directly 
     */
    receive() external payable {
        // Allow contract to receive ETH
    }
}
