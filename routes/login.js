var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes

var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client

//after the base route (in this case, '/login', go to the next route):
//full route: /login/
apiRoutes.get('/', function(req, res) {
	//as a response, render the login view
	res.render("login");
});

module.exports = apiRoutes;