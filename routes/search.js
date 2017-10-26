var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var db = require('./db'); //a reference to the database functions so they can be used

apiRoutes.get('/:term', function(req, res) {
    db.searchUsers('a', function(err, data) {
        res.json(data);
    });
});

module.exports = apiRoutes;