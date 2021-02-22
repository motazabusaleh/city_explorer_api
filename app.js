'use strict';

// require statements (importing packages)
let express = require('express');
const cors = require('cors');
let superagent = require('superagent');
// initializations and configuration
let app = express();
app.use(cors());
require('dotenv').config();

const PORT = process.env.PORT;

// routes - endpoints
app.get('/location', handleLocation);
app.get('/resturants', handleResturants);
app.get('*', handle404);

// restaurant name, cuisine, locality


// handler functions
function handleLocation(req, res) {
  console.log(req.query);
  let searchQuery = req.query.city;
  getLocationData(searchQuery).then(data =>{
    res.status(200).send(data);
  });

}

function handleResturants(req, res) {
  try {
    let resturantsData = require('./data/resturants.json');
    let allResturants = [];
    resturantsData.nearby_restaurants.forEach((element, index) => {
      let resturantObject = new CityResturant(element);
      allResturants.push(resturantObject);
    });
    res.status(200).send(allResturants);
  } catch (error) {
    res.status(500).send('Sorry, an error occured ..' + error);
  }

}

function handle404(req, res) {
  res.status(404).send('Sorry, the page you are trying to access does not exist....');
}

// handle data for functions
function getLocationData(searchQuery) {
  // get the data array from external API
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
  // return responseObject;
}



// constructors
function CityLocation(searchQuery, displayName, lat, lon) {
  this.search_query = searchQuery;
  this.formatted_query = displayName;
  this.latitude = lat;
  this.longitude = lon;
}

function CityResturant(resturantsRawData) {
  this.resturant = resturantsRawData.restaurant.name;
  this.cuisine = resturantsRawData.restaurant.cuisines;
  this.locality = resturantsRawData.restaurant.location.locality;
};

app.listen(PORT, () => {
  console.log('the app is listening on port ' + PORT);
});

