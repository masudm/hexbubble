var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var moment = require('moment'); //a library for time and date functions
var db = require('../helpers/db'); //a reference to the database functions so they can be used
var multer = require('multer');
var st = require('../helpers/storage');

//multer variables for file storage
var upload = multer({
	storage: st.storage('postPictures/'),
	fileFilter: st.fileFilter,
	limits: st.limits
});

//post to the /post/new route
apiRoutes.post('/new', function(req, res) {
	let bid = parseInt(req.body.bubbleId);
	let userId = req.decoded.userId;
	let post = req.body.post;

	if (db.nullCheck(post)) {
		return res.json(db.makeError("Please enter a post."));
	}

	if (post.length > 2500) {
		return res.json(db.makeError("Max post length is 2500."));
	}

	if (db.nullCheck(bid)) {
		return res.json(db.makeError("No bubble id."));
	}

	//create a new post object to insert
	//include everything needed for the database such as userId, bubbleId, etc
	post = {
		userId: userId, //userid from decoding
		bubbleId: bid, //bubble id from passed post request
		dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), //current date in needed format
		post: post, //the actual post
		favourite: 0, //by default, it is not a favourite
	};

	uploadPost(parseInt(userId), bid, post, function(json) {
		res.json(json);
	});
});

apiRoutes.post('/new/upload', upload.single('postPicture'), function(req, res) {
	let bid = parseInt(req.body.bubbleId);
	let userId = req.decoded.userId;
	let post = req.body.post;
	let file = req.file;
	let filename = file.filename;

	if (db.nullCheck(post)) {
		return res.json(db.makeError("Please enter a post."));
	}

	if (db.nullCheck(bid)) {
		return res.json(db.makeError("No bubble id."));
	}

	if (db.nullCheck(file)) {
		return res.json(db.makeError("Please upload a file"));
	}

	//make a post string
	post += "|img|" + filename;

	//create a new post object to insert
	//include everything needed for the database such as userId, bubbleId, etc
	post = {
		userId: userId, //userid from decoding
		bubbleId: bid, //bubble id from passed post request
		dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), //current date in needed format
		post: post, //the actual post
		favourite: 0, //by default, it is not a favourite
	};

	uploadPost(parseInt(req.decoded.userId), bid, post, function(json) {
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
					postId: results.insertId,
					post: post
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

//favourites are posted to this route
apiRoutes.post('/favourite', function(req, res) {
	let postId = req.body.postId;
	let bubbleId = req.body.bubbleId;

	if (db.nullCheck(postId)) {
		return res.json(db.makeError("Please enter a post id."));
	}

	if (db.nullCheck(bubbleId)) {
		return res.json(db.makeError("Please enter a bubble id."));
	}

	db.favouritePost(req.decoded.userId, bubbleId, postId, (err, data) => {
		if (err) {
            return res.json({
                success: false,
                error: err
            });
		}
		
		return res.json({success: true});
	});
});

//likes are posted to this route
apiRoutes.post('/like', function(req, res) {
	let postId = req.body.postId;

	if (db.nullCheck(postId)) {
		return res.json(db.makeError("Please enter a post id."));
	}

	//after the like is posted, it goes here
	//like the post using the database method
	//send the request's user id and the post id that they are sending
	//also format a new date for mysql
	db.likePost(req.decoded.userId, postId, function(err, data) {
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
	let postId = req.body.postId;
	
	if (db.nullCheck(postId)) {
		return res.json(db.makeError("Please enter a post id."));
	}

	db.dislikePost(req.decoded.userId, postId, function(err, data) {
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
	let postId = req.body.postId;
	let skip = req.body.skip;
	
	if (db.nullCheck(postId)) {
		return res.json(db.makeError("Please enter a post id."));
	}

	if (db.nullCheck(skip)) {
		return res.json(db.makeError("Please enter a skip value."));
	}

	//get skip number of comments on postId post
	db.getComments(postId, skip, function(err, data) {
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
	let comment = req.body.comment;
	let postId = req.body.postId;

	if (db.nullCheck(postId)) {
		return res.json(db.makeError("Please enter a post id."));
	}

	if (db.nullCheck(comment)) {
		return res.json(db.makeError("Please enter a comment."));
	}

	//add a new comment using their id, the post id and the actual comment
	db.addComment(req.decoded.userId, postId, comment, function(err, data) {
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