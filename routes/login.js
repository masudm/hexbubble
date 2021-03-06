var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var db = require('../helpers/db'); //a reference to the database functions so they can be used
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var sha256 = require('../helpers/encrypt');

//after the base route (in this case, '/login', go to the next route):
//full route: /login/
apiRoutes.get('/', function(req, res) {
	//if they have a req.decoded object, that means they are logged in so redirect them
	//to their feed.
	if (req.decoded) {
		res.redirect('/feed');
		return false;
	}
	//as a response, render the login view
	res.render("login");
});

//full route: /login/
//post to this route
apiRoutes.post('/', function(req, res) {
	//create block level variables with the POSTed values
	let email = req.body.email;
	let password = sha256(req.body.password);

	if (db.nullCheck(email)) {
		return res.json(db.makeError("Please enter an email."));
	}

	if (db.nullCheck(password)) {
		return res.json(db.makeError("Please enter a password."));
	}

	//login with the passed email and password
	db.login(email, password, function(err, valid, results) {
		if (err) {
            return res.json({
                success: false,
                error: err
            });
        }
		//it returns a valid boolean if the email and password match a
		//user in the database.
		//if it is true, send back a true success token
		if (valid) {
			//create a new json web token using the data from the database.
			//inside the token include userId, name, etc
			var token = jwt.sign({
				email: results[0].email, 
				name: results[0].name, 
				profilePicture: results[0].profilePicture, 
				userId: results[0].userId
			}, 'hexbubblesecret', {
				expiresIn: '1y' // expires in 24 hours
			});		

			//set a cookie with the auth token
			//res.cookie('token', token, { maxAge: 31622400, httpOnly: true });
			res.cookie('token', token, { maxAge: 31622400});

			//send back a success true message along with the token
			return res.json({
				success: true,
				token
			});
		} else {
			//otherwise send back a success false token
			return res.json({
				success: false
			});
		}
	});
});

//export the apiRoutes variable (which defines all the routes) so it can be used elsewhere
//i.e. the main app
module.exports = apiRoutes;