var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var moment = require('moment'); //a library for time and date functions
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var db = require('../helpers/db'); //a reference to the database functions so they can be used
var io; //create a temp variable in the global scope

//this is the main feed page and requests to here
apiRoutes.get('/feed', function(req, res) {
	//get the first bubble id of the user
	db.getFirstBubble(req.decoded.userId, function(err, data) {
		//if there was an error, return it as json to the front-end
        if (err) {
            return res.json({
                success: false,
                error: err
            });
        }
		if (data.length > 0) {
			//redirect to their actual feed from their first bubble id
			res.redirect('/feed/' + (data[0].bubbleId)); //go to the first bubble the user is signed up for
		} else {
			//if they do not have one, redirect them because they are breaking something or not logged in.
			res.redirect('/bubble/new');
		}
	});
});

//the actual feed
apiRoutes.get('/feed/:bubbleId', function(req, res) {
	let bid = parseInt(req.params.bubbleId); //from the string bubble id parse it into an integer

	if (bid == null || bid == "" || bid == undefined) {
		return res.json(db.makeError("No bubble id."));
	}

	getPosts(req.decoded.userId, bid, 0, req.decoded, function(json) {
		res.render('feed', json);
	});
});

apiRoutes.post('/feed', function(req, res) {
	let bid = parseInt(req.body.bubbleId); //from the string bubble id parse it into an integer
	let skip = parseInt(req.body.skip);
	
	if (bid == null || bid == "" || bid == undefined) {
		return res.json(db.makeError("No bubble id."));
	}

	getPosts(req.decoded.userId, bid, skip, req.decoded, function(json) {
		res.json({
			success: true,
			data: json
		});
	});
});

function getPosts(userId, bid, skip, user, callback) {
	//verify if they're a member
	db.isMember(parseInt(userId), bid, function(err, data) {
		//if there was an error, return it as json to the front-end
        if (err) {
            return callback({
                success: false,
                error: err
            });
        }
		if (data.length > 0) { //if they are a member
			//get their posts
			db.getPosts(bid, skip, userId, function(err, results) {
				//if there was an error, return it as json to the front-end
				if (err) {
					return callback({
						success: false,
						error: err
					});
				}
				//render the feed page
				//send the posts in a json format
				//and send the user object as json too
				return callback({
					success: true,
					posts: JSON.stringify(results), 
					me: JSON.stringify(db.me(user)),
					bubbleId: bid
				});
			});
		} else { 
			//they are a not a member so send them a message
			return callback({
				success: false,
				error: "Not allowed here."
			}); //TODO: change this to error message
		}
	});
}



module.exports = function(http) {
	//use the passed in http module to start the io server
	io = require('socket.io')(http);
	//join the socket
	io.on('connection', function(socket){
		//when user disconnects
		socket.on('disconnect', function(){
			//console.log('user disconnected');
		});
		
		//join a bubble method
		socket.on('joinBubble', function(bid){
			//run the method
			socket.join(bid);
		});

		//when you get a new post, emit it to everyone in the room
		socket.on('newPost', function(data) {
			//emit to the bubble id (first in array). send the post (second in array)
			io.to(data[0]).emit('newPost', data[1]);
		});
	});

	//provide the main app with the routes
	return apiRoutes;
};