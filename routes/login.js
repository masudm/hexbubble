var express = require('express');
var apiRoutes = express.Router();

apiRoutes.get('/', function(req, res) {
	res.render("hello");
});

module.exports = apiRoutes;