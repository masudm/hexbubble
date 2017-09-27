const express = require('express');
const app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

//API routes
//create an instance for routes
var apiRoutes = express.Router();

app.use('/', require('./routes/login'));

app.get('/', function (req, res) {
  res.render("hello");
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});