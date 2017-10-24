var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var moment = require('moment'); //a library for time and date functions
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var db = require('./db'); //a reference to the database functions so they can be used

//this is the main page and requests to here
apiRoutes.get('/feed', function(req, res) {
	res.redirect('/feed/1');
});

apiRoutes.get('/feed/:bubbleId', function(req, res) {
	db.getPosts(parseInt(req.params.bubbleId), 0, req.decoded.userId, function(err, results) {
		if (err) {
			//if there is an error, just render the error
			res.render(err);
		} else {
			//render the feed page
			//send the posts in a json format
			//and send the user object as json too
			res.render('feed', {posts: JSON.stringify(results), me: JSON.stringify(db.me(req.decoded))});
		}
	});
});

module.exports = apiRoutes;