const Test = require('../config/testConfig.js');
const truffleAssert = require('truffle-assertions');
const assert = require("assert");


contract('testIsFirstAirlineRegistered', async (accounts) => {

    //  var config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
    });

    it(`Check if first airline is registered`, async function () {
        // Get operating status
        console.log("Checking to see if " + accounts[1] + " is registered after deployment.");
        let status = await config.flightSuretyApp.isAirlineRegistered(accounts[1]);
        assert.equal(status, true, "Expected isAirlineRegistered to be TRUE");
 });
    it(`Now Try to register another Airline before funding - must fail`, async function () {
        // Get operating status
        console.log(accounts[1] + " will try to register " + accounts[2] + " and fail due to not having funded yet");
        let status = await config.flightSuretyApp.registerAirline(accounts[2], {from:accounts[1]});
        assert.equal(status, false, "Expected register to fail due to no funding yet");
    });

    it(`Now Fund first airline and get Active`, async function () {

//        await config.flightSuretyApp.getPastEvents( 'ActiveAirline', { fromBlock: 0, toBlock: 'latest' } );
        let ante = web3.utils.toWei("10", "ether");
        let result = await config.flightSuretyApp.fund({from:accounts[1], value:ante});
        truffleAssert.prettyPrintEmittedEvents(result, 2);
    });

    // it(`Register 3 more airlines - look for Events`, async function () {
    //     // Get operating status
    //     console.log("Registering new Airline: " + accounts[2]);
    //     let status = await config.flightSuretyApp.registerAirline(accounts[2], {from:accounts[1]});
    //     assert.equal(status, true, "Expected Registration SUCCESS.");
    // });


});
