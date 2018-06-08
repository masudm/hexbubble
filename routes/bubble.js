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
    let name = req.body.bubbleName;
    let desc = req.body.bubbleDesc;
    let filename = req.file.filename;

    if (db.nullCheck(name)) {
		return res.json(db.makeError("Please enter a name."));
    }
    
    if (db.nullCheck(desc)) {
		return res.json(db.makeError("Please enter a description."));
    }
    
    if (db.nullCheck(filename)) {
		return res.json(db.makeError("Please upload a file."));
	}

    //create a bubble with the provided name, bio, and the new filename of the photo
    db.createBubble(name, desc, filename, function(err, bubble) {
        //if there was an error, return it as json to the front-end
        if (err) {
            return res.json({
                success: false,
                error: err
            });
        }
        //create a new admin in the newly created bubble
        db.newMember(req.decoded.userId, bubble.insertId, 1, function(err, data) {
            //if there was an error, return it as json to the front-end
            if (err) {
                return res.json({
                    success: false,
                    error: err
                });
            }
            //send back a success true and the feed id as a token. 
            //the user will be redirected using this token
            return res.json({
                success: true,
                feedId: bubble.insertId
            });
        });
    });
});

//post to the join new bubble route
apiRoutes.post('/join', function(req, res) {
    //get the bubbleid using the name provided
    let name = req.body.name;

    if (db.nullCheck(name)) {
		return res.json(db.makeError("Please enter a name."));
	}

    db.getBubble(name, function(err, data) {
        if (err) {
            return res.json({
                success: false,
                error: err
            });
        }
        //if there is no data i.e. it is undefined, return a false with message
        if (data[0] == undefined) {
            return res.json({
                success: false,
                error: "Bubble does not exist"
            });
        }

        if (data[0].password && !req.body.password) {
            return res.json({
                success: false,
                error: "Password needed."
            });
            return false;
        }

        //otherwise, add a new member using their id, the bubbleid and non-admin
        db.newMember(req.decoded.userId, data[0].bubbleId, 0, function(err, member) {
            //if there was an error, return it as json to the front-end
            if (err) {
                return res.json({
                    success: false,
                    error: err
                });
            }
            
            //send back a success token and the new bubble id so the user can be redirected
            return res.json({
                success: true,
                feedId: data[0].bubbleId
            });
        });
    });
});

//export the apiRoutes variable (which defines all the routes) so it can be used elsewhere
//i.e. the main app
module.exports = apiRoutes;