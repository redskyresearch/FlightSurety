const Test = require('../config/testConfig.js');
const truffleAssert = require('truffle-assertions');
const assert = require("assert");


contract('testIsOperational', async (accounts) => {

    //  var config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
    });

    it(`Set and Check operational status`, async function () {
        // Get operating status
        await config.flightSuretyData.getAirlineAddresses();
        let status = await config.flightSuretyApp.isOperational();
        assert.equal(status, true, "Expected isOperation to be TRUE");


        await config.flightSuretyApp.setOperatingStatus(false);
        status = await config.flightSuretyApp.isOperational();
        assert.equal(status, false, "Expected isOperation to be FALSE");

    });
});
