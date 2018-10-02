//all direct database functions go through here. this makes it easier to make mass changes to the database
//such as the connection info or parametising the sql queries to prevent SQL injections

//dependencies
var mysql = require('mysql'); //mysql wrapper for the mysql api

//create a new pool of mysql connection. better for performance - especially Node which is highly async
var pool = mysql.createPool({
    connectionLimit: 10,
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'hexbubble'
});

//escape any weird looking characters
exports.parse = function(string) {
	return pool.escape(string);
}

//create a (public) function to export to other files that include this file
//this is an async function so a 'callback' parameter needs to be passed
//when the function is done, it calls the callback method with either the errors or the results
exports.getData = function(columns, table, callback) {
	let sql = `SELECT ${columns} FROM ${table}`;
    query(sql, callback);
}

//async function to get data where a specific query is met
exports.getDataWhere = function(columns, table, where, callback) {
	let sql = `SELECT ${columns} FROM ${table} WHERE ${where}`;
    query(sql, callback);
}

//async function to get data where a specific query is met and with a limit
exports.getDataWhereLimit = function(columns, table, where, limit, callback) {
	let sql = `SELECT ${columns} FROM ${table} WHERE ${where} LIMIT ${limit}`;
    query(sql, callback);
}

//delete any rows from the table that match the criteria
exports.deleteRow = function(table, where, callback) {
	let sql = `DELETE FROM ${table} WHERE ${where}`;
	query(sql, callback);
}

//async function to update row
exports.updateRow = function(table, update, where, callback) {
	let sql = `UPDATE ${table} SET ${update} WHERE ${where}`;
	query(sql, callback);
}

//insert data using a data object into a table
exports.insertData = function(data, table, callback) {
	//get a new connection from the pool
	pool.getConnection(function(err, connection) {
		//if there is an error
		if (err) {
        	return callback(err);
        }
	    // Use the connection
	    //insert into a table and use the SET MySQL command to easily insert an object of data
	    //rather than the typical columns...values... SQL command
	    //this also allows the data to be parsed to prevent SQL injections
	    connection.query('INSERT INTO '+ table +' SET ?', data, function(err, results, fields) {
	        //finished with the connection - send it back to the pool
	        connection.release();
	        //if there is an error
			if (err) {
				return callback(err);
			}

	        //return the results of the command
	        return callback(null, results)
	        //Don't use the connection here, it has been returned to the pool.
	    });
	});
}

//search through that database by using a where like sql command
exports.searchUsers = function(term, callback) {
	let sql = `SELECT userId, name
	FROM users
	WHERE
	(
		name LIKE '%${term}%'
	)
	LIMIT 5`;
	query(sql, callback);
}

//get bubbles by selecting any bubbles where a user is a member, and order by the data it was created
exports.getBubbles = function(userId, callback) {
	let sql = `SELECT b.bubbleId, b.bubblePicture, b.bubbleName, m.admin
	FROM members AS m
	INNER JOIN bubbles AS b ON m.bubbleId = b.bubbleId
	WHERE m.userId = ${userId}
	ORDER BY m.dateCreated DESC`;
	query(sql, callback);
}

//get a certain number of posts that are favourited (have the fav tag as 1)
exports.getTopPosts = function(bubbleId, userId, callback) {
	let limitPosts = 10;
	//get a new connection from the pool
	pool.getConnection(function(err, connection) {
		//if there is an error
		if (err) {
        	return callback(err);
        }
		// Use the connection
		//the sql gets the postid, the post, date created, bubble name it belongs too, username that made the post, userid that made the post, likes, if the user liked it and the favourite column
		//it gets posts where the post is part of a certain bubble and also where the user is a member
		//to check if a user has liked the post, it will join the like column to veerify if there is a row that matches the user and that post
		//finally it groups all this data into rows based on the post id so it is unique
	    var sql = `
	    SELECT p.postId, p.post, p.dateCreated, b.bubbleName, u.name AS username, u.userId, p.favourite AS fav,
	    COUNT(l.likeId) as likes, COUNT(lu.likeId) as likeId
	    FROM posts AS p
		INNER JOIN bubbles AS b ON p.bubbleId = b.bubbleId
		INNER JOIN users AS u ON p.userId = u.userId 
		LEFT JOIN likes AS l ON p.postId = l.postId
		LEFT JOIN likes AS lu ON p.postId = lu.postId AND lu.userId = ${userId}
		WHERE p.bubbleId = ${bubbleId} AND p.favourite = 1
		GROUP BY p.postId
		ORDER BY p.dateCreated DESC
		LIMIT ${limitPosts}`;
	    connection.query(sql, function(err, results, fields) {
	        //finished with the connection - send it back to the pool
	        connection.release();
	        //if there is an error
			if (err) {
				//return the error
				return callback(err);
			}

	        return callback(null, results)
	        //Don't use the connection here, it has been returned to the pool.
	    });
	});
}
//get a page of posts for a certain bubble
exports.getPosts = function(bubbleId, skip, userId, callback) {
	let limitPosts = 10; //this is the amount of posts per page
	//get a new connection from the pool
	pool.getConnection(function(err, connection) {
		//if there is an error
		if (err) {
        	return callback(err);
        }
		// Use the connection
		//sql gets posts where the post belongs in a bubble
		//it also gets whether a user has liked a post, the amount of likes
		//this is very similar to the sql above for getting top posts
	    var sql = `
	    SELECT p.postId, p.post, p.dateCreated, b.bubbleName, u.name AS username, u.userId, p.favourite AS fav,
	    COUNT(l.likeId) as likes, COUNT(lu.likeId) as likeId
	    FROM posts AS p
		INNER JOIN bubbles AS b ON p.bubbleId = b.bubbleId
		INNER JOIN users AS u ON p.userId = u.userId 
		LEFT JOIN likes AS l ON p.postId = l.postId
		LEFT JOIN likes AS lu ON p.postId = lu.postId AND lu.userId = ${userId}
		WHERE p.bubbleId = ${bubbleId}
		GROUP BY p.postId
		ORDER BY p.dateCreated DESC
		LIMIT ${skip}, ${limitPosts}`;
	    connection.query(sql, function(err, results, fields) {
	        //finished with the connection - send it back to the pool
	        connection.release();
	        //if there is an error
			if (err) {
				return callback(err);
			}

	        return callback(null, results)
	        //Don't use the connection here, it has been returned to the pool.
	    });
	});
}

//a function to get comments
exports.getComments = function(postId, skip, callback) {
    //get a new connection from the pool
    pool.getConnection(function(err, connection) {
        //if there is an error
		if (err) {
        	return callback(err);
        }
		// Use the connection
		//get comments where the comment has the same post id as a post, also join
		//users so I can display username
        connection.query(`
            SELECT c.comment as comment, c.dateCreated as dateCreated, u.name as username, u.userId as userId
            FROM comments as c
            INNER JOIN users AS u ON c.userId = u.userId
            WHERE postId = "${postId}" 
            ORDER BY dateCreated DESC 
            LIMIT ${skip}, ${skip+10}`, 
        function(err, results, fields) {
            //finished with the connection - send it back to the pool
            connection.release();
            //if there is an error
			if (err) {
				return callback(err);
			}

            return callback(null, results)
            //Don't use the connection here, it has been returned to the pool.
        });
    });
}

//a basic query function that reduces code reuse 
//as most sql commands go through this
//and they need a connection from the pool as well as the connection
//to be returned
function query(sql, callback) {
    //get a new connection from the pool
	pool.getConnection(function(err, connection) {
		//if there is an error
		if (err) {
        	return callback(err);
        }
	    // Use the connection
	    connection.query(sql, function(err, results, fields) {
	        //finished with the connection - send it back to the pool
	        connection.release();
	        //if there is an error
			if (err) {
				return callback(err);
			}

	        return callback(null, results)
	        //Don't use the connection here, it has been returned to the pool.
	    });
	});
}