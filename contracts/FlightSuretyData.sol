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
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsureds(bytes32 flightKey) external view
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
    }
    /**
     *  @dev Close this flights insurance policies one by one
     Used when the flight has a status which needs not pay out
        */
    function closeInsurancePolicy(bytes32 flightKey) external view
    requireContractOwner
    requireIsOperational {

        // close all policies for this flight
        InsurancePolicy[] memory ipArray = insurancePoliciesByFlightKey[flightKey];

        for (uint i = 0; i < ipArray.length; i++) {
            InsurancePolicy memory ip = ipArray[i];
            ip.isOpen = false;
        }
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
    function fund(address airlineAddress) public payable
    requireIsOperational {
        // 10 eth is required but checked at interface of the App Contract, not here
        // as business rules may change
        airlineFundingBalances[airlineAddress].add(msg.value);
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
    function setOperatingStatus(bool mode) external requireContractOwner {
        // no multi consensus required here
        operational = mode;

    }

    function isOperational() public view returns (bool)  {
        return operational;
    }


}

