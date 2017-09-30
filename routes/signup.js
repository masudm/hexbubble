var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes

var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var moment = require('moment'); //a library for time and date functions
var db = require('./db');

//after the base route (in this case, '/signup', go to the next route):
//full route: /signup/
apiRoutes.get('/', function(req, res) {
	//as a response, render the signup view
	res.render("signup");
});

//full route: /signup/
//post to this route
apiRoutes.post('/', function(req, res) {
	//create variables for each piece of data POSTed
	//let allows variable creation at the block level which minimises scoping problems
	let email = req.body.email;
	let password = req.body.password;
	let name = req.body.name;
	let profilePicture = ""; //save this as null for now
	let bio = req.body.bio;

	var user = {
		email,
		password,
		name,
		profilePicture,
		bio,
		dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
	};
	
	db.insertData(user, 'users', function(err, results) {
		if (err) {
			res.json({
				success: false
			});
			throw err;
		};

		res.json({
			success: true
		});
	});
});

module.exports = apiRoutes;