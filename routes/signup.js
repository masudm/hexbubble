var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes

var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var moment = require('moment'); //a library for time and date functions
var db = require('./db');

//after the base route (in this case, '/signup', go to the next route):
//full route: /signup/
apiRoutes.get('/', function(req, res) {
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
	let bio = req.body.bio;

	//create a new object (or associative array) using property value shorthand
	//https://github.com/airbnb/javascript#es6-object-concise
	var user = {
		email,
		password,
		name,
		profilePicture,
		bio,
		//create a new MySQL formatted date using the moment library
		dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss") 
	};
	
	//use the insertData function to insert the user object into the user table
	db.insertData(user, 'users', function(err, userResults) {
		//if there is an error
		if (err) {
			//send back a false success message
			res.status(200).json({
				success: false
			});
			//and throw an error so it can be debugged
			throw err;
		};

		db.getDataWhere('bubbleId', 'bubbles', 'bubbleName = "' + req.body.bubble + '"', function(err, results) {
			//if there is an error
			if (err) {
				//send back a false success message
				res.status(200).json({
					success: false
				});
				//and throw an error so it can be debugged
				throw err;
			};

			member = {
				userId: userResults.insertId,
				bubbleId: results[0].bubbleId,
				admin: 0, //false
				dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss") 
			};

			db.insertData(member, 'members', function(err, results) {
				//if there is an error
				if (err) {
					//send back a false success message
					res.status(200).json({
						success: false
					});
					//and throw an error so it can be debugged
					throw err;
				};
				
				//otherwise, send back a success true message
				res.json({
					success: true
				});
			});			
		});
	});
});

//export the apiRoutes variable (which defines all the routes) so it can be used elsewhere
//i.e. the main app
module.exports = apiRoutes;