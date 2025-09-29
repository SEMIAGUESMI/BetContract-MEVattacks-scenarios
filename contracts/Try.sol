// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IRateContract.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";


/**
 * @title MEVProtectedBetContract
 * @dev Smart contract for betting on token exchange rates with MEV protection
 * Implementation based on MEV Noninterference paper using Chainlink oracles
 */
contract Try is ChainlinkClient {
    using Chainlink for Chainlink.Request;
    
    uint256 public  fee;
    bytes32 public jobId;
    address public rateContract;
    address public  player ;
    uint256 public betWallet=10;
    uint256 public playerBetBlock;
    string public url_complete;
    bytes32 public requestId_;
    uint256 public data_=11;
    uint256 public returnedata ;
    bytes32 public returnedrequest ;

    event OracleRequestSent(bytes32 indexed requestId, address indexed player);
    event TransactionCheckCompleted(bytes32 indexed requestId, uint256 hasMEVTransactions);
    
    constructor(
        address _player,
        address _rateContract) {
        
        setChainlinkToken(0x779877A7B0D9E8603169DdbD7836e478b4624789);
        setChainlinkOracle(0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD);
        
        jobId = "ca98366cc7314957b8c012c72f05aeeb";
        
        fee = (1*LINK_DIVISIBILITY)/10;
        rateContract = _rateContract;
        player=_player;
       
    }
   
    function placeBet() external {
        playerBetBlock = block.number;
    }
    
    function claimWin() external{
        _requestTransactionCheck();
    }
    
    function _requestTransactionCheck() public returns (bytes32) {
        Chainlink.Request memory request = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillTransactionCheck.selector
        );
        string memory fromaddress= adrToString(player);
        string memory toAddress= adrToString(rateContract);
        string memory  startBlock= uintToString(playerBetBlock);
        string memory baseUrl = "https://alchemy-api.onrender.com/";
        string memory urlreq = string(
            abi.encodePacked(
                baseUrl,
                "&from=", fromaddress,
                "&to=", toAddress,
                "&startBlock=", startBlock
            )
        );
        url_complete = urlreq;
        request.add("get", urlreq);
        request.add("path", "data"); 
        int256 timesAmount = 10 ** 18;
        request.addInt("times", timesAmount);

        requestId_= sendChainlinkRequest(request, fee);
        return requestId_;
        
    }
    
    function fulfillTransactionCheck(
        bytes32 requestId,
        uint256 data
    ) public recordChainlinkFulfillment(requestId) {
        emit TransactionCheckCompleted(requestId, data);
        data_=data;
        returnedata=data;
        returnedrequest=requestId;
    }
    
   /* function uintToString(uint256 value) private pure returns (string memory) {
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
    }*/
    
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
    function adrToString(address _addr) internal pure returns (string memory) {
    return Strings.toHexString(uint256(uint160(_addr)), 20);
    }
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
}
 