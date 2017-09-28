const express = require('express');
const app = express();
const mysql = require('mysql');

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static('public'));

//database connection
/*var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'hexbubble'
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function(error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
});

connection.end();*/

//API routes
//create an instance for routes
var apiRoutes = express.Router();

app.use('/login', require('./routes/login'));
app.use('/', require('./routes/feed'));

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});