var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var moment = require('moment'); //a library for time and date functions
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var db = require('./db'); //a reference to the database functions so they can be used

apiRoutes.get('/', function(req, res) {
	db.getPosts(1, 0, function(err, results) {
		res.render('feed', {posts: JSON.stringify(results), me: JSON.stringify(db.me(req.decoded))});
	});
});

module.exports = apiRoutes;