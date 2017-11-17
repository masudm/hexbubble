var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var db = require('../helpers/db'); //a reference to the database functions so they can be used

//the search users route
apiRoutes.post('/users', function(req, res) {
    //get the term used to search for
    var term = req.body.term;

    if (db.nullCheck(term)) {
		return res.json(db.makeError("Please enter a term."));
	}

    //if it is less than 3 characters, do not execute the query
    //because it probably spam and will return too many results
    if (term < 3) {
        //return an expressive error message
        return res.json({
            success: false,
            error: "Min. 3 Characters"
        });
    }

    //otherwise, search the users table for that term
    db.searchUsers(term, function(err, data) {
        //if there is an error, return a success: false message along with the error
		if (err) {
            return res.json({
                success: false,
                error: err
            });
        }
        //return the json
        res.json(data);
    });
});

module.exports = apiRoutes;