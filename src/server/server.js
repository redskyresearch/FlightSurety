import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
import truffleAssert from "truffle-assertions";

// Watch contract events
const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

const TEST_ORACLES_COUNT = 20;

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);


async function loadOracles () {

let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();

// ACT
for(let a = 1; a < TEST_ORACLES_COUNT; a++) {
    let result;
    try {
        result = await config.flightSuretyApp.registerOracle({from: accounts[a], value: fee});
    } catch (error){
        console.log(`${a} registerOracle Failed: ${error.message}`);
        break;
    }
    // use truffleAssert to pretty print Events from Result
//      console.log(truffleAssert.prettyPrintEmittedEvents(result, 2));
    let events = result.logs.filter((entry) => entry.event === 'OracleRegistered');

    let eventObject = JSON.parse(JSON.stringify(events[0]));
    let eventValues = JSON.parse(JSON.stringify(events[0].args));
//      console.log(eventObject.event + ", Registered Oracle is " + eventValues['sender']);

    truffleAssert.eventEmitted(result, 'OracleRegistered', (ev) => {
//        console.log("Received Event -> from " + ev.sender);
        return ev.sender === accounts[a];
    });
    result = await config.flightSuretyApp.getMyIndexes.call({from: accounts[a]});
    console.log(`Event ${a}  ${eventObject.event} -> ${accounts[a]} Registered with indexes: ${result[0]}, ${result[1]}, ${result[2]}`);
}


flightSuretyApp.events.OracleRequest({
//    fromBlock: 0
  }, function (error, event) {

    if (error)
        console.log(error);
    console.log(event);
    let requestIndex = event.returnValues.index;
    let airline = event.returnValues.airline;
    let flight = event.returnValues.flight;
    let timestamp = event.returnValues.timestamp;
});

// TRW: put hard coded flights and timestamps here
// to hydrate the front end. Hmmm, how to do that?...

const app = express();

app.get('/api', (req, res) => {
    res.send({
        message: 'An API for use with your Dapp!'
    })
})
app.get('/api/getOracles', (req, res) => {
    res.send({
        message: 'api/getOracles called'
    })
})
app.get('/api/getEventLog', (req, res) => {
    res.send({
        message: 'api/getEventLog called'
    })
})

export default app;

/**
function () {
    // ARRANGE
    let flight = 'ND1309'; // Course number
    let timestamp = Math.floor(Date.now() / 1000);
    let indexForThisFlightStatus;

    // Submit a request for oracles to get status information for a flight
    let result = await config.flightSuretyApp.fetchFlightStatus(config.firstAirline, flight, timestamp);
    // filter only events of OracleRegistered or whatever

    truffleAssert.eventEmitted(result, 'OracleRequest', (ev) => {
        indexForThisFlightStatus = ev.index;
        console.log("Received expected OracleRequest Event with index " + indexForThisFlightStatus);
        return (ev.flight === flight && ev.timestamp == timestamp);
    });

    let oracleAddress;
    for(let iOracles = 1; iOracles < TEST_ORACLES_COUNT; iOracles++) {
        oracleAddress = accounts[iOracles];
        try {
            console.log(`(${iOracles}) Oracle ${accounts[iOracles]} submitting Response with correct index (${indexForThisFlightStatus})`);
            let result = await config.flightSuretyApp.submitOracleResponse(indexForThisFlightStatus, config.firstAirline, flight, timestamp, 10, {from: accounts[iOracles]});
            truffleAssert.eventEmitted(result, 'OracleReport', (ev) => {
                truffleAssert.prettyPrintEmittedEvents(result, 2);
                console.log("Received OracleReport Event");
                // filter only events of OracleRegistered or whatever
                //dumpEvent(result.logs[0]);
                console.log(getPrettyEventString("OracleReport...", result.logs[0]));
                console.log(getPrettyEventString(result.logs[0].event, result.logs[0]));
                return (ev.flight === flight && ev.timestamp == timestamp);
            });

        } catch (error) {
            // Enable this when debugging
            console.log(`(${iOracles}) Submit Failed: ${error.message}`);
        }
    }

*/