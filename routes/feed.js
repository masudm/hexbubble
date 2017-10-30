var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var moment = require('moment'); //a library for time and date functions
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var db = require('../helpers/db'); //a reference to the database functions so they can be used

//this is the main feed page and requests to here
apiRoutes.get('/feed', function(req, res) {
	//get the first bubble id of the user
	db.getFirstBubble(req.decoded.userId, function(err, data) {
		if (data.length > 0) {
			//redirect to their actual feed from their first bubble id
			res.redirect('/feed/' + (data[0].bubbleId)); //go to the first bubble the user is signed up for
		} else {
			//if they do not have one, redirect them because they are breaking something or not logged in.
			res.redirect('/');
		}
	});
});

//the actual feed
apiRoutes.get('/feed/:bubbleId', function(req, res) {
	let bid = parseInt(req.params.bubbleId); //from the string bubble id parse it into an integer
	//verify if they're a member
	db.isMember(parseInt(req.decoded.userId), bid, function(err, data) {
		if (data.length > 0) { //if they are a member
			//get their posts
			db.getPosts(bid, 0, req.decoded.userId, function(err, results) {
				if (err) {
					//if there is an error, just render the error
					res.render(err);
				} else {
					//render the feed page
					//send the posts in a json format
					//and send the user object as json too
					res.render('feed', {
						posts: JSON.stringify(results), 
						me: JSON.stringify(db.me(req.decoded)),
						bubbleId: bid
					});
				}
			});
		} else { 
			//they are a not a member so send them a message
			res.send('You are not allowed in this bubble.'); //TODO: change this to error message
		}
	});
	
});

module.exports = apiRoutes;