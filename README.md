# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

Environment:
node v16.13.0
Truffle v5.4.29

##Status
At the moment, I am stuck. I cannot register Oracles via server.js.  
I _can_, however, register Oracles via ./test/oracles.js



## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`
`truffle test ./test/oracles.js`

To use the dapp:

`truffle migrate`
`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder


## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)  


=========================== Project REPORT ===========================
I tried to solve this ResponseInfo compile error problem independently. Could not:

```  
TypeError: Types in storage containing (nested) mappings cannot be assigned to.
--> project:/contracts/ExerciseC6D/ExerciseC6D.sol:143:9:
|
143 |         oracleResponseInfoByKey[key] = ResponseInfo({
|         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^``
```
Borrowed Code Note: 
Through Udacity Knowledge system, I found this updated coded repo from Jasper V and updated my
ResponseInfo object in two places as follows:
https://github.com/yarode/FlightSurety/commit/cd75f8017e769280d7216ffb3603d97f3903552f

I changed this original non-compiling code:

`struct ResponseInfo {`   
`address requester;`  
`bool isOpen;`                 
`mapping(uint8 => address[]) responses;`     
`}`

to this compiling code:  
`struct ResponseInfo {  `  
`address requester;`
`bool isOpen;  `                            
`//mapping(uint8 => address[]) responses;`   
`}`  
`mapping(bytes32 => mapping(uint8 => address[])) private oracleResponsesByKeyAndStatusCode;` 
Borrowed package.json Note: Also, I battled with the 3 year out of date package.json and 'scaffolding' for 6 hours.

Finally, I found a package.json that worked, thank the almighty.

I took it from here:
https://github.com/cfagena/FlightSurety.git


#----------Rubric Tracking--------------  

###=====General Requirements======

###Smart Contract Separation  
Smart Contract code is separated into multiple contracts:

1) FlightSuretyData.sol for data persistence
2) FlightSuretyApp.sol for app logic and oracles code

###Dapp Created and Used for Contract Calls

A Dapp client has been created and is used for triggering contract calls. Client can be launched with “npm run dapp” and is available at http://localhost:8000

Specific contract calls:

1) Passenger can purchase insurance for flight
2) Trigger contract to request flight status update

###Oracle Server Application    
-->A server app has been created for simulating oracle behavior. Server can be launched with “npm run server”

###Operational status control is implemented in contracts  
--> Students has implemented operational status control.

###Fail Fast Contract  
-->Contract functions “fail fast” by having a majority of “require()” calls at the beginning of function body

###=======Airline Requirements=========

###Airline Contract Initialization

First airline is registered when contract is deployed.

###Multiparty Consensus

Only existing airline may register a new airline until there are at least four airlines registered

Demonstrated either with Truffle test or by making call from client Dapp

###Multiparty Consensus

Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines

Demonstrated either with Truffle test or by making call from client Dapp

###Airline Ante

Airline can be registered, but does not participate in contract until it submits funding of 10 ether (make sure it is not 10 wei)

Demonstrated either with Truffle test or by making call from client Dapp

###======Passenger Requirements======

###Passenger Airline Choice

Passengers can choose from a fixed list of flight numbers and departures that are defined in the Dapp client

Your UI implementation should include:

Fields for Airline Address and Airline Name
Amount of funds to send/which airline to send to
Ability to purchase flight insurance for no more than 1 ether

###Passenger Payment

__Passengers may pay up to 1 ether for purchasing flight insurance.__

###Passenger Repayment

If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid

###Passenger Withdraw

Passenger can withdraw any funds owed to them as a result of receiving credit for insurance payout

###Insurance Payouts

Insurance payouts are not sent directly to passenger’s wallet

###=====Oracle (Server App) Requirements =====

###Functioning Oracle  
--> Oracle functionality is implemented in the server app.

###Oracle Initialization    
-->Upon startup, 20+ oracles are registered and their assigned indexes are persisted in memory

###Oracle Updates  
--> Update flight status requests from client Dapp result in OracleRequest event emitted by Smart Contract that is captured by server (displays on console and handled in code)

###Oracle Functionality  
--> Server will loop through all registered oracles, identify those oracles for which the OracleRequest event applies, and respond by calling into FlightSuretyApp contract with random status code of Unknown (0), On Time (10) or Late Airline (20), Late Weather (30), Late Technical (40), or Late Other (50)  
NOTE:  For randomly selecting a Status for the statuses[] array, I used example code from Stack Overflow
https://stackoverflow.com/questions/5915096/get-a-random-item-from-a-javascript-array
