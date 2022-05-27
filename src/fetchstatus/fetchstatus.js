import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import "babel-polyfill";

import express, {request} from 'express';

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let GAS = 200000;

async function fetchstatus() {

    try {

        // ARRANGE
        let flight = 'ND1309'; // Course number
        let timestamp = Math.floor(Date.now() / 1000);
        let firstAirline = "0xdE4ca4C5a8D2a0D957CA1C3460f1eD5230D250f1";

            // Submit a request for oracles to get status information for a flight
            let result = await flightSuretyApp.methods.fetchFlightStatus(firstAirline, flight, timestamp).send(
                {
                from: "0xdE4ca4C5a8D2a0D957CA1C3460f1eD5230D250f1",
                gas: GAS.toString()
            }
            );

            console.log("Result is " + JSON.stringify(result));
        } catch (error) {
            console.log(`fetchFlightStatus Failed: ${error.message}`);
        }
}
function listenForEvents() {
    flightSuretyApp.events.OracleRequest(function (error, event) {
            if (error) {
                console.log(`OracleRequest Event Error: ${error}`);
            } else {
                console.log(event);
                let result;
                let requestIndex = event.returnValues.index;
                let airline = event.returnValues.airline;
                let flight = event.returnValues.flight;
                let timestamp = event.returnValues.timestamp;

            }
        });
}

async function startup() {
    await listenForEvents();
    await fetchstatus();
}

startup().then(console.log("done"));
const app = express();
export default app;
