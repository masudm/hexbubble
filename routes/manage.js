var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var moment = require('moment'); //a library for time and date functions
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var db = require('../helpers/db'); //a reference to the database functions so they can be used
var sha256 = require('../helpers/encrypt');

apiRoutes.get('/:id', function(req, res) {
    isAdmin(req.decoded.userId, req.params.id, function(isAdmin) {
        if (!isAdmin) {
            res.send('You are not an admin.');
        } else {
            res.render('manage', {bubbleId: req.params.id});
        }
    });
});

apiRoutes.post('/changePassword', function(req, res) {
    let bubbleId = req.body.bubbleId;
    let password = sha256(req.body.password);
    let oldPassword = sha256(req.body.oldPassword);

    isAdmin(req.decoded.userId, bubbleId, function(isAdmin) {
        if (!isAdmin) {
            return res.json({
                success: false,
                error: 'You are not an admin.'
            });
        } else {
            db.isBubblePasswordCorrect(oldPassword, bubbleId, function(err, isCorrect) {
                if (!isCorrect) {
                    return res.json({
                        success: false,
                        error: 'Incorrect old password'
                    });
                } else {
                    db.changeBubblePassword(bubbleId, password, function(err, data) {
                        if (err) {
                            return res.json({
                                success: false,
                                error: err
                            });
                        }
                        res.json({
                            success: true,
                            //data: data
                        });
                    });
                }
            });
        }
    });
});

function isAdmin(userId, bubbleId, callback) {
//check for auth of user - if they are actually an admin
    db.isAdmin(userId, bubbleId, function(err, data) {
        return callback(!!data[0].admin);
    });
}

module.exports = apiRoutes;