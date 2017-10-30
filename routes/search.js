var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var db = require('../helpers/db'); //a reference to the database functions so they can be used

apiRoutes.post('/users', function(req, res) {
    var term = req.body.term;
    if (term < 3) {
        return res.json({
            success: false,
            error: "Min. 3 Characters"
        });
    }
    db.searchUsers(term, function(err, data) {
        res.json(data);
    });
});

module.exports = apiRoutes;