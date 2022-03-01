// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    address private contractOwner;          // Account used to deploy contract

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
    }
    mapping(bytes32 => Flight) private flightsByFlightKey;

    struct OracleRegistration {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping(address => OracleRegistration) private oracleRegistrationsByAddress;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester; // Account that requested status
        bool isOpen;       // If open, oracle responses are accepted
    }
    // Track all oracle responses
    // Key = hash(index, airline, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private responseInfoByKey;
    mapping(bytes32 => mapping(uint8 => address[])) private responseInfoByKeyAndStatusCode;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);
    event OracleReport(address oracle, address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted. Oracles track this and if they have a matching index. they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);

    modifier requireIsOperational()     {
        // used on all state changing functions
         // Modify to call data contract's status
        require(true, "Contract is currently not operational");  
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }
    modifier requireContractOwner()    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }
    constructor(/*address addressOfDataContract*/) {
        contractOwner = msg.sender;
    }


    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    function registerAirline() external pure returns(bool success, uint256 votes) {
        return (success, 0);
    }

    function registerFlight() external pure {
    }

    function fetchFlightStatus(address airline, string memory flight, uint256 timestamp) external {
        // Generate a request for oracles to fetch flight information
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        responseInfoByKey[key] = ResponseInfo({requester: msg.sender, isOpen: true});
        emit OracleRequest(index, airline, flight, timestamp);
    }
    /**
    * @dev Called after oracle has updated flight status
    *
    */  
    function processFlightStatus(address airline, string memory flight, uint256 timestamp, uint8 statusCode) internal pure {
    }

    function submitOracleResponse  (uint8 index, address airline, string memory flight, uint256 timestamp, uint8 statusCode) external {

        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
//        require(responseInfoByKey[key].isOpen, "OracleRequest with index (" + index + "), airline (" + airline + "), flight (" + flight + ") and timestamp (" + timestamp + ") is not OPEN");
        require(responseInfoByKey[key].isOpen, "OracleRequest is not OPEN");
        require((oracleRegistrationsByAddress[msg.sender].indexes[0] == index) ||
                (oracleRegistrationsByAddress[msg.sender].indexes[1] == index) ||
                (oracleRegistrationsByAddress[msg.sender].indexes[2] == index), "Oracle has no matching Index for this OracleRequest");

        responseInfoByKeyAndStatusCode[key][statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(msg.sender, airline, flight, timestamp, statusCode);

        if (responseInfoByKeyAndStatusCode[key][statusCode].length >= MIN_RESPONSES) {
            // CODE EXERCISE 3: Prevent any more responses since MIN_RESPONSE threshold has been reached
            /* Enter code here */
            responseInfoByKey[key].isOpen = false;

            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
    }


    event    OracleRegistered(address sender);
    function registerOracle() external  payable {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

       uint8[3] memory indexes = generateIndexes(msg.sender);

                oracleRegistrationsByAddress[msg.sender] = OracleRegistration({
                    isRegistered: true,
                    indexes: indexes
                });
       emit OracleRegistered(msg.sender);

    }
    function isOperational()public pure returns(bool) {
        return true;  // Modify to call data contract's status
    }
    function getFlightKey (address airline, string memory flight,  uint256 timestamp) pure internal returns(bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }
    function generateIndexes(address account) internal returns(uint8[3] memory ) {
        // Returns array of three non-duplicating integers from 0-9
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);

        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }
        return indexes;
    }
    function getMyIndexes () view external returns(uint8[3] memory) {
        require(oracleRegistrationsByAddress[msg.sender].isRegistered, "This Oracle is not REGISTERED");
        return oracleRegistrationsByAddress[msg.sender].indexes;
    }
    function getRandomIndex(address account) internal returns (uint8) {
        uint8 maxValue = 10;
        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);
        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }
        return random;
    }


    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;
    uint8 private nonce = 0;                            // Incremented to add pseudo-randomness at various points
    uint256 public constant REGISTRATION_FEE = 1 ether; // Fee to be paid when registering oracle
    uint256 private constant MIN_RESPONSES = 2;         // Number of oracles that must respond for valid status
}
