var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client

apiRoutes.get('/', function(req, res) {
    res.render('homepage');
});

module.exports = apiRoutes;