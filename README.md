# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

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