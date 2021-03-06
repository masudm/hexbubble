var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var db = require('../helpers/db'); //a reference to the database functions so they can be used

//the user route - render the user using the query in the url
apiRoutes.get('/:userid', function(req, res) {
	let userId = req.params.userid;
	//get the user using that query
	db.getUser(userId, function(err, data) {
		if (err) {
            return res.json({
                success: false,
                error: err
            });
        }
		//render the user page using that data.
		if (data[0]) {
			res.render('user', {user: data});
		} else {
			res.render('error', {err: "No user found."});
		}
		
	});
});

//export the apiRoutes variable (which defines all the routes) so it can be used elsewhere
//i.e. the main app
module.exports = apiRoutes;