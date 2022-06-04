// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./FlightSuretyData.sol";

contract FlightSuretyApp {
    using SafeMath for uint256;
    address private contractOwner;          // Account used to deploy contract
    //    address private dataContractAddress;
    FlightSuretyData private dataContract;
    bool operational = false;


    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20; // << This is the only one relevant to payouts
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;
    uint8 private nonce = 5;                            // Incremented to add pseudo-randomness at various points
    uint256 public constant REGISTRATION_FEE = 1 ether; // Fee to be paid when registering oracle
    uint256 private constant MIN_RESPONSES = 2;         // Number of oracles that must respond for valid status


    struct Airline {
        address airlineAddress;
        bool isRegistered;
        bool isFunded;
        bool isActive; // both isRegisterd and isFunded. Not needed as we can calculate it, but is simple.
    }

    address[] airlineAddresses;
    mapping(address => Airline) airlines;
    // easy way for m of n once we have more than 4
    uint256 activeAirlinesCount;

    struct Flight {
        bytes32 flightKey;
        //        bool isRegistered;
        uint8 statusCode;
        uint256 timestamp;
        address airline;
    }

    mapping(bytes32 => Flight) private flightsByFlightKey;

    struct OracleRegistration {
        bool isRegistered;
        uint8[3] indexes;
    }

    modifier requireIsOperational()     {
        // used on all state changing functions
        // Modify to call data contract's status
        require(operational == true, "Contract is currently not operational");
        _;
        // All modifiers require an "_" which indicates where the function body will be added
    }
    modifier requireContractOwner()    {
        require(msg.sender == contractOwner, "Caller must be contract owner to make this call.");
        _;
    }
    modifier requireNominatedAirlineIsNotYetRegistered(address airlineAddress) {
        require(!airlines[airlineAddress].isRegistered, "Airline must not yet be REGISTERED.");
        _;
    }
    modifier requireAirlineIsFunded(address airlineAddress) {
        require(airlines[airlineAddress].isFunded, "Airline must be FUNDED to make this call.");
        _;
    }
    modifier requireAirlineIsRegistered(address airlineAddress) {
        require(airlines[airlineAddress].isRegistered, "Airline must be REGISTERED to make this call.");
        _;
    }
    // require an airline is active in order to vote on registering an airline
    modifier requireNominatingAirlineIsActive(address airlineAddress) {
        require(airlines[airlineAddress].isActive, "Airline must be ACTIVE to make this call.");
        _;
    }
    modifier requireLessThanOneEther(uint256 value){
        require(value <= 1 ether, "Cannot insure for more than one ether.");
        _;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    // implies Data Contract has already been deployed
    constructor(address _contractOwner, address dataContractAddress, address firstAirlineAddress){
        contractOwner = _contractOwner;
        dataContract = FlightSuretyData(dataContractAddress);
        _registerAirline(firstAirlineAddress);
    }

    function setOperatingStatus(uint256 mode) external
//    requireContractOwner
    {
        if (mode > 0) {
            operational = true;
        } else {
            operational = false;
        }
        dataContract.setOperatingStatus(operational);
    }
    function isOperational() public view
    returns (bool)
    {
        return operational;
    }
    // a simple way to test the isOperational modifier
    function isOperationalTest() public view
    requireIsOperational
    returns (bool)
    {
        return isOperational();
    }
    /**
     * Assuming only one registration at a time
     * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *      M of N Multi-party Consensus is required
    *        - M is 1/2 of N

    *       NOTE: Will only allowing one airline to be added at a time.
            Otherwise, would need an M of N for each airline which was
            being added in parallel. No requirement for that.
    */

    address[] mofnConsensusToRegisterAnAirline = new address[](0);

    function registerAirline(address airlineAddress)
    external
    requireIsOperational
    requireNominatingAirlineIsActive(msg.sender)
    requireNominatedAirlineIsNotYetRegistered(airlineAddress)
//    returns (bool success, uint256 votes) {
    returns (bool) {
        require(!airlines[msg.sender].isRegistered, "Airline is already Registered.");
        // check if it is already registered


        // no requirement to prevent an airline from voting twice,
        //but will not do this in the test anyway
        //        if (bAlreadyVoted == false) {

        //        }

        // only do M of N if N > 4
        // M by the way is only to be greater than 50%
        if (activeAirlinesCount < 4) {
            _registerAirline(airlineAddress);
        }
        else {
            mofnConsensusToRegisterAnAirline.push(msg.sender);

            if (mofnConsensusToRegisterAnAirline.length >= activeAirlinesCount / 2) {
                // ok, majority has been reached
                mofnConsensusToRegisterAnAirline = new address[](0);

                _registerAirline(airlineAddress);
                return true;
            }
        }
//        return (success, mofnConsensusToRegisterAnAirline.length);
        return (false);

    }

    event RegisteredAirline(Airline airline);
    event FundedAirline(address airlineAddress, uint256 amount);

    function _registerAirline(address newAirlineAddress)
    private
        // this requireOperational modifier doesn't feel right as it is an internal call
        // and should executed because the call has passed a previous modifier
        // so out it goes
        // requireIsOperational
    returns (bool) {
        Airline memory newAirline = Airline
        ({airlineAddress : newAirlineAddress,
        isActive : false,
        isFunded : false,
        isRegistered : true
        });
        airlines[newAirlineAddress] = newAirline;
        airlineAddresses.push(newAirlineAddress);
        emit RegisteredAirline(newAirline);

        return (true);
    }

    function getRegisteredAirlines() external view returns (address[] memory){
        return airlineAddresses;
    }

    function isAirlineRegistered(address _airline) external view
    returns (bool) {
        for (uint256 i = 0; i < airlineAddresses.length; i++) {
            if (airlineAddresses[i] == _airline) {
                return true;
            }
        }
        return false;
    }

    function fund()
    external
    payable
    requireIsOperational
    requireAirlineIsRegistered(msg.sender)
    {
        require(msg.value == 10 ether);

        airlines[msg.sender].isFunded;
        if (airlines[msg.sender].isRegistered) {
            airlines[msg.sender].isActive = true;
            activeAirlinesCount++;
        }

        dataContract.fund{value : msg.value}(msg.sender);
        emit FundedAirline(msg.sender, msg.value);
    }

    function pay(address airlineAddress, string memory flight, uint256 timestamp) external {
        bytes32 flightKey = getFlightKey(airlineAddress, flight, timestamp);
        dataContract.pay(airlineAddress, flightKey, payable(msg.sender));
    }

    function buyInsurance(address airlineAddress, string memory flight, uint256 timestamp)
    external payable
    requireLessThanOneEther(msg.value) {
        bytes32 flightKey = getFlightKey(airlineAddress, flight, timestamp);
        dataContract.buyInsurance(airlineAddress, flightKey);
    }

//    function getInsurancePoliciesForFlight(address airlineAddress, string memory flight, uint256 timestamp)
//    public view returns (FlightSuretyData.InsurancePolicy[] calldata){
//        bytes32 flightKey = getFlightKey(airlineAddress, flight, timestamp);
//        return dataContract.getInsurancePoliciesByFlightKey(flightKey);
//    }
    function getCreditForInsured(address insuredAddress)
    external view
    requireIsOperational
    returns (uint256){
        return dataContract.getCreditForInsured(insuredAddress);
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) pure internal returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // what is the point of this?
    // is it required that the airline is registered? Makes sense.
    function registerFlight(address airlineAddress, string memory flightName, uint256 timestamp) external
    requireIsOperational
    requireAirlineIsRegistered(airlineAddress) {
        // do we check to see if the flight has already been registered?
        // not a requirement and also idempotent
        bytes32 flightKey = getFlightKey(airlineAddress, flightName, timestamp);
        Flight memory flight = Flight(
        {flightKey : flightKey,
        timestamp : timestamp,
        airline : airlineAddress,
        statusCode : STATUS_CODE_UNKNOWN});

        flightsByFlightKey[flightKey] = flight;
    }


    ///////// ORACLE STUFF /////////////

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

    // Triggered from the UI
    function fetchFlightStatus(address airline, string memory flight, uint256 timestamp) external {
        // Generate a request for oracles to fetch flight information
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        responseInfoByKey[key] = ResponseInfo({requester : msg.sender, isOpen : true});
        emit OracleRequest(index, airline, flight, timestamp);
    }
    /**
    * @dev Called after oracle has updated flight status
    *
    */
    function processFlightStatus(address airline, string memory flight, uint256 timestamp, uint8 statusCode) internal  {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        // if status code is not 20, do nothing
        if (statusCode == STATUS_CODE_UNKNOWN) {
            return;
        } else if (statusCode == STATUS_CODE_LATE_AIRLINE) {
            // if status code is 20, then pay out all passengers who are insured for this flight
            dataContract.creditInsureds(flightKey);
        }
        // no matter what, close down the policy for this flight
        dataContract.closeInsurancePolicy(flightKey);
    }

    function submitOracleResponse(uint8 index, address airline, string memory flight, uint256 timestamp, uint8 statusCode) external {

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

    function registerOracle() external payable {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracleRegistrationsByAddress[msg.sender] = OracleRegistration({
        isRegistered : true,
        indexes : indexes
        });
        emit OracleRegistered(msg.sender);

    }


    function generateIndexes(address account) internal returns (uint8[3] memory) {
        // Returns array of three non-duplicating integers from 0-9
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);

        indexes[1] = indexes[0];
        while (indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while ((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }
        return indexes;
    }

    function getMyIndexes() view external returns (uint8[3] memory) {
        require(oracleRegistrationsByAddress[msg.sender].isRegistered, "This Oracle is not REGISTERED");
        return oracleRegistrationsByAddress[msg.sender].indexes;
    }

    function getRandomIndex(address account) internal returns (uint8) {
        uint8 maxValue = 10;
        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);
        if (nonce > 250) {
            nonce = 0;
            // Can only fetch blockhashes for last 256 blocks so we adapt
        }
        return random;
    }


}
