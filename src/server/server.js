import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import "babel-polyfill";

import "random";

import express, {request} from 'express';

const NUMBER_OF_TEST_ORACLES = 2;

// Watch contract events
const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

let GAS = 200000;
let ORACLES_START_INDEX = 1;
let flightStatuses = [STATUS_CODE_UNKNOWN, STATUS_CODE_ON_TIME, STATUS_CODE_LATE_AIRLINE, STATUS_CODE_LATE_WEATHER, STATUS_CODE_LATE_TECHNICAL, STATUS_CODE_LATE_OTHER];

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

// internal: return a random flight status code
function _randomStatus()
{
    return flightStatuses[Math.random()];
}

async function registerOracles(){
    const accounts = await web3.eth.getAccounts();
    let oracles = [] ;
    let indexesMap = {};
        let thisOracle;
        console.log(`There are ${accounts.length} accounts`);

        for (let i = ORACLES_START_INDEX; i < NUMBER_OF_TEST_ORACLES + 1; i++) {
            oracles[i-1] = accounts[i];
            thisOracle = oracles[i-1];
            let result;

            console.log(`Oracle account ${i} is ${thisOracle}`);
            console.log(`Registering Oracle ${i}  ${thisOracle}`);
            try {
                result = await flightSuretyApp.methods.registerOracle().send({
                    from: thisOracle,
                    value: 1000000000000000000,
                    gas: GAS.toString()
                });
                console.log("Result is " + JSON.stringify(result));
                //await new Promise(resolve => setTimeout(resolve, 5000));
            } catch (error) {
                console.log(`${i} registerOracle Failed: ${error.message}`);
                break;
            }
                let indexes = await flightSuretyApp.methods.getMyIndexes().call({from: thisOracle});
                console.log("Indexes are " + JSON.stringify(indexes));
                                                indexesMap[thisOracle] = [...indexes];

//            flightSuretyApp.events.OracleRequest({fromBlock: 0, filter: {index: [...indexes]}}, (err, event) => {
/*
                flightSuretyApp.events.OracleRequest((err, event) => {

                                                    if (err) { console.log(err); }
                                                    let result = event.returnValues;

                                                    console.log(`${i} OracleRequest: airline ${result.airline}, flight: ${result.flight}, time: ${result.timestamp}, index: ${result.index}`);
                                                    let randomStatus = _randomStatus();
                                                    console.log(`${i} (${thisOracle} - ${indexesMap[thisOracle]}: replying with ${randomStatus}`);
//                                                    flightSuretyApp.methods.submitOracleResponse(result.index, result.airline, result.flight, result.timestamp, randomStatus).send({from: thisOracle, gas: GAS.toString()});
                                                });
*/




        }
}
async function getIndexes(){
    let oracle;

    for (let i = 0; i < NUMBER_OF_TEST_ORACLES; i++) {
        oracle = oracles[i];
        let result;

        console.log(`Getting Index Oracle ${i}  ${oracle}`);
        try {
            result = await flightSuretyApp.methods.getMyIndexes().call({
                from: oracles[i],
                gas: GAS.toString()
            });
            console.log(`Indexes: ${result[0]}, ${result[1]}, ${result[2]} for Oracle ${i} ${oracle} `);
        } catch (error) {
            console.log(`${i} getMyIndex Failed: ${error.message}`);
            return;
        }
    }

}

function listenForEvents() {
    flightSuretyApp.events.OracleRequest({fromBlock:0}, function (error, event) {
            if (error) {
                console.log(`OracleRequest Event Error: ${error}`);
            } else {
                console.log(event);
                let result;
                let requestIndex = event.returnValues.index;
                let airline = event.returnValues.airline;
                let flight = event.returnValues.flight;
                let timestamp = event.returnValues.timestamp;
                console.log(event);

            }
        });
    flightSuretyApp.events.OracleReport({fromBlock:0}, function (error, event) {
        if (error) {console.log(`OracleReport Event Error:  ${error}`);
            } else {console.log(event);            }
        });
    flightSuretyApp.events.OracleRegistered({fromBlock:0}, function (error, event) {
        if (error) {console.log(`OracleRegistered Event Error:  ${error}`);
            } else {console.log(event);}
        });
}

async function startup() {

    await listenForEvents();
    await registerOracles();
}

startup().then(console.log("done"));
const app = express();
export default app;


/*            for (let i = 0; i < oracles.length; i++) {
                try {
                    result = flightSuretyApp.methods.getMyIndexes().call({from: oracles[i], gas: GAS.toString()});
                    console.log(`Indexes: ${result[0]}, ${result[1]}, ${result[2]} for Oracle ${i} ${oracles[i]} `);
                    if (result[0] == requestIndex || result[1] == requestIndex || result[2] == requestIndex) {
                        // borrowed from here
                        // https://stackoverflow.com/questions/5915096/get-a-random-item-from-a-javascript-array
                        let randomStatus = flightStatuses[Math.floor(Math.random() * flightStatuses.length)];

                        flightSuretyApp.submitOracleResponse().
                        send(requestIndex, airline, flight, timestamp, randomStatus, {from: oracles[i]})
                            .then(r => console.log("Oracle $[i] sent Response."));
                    }
                } catch (error) {
                    console.log(error);
                }
            }
*/
//}
//    });