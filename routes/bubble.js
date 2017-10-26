var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var db = require('./db'); //a reference to the database functions so they can be used

apiRoutes.get('/new', function(req, res) {
    res.render('newbubble');
});

apiRoutes.post('/new', function(req, res) {
    db.getBubble(req.body.name, function(err, data) {
        if (data[0] == undefined) {
            return res.json({
                success: false,
                error: "Bubble does not exist"
            });
        }
        db.newMember(req.decoded.userId, data[0].bubbleId, 0, function(err, data) {
            if (err) {
                if (err == "User already in this bubble.") {
                    return res.json({
                        success: false,
                        error: "User already in this bubble."
                    }); 
                }
                return res.json({
                    success: false,
                    error: "Server error"
                });
            } 
            
            res.json({success: true});
        });
    });
});

//export the apiRoutes variable (which defines all the routes) so it can be used elsewhere
//i.e. the main app
module.exports = apiRoutes;