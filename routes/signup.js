var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var moment = require('moment'); //a library for time and date functions
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var db = require('./db'); //a reference to the database functions so they can be used

apiRoutes.get('/2', function(req, res) {
	res.render('signup2');
});

apiRoutes.post('/2', function(req, res) {
	console.log(req.files);
	console.log(req.body);
});

//after the base route (in this case, '/signup', go to the next route):
//full route: /signup/
apiRoutes.get('/', function(req, res) {
	if (req.decoded) {
		res.redirect('/feed');
		return false;
	}
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
	let bio = "";

	//check if the bubble already exists
	db.getBubble(req.body.bubble, function(err, data) {
		if (data.length > 0) {
			//a bubble already exists
			let bubbleId = (data[0].bubbleId); //get it's bubbleid
			signUserUp(res, email, password, name, profilePicture, bio, bubbleId); //sign the user up with that bubbleid
		} else {
			//no bubble, create it too
			db.createBubble(req.body.bubble, "", "", function(err, bubble) {
				//sign the user up and use the bubble id from that inserted id
				signUserUp(res, email, password, name, profilePicture, bio, bubble.insertId);
			});
		}
	});
});

//sign the user up and add member
function signUserUp(res, email, password, name, profilePicture, bio, bubbleId) {
	//use the db function
	db.signup(email, password, name, profilePicture, bio, function(err, user) {
		//create a new member
		db.newMember(user.insertId, bubbleId, 0, function(err, member) {

			//create a new token for auth
			var token = jwt.sign({email, name, profilePicture, userId: user.insertId}, 'hexbubblesecret', {
				expiresIn: '1y' // expires in 24 hours
			});				
	
			//set a cookie with the auth token
			//res.cookie('token', token, { maxAge: 31622400, httpOnly: true });
			res.cookie('token', token, { maxAge: 31622400});
	
			//otherwise, send back a success true message
			res.json({
				success: true,
				token
			});
		});
	});
}

//export the apiRoutes variable (which defines all the routes) so it can be used elsewhere
//i.e. the main app
module.exports = apiRoutes;