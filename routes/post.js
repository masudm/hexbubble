var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes

var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var moment = require('moment'); //a library for time and date functions
var db = require('./db');

apiRoutes.post('/new', function(req, res) {
	post = {
		userId: req.decoded.userId,
		bubbleId: 1,
		dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
		post: req.body.post
	};
	db.insertData(post, 'posts', function(err, results) {
		console.log(err);
		console.log(results);
	});
});

//export the apiRoutes variable (which defines all the routes) so it can be used elsewhere
//i.e. the main app
module.exports = apiRoutes;