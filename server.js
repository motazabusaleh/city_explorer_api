'use strict';
const { names } = require('debug');
// require statements (importing packages)
let express = require('express');
const cors = require('cors');
// initialization and configuration
let app = express();
app.use(cors());
require('dotenv').config();

const PORT = process.env.PORT;

// routes - endpoints 
app.get('/location', handlerLocation);
function handlerLocation (req, res){
    let searchQuery = req.query.city;
    let locationObject = getLocationData (searchQuery)
    res.status(200).send(locationObject);
}

function getLocationData (searchQuery){
    let locationData = require('./data/location.json');
    let longitude = locationData[0].lon;
    let latitdue = locationData[0].lat;
    let displayName = locationData[0].display_name;
    let responseobject = new CityLocation(searchQuery, displayName, latitdue, longitude);
    return responseobject;
}
app.listen(PORT, ()=> {
    console.log("the app is listening to port ..." + PORT);
});

//constructer 
function CityLocation(searchQuery, displayName, lat ,lon){
    this.searchQuery = searchQuery;
    this.formatted_query = displayName;
    this.latitdue = lat;
    this.longitude = lon;
}





