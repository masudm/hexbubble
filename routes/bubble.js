var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var db = require('./db'); //a reference to the database functions so they can be used
var multer = require('multer');
var st = require('./storage');

//multer variables for file storage
var upload = multer({
	storage: st.storage('bubblePictures/'),
	fileFilter: st.fileFilter,
	limits: st.limits
});

apiRoutes.get('/new', function(req, res) {
    res.render('newbubble');
});

apiRoutes.post('/new', upload.single('bubblePicture'), function (req, res, next) {
    //create a bubble
    db.createBubble(req.body.bubbleName, req.body.bubbleName, req.file.filename, function(err, bubble) {
        //create a new admin in the newly created bubble
        db.newMember(req.decoded.userId, bubble.insertId, 1, function(err, data) {
            res.json({
                success: true,
                feedId: bubble.insertId
            });
        });
    });
});

apiRoutes.post('/join', function(req, res) {
    db.getBubble(req.body.name, function(err, data) {
        if (data[0] == undefined) {
            return res.json({
                success: false,
                error: "Bubble does not exist"
            });
        }
        db.newMember(req.decoded.userId, data[0].bubbleId, 0, function(err, member) {
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
            
            res.json({
                success: true,
                feedId: data[0].bubbleId
            });
        });
    });
});

//export the apiRoutes variable (which defines all the routes) so it can be used elsewhere
//i.e. the main app
module.exports = apiRoutes;