# README #
## What is this project? ##
A social network built for my A Level Computer Science Controlled Assessment. 

## About this project ##
The social network is built on Node and Mongo with a plain HTML/Javascript setup running the front end.
The actual project is a 'private' social network. It is built around 'bubbles' - for example, a school could be a bubble and a group of friends could also be a 'bubble'.
Each bubble is isolated and independent from each of the other bubbles. 
By default, when a user signs up he joins a bubble (during sign up). He can join other bubbles later on. 
The person to create the bubble is also the admin - they control what goes on in the bubble: users, posts etc. 

## Database ##
The project utilises Mongo as a backend and uses Mongoose as a wrapper for the Mongo API.

### Schema ###
* Users: userId, name, email, bubbles [], dateCreated, picture, bio
* Bubbles: bubbleId, admins [], dateCreated, members[], name, picture, bio
* Posts: postId, bubbleId, userId, post, dateCreated, likes, comments
* Likes: likeId, postId, userId, dateCreated
* Comments: commentId, postId, userId, dateCreated, comment