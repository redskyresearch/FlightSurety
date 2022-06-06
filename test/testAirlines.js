const Test = require('../config/testConfig.js');
const truffleAssert = require('truffle-assertions');
const assert = require("assert");

contract('Airlines Test', async (accounts) => {

    let config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
    });

    it(`1 - Is Airline 1 REGISTERED after deployment`, async  () => {
//        let message = "Checking to see if " + accounts[1] + " is registered after deployment.";
 //       console.log(message);
        let result = await config.flightSuretyApp.isAirlineRegistered(accounts[1]);
//        console.log(message + " >>>Result is " + result);
        assert.equal(result, true, "Expected isAirlineRegistered to be TRUE");
    });

    it(`2 - Test PARTICIPATION Before Funding Airline 1, have it Register Another Airline - should not work`, async  () => {

        let shouldFail = false;
        try {
            await config.flightSuretyApp.registerAirline(accounts[2], {from:accounts[1]});
        } catch(e) {
            shouldFail = true;
        }
        assert.equal(shouldFail, true, "Register should have failed due to no funding yet");
    });

    it(`3 - FUND Airline 1`, async () =>{

        let ante = web3.utils.toWei("10", "ether");
        let shouldSucceed = true;
        try {
            let result = await config.flightSuretyApp.fundAirline({from:accounts[1], value:ante});
            truffleAssert.prettyPrintEmittedEvents(result, 2);
            console.log("Funding is " + result);
        } catch (e){
            console.log("FUNDING Exception " + e);
            shouldSucceed = false;
        }

        assert.equal(shouldSucceed, true, "Funding should have worked");
    });

    it('4 - Check is FUNDED', async () =>{
        let shouldSucceed = true;
        try {
            let result = await config.flightSuretyApp.isAirlineFunded(accounts[1]);
            assert.equal(result, true, "Expected Airline to be Funded");
        } catch (e){
            console.log("Exception caught " + e);
            shouldSucceed = false;
        }
        assert.equal(shouldSucceed, true, "Expected Airline FUNDING to have worked.");
    });

    it(`5 - Get FUNDing LEVEL`, async () =>{

        let shouldSucceed = true;
        try {
            let result = await config.flightSuretyApp.getAirlineFundLevel(accounts[1]);
            console.log("Funding for Airline 1 is " + result);
        } catch (e){
            console.log("Exception caught " + e);
            shouldSucceed = false;
        }
        assert.equal(shouldSucceed, true, "Airline Should have been Funded");
    });

    // it(`6.1 - Register Airline 2`, async function () {
    //     let success = true;
    //     try {
    //         await config.flightSuretyApp.registerAirline(accounts[2], {from:accounts[1]});
    //     } catch (e) {
    //         console.log(e);
    //         success = false;
    //     }
    //     assert.equal(success, true, "Registering Airline should have worked.");
    // });
    // it(`6.2 - Is Airline 2 REGISTERED?`, async  () => {
    //     try {
    //         let result = await config.flightSuretyApp.isAirlineRegistered(accounts[1]);
    //         assert.equal(result, true, "Expected isAirlineRegistered to be TRUE");
    //     } catch (e) {
    //         console.log(e);
    //     }
    // });
    // it(`6.3 - FUND Airline 2`, async () =>{
    //
    //     let ante = web3.utils.toWei("10", "ether");
    //     let shouldSucceed = true;
    //     let result;
    //     try {
    //         result = await config.flightSuretyApp.fundAirline({from:accounts[2], value:ante});
    //     } catch (e){
    //         console.log("Exception caught " + e);
    //         shouldSucceed = false;
    //     }
    //     assert.equal(shouldSucceed, true, "Funding should have worked");
    // });
    // it('6.4 - Is Airline 2 FUNDED', async () =>{
    //     let shouldSucceed = true;
    //     try {
    //         let result = await config.flightSuretyApp.isAirlineFunded(accounts[2]);
    //         assert.equal(result, true, "Expected Airline to be Funded");
    //     } catch (e){
    //         console.log("Exception caught " + e);
    //         shouldSucceed = false;
    //     }
    //     assert.equal(shouldSucceed, true, "Airline Should have been Funded");
    // });
    //
    // it(`6.5 - Get Airline 2 Funding Level`, async () =>{
    //
    //     shouldSucceed = true;
    //     try {
    //         config.flightSuretyApp.getAirlineFundLevel(accounts[2]);
    //         //console.log("result is " + result + " result[0] = " + result[0]);
    //     } catch (e){
    //         console.log("Exception caught " + e);
    //         shouldSucceed = false;
    //     }
    //
    //     assert.equal(shouldSucceed, true, "Airline Should have been Funded");
    // });

//     it(`7 - Register Airline 3`, async function () {
//         let success = true;
//         try {
//             await config.flightSuretyApp.registerAirline(accounts[3], {from:accounts[1]});
//         } catch (e) {
//             success = false;
//         }
//         assert.equal(success, true, "Registering Airline should have worked.");
//     });
//     it(`8 - Register Airline 4`, async function () {
// //        let message = "STEP 3 " + accounts[1] + " will register " + accounts[2] + " and succeed since it is funded";
// //        console.log(message);
//         let success = true;
//         try {
//             await config.flightSuretyApp.registerAirline(accounts[3], {from:accounts[1]});
//         } catch (e) {
//             success = false;
//         }
//         assert.equal(success, true, "Registering Airline should have worked.");
//     });
//     it(`9 - FUND Airlines 2, 3 and 4`, async () =>{
//
//         let ante = web3.utils.toWei("10", "ether");
//         let shouldSucceed = true;
//         let result;
//         try {
//             result = await config.flightSuretyApp.fundAirline({from:accounts[2], value:ante});
//             result = await config.flightSuretyApp.fundAirline({from:accounts[3], value:ante});
//             result = await config.flightSuretyApp.fundAirline({from:accounts[4], value:ante});
//             //truffleAssert.prettyPrintEmittedEvents(result, 2);
//         } catch (e){
//             console.log("Exception caught " + e);
//             shouldSucceed = false;
//         }
//
//         assert.equal(shouldSucceed, true, "Funding should have worked");
//     });


});
