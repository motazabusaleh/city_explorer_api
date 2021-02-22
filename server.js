'use strict';

// require statements (importing packages)
let express = require('express');
const cors = require('cors');
let superagent = require('superagent');
// initialization and configuration
let app = express();
app.use(cors());
require('dotenv').config();

const PORT = process.env.PORT;

// routes - endpoints 
app.get('/location', handlerLocation);
app.get('/weather', weatherHandler);
app.get('*', errorHandler);


// handlers functions
function handlerLocation(req, res) {
    let searchQuery = req.query.city;
    getLocationData(searchQuery, res).then(data => {
        res.status(200).send(data);
    });
}

function weatherHandler(req, res) {
    let weatherObject = getWeatherData(searchQuery, res).then(data =>{
        res.status(200).send(weatherObject);
    })
    
}

function errorHandler(req, res) {
    res.status(404).send({ status: 500, responseText: "Sorry, something went wrong" });
}



// getting specific data from the json

function getLocationData(searchQuery) {
    const query = {
        key: process.env.GEOCODE_API_KEY,
        q: searchQuery,
        limit: 1,
        format: 'json'
    };

    let url = 'https://us1.locationiq.com/v1/search.php';
    return superagent.get(url).query(query).then(data => {
        try {


            let longitude = data.body[0].lon;
            let latitude = data.body[0].lat;
            let displayName = data.body[0].display_name;
            let responseObject = new CityLocation(searchQuery, displayName, latitude, longitude);

            return responseObject;
        } catch (error) {
            res.status(500).send(error);
        }
    }).catch(error => {
        res.status(500).send('There was an error getting data from API ' + error);
    });
}

function getWeatherData() {
    const query = {
        key: process.env.WEATHER_API_KEY,
        q: searchQuery,
        limit: 1,
        format: 'json'
    };

    const url = "https://api.weatherbit.io/v2.0/forecast/daily";
    return superagent.get(url).query(query)
    .then( data => {
      const weatherSummaries = data.body.daily.data.map(day => {
        return new Weather(day);
      });
      response.status(200).json(weatherSummaries);
    })
    .catch( ()=> {
      errorHandler('So sorry, something went really wrong', request, response);
    });
}






//constructer 
function CityLocation(searchQuery, displayName, lat, lon) {
    this.searchQuery = searchQuery;
    this.formatted_query = displayName;
    this.latitdue = lat;
    this.longitude = lon;
}

function Weather(forecast, time) {
    this.forecast = forecast;
    this.time = time;
}





app.listen(PORT, () => {
    console.log("the app is listening to port ..." + PORT);
});


