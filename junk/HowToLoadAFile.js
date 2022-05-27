import Flights from "./Flights.js";

async function setupFlights(req, res)
{
    let did = [];

    // each airline gets two flights
    for (let flight of Flights) {
//        await fsapp.methods.registerFlight(flight.name, flight.timestamp).send({from: flight.address, gas: config.gas});
        console.log(`airline ${flight.address} flight: ${flight.name}`);
        did.push(`airline ${flight.address} flight: ${flight.name}`);
    }

    console.log(did);
    if (res !== undefined) return res.json({status: "okay", "events": did}).end();
}


// start everything
async function startup() {
    await setupFlights();
}

//app.post("/api/flights", setupFlights);

startup().then(console.log);

export default app;
