var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var moment = require('moment'); //a library for time and date functions
var db = require('../helpers/db'); //a reference to the database functions so they can be used

//post to the /post/new route
apiRoutes.post('/new', function(req, res) {
	bid = req.body.bubbleId
	//create a new post object to insert
	//include everything needed for the database such as userId, bubbleId, etc
	post = {
		userId: req.decoded.userId,
		bubbleId: bid,
		dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
		post: req.body.post
	};

	//insert the object into the post table if they are a member
	db.isMember(parseInt(req.decoded.userId), bid, function(err, data) {
		if (data.length > 0) {
			db.newPost(post, function(err, results) {
				if (err) {
					return res.json({success: false, error: err});
				}
				db.likePost(req.decoded.userId, results.insertId, function(err, data) {
					if (err) {
						return res.json({success: false, error: err});
					}
					return res.json({success: true});
				});
			});
		} else {
			res.send('You are not allowed in this bubble.'); //TODO: change this to error message
		}
	});
});

//likes are posted to this route
apiRoutes.post('/like', function(req, res) {
	//after the like is posted, it goes here
	//like the post using the database method
	//send the request's user id and the post id that they are sending
	//also format a new date for mysql
	db.likePost(req.decoded.userId, req.body.postId, function(err, data) {
		//if there is an error, return a success: false message along with the error
		if (err) {
			return res.json({success: false, error: err});
		}
		//otherwise, return a success true message
		return res.json({success: true});
	});
});

//get comments on a post
apiRoutes.post('/comments', function(req, res) {
	db.getComments(req.body.postId, req.body.skip, function(err, data) {
		res.json(data);
	});
});

//comment on a post
apiRoutes.post('/comment', function(req, res) {
	db.addComment(req.decoded.userId, req.body.postId, req.body.comment, function(err, data) {
		//if there is an error, return a success: false message along with the error
		if (err) {
			return res.json({success: false, error: err});
		}
		//otherwise, return a success true message
		return res.json({success: true});
	});
});

//export the apiRoutes variable (which defines all the routes) so it can be used elsewhere
//i.e. the main app
module.exports = apiRoutes;