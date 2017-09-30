//all database functions go through here. this makes it easier to make mass changes to the database
//such as the connection info or parametising the sql queries to prevent SQL injections

//dependencies
var mysql = require('mysql'); //mysql wrapper for the mysql api

//create a new pool of mysql connection. better for performance - especially Node which is highly async
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'hexbubble'
});

//create a (public) function to export to other files that include this file
//this is an async function so a 'callback' parameter needs to be passed
//when the function is done, it calls the callback method with either the errors or the results
exports.getData = function(columns, table, callback) {
	//get a new connection from the pool
	pool.getConnection(function(err, connection) {
		if (err) {
        	return callback(err);
        }
	    // Use the connection
	    connection.query('SELECT ' + columns + ' FROM ' + table, function(error, results, fields) {
	        //finished with the connection - send it back to the pool
	        connection.release();
	        //Handle error after the release.
	        if (error) {
	        	return callback(error);
	        }

	        return callback(null, results)
	        //Don't use the connection here, it has been returned to the pool.
	    });
	});
}

exports.login = function(email, password, callback) {
	//get a new connection from the pool
	pool.getConnection(function(err, connection) {
		if (err) {
        	return callback(err);
        }
	    // Use the connection
	    connection.query('SELECT * from users WHERE email = ? and password = ?', [email, password], function(error, results, fields) {
	        //finished with the connection - send it back to the pool
	        connection.release();
	        //Handle error after the release.
	        if (error) {
	        	return callback(error);
	        }

	        if (results.length == 1) {
	        	return callback(null, true)
	        } else {
	        	return callback(null, false)
	        }
	        //Don't use the connection here, it has been returned to the pool.
	    });
	});
}

exports.insertData = function(data, table, callback) {
	//get a new connection from the pool
	pool.getConnection(function(err, connection) {
		if (err) {
        	return callback(err);
        }
	    // Use the connection
	    connection.query('INSERT INTO '+ table +' SET ?', data, function(error, results, fields) {
	        //finished with the connection - send it back to the pool
	        connection.release();
	        //Handle error after the release.
	        if (error) {
	        	return callback(error);
	        }

	        return callback(null, results)
	        //Don't use the connection here, it has been returned to the pool.
	    });
	});
}