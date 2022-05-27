var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {

    let appAddress =  "0x51bd56F3A927a69eCAC62eaB04D1cA72e850f9D5";
    let flightSuretyApp = await FlightSuretyApp.deployed(appAddress);

    let owner = accounts[0];
    let firstAirline = accounts[1];

    let dataAddress = "0x2debcCD21D98403DeCF8CD0e9961D72FF055987A";
    let flightSuretyData = await FlightSuretyData.deployed(dataAddress);

    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}
module.exports = {
    Config: Config
};