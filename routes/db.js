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
		//if there is an error
		if (err) {
			//return the error via the callback to the function that callled it
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

//async function to get data where a specific query is met
exports.getDataWhere = function(columns, table, where, callback) {
	//get a new connection from the pool
	pool.getConnection(function(err, connection) {
		//if there is an error
		if (err) {
			//return the error via the callback to the function that callled it
        	return callback(err);
        }
	    // Use the connection
	    connection.query('SELECT ' + columns + ' FROM ' + table + ' WHERE ' + where, function(error, results, fields) {
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

//an async function to login
//pass an email, password and a callback function as parameters
exports.login = function(email, password, callback) {
	//get a new connection from the pool
	pool.getConnection(function(err, connection) {
		//if there is an error
		if (err) {
			//return the error via the callback to the function that callled it
        	return callback(err);
        }
	    // Use the connection
	    //login by finding users where the email and password match the database.
	    //use '?' to make sure the query is parameterised to prevent sql injections
	    connection.query('SELECT * from users WHERE email = ? and password = ?', [email, password], function(error, results, fields) {
	        //finished with the connection - send it back to the pool
	        connection.release();
	        //Handle error after the release.
	        if (error) {
	        	return callback(error);
	        }

	        //if there is a result (i.e. it found a match to the email and password)
	        if (results.length == 1) {
	        	//return true
	        	return callback(null, true)
	        } else {
	        	//otherwise return false
	        	return callback(null, false)
	        }
	        //Don't use the connection here, it has been returned to the pool.
	    });
	});
}

//insert data using a data object into a table
exports.insertData = function(data, table, callback) {
	//get a new connection from the pool
	pool.getConnection(function(err, connection) {
		//if there is an error
		if (err) {
			//return the error via the callback to the function that callled it
        	return callback(err);
        }
	    // Use the connection
	    //insert into a table and use the SET MySQL command to easily insert an object of data
	    //rather than the typical columns...values... SQL command
	    //this also allows the data to be parsed to prevent SQL injections
	    connection.query('INSERT INTO '+ table +' SET ?', data, function(error, results, fields) {
	        //finished with the connection - send it back to the pool
	        connection.release();
	        //Handle error after the release.
	        if (error) {
	        	return callback(error);
	        }

	        //return the results of the command
	        return callback(null, results)
	        //Don't use the connection here, it has been returned to the pool.
	    });
	});
}