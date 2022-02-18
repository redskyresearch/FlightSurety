import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);


// TRW: Load up Oracles here
flightSuretyApp.events.OracleRequest({
//    fromBlock: 0
  }, function (error, event) {
    callCount++;
    // TRW: Log Event Here
    console.log("Received " + callCount + " OracleRequest Events");

    if (error)
        console.log(error);
    console.log(event);

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



