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
        // set up as false to start, so let's confirm that
        let status = await config.flightSuretyApp.isOperational();
        assert.equal(status, false, "Expected isOperation to be FALSE on startup");

        await config.flightSuretyApp.setOperatingStatus(1);
        status = await config.flightSuretyApp.isOperational();
        assert.equal(status, 1, "Expected isOperation to be TRUE");


        await config.flightSuretyApp.setOperatingStatus(0);
        status = await config.flightSuretyApp.isOperational();
        assert.equal(status, 0, "Expected isOperation to be FALSE");

        await config.flightSuretyApp.setOperatingStatus(1);
        status = await config.flightSuretyApp.isOperational();
        assert.equal(status, 1, "Expected isOperation to be TRUE");
    });
});
