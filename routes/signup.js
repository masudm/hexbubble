var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes

var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client

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

	console.log(email);
});

module.exports = apiRoutes;