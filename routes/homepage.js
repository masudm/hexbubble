var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client

//this is a basic homepage renderer
//get /
//and render the homepage
apiRoutes.get('/', function(req, res) {
	//if they have a req.decoded object, that means they are logged in so redirect them
	//to their feed.
	if (req.decoded) {
		res.redirect('/feed');
		return false;
	}
	//as a response, render the homepage view
	res.render('homepage');
});

module.exports = apiRoutes;