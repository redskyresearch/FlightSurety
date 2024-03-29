const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

module.exports = function(deployer, network, accounts) {

    let firstAirline = accounts[1];
    deployer.deploy(FlightSuretyData)
        .then(() => {
            return deployer.deploy(FlightSuretyApp, accounts[0], FlightSuretyData.address, firstAirline)
                .then(() => {
                    let config = {
                        localhost: {
                            url: 'ws://localhost:7545',
                            appAddress:  FlightSuretyApp.address,
                            dataAddress: FlightSuretyData.address
                        }
                    }
                    fs.writeFileSync(__dirname + '/../src/dapp/config.json',  JSON.stringify(config, null, '\t'), 'utf-8');
                    fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                    fs.writeFileSync(__dirname + '/../src/fetchstatus/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                });
    });
}