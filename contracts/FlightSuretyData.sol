// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    struct InsurancePolicy {
        bytes32 flightKey;
        address airline;
        address insuredAddress;
        uint256 amountInsuredFor; // 1 E >= how much is paid by Customer
        uint256 amountCredited; // 1.5 x amountInsuredFor
        bool isOpen; // if not open, will no longer issue credits. a bit of a hack.
        bool isPaid;
    }

    mapping(address => uint256) private airlineFundingBalances;
    // map by flightKey to InsurancePolicy array
    mapping(bytes32 => InsurancePolicy[]) private insurancePoliciesByFlightKey;

    mapping(address => uint256) private insuredCreditGiven;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/
    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor()  {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/
    /**
     * @dev Buy insurance for a flight
    *
    */
    event Data_BuyInsurnce(address airline, bytes32 flightKey, address buyer, uint256 amount);

    function buyInsurance(address _airline, bytes32 _flightKey)
    external payable
    requireIsOperational {
        InsurancePolicy memory ip = InsurancePolicy(
        {flightKey : _flightKey,
        airline : _airline,
        insuredAddress : msg.sender,
        amountInsuredFor : msg.value,
        amountCredited : 0 ether,
        isOpen : true,
        isPaid : false});
        insurancePoliciesByFlightKey[_flightKey].push(ip);
        emit Data_BuyInsurnce(_airline, _flightKey, msg.sender, msg.value);
    }

    /**
     *  @dev Credits payouts to insurees
    */
    event Data_CreditInsureds(bytes32 flightKey);

    function creditInsureds(bytes32 flightKey) external
    requireContractOwner
    requireIsOperational
    {

        // for each insured in the policies for this flight
        InsurancePolicy[] memory ipArray = insurancePoliciesByFlightKey[flightKey];

        for (uint i = 0; i < ipArray.length; i++) {
            InsurancePolicy memory ip = ipArray[i];
            if (ip.isOpen == true) {
                // credit them 1.5 x their premium
                ip.amountCredited = (15 * ip.amountInsuredFor)/10;
                // close this here, bit of a hack, but better than AppContract controlling our state
                ip.isOpen = false;
            }
        }
        emit Data_CreditInsureds(flightKey);
    }
    function getCreditForInsured(address insuredAddress)
    external view
    requireIsOperational
    returns (uint256){
        return insuredCreditGiven[insuredAddress];
    }

    /**
     *  @dev Close this flights insurance policies one by one
     Used when the flight has a status which needs not pay out
        */

    event Data_CloseInsurancePolicy(bytes32 flightKey);
    function closeInsurancePolicy(bytes32 flightKey) external
//    requireContractOwner
    requireIsOperational {

        // close all policies for this flight
        InsurancePolicy[] memory ipArray = insurancePoliciesByFlightKey[flightKey];

        for (uint i = 0; i < ipArray.length; i++) {
            InsurancePolicy memory ip = ipArray[i];
            ip.isOpen = false;
        }
    emit Data_CloseInsurancePolicy(flightKey);
    }
//    function getInsurancePoliciesByFlightKey(bytes32 flightKey)
//    public view returns (InsurancePolicy[] calldata){

//        return insurancePoliciesByFlightKey[flightKey];
//    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */

    function pay(address airlineAddress, bytes32 flightKey, address payable insuredAddress)
        external
        requireContractOwner
        requireIsOperational

    {
        // inefficient and gassy but ... whatever, it's a class not a commercial product
        InsurancePolicy[] memory ipArray = insurancePoliciesByFlightKey[flightKey];

        for (uint i = 0; i < ipArray.length; i++) {
            InsurancePolicy memory ip = ipArray[i];
            if (ip.insuredAddress == insuredAddress) {
                if (ip.isPaid == true) {
                    // don't pay again
                    return;
                }
                ip.isPaid = true;
                // is this a requirement? I don't recall it being one.
                airlineFundingBalances[airlineAddress].sub(ip.amountCredited);
                insuredAddress.transfer(ip.amountCredited);
            }
        }
    }

    /**
     * @dev How Airlines fund their participation.
    */
    event Data_FundingReceived(address airline, uint256 amount);
    function fund(address airlineAddress, uint256 amount) public payable
        requireIsOperational
    {
        // 10 eth is required but checked at interface of the App Contract, not here
        // as business rules may change
        airlineFundingBalances[airlineAddress].add(amount);
        emit Data_FundingReceived(airlineAddress, amount);
    }
    function getAirlineFundLevel(address airlineAddress) public view returns (uint256){
        return airlineFundingBalances[airlineAddress];
    }

//    fallback() external payable {
//        fund(msg.sender);
//    }

//    receive() external payable
//    {
//        fund(msg.sender);
//    }
    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    modifier requireIsOperational()  {
        require(operational, "Contract is currently not operational");
        _;
    }
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }


    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    event Data_OperatingStatusSet(bool status);
    function setOperatingStatus(bool mode) external //requireContractOwner
    {
        // no multi consensus required here
        operational = mode;
        emit Data_OperatingStatusSet(operational);

    }

    function isOperational() public view returns (bool)  {
        return operational;
    }


}

