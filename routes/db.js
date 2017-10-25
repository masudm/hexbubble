//all database functions go through here. this makes it easier to make mass changes to the database
//such as the connection info or parametising the sql queries to prevent SQL injections

//dependencies
var mysql = require('mysql'); //mysql wrapper for the mysql api
var moment = require('moment'); //mysql wrapper for the mysql api

//create a new pool of mysql connection. better for performance - especially Node which is highly async
var pool = mysql.createPool({
    connectionLimit: 10,
    host: '127.0.0.1',
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
		LEFT JOIN likes as lu on p.postId = lu.postId AND lu.userId = ${userId}
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
exports.likePost = function(userId, postId, callback) {
	//create an object for inserting into the like table
	var like = {
		//the like id is a concatention of the userId and the postId
		//in a string form. this can be used as a unique key as
		//it is always in this form so the same user liking 
		//the same post will not be inserted into the post
		likeId: parseInt(String(userId) + String(postId)),
		userId: userId,
		postId: postId,
		dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
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

exports.addComment = function(userId, postId, comment, callback) {
	var comment = {
		userId,
		postId,
		comment,
		dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
	}

	exports.insertData(comment, 'comments', function(err, data) {
		//if there is an error
		if (err) {
			//send back a false success message
			callback(err);
			//and throw an error so it can be debugged
			throw err;
		};
		callback(null, data);
	});
}

exports.getComments = function(postId, skip, callback) {
	//get a new connection from the pool
	pool.getConnection(function(err, connection) {
		//if there is an error
		if (err) {
			//return the error via the callback to the function that callled it
        	console.log(err);
        	return callback("Server error.");
        }
	    // Use the connection
	    connection.query(`SELECT * from comments WHERE postId = "${postId}" LIMIT ${skip}, ${skip+10}`, function(error, results, fields) {
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

//verify if they are a member by checking that userid against that bubbleid in the member table
exports.isMember = function(userId, bubbleId, callback) {
	exports.getDataWhere('memberId', 'members', ('userId = ' + userId + ' and bubbleId = ' + bubbleId), function(err, data) {
		//if there is an error
		if (err) {
			//send back a false success message
			callback(err);
			//and throw an error so it can be debugged
			throw err;
		};
		callback(err, data); //return the data
	});
}

//a signup function 
exports.signup = function(email, password, name, profilePicture, bio, callback) {
	//create a new object (or associative array) using property value shorthand
	//https://github.com/airbnb/javascript#es6-object-concise
	var user = {
		email,
		password,
		name,
		profilePicture,
		bio,
		//create a new MySQL formatted date using the moment library
		dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss") 
	};

	//inset the user object into the user table
	exports.insertData(user, 'users', function(err, userResults) {
		//if there is an error
		if (err) {
			//send back a false success message
			callback(err);
			//and throw an error so it can be debugged
			throw err;
		};
		//send the data back
		callback(null, userResults);
	});
}

//a function to add a new member to the member table
exports.newMember = function(userId, bubbleId, admin, callback) {
	//create a new member object
	member = {
		userId,
		bubbleId,
		admin,
		dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss") //create a MySQL formatted date
	};

	//insert the member object into the member table
	exports.insertData(member, 'members', function(err, results) {
		//if there is an error
		if (err) {
			//send back a false success message
			callback(err);
			//and throw an error so it can be debugged
			throw err;
		};
		callback(null, results);
	});
}

//a function to create a new bubble
exports.createBubble = function(name, bio, pic, callback) {
	//create a new bubble object
	let bubble = {
		bubbleName: name,
		dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
		bio: bio,
		bubblePicture: pic
	};

	//use the insertData function to insert the user object into the user table
	exports.insertData(bubble, 'bubbles', function(err, results) {
		//if there is an error
		if (err) {
			//send back a false success message
			callback(err);
			//and throw an error so it can be debugged
			throw err;
		};
		callback(null, results); //send the data back
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