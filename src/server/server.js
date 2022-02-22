// noinspection DuplicatedCode
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import "babel-polyfill";

import express, {request} from 'express';

const NUMBER_OF_TEST_ORACLES = 20;

// Watch contract events
const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

let GAS = 6721975;

let flightStatuses = [STATUS_CODE_UNKNOWN, STATUS_CODE_ON_TIME, STATUS_CODE_LATE_AIRLINE, STATUS_CODE_LATE_WEATHER, STATUS_CODE_LATE_TECHNICAL, STATUS_CODE_LATE_OTHER];

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
let oracles = [];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

async function registerOracles(){

    const accounts = await web3.eth.getAccounts();
//    web3.eth.getAccounts().then(accounts => {
        console.log(`There are ${accounts.length} accounts`);

        for (let i = 0; i < NUMBER_OF_TEST_ORACLES; i++) {
            let account = accounts[i + 1];
            oracles.push(account);
            console.log(`Oracle account ${i} is ${oracles[i]}`);
        }
        let fee;// = 1 ether;//await flightSuretyApp.methods.REGISTRATION_FEE.call();
// ACT
        let result;
        for (let i = 0; i < oracles.length; i++) {

            console.log(`Registering Oracle ${i}  ${oracles[i]}`);
            try {
//            result = await config.flightSuretyApp.registerOracle({from: accounts[a], value: fee});
                result = await flightSuretyApp.methods.registerOracle().send({
                    from: oracles[i],
                    value: 1000000000000000000,
                    gas: 6721975
                });

            } catch (error) {
                console.log(`${i} registerOracle Failed: ${error.message}`);
                break;
            }
        }
        for (let i = 0; i < oracles.length; i++) {
            try {
                result = await flightSuretyApp.methods.getMyIndexes().call({from: oracles[i], gas: GAS.toString()});
                console.log(`Indexes: ${result[0]}, ${result[1]}, ${result[2]} for Oracle ${i} ${oracles[i]} `);
            } catch (error) {
                console.log(error);
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

    listenForEvents();
    await registerOracles();

}

startup().then(console.log);
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