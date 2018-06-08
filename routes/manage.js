var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var moment = require('moment'); //a library for time and date functions
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var db = require('../helpers/db'); //a reference to the database functions so they can be used

apiRoutes.get('/:id', function(req, res) {
    //check for auth of user - if they are actually an admin
    db.isAdmin(req.decoded.userId, req.params.id, function(err, data) {
        let isAdmin = !!data[0].admin;

        if (!isAdmin) {
            res.send('You are not an admin.');
        } else {
            res.render('manage');
        }
    });
});

module.exports = apiRoutes;