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
        	console.log(err);
        	return callback("Server error.");
        }
	    // Use the connection
	    connection.query('SELECT ' + columns + ' FROM ' + table, function(error, results, fields) {
	        //finished with the connection - send it back to the pool
	        connection.release();
	        //Handle error after the release.
	        if (error) {
	        	console.log(error);
	        	return callback("Server error.");
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
        	console.log(err);
        	return callback("Server error.");
        }
	    // Use the connection
	    connection.query('SELECT ' + columns + ' FROM ' + table + ' WHERE ' + where, function(error, results, fields) {
	        //finished with the connection - send it back to the pool
	        connection.release();
	        //Handle error after the release.
	        if (error) {
	        	console.log(error);
	        	return callback("Server error.");
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
        	console.log(err);
        	return callback("Server error.");
        }
	    // Use the connection
	    //login by finding users where the email and password match the database.
	    //use '?' to make sure the query is parameterised to prevent sql injections
	    connection.query('SELECT * from users WHERE email = ? and password = ?', [email, password], function(error, results, fields) {
	        //finished with the connection - send it back to the pool
	        connection.release();
	        //Handle error after the release.
	        if (error) {
	        	console.log(error);
	        	return callback("Server error.");
	        }

	        //if there is a result (i.e. it found a match to the email and password)
	        if (results.length == 1) {
	        	//return true
	        	return callback(null, true, results)
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
        	console.log(err);
        	return callback("Server error.");
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
	        	console.log(error);
	        	return callback("Server error.");
	        }

	        //return the results of the command
	        return callback(null, results)
	        //Don't use the connection here, it has been returned to the pool.
	    });
	});
}

//get posts
exports.getPosts = function(bubbleId, skip, userId, callback) {
	//get a new connection from the pool
	pool.getConnection(function(err, connection) {
		//if there is an error
		if (err) {
			//return the error via the callback to the function that callled it
        	console.log(err);
        	return callback("Server error.");
        }
	    // Use the connection
	    var sql = `
	    SELECT p.postId, p.post, p.dateCreated, b.bubbleName, u.name AS username, 
	    COUNT(l.likeId) as likes, COUNT(lu.likeId) as likeId, COUNT(c.commentId) as comments
	    FROM posts AS p
		INNER JOIN bubbles AS b ON p.bubbleId = b.bubbleId
		INNER JOIN users AS u ON p.userId = u.userId
		LEFT JOIN likes AS l ON p.postId = l.postId
		LEFT JOIN likes as lu on p.postId = lu.postId AND l.userId = ${userId}
		LEFT JOIN comments as c on p.postId = c.postId
		WHERE p.bubbleId = ${bubbleId}
		GROUP BY postId
		ORDER BY p.dateCreated DESC
		LIMIT ${skip}, ${skip+10}`;
	    connection.query(sql, function(error, results, fields) {
	        //finished with the connection - send it back to the pool
	        connection.release();
	        //Handle error after the release.
	        if (error) {
	        	console.log(error);
	        	return callback("Server error.");
	        }

	        return callback(null, results)
	        //Don't use the connection here, it has been returned to the pool.
	    });
	});
}

//like the post using the insert id function
exports.likePost = function(userId, postId, date, callback) {
	//create an object for inserting into the like table
	var like = {
		//the like id is a concatention of the userId and the postId
		//in a string form. this can be used as a unique key as
		//it is always in this form so the same user liking 
		//the same post will not be inserted into the post
		likeId: parseInt(String(userId) + String(postId)),
		userId: userId,
		postId: postId,
		dateCreated: date
	};
	//using the insert data function, the like object is 
	//inserted into the like table
	exports.insertData(like, 'likes', function(err, results) {
		//if there is an error, return the error
		if (err) {
			//if the error is a duplicate entry, that means the user has
			//already liked the post. return an error that displays 
			//that rather than the long and complicated mysql error.
			if (err.errno == 1062) {
				return callback("Post already liked by this user.");
			}
			console.log(err);
			return callback("Server error.");
		} 
		return callback(null, results);
	});
}

//using the decoded id, return the email and username
//instead of returning the whole decoded array 
//which may contain sensitive info.
exports.me = function(decoded) {
	return {
		email: decoded.email,
		username: decoded.name
	}
}