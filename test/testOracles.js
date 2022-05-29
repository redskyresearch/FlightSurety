var Test = require('../config/testConfig.js');
const truffleAssert = require('truffle-assertions');


//var BigNumber = require('bignumber.js');

contract('Oracles', async (accounts) => {

    const TEST_ORACLES_COUNT = 20;

    //  var config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);

        // Watch contract events
        const STATUS_CODE_UNKNOWN = 0;
        const STATUS_CODE_ON_TIME = 10;
        const STATUS_CODE_LATE_AIRLINE = 20;
        const STATUS_CODE_LATE_WEATHER = 30;
        const STATUS_CODE_LATE_TECHNICAL = 40;
        const STATUS_CODE_LATE_OTHER = 50;
    });


    it('can register oracles', async () => {

        // ARRANGE
        let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();

        // ACT
        for (let a = 1; a < TEST_ORACLES_COUNT; a++) {
            let result;
            try {
                result = await config.flightSuretyApp.registerOracle({from: accounts[a], value: fee});
            } catch (error) {
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

//      const events = await config.flightSuretyApp.getPastEvents('OracleRegistered');
//      console.log("Logging past Events of message OracleRegistered");
//      console.log(events);
        // iterate over the events
        // and do the necessary assertions

    });

    it('Test: Request Flight Status, All Oracles spoof index', async () => {

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
        for (let iOracles = 1; iOracles < TEST_ORACLES_COUNT; iOracles++) {
            oracleAddress = accounts[iOracles];
            try {
                console.log(`(${iOracles}) Oracle ${accounts[iOracles]} submitting Response with correct index (${indexForThisFlightStatus})`);
                let result = await config.flightSuretyApp.submitOracleResponse(indexForThisFlightStatus, config.firstAirline, flight, timestamp, 20, {from: accounts[iOracles]});
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
//      }
    });
    /* Returns event string in the form of EventType(arg1, arg2, ...) */
    const getPrettyEventString = (eventType, args) => {
        let argString = '';
        Object.entries(args).forEach(([key, value]) => {
            argString += `, ${key}: ${value}`;
        });
        argString = argString.replace(', ', '');
        return `${eventType}(${argString})`;
    }

    function dumpEvent(event) {
        let obj = JSON.parse(JSON.stringify(event));
        console.log("Event Received " + obj.event);
        let eventValues = JSON.parse(JSON.stringify(event.args));
        console.log(eventValues);
        for (const [key, value] of Object.entries(eventValues)) {
            console.log(`++> ${key}: ${value}`);
        }
    }

    /*
      it('this contains code for messing with Result, the transaction result', async () => {

        // ARRANGE
        let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();

        // ACT
        for(let a=1; a<TEST_ORACLES_COUNT; a++) {
          let result = await config.flightSuretyApp.registerOracle({ from: accounts[a], value: fee });
          console.log("Now Pretty Printing it...");
          // two ways to get Event name
          console.log("Event Name = " + result.logs[0].event);
          let obj = JSON.parse(JSON.stringify(result.logs[0]));
          console.log("Event name is " + obj.event);

          // use truffleAssert to pretty print Events from Result
          console.log(truffleAssert.prettyPrintEmittedEvents(result, 2));

          // filter only events of OracleRegistered or whatever
          let events = result.logs.filter((entry) => entry.event === 'OracleRegistered');

          // printing again by object.
          // the object is useful for getting parameters from the Event, such as Event Name
          obj = JSON.parse(JSON.stringify(events[0]));
          console.log("Event name is " + obj.event);
          // Now lets print the returned args of the Event itself.
          // This is useful for getting lower level details of the Event
          // in this case, the Event contains a sender value of the
          // registerd Oracle
          let objArgs = JSON.parse(JSON.stringify(events[0].args));
          console.log("Event args Sender is " + objArgs.sender);

    //      let events = result.logs;
          console.log("Checking if Events is an array");
          if (Array.isArray(events)) {
            console.log("Events is an array");
            console.log("Event length" + events.length);
            console.log("Event 0 " + JSON.stringify(events[0]));


          } else {
            console.log("Events is NOT an array");
          }

          let eventArgs = events.map((entry) => entry.args);
          console.log("EventArgs is " + eventArgs);
          for(let i = 0; i < eventArgs.length; i++) {
            console.log("EventArgs[" + i + "] is " + JSON.stringify(eventArgs[i]));
          }


          truffleAssert.eventEmitted(result, 'OracleRegistered', (ev) => {
            console.log("Received Event -> from " + ev.sender);
            return ev.sender === accounts[a];
          });
          result = await config.flightSuretyApp.getMyIndexes.call({from: accounts[a]});
          console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
        }


              // filter only events of OracleRegistered or whatever
          let events = result.logs.filter((entry) => entry.event === 'OracleRegistered');

          let obj = JSON.parse(JSON.stringify(events[0]));
          console.log("Event name is " + obj.event);
          let eventValues = JSON.parse(JSON.stringify(events[0].args));

    //      for (const [key, value] of Object.entries(eventValues)) {
    //        console.log(`++> ${key}: ${value}`);
    //      }

    //      console.log("Event.0          is " + eventValues['0']);
    //      console.log("Registered Oracle is " + eventValues.sender);


          console.log("Checking if Events is an array");
          if (Array.isArray(events)) {
            console.log("Events is an array");
            console.log("Event length" + events.length);
            console.log("Event 0 " + JSON.stringify(events[0]));


          } else {
            console.log("Events is NOT an array");
          }

        */

});
