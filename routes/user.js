var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var db = require('./db'); //a reference to the database functions so they can be used

apiRoutes.get('/:userid', function(req, res) {
	db.getUser(req.params.userid, function(err, data) {
		res.render('user', {user: data});
	});
});

//export the apiRoutes variable (which defines all the routes) so it can be used elsewhere
//i.e. the main app
module.exports = apiRoutes;