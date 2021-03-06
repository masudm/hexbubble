var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var db = require('../helpers/db'); //a reference to the database functions so they can be used

//get the /me page and redirect to their page using the decoded user id
apiRoutes.get('/', function(req, res) {
	res.redirect('/user/' + req.decoded.userId);
});

apiRoutes.get('/logout', function(req, res) {
    req.decoded = null;
    res.clearCookie("token");
    res.redirect('/');
});

//get a user's memberships to bubbles
apiRoutes.get('/bubbles', function(req, res) {
    //get their bubbles using their userId
    db.getBubbles(req.decoded.userId, function(err, data) {
        //if there was an error, return it as json to the front-end
        if (err) {
            return res.json({
                success: false,
                error: err
            });
        }
        //send back the data as json to format on the front-end
        res.json({
            success: true,
            data: data
        });
    });
});

//export the apiRoutes variable (which defines all the routes) so it can be used elsewhere
//i.e. the main app
module.exports = apiRoutes;