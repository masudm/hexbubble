var express = require('express'); //the express web server dependency
var apiRoutes = express.Router(); //use the router function within express to define the routes
var bodyParser = require('body-parser'); //use the body parser to parse the body request from the client
var moment = require('moment'); //a library for time and date functions
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var db = require('../helpers/db'); //a reference to the database functions so they can be used
var multer = require('multer');
var st = require('../helpers/storage');
var sha256 = require('../helpers/encrypt');

//multer variables for file storage
var upload = multer({
	storage: st.storage('profilePictures/'),
	fileFilter: st.fileFilter,
	limits: st.limits
});

//after the base route (in this case, '/signup', go to the next route):
//full route: /signup/
apiRoutes.get('/', function(req, res) {
	if (req.decoded) {
		res.redirect('/feed');
		return false;
	}
	//as a response, render the signup view
	res.render("signup");
});

apiRoutes.get('/2', function(req, res) {
	res.render('signup2');
});

apiRoutes.post('/2', upload.single('profilePic'), function(req, res) {
	let bio = req.body.bio;
	let filename = req.file.filename;

	if (db.nullCheck(bio)) {
		return res.json(db.makeError("Please enter a bio."));
	}

	if (db.nullCheck(filename)) {
		return res.json(db.makeError("Please upload a file"));
	}

	db.updateUser(bio, filename, req.decoded.userId, function(err, data) {
		if (err) {
            return res.json({
                success: false,
                error: err
            });
        }
		return res.json({
			success: true
		});
	});
});


//full route: /signup/
//post to this route
apiRoutes.post('/', function(req, res) {
	//create variables for each piece of data POSTed
	//let allows variable creation at the block level which minimises scoping problems
	let email = req.body.email;
	let password = req.body.password;
	let name = req.body.name;

	if (db.nullCheck(email)) {
		return res.json(db.makeError("Please enter an email."));
	}

	if (db.nullCheck(password)) {
		return res.json(db.makeError("Please enter a password."));
	}

	if (db.nullCheck(name)) {
		return res.json(db.makeError("Please enter a name."));
	}

	signUserUp(res, email, password, name);
});

//sign the user up and add member
function signUserUp(res, email, password, name) {
	password = sha256(password);
	//use the db function
	db.signup(email, password, name, function(err, user) {
		if (err) {
            return res.json({
                success: false,
                error: err
            });
        }
		//create a new token for auth
		var token = jwt.sign({email, name, userId: user.insertId}, 'hexbubblesecret', {
			expiresIn: '1y' // expires in 24 hours
		});				

		//set a cookie with the auth token
		//res.cookie('token', token, { maxAge: 31622400, httpOnly: true });
		res.cookie('token', token, { maxAge: 31622400});

		//otherwise, send back a success true message
		return res.json({
			success: true,
			token
		});
	});
}

//export the apiRoutes variable (which defines all the routes) so it can be used elsewhere
//i.e. the main app
module.exports = apiRoutes;