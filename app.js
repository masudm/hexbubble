//dependencies
const express = require('express'); //the express web server dependency
const app = express(); //create a web server using express
const mysql = require('mysql'); //mysql api connection wrapper to connect to mysql server
const bodyParser = require('body-parser'); //middleware for parsing body requests

//config
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
//parse application/json
app.use(bodyParser.json())
// set the view engine to ejs (similar to html)
app.set('view engine', 'ejs');
//set the publicly accessible folder (available on the client side)
app.use(express.static('public'));

//API routes
//create an instance for routes
var apiRoutes = express.Router();

//for each base route (such as '/'), provide a route file which defines
//the routes within the base route and what each route does
app.use('/login', require('./routes/login'));
app.use('/signup', require('./routes/signup'));
app.use('/dev', require('./routes/dev'));
app.use('/', require('./routes/feed'));

//finally, start the server on port 3000 within the local network.
app.listen(3000, function() {
	//display a message to state the server has started
    console.log('Started on port 3000!');
});