import FlightSuretyApp from './build/contracts/FlightSuretyApp.json';
import Config from './src/server/config.json';
import Web3 from 'web3';
import express, {request} from 'express';
//import truffleAssert from "truffle-assertions";
//import "babel-polyfill";

const NUMBER_OF_TEST_ORACLES = 20;

// Watch contract events
const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

let flightStatuses = [STATUS_CODE_UNKNOWN, STATUS_CODE_ON_TIME, STATUS_CODE_LATE_AIRLINE, STATUS_CODE_LATE_WEATHER, STATUS_CODE_LATE_TECHNICAL, STATUS_CODE_LATE_OTHER];

let config = Config['localhost'];
const web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];

console.log("web3 is " + web3.toSource());

console.log(`defaultAccount is ${web3.eth.accounts[0]}`);

console.log(`defaultAccount is ${web3.eth.defaultAccount}`);

let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
console.log(JSON.stringify(flightSuretyApp.methods));
let oracles = [];
let GAS = 6721975;
let INDEXES_PER_ORACLE = 3;

const loadOracleAddresses = (count) => {
    console.log(`Getting Oracle Addresses`);
    for (let i = 0; i < count; i++) {
        console.log(`Oracle Address ${i} is ${web3.eth.accounts[i]}`);
        oracles[i] = web3.eth.accounts[i + 1];
    }
}
loadOracleAddresses(NUMBER_OF_TEST_ORACLES);

const registerOracles = async () => {
    let fee = await flightSuretyApp.methods.REGISTRATION_FEE().call();
// ACT
    for(let i = 0; i < oracles.length; i++) {
        let result;
        console.log(`Registering Oracle ${i}  ${oracles[i]}`);
        try {
            result = await flightSuretyApp.methods.registerOracle().send({from: oracles[i], value: fee, gas:GAS.toString()});
        } catch (error) {
            console.log(`${i} registerOracle Failed: ${error.message}`);
            break;
        }
        // use truffleAssert to pretty print Events from Result
    //      console.log(truffleAssert.prettyPrintEmittedEvents(result, 2));
        let events = result.logs.filter((entry) => entry.event === 'OracleRegistered');

        let eventObject = JSON.parse(JSON.stringify(events[0]));
        let eventValues = JSON.parse(JSON.stringify(events[0].args));
        console.log(eventObject.event + ", Registered Oracle is " + eventValues['sender']);
        result = await flightSuretyApp.methods.getMyIndexes().call({from: oracles[i], gas:GAS.toString()});
        console.log(`Event ${i}  ${eventObject.event} -> ${oracles[i]} Registered with indexes: ${result[0]}, ${result[1]}, ${result[2]}`);
    }
}
registerOracles().then(r => console.log("Oracles have been registered."));

const sendOracleResponses = async (requestIndex, airline, flight, timestamp) => {

// ACT
    let iCount = 0;
    for(let i = 1; i < oracles.length + 1; i++) {
        // TRW
        // OK, bad form to query each time but this project is not about optimization
        // I'll store it later maybe
        let myIndexes = await flightSuretyApp.methods.getMyIndexes().call({from: oracles[i], gas:GAS.toString()});

        for (let j = 0; j < INDEXES_PER_ORACLE; j++) {
            if (myIndexes[j] == requestIndex) {
                iCount++;
                // borrowed from here
                // https://stackoverflow.com/questions/5915096/get-a-random-item-from-a-javascript-array
                let randomStatus = flightStatuses[Math.floor(Math.random() * flightStatuses.length)];
                console.log(`Oracle (${oracles[i]}) submitting Response (${randomStatus}) with correct index (${requestIndex})`);
                try {
                await flightSuretyApp.submitOracleResponse().send(requestIndex, airline, flight, timestamp, 10, {from: oracles[i]});
                } catch (error) {
                    console.log(`Error on submitOracleResponse (${error})`)
                }
            }

        }
    }
    console.log(`Submitted (${iCount}) OracleResponses`);
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
    // TRW Now respond with OracleResponses
    // from each Oracle with matching Index
    sendOracleResponses(requestIndex, airline, flight, timestamp).then(r => console.log("Oracle Responses have been sent."));
});


   flightSuretyApp.events.OracleRegistered({
//    fromBlock: 0
    }, function (error, event) {
        if (error) {
            console.log(error);
        } else {
            console.log(event);
        }
    });
flightSuretyApp.events.OracleReport({
//    fromBlock: 0
}, function (error, event) {
    if (error) {
        console.log(error);
    } else {
        console.log(event);
    }
});

flightSuretyApp.events.FlightStatusInfo({
//    fromBlock: 0
}, function (error, event) {
    if (error) {
        console.log(error);
    } else {
        console.log(event);
    }
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