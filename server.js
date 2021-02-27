// require statements (importing packages)
let express = require('express');
const cors = require('cors');
let superagent = require('superagent');
const postgress = require('pg');
// initialization and configuration
let app = express(); //init server
app.use(cors());
require('dotenv').config();
const client = new postgress.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT;

// const client = new postgress.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// routes - endpoints 
app.get('/location', handlerLocation);
app.get('/weather', weatherHandler);
app.get('/parks', parkHandler)
app.get('*', errorHandler);


// handlers functions
function handlerLocation(req, res) {
    // console.log("i am request ",req.query);
    let searchQuery = req.query.city;
    getLocationData(searchQuery, res);
}

function weatherHandler(req, res) {
    //console.log(req.query);
    let searchQuery = req.query;
    getWeatherData(searchQuery, res);

}
function parkHandler(req, res) {
    let searchQuery = req.query;
    //console.log(req);
    getParkData(searchQuery, res);

}

function errorHandler(req, res) {
    res.status(404).send({ status: 500, responseText: "Sorry, something went wrong 38" });
}



// getting specific data from the json

function getLocationData(searchQuery, res) {
    // if location exist in db then get location from db else get location from api and store it in db
    const dbQuery = `select * from city where search_query='${searchQuery}'`;
    client.query(dbQuery).then(data => {
        if (data.rowCount!=0) {
            // data in db
            const result = data.rows[0];
            // console.log("hello i am the body ",result)
            var longitdue = result.lon;
            var latitdue = result.lat;
            var dispalyName = result.display_name;

            let cityLocation = new CityLocation(searchQuery, dispalyName, latitdue, longitdue);
            res.status(200).send(cityLocation);    
        }
        else {
            const query = {
                key: process.env.GEOCODE_API_KEY,
                city: searchQuery,
                limit: 1,
                format: 'json'
            };

            let url = `https://us1.locationiq.com/v1/search.php?`;
            superagent.get(url).query(query).then(data => {
                const result = data.body[0];
                // console.log("hello i am the body ",result)
                var longitdue = result.lon;
                var latitdue = result.lat;
                var dispalyName = result.display_name;

                let cityLocation = new CityLocation(searchQuery, dispalyName, latitdue, longitdue);
                // console.log("hello i am city location",cityLocation)
                //insert
                const dbQuery_insert =`INSERT INTO city(search_query,formatted_query,latitude,longitude) VALUES('${searchQuery}','${dispalyName}',${latitdue},${longitdue})`;
                client.query(dbQuery_insert).then(data=>{
                    console.log("succesfully inserted in db");
                })
                res.status(200).send(cityLocation);
            }).catch(error => {
                //res.status(500).send('There was an error getting data from API ' + error);
            });
            
        }
       
    }).catch(error => {
        console.log(error)
    })

    // const query = {
    //     key: process.env.GEOCODE_API_KEY,
    //     city: searchQuery,
    //     limit: 1,
    //     format: 'json'
    // };

    // let url = `https://us1.locationiq.com/v1/search.php?`;
    // superagent.get(url).query(query).then(data => {
    //     const result = data.body[0];
    //     // console.log("hello i am the body ",result)
    //     var longitdue = result.lon;
    //     var latitdue = result.lat;
    //     var dispalyName = result.display_name;

    //     let cityLocation = new CityLocation(searchQuery, dispalyName, latitdue, longitdue);
    //     // console.log("hello i am city location",cityLocation)

    //     res.status(200).send(cityLocation);
    // }).catch(error => {
    //     //res.status(500).send('There was an error getting data from API ' + error);
    // });
}

function getWeatherData(searchQuery, res) {
    const query = {
        key: process.env.WEATHER_API_KEY,
        lat: searchQuery.latitdue,
        lon: searchQuery.longitude
    };
    // console.log("i am query",query);

    const url = "http://api.weatherbit.io/v2.0/forecast/daily?";
    superagent
        .get(url)
        .query(query)
        .then(data => {
            var weatherData = JSON.parse(data.text).data;
            var weatherArr = [];
            for (let i = 0; i < 8; i++) {
                //console.log("hello im weatherData ...", weatherData);
                var forecast = weatherData[i].weather.description;
                var time = weatherData[i].valid_date;
                var weatherObject = new Weather(forecast, time);
                // console.log("hello im weatherObject", weatherObject);
                weatherArr.push(weatherObject);
            }
            res.status(200).send(weatherArr);

        })
        .catch(error => {
            //console.log(error.body);
            //errorHandler('So sorry, something went really wrong', request, response);
        });
}
function getParkData(searchQuery, res) {
    //console.log(searchQuery);
    const query = {
        api_key: process.env.PARK_API_KEY,
        q: searchQuery,
        limit: 10

    };
    // console.log("i am query",query);

    const url = "https://developer.nps.gov/api/v1/parks?";
    superagent
        .get(url)
        .query(query)
        .then(data => {
            var parkData = JSON.parse(data.text).data;
            // console.log(parkData[0])
            var parkArr = [];
            for (let i = 0; i < 10; i++) {

                var name = parkData[i].fullName;
                var adress = parkData[i].addresses[0].line1;
                var fee = parkData[i].fees;
                var des = parkData[i].description;
                var url = parkData[i].url;
                var parkObject = new Park(name, adress, fee, des, url)
                parkArr.push(parkObject);


            }


            res.status(200).send(parkArr);
        })
        .catch(error => {
            //console.log(error.body);
            //errorHandler('So sorry, something went really wrong', request, response);
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
    this.time = new Date(time).toDateString();
}

function Park(name, adress, fee, des, url) {
    this.name = name;
    this.adress = adress;
    this.fee = fee;
    this.description = des;
    this.url = url;
}



client.connect().then(() => {
    app.listen(PORT, () => {
        console.log('the app is listening to port ' + PORT);
    });
}).catch(error => {
    console.log('an error occurred while connecting to database ' + error);
});



