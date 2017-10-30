var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var db = require('../helpers/db'); //a reference to the database functions so they can be used
var multer = require('multer');
var st = require('../helpers/storage');

//multer variables for file storage
var upload = multer({
	storage: st.storage('bubblePictures/'),
	fileFilter: st.fileFilter,
	limits: st.limits
});

//getting a new bubble page
apiRoutes.get('/new', function(req, res) {
    //render the respective page
    res.render('newbubble');
});

//posting to the new bubble page
//it requires a 'bubblePicture' file (middleware)
apiRoutes.post('/new', upload.single('bubblePicture'), function (req, res, next) {
    //create a bubble with the provided name, bio, and the new filename of the photo
    db.createBubble(req.body.bubbleName, req.body.bubbleDesc, req.file.filename, function(err, bubble) {
        //create a new admin in the newly created bubble
        db.newMember(req.decoded.userId, bubble.insertId, 1, function(err, data) {
            //send back a success true and the feed id as a token. 
            //the user will be redirected using this token
            res.json({
                success: true,
                feedId: bubble.insertId
            });
        });
    });
});

//post to the join new bubble route
apiRoutes.post('/join', function(req, res) {
    //get the bubbleid using the name provided
    db.getBubble(req.body.name, function(err, data) {
        //if there is no data i.e. it is undefined, return a false with message
        if (data[0] == undefined) {
            return res.json({
                success: false,
                error: "Bubble does not exist"
            });
        }
        //otherwise, add a new member using their id, the bubbleid and non-admin
        db.newMember(req.decoded.userId, data[0].bubbleId, 0, function(err, member) {
            //if there is an error...
            if (err) {
                //if due to already existing in the bubble, return that error...
                if (err == "User already in this bubble.") {
                    return res.json({
                        success: false,
                        error: "User already in this bubble."
                    }); 
                }
                //otherwise, return a server error
                return res.json({
                    success: false,
                    error: "Server error"
                });
            } 
            
            //send back a success token and the new bubble id so the user can be redirected
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