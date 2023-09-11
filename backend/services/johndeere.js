const request = require('request-promise');
const express = require('express');
const path = require('path')
const cors = require('cors')
const app = express();

app.use(cors())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

const authToken = 'Bearer eyJraWQiOiJURUpqLThwSWdTRFNJeDNnR19aUjVOT1FQRlJRQ1JQaWE0S0N2YkpqZ3VrIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULkVXcnBwNElMajFRRkEyZ1BJT0Fobjh2SHFtaFVtdmd4dE4yajl4d2NlZnMiLCJpc3MiOiJodHRwczovL3NpZ25pbi5qb2huZGVlcmUuY29tL29hdXRoMi9hdXM3OHRubGF5c01yYUZoQzF0NyIsImF1ZCI6ImNvbS5kZWVyZS5pc2cuYXhpb20iLCJpYXQiOjE2OTQ0MTIwMDYsImV4cCI6MTY5NDQ1NTIwNiwiY2lkIjoiMG9hYWd6aXd4YnkwdXRYa1U1ZDciLCJ1aWQiOiIwMHVhZjUyMDJsZzNvcVJRTjVkNyIsInNjcCI6WyJhZzIiLCJhZzEiLCJlcTIiLCJlcTEiXSwiYXV0aF90aW1lIjoxNjk0Mzc1NTgxLCJzdWIiOiJrb3V0dWswNSIsImlzY3NjIjp0cnVlLCJ0aWVyIjoiU0FOREJPWCIsImNuYW1lIjoiVGVzdEFwcGxpY2F0aW9uMDUiLCJ1c2VyVHlwZSI6IkN1c3RvbWVyIiwiY2FwaWQiOiJmZGNkNDNmYS1mMWMzLTQ2YjQtOGZiMC00NWYyZDA5MjUxNjIifQ.nFOjE-uq8FoyVGgB_cscK14InYq5zny3Isd-rgwCqoSE5Txc3TUxzQvbRokH1qMrQ-8Bau_ejkAKJomj_33idXOqhffPtEsT4IFLhKP4rEXOooPBPvmFzevdRstcSlp1QoNuliHQt-0PlYZY59qbbOeKUpuqHbodVSLXgKmki1iSOCnbLXdXJLEt2_7i0yjm9Yonfqvjd4kwX3nHxIX_KjecrMT3_LBJdEafn_67DmI80dS0zlo4cTtL3ETNQ-mL4pEhQJD0fnCIpndsSL2Cjta7WSFspPRDH92HH4V6amm4ZekP65bpIZaMShtDM5Tx7JvksD5Ggn9WgFeTeWTj3w'
app.get('/machines', async (req, res) => {

    let Machine = class {
        constructor(id, vin, name, make, type, model, lastKnown, locationHistory, lastUpdatedTime, locationAddress) {
            this.id = id;
            this.vin = vin;
            this.name = name;
            this.make = make;
            this.type = type;
            this.model = model;
            this.lastKnown = lastKnown;
            this.locationHistory = locationHistory;
            this.lastUpdatedTime = lastUpdatedTime;
            this.locationAddress = locationAddress
        }
    };

    let machines = await getMachines()

    var machinesArray = [];

    for (let i = 0; i < machines.values.length; i++) {

        var machine = new Machine()
        machine.id = machines.values[i].id
        machine.name = machines.values[i].name
        machine.vin = machines.values[i].vin
        machine.make = machines.values[i].equipmentMake.name
        machine.type = machines.values[i].equipmentType.name
        machine.model = machines.values[i].equipmentModel.name

        var locationLast = await getMachineLastLocation(machines.values[i].id)
        console.log(locationLast)
        machine.lastKnown = locationLast !== undefined && locationLast.values.length > 0 ? transformPoint(locationLast.values[0].point) : { lat: 42.562917, lng: -95.536972 };
        var time = locationLast.values[0].eventTimestamp;
        machine.lastUpdatedTime = timeConvertor(time);
        var locationAddress = await getLocationAddress(machine.lastKnown.lat, machine.lastKnown.lng);
        machine.locationAddress = locationAddress.results[0].formatted_address;
       /* console.log(locationAddress);*/
        let locationHistory = await getMachineHistory(machines.values[i].id)
        // Sort the location history array based on timestamps
        locationHistory = locationHistory.values.sort(compareTimestamps);

        var points = []
        if (locationHistory.length > 0) {
            for (let i = 0; i < locationHistory.length; i++) {
                var point = transformPoint(locationHistory[i].point);
                points.push(point)
            }
        }
        machine.locationHistory = points
        machinesArray.push(machine);
        console.log(i)
    }

    console.log("executed")
    res.send(machinesArray)
});

async function getMachines() {

    var optionsTemp = getOptions('https://sandboxapi.deere.com/platform/organizations/157679/machines')
    let result0 = await req(optionsTemp);
    //console.log(result0.resp.body);
    return result0.resp.body;

}


async function getLocationAddress(lat, long) {

    var optionsTemp = getOptionsGoogle('https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+long+'&key=AIzaSyBGyJn-zW6WKi9QT8UpVm9V6y6mK5qzrCE')
    let result0 = await req(optionsTemp);
    //console.log(result0.resp.body);
    return result0.resp.body;

}

async function getMachineHistory(id) {

    var optionsTemp = getOptions('https://sandboxapi.deere.com/platform/machines/' + id + '/locationHistory')
    let result0 = await req(optionsTemp);
    //console.log(result0.resp.body);
    return result0.resp.body;

}

async function getMachineLastLocation(id) {

    var optionsTemp = getOptions('https://sandboxapi.deere.com/platform/machines/' + id + '/locationHistory?lastKnown=true')
    let result0 = await req(optionsTemp);
    //console.log(result0.resp.body);
    return result0.resp.body;
}

function req(url) {
    return new Promise(function (resolve, reject) {
        request.get(url, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    resp: resp,
                    body: body
                });
            }
        })
    })
};

function getOptions(url) {
    const options = {
        method: 'GET',
        uri: url,
        json: true,
        headers: {
            'Authorization': authToken,
            'Accept': 'application/vnd.deere.axiom.v3+json'
        }
    }
    return options;
}


function getOptionsGoogle(url) {
    const options = {
        method: 'GET',
        uri: url,
        json: true,
        headers: {
            'Accept': 'application/json'
        }
    }
    return options;
}

app.listen(4000, () => console.log('Example app listening on port 4000!'));

function transformPoint(point){
    return {
        "lat": point.lat,
        "lng": point.lon
    }
}

function compareTimestamps(a, b) {
    const timestampA = new Date(a.eventTimestamp);
    const timestampB = new Date(b.eventTimestamp);
    // Compare timestamps
    if (timestampA < timestampB) return -1;
    if (timestampA > timestampB) return 1;
    return 0;
}


function timeConvertor(isoTimestamp){
// Desired time zone
    const timeZone = "America/Chicago"; // Example time zone (Eastern Time)

// Convert ISO timestamp to date object
    const date = new Date(isoTimestamp);

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

// Create a formatter with the desired time zone
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timeZone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZoneName: "short"
    });

// Format the date and time with the specified time zone
    const formattedDate = formatter.format(date);

    return formattedDate;
}