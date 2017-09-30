var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes

var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var db = require('./db');

//after the base route (in this case, '/login', go to the next route):
//full route: /login/
apiRoutes.get('/', function(req, res) {
	//as a response, render the login view
	res.render("login");
});

//full route: /login/
//post to this route
apiRoutes.post('/', function(req, res) {
	email = req.body.email;
	password = req.body.password;
	db.login(email, password, function(err, valid) {
		if (valid) {
			res.json({
				success: true
			});
		} else {
			res.json({
				success: false
			});
		}
	});
});

module.exports = apiRoutes;