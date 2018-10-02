//export the http function so it can imported elsewhere
module.exports = function(http) {
	//use the passed in http module to start the io server
	io = require('socket.io')(http);
	//join the socket
	io.on('connection', function(socket){
		//when user disconnects
		socket.on('disconnect', function(){
			//console.log('user disconnected');
		});
		
		//join a bubble method
		socket.on('joinBubble', function(bid){
			//run the method to join a socket
			socket.join(bid);
		});

		//when you get a new post, emit it to everyone in the room
		socket.on('newPost', function(data) {
			//emit to the bubble id (first in array). send the post (second in array)
			io.to(data[0]).emit('newPost', data[1]);
        });
        
        //when you get a new comment, emit it to everyone in the room
		socket.on('newComment', function(data) {
			//emit to the bubble id (first in array). send the comment (second in array)
			io.to(data[0]).emit('newComment', data[1]);
		});
	});
};