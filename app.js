//require('node-offline-localhost').ifOfflineAtStartUp(); //make sure localhost works when offline
//dependencies
const express = require('express'); //the express web server dependency
const app = express(); //create a web server using express
const http = require('http').Server(app);
const bodyParser = require('body-parser'); //middleware for parsing body requests
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const cookieParser = require('cookie-parser');
const realtime = require('./helpers/io')(http);

//config
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//parse application/json
app.use(bodyParser.json());
// set the view engine to ejs (similar to html)
app.set('view engine', 'ejs');
//set the publicly accessible folder (available on the client side)
app.use(express.static('public'));
app.use(express.static('uploads'));
//get and set cookies using the cookie parser. useful for auth
app.use(cookieParser());

//API routes
//create an instance for routes
var apiRoutes = express.Router();

//middleware - all the routes go through here
app.use(function (req, res, next) {
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token;
	// decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, 'hexbubblesecret', function (err, decoded) {
			//if there was an error or an incorrect token...
			if (err) {
				return res.json({
					success: false,
					message: 'Failed to authenticate token.'
				});
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;
				//go to the next route (route that was requested)
				next();
			}
		});
	} else {
		//go to the next route (route that was requested)
		next();
	}
});

//for each base route (such as '/'), provide a route file which defines
//the routes within the base route and what each route does
app.use('/', require('./routes/homepage'));
app.use('/login', require('./routes/login'));
app.use('/signup', require('./routes/signup'));

app.use(function(req, res, next) {
	if (!req.decoded) {
		//res.status(300).json('Unauthorised');
		res.redirect('/login');
	} else {
		next();
	}
});

app.use('/post', require('./routes/post'));
app.use('/', require('./routes/feed'));

app.use('/user', require('./routes/user'));
app.use('/me', require('./routes/me'));
app.use('/bubble', require('./routes/bubble'));
app.use('/manage', require('./routes/manage'));
app.use('/search', require('./routes/search'));
app.use('/recommendation', require('./routes/recommendation'));


//finally, start the server on port 3000 within the local network.
http.listen(3000, function(){
	//display a message to state the server has started
	console.log('Started on port 3000!');
});

