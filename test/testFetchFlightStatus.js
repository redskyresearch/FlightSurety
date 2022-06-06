var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');
const assert = require("assert");

contract('FetchFlightStatus', async (accounts) => {

    //  var config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
    });
    console.log("First let's set this to operational.");
    await config.flightSuretyApp.setOperatingStatus(1);
    let status = await config.flightSuretyApp.isOperational();
    assert.equal(status, 1, "Expected isOperation to be TRUE");

    it('Test: Request Flight Status', async () => {


        // first let's make sure it is operational
        await config.flightSuretyApp.setOperatingStatus(1);
        status = await config.flightSuretyApp.isOperational();
        assert.equal(status, 1, "Expected isOperation to be TRUE");

        // ARRANGE
        let flight = 'ND1309'; // Course number
        let timestamp = Math.floor(Date.now() / 1000);
        let indexForThisFlightStatus;

        // Submit a request for oracles to get status information for a flight
        let result = await config.flightSuretyApp.fetchFlightStatus(config.firstAirline, flight, timestamp);
        console.log(`Transaction ${result.tx}`);
        // filter only events of OracleRegistered or whatever
        truffleAssert.prettyPrintEmittedEvents(result, 2);

        let events = result.logs.filter((entry) => entry.event === 'OracleRequest');

        let eventObject = JSON.parse(JSON.stringify(events[0]));
        truffleAssert.eventEmitted(result, 'OracleRequest', (ev) => {
            indexForThisFlightStatus = ev.index;
            console.log("Received expected OracleRequest Event with index " + indexForThisFlightStatus);
            return (ev.flight === flight && ev.timestamp == timestamp);
        });
    });
});
