//SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IRateContract.sol";

/**
 * @title ProtectedBet
 * @dev Smart contract for betting on token exchange rates
 * Implementation
 *integrat chainlink oracle to mitigate MEV attacks
 */

contract ProtectedBet is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    // State variables
    address public ownerr;
    address public rateContract;
    address public token;
    uint256 public betRate;
    uint256 public deadline;
    uint256 public betWallet;
    uint256 public initialPot;
    address public currentPlayer;
    uint256 public playerBet;
    uint256 public playerBetBlock;
    string public url_complete;

    //oracle configuration
    bytes32 private jobId;
    uint256 private fee;

    //value to check
    uint256 public value_volume = 10;
    string public value_startBlock;
    bytes32 public value_requestId;

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
    event FulfillError(bytes32 requestId, string reason);

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
        ownerr = msg.sender;
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

        emit ContractInitialized(ownerr, initialPot, _betRate, _deadline);
    }

    /**
     * @dev Place a bet - player must match the current bet wallet amount
     */
    function placeBet() external payable beforeDeadline {
        require(
            msg.value == betWallet,
            "Bet amount must equal current bet wallet"
        );
        require(msg.sender != ownerr, "Owner cannot place bets");

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
            // check if the player has fromtRunning transactions of the claimWin() function
            requestVolumeData();
        }
    }
    /**
     * @dev requestVolumeData - retreive data from an API through
     * oracle
     * send chainlink request to check if the player interact(asset transfers)
     * with the rateContract with the bet between placeBet() call and claimWin() call
     */

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
        value_startBlock = startBlock_;
        url_complete = urlreq;
        req.add("get", urlreq);
        req.add("path", "result");
        req.addInt("times", 1);
        return sendChainlinkRequest(req, fee);
    }

    /**
     * @dev fulfill recieve data from oracle response
     */

    function fulfill(
        bytes32 _requestId,
        uint256 _volume
    ) public recordChainlinkFulfillment(_requestId) {
        emit RequestVolume(_requestId, _volume);
        value_volume = _volume;
        if (_volume > 0) {
            currentPlayer = address(0);
            playerBet = 0;
            emit FulfillError(_requestId, "font-running MEV atttack attempt");
        } else {
            (bool success, ) = payable(currentPlayer).call{value: betWallet}("");
            require(success, "Transfer failed");
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

        (bool success, ) = ownerr.call{value: amount}("");
        require(success, "Transfer failed");

        emit BetClosed(ownerr, amount);
    }
    /**
     * @dev Get current contract state
     */
    function getState()
        external
        view
        returns (
            address _owner,
            address _currentPlayer,
            uint256 _betWallet,
            uint256 _betRate,
            uint256 _deadline,
            uint256 _currentRate,
            bool _betActive
        )
    {
        uint256 currentRate = 0;
        if (rateContract != address(0)) {
            currentRate = IRateContract(rateContract).getRate(
                address(0),
                token
            );
        }
        return (
            ownerr,
            currentPlayer,
            betWallet,
            betRate,
            deadline,
            currentRate,
            currentPlayer != address(0)
        );
    }

    /**
     * @dev uintToString convert uint to string
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
