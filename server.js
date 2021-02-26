'use strict';

//App Libraries
const express = require('express');
// cors = Cross Origin resource sharing
const cors = require('cors');
//dotenv (read our enviroment variable)
const dot = require('dotenv');
const { request } = require('http');
const { response } = require('express');
dot.config();
const superAgent0 = require('superagent');

//App setup
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

// Routes Definitions
app.get('/', handlerHomeRoute);
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/parks', parkHandler)
app.get('*', pageNotFoundHandler);
app.use(errorHandler);


// handler Functions

//this functions assure the server is working
function handlerHomeRoute(request, response) {
    response.status(200).send('you did a great job');
}


function locationHandler(request, response) {
    const cityName = request.query.city;
    let LocationKey = process.env.GEOCODE_API_KEY;
    let url = `https://eu1.locationiq.com/v1/search.php?key=${LocationKey}&q=${cityName}&format=json&limit=1`;

    superAgent0.get(url).then(data => {
        const locationObj = new Location(cityName, data.body);
        response.send(locationObj);
    }).catch(() => {
        errorHandler('error in getting data from Api server ', request, response);
    });
}
function weatherHandler(request, response) {
    let WeatherKey = process.env.WEATHER_API_KEY;
    const cityWeatherName = request.query.search_query;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${cityWeatherName}&key=${WeatherKey}&limit=1`;

    superAgent0.get(url).then(weatherData => {
        let weatherDataMap = weatherData.body.data.map(element => {
            const weatherObject = new Weather(element);
            return weatherObject;
        });
        response.send(weatherDataMap);
    }).catch(() => {
        errorHandler('error in getting data from Api server ', request, response);
    });
}
function parkHandler(request,response){
    let parkKey = process.env.PARK_API_KEY  ;
    const latitude = request.query.latitude;
    const longitude = request.query.longitude;
    let url = `https://developer.nps.gov/api/v1/parks?latitude=${latitude}&longitude=${longitude}&api_key=${parkKey}&limit=1`;

  superAgent0.get(url).then(parkData =>{

    let parkData0 = parkData.body.data.map(element => {
      const parkObject = new Park(element);
      return parkObject;
    });
    response.send(parkData0);
  }).catch(()=>{
    errorHandler('error in getting data from Api server ',request,response);
  });
}

// page Not found
function pageNotFoundHandler(req, res) {
    res.status(404).send('Not Found')
}

function errorHandler(error, req, res) {

    res.status(500).send(error);
}


// Constructor
function Location(city, data) {
    this.search_query = city;
    this.formatted_query = data[0].display_name;
    this.latitude = data[0].lat;
    this.longitude = data[0].lon;
}
function Weather(weatherDay) {
    this.forecast = weatherDay.weather.description;
    this.time = weatherDay.valid_date;
}
function Park(parkData) {
    this.name = parkData.name;
    this.address = parkData.address;
    this.fee = parkData.fee;
    this.description = parkData.description;
    this.url = parkData.url;
}

app.listen(PORT, () => {
    console.log(`app is listening on Port ${PORT}`)
})