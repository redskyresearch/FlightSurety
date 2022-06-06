const Test = require('../config/testConfig.js');
const truffleAssert = require('truffle-assertions');
const assert = require("assert");


contract('Register Airlines with M of N Cases', async (accounts) => {

    let config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
    });

    it(`Account 1 Register account 3`, async function () {
        let message = accounts[1] + " will try to register " + accounts[3];
        console.log(message);

        let result = await config.flightSuretyApp.registerAirline(accounts[3], {from:accounts[1]});
        console.log(message + ">>>Result is " + result);

        truffleAssert.prettyPrintEmittedEvents(result, 2);
        assert.equal(result, true, "Expected register to be successful due to airline having been funding");

    });
    it(`Account 1 Register account 4`, async function () {
        let message = accounts[1] + " will try to register " + accounts[4];
        console.log(message);
        let result = await config.flightSuretyApp.registerAirline(accounts[4], {from:accounts[1]});
        console.log(message + ">>>Result is " + result);
        truffleAssert.prettyPrintEmittedEvents(result, 2);
        assert.equal(result, true, "Expected register to be successful due to airline having been funding");
    });
    it(`Account 1 Register account 5`, async function () {
        console.log(accounts[1] + " will try to register " + accounts[5] + "");
        let result = await config.flightSuretyApp.registerAirline(accounts[5], {from:accounts[1]});
        console.log(message + ">>>Result is " + result);
        truffleAssert.prettyPrintEmittedEvents(result, 2);
        assert.equal(result, true, "Expected register to be successful due to airline having been funding");
    });
    it(`Account 5 should not be yet registered`, async function () {
        console.log("Checking to see if " + accounts[5] + " is registered ");
        let result = await config.flightSuretyApp.isAirlineRegistered(accounts[5]);
        console.log(message + ">>>Result is " + result);
        assert.equal(result, false, "Expected Account 5 not to be registered yet");
    });

    ////////// Must fund accounts 2, 3, 4 in order to vote for account 5
    it(`Fund Account 2 to become ACTIVE`, async function () {
        let message = "Funding account 2 " + accounts[2];
        console.log(message);
        let ante = web3.utils.toWei("10", "ether");
        let result = await config.flightSuretyApp.fund({from:accounts[2], value:ante});
        console.log(message + ">>>Result is " + result);
        truffleAssert.prettyPrintEmittedEvents(result, 2);
        assert.equal(result, true, "Expected that funding would have been successful.");

    });
    it(`Fund Account 3 to become ACTIVE`, async function () {
        let message = "Funding account 3 " + accounts[3];
        console.log(message);
        let ante = web3.utils.toWei("10", "ether");
        let result = await config.flightSuretyApp.fund({from:accounts[2], value:ante});
        console.log(message + ">>>Result is " + result);
        truffleAssert.prettyPrintEmittedEvents(result, 2);
        assert.equal(result, true, "Expected that funding would have been successful.");

    });
    it(`Fund Account 4 to become ACTIVE`, async function () {
        let message = "Funding account 4 " + accounts[4];
        console.log(message);
        let ante = web3.utils.toWei("10", "ether");
        let result = await config.flightSuretyApp.fund({from:accounts[2], value:ante});
        console.log(message + ">>>Result is " + result);
        truffleAssert.prettyPrintEmittedEvents(result, 2);
        assert.equal(result, true, "Expected that funding would have been successful.");
    });

    // now we vote. Only after Account 3 votes should Account 5 be registered
    it(`Account 2 Register account 5`, async function () {
        let message = accounts[2] + " will try to register " + accounts[5];
        console.log(message);
        let result = await config.flightSuretyApp.registerAirline(accounts[5], {from:accounts[2]});
        console.log(message + ">>>Result is " + result);
        truffleAssert.prettyPrintEmittedEvents(result, 2);
        assert.equal(result, true, "Expected register to be successful due to airline having been funding");
    });
    it(`Account 5 should NOT be yet registered`, async function () {
        let message = "Checking to see if " + accounts[5] + " is registered M of N.";
        console.log(message);
        let result = await config.flightSuretyApp.isAirlineRegistered(accounts[5]);
        console.log(message + ">>>Result is " + result);
        assert.equal(result, false, "Expected Account 5 not to be registered yet");
    });
    // now we vote. Only after Account 3 votes should Account 5 be registered
    it(`Account 3 Register account 5`, async function () {
        let message = accounts[3] + " will try to register " + accounts[5];
        console.log(message);
        let result = await config.flightSuretyApp.registerAirline(accounts[5], {from:accounts[3]});
        console.log(message + ">>>Result is " + result);
        truffleAssert.prettyPrintEmittedEvents(result, 2);
        assert.equal(result, true, "Expected register to be successful due to airline having been funding");
    });
    it(`Account 5 should be registered`, async function () {
        let message = "Checking to see if " + accounts[5] + " is registered M of N.";
        console.log(message);
        let result = await config.flightSuretyApp.isAirlineRegistered(accounts[5]);
        console.log(message + ">>>Result is " + result);
        assert.equal(result, true, "Expected Account 5 not to be registered yet");
    });


});
