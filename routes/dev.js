var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes

var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var async = require('async');
var moment = require('moment'); //a library for time and date functions
var db = require('./db');

apiRoutes.get('/new', function(req, res) {
	res.render('new');
});

apiRoutes.post('/new', function(req, res) {
	let bubble = {
		bubbleName: req.body.name,
		dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
		bio: "bio",
		bubblePicture: ""
	};
	//use the insertData function to insert the user object into the user table
	db.insertData(bubble, 'bubbles', function(err, results) {
		//if there is an error
		if (err) {
			//send back a false success message
			res.json({
				success: false
			});
			//and throw an error so it can be debugged
			throw err;
		};

		//otherwise, send back a success true message
		res.json({
			success: true
		});
	});
});

//export the apiRoutes variable (which defines all the routes) so it can be used elsewhere
//i.e. the main app
module.exports = apiRoutes;