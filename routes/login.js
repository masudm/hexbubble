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
	//create block level variables with the POSTed values
	let email = req.body.email;
	let password = req.body.password;

	//login with the passed email and password
	db.login(email, password, function(err, valid) {
		//it returns a valid boolean if the email and password match a
		//user in the database.
		if (valid) {
			//if it is true, send back a true success token
			res.json({
				success: true
			});
		} else {
			//otherwise send back a success false token
			res.json({
				success: false
			});
		}
	});
});

//export the apiRoutes variable (which defines all the routes) so it can be used elsewhere
//i.e. the main app
module.exports = apiRoutes;