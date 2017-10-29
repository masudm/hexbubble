var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var db = require('./db'); //a reference to the database functions so they can be used
var multer = require('multer');
var path = require('path');

//multer variables for file storage
var storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, './uploads/bubblePictures/');
	},
	filename: function (req, file, callback) {
		var ext = "";
		var fileName = file.originalname;
		if (fileName.indexOf(".") > 0) {
			ext = fileName.substr(fileName.lastIndexOf(".") + 1).toLowerCase(); //get everything after last dot (extension)
			fileName = db.makeid() + "." + ext; //concatenate with a few random characters
		} else {
			fileName = db.makeid();
		}

		callback(null, fileName);
	}
});

var upload = multer({
	storage: storage,
	fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only png, jpg and gif are allowed'))
        }
        callback(null, true);
    },
	limits: {
		fileSize: 2 * 1024 * 1024 //2mb limit
	}
});

apiRoutes.get('/new', function(req, res) {
    res.render('newbubble');
});

apiRoutes.post('/new', upload.single('bubblePicture'), function (req, res, next) {
    //create a bubble
    db.createBubble(req.body.bubbleName, req.body.bubbleName, req.file.filename, function(err, bubble) {
        //sign the user up and use the bubble id from that inserted id
        res.json(bubble);
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