//all database functions go through here. this contacts the raw database wrapper
//it is also where all the errors are handled

//dependencies
var moment = require('moment'); //get time/format times
var rawdb = require('./rawdb');
var crypto = require('crypto');

//an async function to login
//pass an email, password and a callback function as parameters
exports.login = function(email, password, callback) {
	rawdb.getDataWhere('*', 'users', `email = '${email}' and password = '${password}'`, function(err, results) {
		if (err) {
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
	});
}

//get posts using the bubbleid, how many posts to skip (pagination) and current user
exports.getPosts = function(bubbleId, skip, userId, callback) {
	rawdb.getPosts(bubbleId, skip, userId, function(err, data) {
		if (err) {
			return callback("Server error.");
		}
		return callback(null, data);
	});
}

//insert a new pos
exports.newPost = function(post, callback) {
	rawdb.insertData(post, 'posts', function(err, data) {
		if (err) {
			return callback("Server error.");
		}
		return callback(null, data);
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
	rawdb.insertData(like, 'likes', function(err, results) {
		//if there is an error, return the error
		if (err) {
			//if the error is a duplicate entry, that means the user has
			//already liked the post. return an error that displays 
			//that rather than the long and complicated mysql error.
			if (err.errno == 1062) {
				return callback("Post already liked by this user.");
			}
			return callback("Server error.");
		} 
		return callback(null, results);
	});
}

//add a comment using their userid and current postid
exports.addComment = function(userId, postId, comment, callback) {
	var comment = {
		userId,
		postId,
		comment,
		dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
	}

	rawdb.insertData(comment, 'comments', function(err, data) {
		if (err) {
			return callback("Server error.");
		}
		return callback(null, data);
	});
}

//get x number of comments on the current post(id)
exports.getComments = function(postId, skip, callback) {
	rawdb.getComments(postId, parseInt(skip), function(err, data) {
		if (err) {
			return callback("Server error.");
		}
		return callback(null, data);
	});
}

//verify if they are a member by checking that userid against that bubbleid in the member table
exports.isMember = function(userId, bubbleId, callback) {
	rawdb.getDataWhere('memberId', 'members', ('userId = ' + userId + ' and bubbleId = ' + bubbleId), function(err, data) {
		if (err) {
			return callback("Server error.");
		}
		return callback(null, data);
	});
}

//get bubbleId using the name
exports.getBubble = function(name, callback) {
	rawdb.getDataWhereLimit("bubbleId", "bubbles", "bubbleName = '" + name + "'", 1, function(err, data) {
		if (err) {
			return callback("Server error.");
		}
		return callback(null, data);
	});
}

exports.getBubbles = function(userId, callback) {
	rawdb.getBubbles(userId, function(err, data) {
		if (err) {
			return callback("Server error.");
		}
		return callback(null, data);
	});
}

//get first bubbleid
exports.getFirstBubble = function(userId, callback) {
	rawdb.getDataWhere('bubbleId', 'members', 'userId = ' + userId, function(err, data) {
		if (err) {
			return callback("Server error.");
		}
		return callback(null, data);
	});
}

//a signup function - convert the details into an object and insert
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
	rawdb.insertData(user, 'users', function(err, data) {
		if (err) {
			return callback("Server error.");
		}
		return callback(null, data);
	});
}

//a function to add a new member to the member table
exports.newMember = function(userId, bubbleId, admin, callback) {
	//create a new member object
	member = {
		memberId: parseInt(String(userId) + String(bubbleId)),
		userId,
		bubbleId,
		admin,
		dateCreated: moment(new Date()).format("YYYY-MM-DD HH:mm:ss") //create a MySQL formatted date
	};

	//insert the member object into the member table
	rawdb.insertData(member, 'members', function(err, results) {
		//if there is an error, return the error
		if (err) {
			//if the error is a duplicate entry, that means the user has
			//already liked the post. return an error that displays 
			//that rather than the long and complicated mysql error.
			if (err.errno == 1062) {
				return callback("User already in this bubble.");
			}
			return callback("Server error.");
		} 
		return callback(null, results);
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
	rawdb.insertData(bubble, 'bubbles', function(err, results) {
		if (err) {
			return callback("Server error.");
		}
		return callback(null, data);
	});
}

//get a user using their userid
exports.getUser = function(userId, callback) {
	rawdb.getDataWhere('*', 'users', 'userId = "' + userId + '"', function(err, data) {
		if (err) {
			return callback("Server error.");
		}
		return callback(null, data);
	});
}

exports.searchUsers = function(term, callback) {
	rawdb.searchUsers(term, function(err, data) {
		if (err) {
			return callback("Server error.");
		}
		return callback(null, data);
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

//create a random id
exports.makeid = function() {
	return crypto.randomBytes(20).toString('hex');
}