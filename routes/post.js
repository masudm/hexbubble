var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var moment = require('moment'); //a library for time and date functions
var db = require('../helpers/db'); //a reference to the database functions so they can be used

//post to the /post/new route
apiRoutes.post('/new', function(req, res) {
	let bid = parseInt(req.body.bubbleId);
	let userId = req.decoded.userId;
	let post = req.body.post;
	console.log(req.body);

	if (post == null || post == "" || post == undefined) {
		return res.json(db.makeError("Please enter a post."));
	}

	if (bid == null || bid == "" || bid == undefined) {
		return res.json(db.makeError("No bubble id."));
	}

	//create a new post object to insert
	//include everything needed for the database such as userId, bubbleId, etc
	post = {
		userId: userId, //userid from decoding
		bubbleId: bid, //bubble id from passed post request
		dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), //current date in needed format
		post: post //the actual post
	};

	uploadPost(parseInt(req.decoded.userId), bid, post, function(json) {
		console.log(json);
		res.json(json);
	});
});

function uploadPost(userId, bid, post, callback) {
	//insert the object into the post table if they are a member
	db.isMember(userId, bid, function(err, data) {
		if (err) {
            return callback({
                success: false,
                error: err
            });
        }
		//if there is no data, they are not a member
		if (data.length > 0) { 
			//they are a member, so insert their post
			db.newPost(post, function(err, results) {
				//if there is an error, return the error
				if (err) {
					return callback({
						success: false,
						error: err
					});
				}
				return callback({
					success: true, 
					postId: results.insertId
				});
			});
		} else {
			//they are not a member so send back a message
			return callback({
				success: false,
				error: 'You are not allowed in this bubble.'
			}); //TODO: change this to error message
		}
	});
}

//likes are posted to this route
apiRoutes.post('/like', function(req, res) {
	//after the like is posted, it goes here
	//like the post using the database method
	//send the request's user id and the post id that they are sending
	//also format a new date for mysql
	db.likePost(req.decoded.userId, req.body.postId, function(err, data) {
		//if there is an error, return a success: false message along with the error
		if (err) {
            return res.json({
                success: false,
                error: err
            });
        }
		//otherwise, return a success true message
		return res.json({success: true});
	});
});

apiRoutes.post('/dislike', function(req, res) {
	db.dislikePost(req.decoded.userId, req.body.postId, function(err, data) {
		//if there is an error, return a success: false message along with the error
		if (err) {
            return res.json({
                success: false,
                error: err
            });
        }
		//otherwise, return a success true message
		return res.json({success: true});
	});
});

//get comments on a post
apiRoutes.post('/comments', function(req, res) {
	//get skip number of comments on postId post
	db.getComments(req.body.postId, req.body.skip, function(err, data) {
		if (err) {
            return res.json({
                success: false,
                error: err
            });
        }
		//send back the data as json
		return res.json(data);
	});
});

//comment on a post
apiRoutes.post('/comment', function(req, res) {
	//add a new comment using their id, the post id and the actual comment
	db.addComment(req.decoded.userId, req.body.postId, req.body.comment, function(err, data) {
		//if there is an error, return a success: false message along with the error
		if (err) {
            return res.json({
                success: false,
                error: err
            });
        }
		//otherwise, return a success true message
		return res.json({success: true});
	});
});

//export the apiRoutes variable (which defines all the routes) so it can be used elsewhere
//i.e. the main app
module.exports = apiRoutes;