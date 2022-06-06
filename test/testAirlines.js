const Test = require('../config/testConfig.js');
//const truffleAssert = require('truffle-assertions');
const assert = require("assert");


contract('Airlines Test', async (accounts) => {

    let config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
    });

    // it(`Check if first airline is REGISTERED after deployment`, async  () => {
    //     let message = "Checking to see if " + accounts[1] + " is registered after deployment.";
    //     console.log(message);
    //     let result = await config.flightSuretyApp.isAirlineRegistered(accounts[1]);
    //     console.log(message + " >>>Result is " + result);
    //     assert.equal(result, true, "Expected isAirlineRegistered to be TRUE");
    // });

    it(`Test PARTICIPATION Before Funding Airline 1, have it Register Another Airline - should not work`, async  () => {

        let shouldFail = false;
        try {
            await config.flightSuretyApp.registerAirline(accounts[2], {from:accounts[1]});
        } catch(e) {
            shouldFail = true;
        }
        assert.equal(shouldFail, true, "Register should have failed due to no funding yet");
    });

    it(`FUND the First Airline to become ACTIVE`, async () =>{
        let message = "STEP 2 FUND account " + accounts[1];
        let ante = web3.utils.toWei("10", "ether");
        console.log(message + " with this many WEI " + ante);

        let shouldSucceed = true;
        try {
            await config.flightSuretyApp.fundAirline({from:accounts[1], value:ante});
        } catch (e){
            console.log("Exception caught " + e);
            shouldSucceed = false;
        }
        assert.equal(shouldSucceed, true, "Funding should have worked");

        let result = await config.flightSuretyApp.isAirlineFunded(accounts[1]);

        console.log("result is " + result + " result[0] = " + result[0]);
        assert.equal(result, true, "Airline Should have been Funded");
    });

    // await it(`Test PARTICIPATION AFTER Funding Airline 1, should work`, async function () {
    //     let message = "STEP 3 " + accounts[1] + " will register " + accounts[2] + " and succeed since it is funded";
    //     console.log(message);
    //     let success = true;
    //     try {
    //         await config.flightSuretyApp.registerAirline(accounts[2], {from:accounts[1]});
    //     } catch (e) {
    //         success = false;
    //     }
    //     assert.equal(success, true, "Registering Airline should have worked.");
    // });

});
