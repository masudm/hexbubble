var postsNum = 0;
var commentsSkip = {};
var skip = 0;
var converter = new showdown.Converter();

//socket io real time connections
var socket = io();

//when you get a new post, add the new post
socket.on('newPost', function(post) {
    //add the post
    addPost("/user/" + post.userId, post.username, post.date, post.post, 0, false, true, post.postId)
});

//when you get a new comment
socket.on('newComment', function(comment) {
    //add the comment
    insertComment(comment.postId, comment.comment, comment.username, comment.userId, comment.date, true)
});

//bool has it preloaded the posts
var hasPreloaded = false;

//a function to preload
function runPreload() {
    if (!hasPreloaded) {
        hasPreloaded = true;
        preload();
    }
}

//when a user chooses a picture using the picture element, load it into the browser
document.getElementById('postPicture').onchange = function (e) {
    loadImage(e.target.files[0], function (img) {
            $("#postPicturePreview").html(img);
        }, { // Options
            maxWidth: 150,
            maxHeight: 150
        } 
    );
};

//on document load...
$(document).ready(function() {
    //join socket bubble when the document is ready.
    socket.emit('joinBubble', bubbleId);

    //render and add all the html for the posts from the server
    addAllPosts(posts);

    //all the top posts too
    addAllPosts(topPosts, '#topPosts');
    
    //configure the sidebar
    var sidebarIcon = $("#bubbleIcon_" + bubbleId);
    sidebarIcon.addClass('active');
    $("#meIcon").after(sidebarIcon.clone());
    sidebarIcon.remove();
});

//a preload function
function preload() {
    console.log('preloading....');
    //how many to preload
    skip += 10;

    //post via ajax to the /feed route
    //send all the data: token, how posts to skip (for pagination), and the current bubble
    $.post("/feed",
    {
        token: localStorage.getItem('token'),
        skip: skip,
        bubbleId: bubbleId
    },
    function(data, status){
        //if the ajax is successful
        if (data.success) {
            //and there are actually posts...
            if (data.data.posts != "[]") {
                //add the new posts
                addAllPosts(JSON.parse(data.data.posts));
                //make sure to not keep preloading
                hasPreloaded = false;
            } else {
                //otherwise if it is empty, there are no more posts so block the display more posts button
                document.getElementById("loadmorebutton").style.display = 'none';
            }
        } else {
            //log any errors
            console.log(data.err);
        }
    });
}

//this loops through the posts and adds them to the HTML
function addAllPosts(posts, postContainer) {
    //for each post...
    for (i in posts) {

        //check if it's a favourite
        var fav = false;
        if (posts[i].fav == 1) {
            fav = true;
        }

        //if the user did like it...
        if (posts[i].likeId != null && posts[i].likeId != 0) {
            addPost('/user/' + posts[i].userId, posts[i].username, posts[i].dateCreated, posts[i].post, posts[i].likes, true, false, posts[i].postId, postContainer, fav);
        } else {
            //otherwise
            addPost('/user/' + posts[i].userId, posts[i].username, posts[i].dateCreated, posts[i].post, posts[i].likes, false, false, posts[i].postId, postContainer, fav);
        }
        //increment the post counter - useful for pagination
        postsNum += i;
    }
}

//if the focus is on the comment input and the enter button is pressed, add the comment
$('#posts').on('keyup', '.commenter', function(ev) {
    if (ev.which === 13) {
        var id = (ev.currentTarget.id);
        id = id.substr(id.indexOf("_") + 1);
        addComment(id);
    }
});

//a function for when the user adds a new post
function newPost() {
    //increment the counter
    postsNum += 1;

    //get the post 
    var postText = $("#post").val()
    //escape any special characters
    var p = escape(postText);//.replace(/\s/g, '');

    //check for post length
    if (postText.length > 2500) {
        alert('Too many characters. Max of 2500. You have used ' + postText.length);
        return false;
    }
    
    //get any files user is about to upload
    var files = $('#postPicture')[0].files;
    var file = files[0];

    //if the user is uploading a file...
    if (file) {
        //check the file size in case it is too large
        if (file.size > (1024 * 1024 * 2)) {
            alert("Max total file size of 2mb reached");
            return false;
        }

        //create formdata will all the post data including the image
        var formData = new FormData($("#postForm")[0]);
        formData.append('token', localStorage.getItem('token'));
        formData.append('bubbleId', bubbleId);
        formData.append('post', p);

        //send it via ajax and upload the image too
        $.ajax({
            url: '/post/new/upload',
            type: 'POST',
            data: formData,
            async: true,
            success: function (data) {
                //a function for when the form has submitted and AJAX is successful
                onUpload(data);
            },
            cache: false,
            contentType: false,
            processData: false
        }).uploadProgress(function (e) {
            //the percentage complete
            if (e.lengthComputable) {
                var percentage = Math.round((e.loaded * 100) / e.total);
                $("#postUploading").html("Uploading: " + percentage + "%");
            }
        });
    } else {
        //if there is no post to upload, post to /new 
        //this route does not upload a file
        //send along the same data bar an image
        $.post("/post/new",
        {
            token: localStorage.getItem('token'),
            post: p,
            bubbleId: bubbleId
        },
        function(data){
            //run the same success function when the ajax query is done
            onUpload(data);
        });
    }
}

//when a user has submitted a post and it is successful
function onUpload(data) {
    //reset the input
    $("#post").val("");

    //reset picking an image
    document.getElementById("postPicture").value = "";

    //reset the html for displaying upload progress and image
    $("#postPicturePreview").html("");
    $("#postUploading").html("");

    //if it all went well, emit the new post in real time to all the other users
    if (data.success == true) {
        var fullPost = {
            userId: me.userId,
            username: me.username, 
            time: moment(),
            post: data.post.post,
            likes: 0,
            postId: data.postId
        };

        socket.emit("newPost", [bubbleId, fullPost]);
    } else {
        //otherwise display an error
        alert(data.err);
        console.log(data);
    }
}

//a function for creating and then adding the HTML for a post
//it takes many parameters so every aspect of the post can be controlled
function addPost(userlink, username, date, post, likes, isLiked, isNewPost, id, overridePostContainer, isFav) {
    var postContainer = "#posts"; //default value
    if (overridePostContainer != undefined) { //and the default is overridden if needed
        postContainer = overridePostContainer;
    }

    //handles the heart html
    //changes depdending on whether a user has already liked it or not
    var heart = "";
    var heartAction = "onclick='love(\"" + id + "\")'";
    if (isLiked) {
        heart = "activeHeart";
        heartAction = "onclick='unlove(\"" + id + "\")'";
    }

    //handles the favourite start
    //the animation and function depend on the user
    var favStyle = "";
    var favAction = "onclick='favourite(\"" + id + "\")'";
    if (isFav) {
        favStyle = "activeStar";
        favAction = "onclick='unfavourite(\"" + id + "\")'";
    }

    //if there is an image, render that too
    if (post.indexOf("|img|") > -1) {
        post = (post.split("|img|"));
        var img = '<img class="postPicture" src="/postPictures/'+post[1]+'"/>';
        post = post[0] + "<br>" + img;
    }

    //the html for rendering comments
    commentStructure = "<div class='postCommentsInfo button' onclick='getComments(\"" + id + "\")' id='loader_" + id + "'>Load comments...</div>";

    //add in any special characters that were escaped when saved to the db
    var postData = unescape(post);
    //convert any markdown into html
    postData = converter.makeHtml(postData);

    //this is the basic post structure in html
    //with all the neccessary information appended in
    var postStructure = "<div class='post shadow'><div class='postUser'>    <!-- <img class='postProfilePic'> -->    <div class='postUserName'><a href='" + userlink + "'>" + username + "</a></div>    <div class='postUserDate' title='" + date + "'>" + moment(date).fromNow() + "</div></div><div class='postData'>" + (postData) + "</div><div class='postLikes'>    <div>    <div class='star-five " + favStyle + "' id='fav." + id + "' " + favAction + "></div><div class='heart " + heart + "' id='heart." + id + "' " + heartAction + "></div>    <span class='likeNum'>Likes: <span id='like." + id + "'>" + likes + "</span></span>    </div>    "+ commentStructure +"</div><div class='postComments'>    <ul id='comments_" + id + "'>    </ul>    <div class='commentFlex'><input type='text' placeholder='Comment....' class='commenter' id='commenter_" + id + "'>    <div class='submitComment button' onclick='addComment(\"" + id + "\")'>Submit</div></div></div>    </div>    <br>    <br>";    

    //if it;s a new post (i.e. from the real time)
    if (isNewPost) {
        //add the post to the top rather than the bottom
        $(postContainer).prepend(postStructure);
        post = unescape(post);
        
        //this is a quick easter egg
        //if it contains the string "/tts" at the start, 
        //using the chrome SpeechSynthesis api
        //speak out the post
        if (post.substring(0, 4) == "/tts") {
            post = post.substring(4, post.length);
            var msg = new SpeechSynthesisUtterance(post);
            window.speechSynthesis.speak(msg);
        }
    } else {
        //otherwise if the post is from the database and not realtime, 
        //append it to the bottom
        $(postContainer).append(postStructure);
    }

    //setup the pagination for the comments for that certain post
    commentsSkip[id] = 0;
}

//a function to get all the comments
function getComments(id) {
    skip = 0; //used for pagination

    //if some comments have already been loaded in, skip through them
    if (commentsSkip[id] != undefined) {
        skip = commentsSkip[id];
    }

    //post to the ajax route to get some comments, with that post and skipping that many
    $.post("/post/comments",
        {
            postId: id,
            skip: skip
        },
        function(data, status){
            //add a button to load mroe comments
            $("#loader_" + id).html("Load more comments");

            //go through each comment and insert it
            for (comment in data) {
                insertComment(id, data[comment].comment, data[comment].username, data[comment].userId, data[comment].dateCreated, false);
            }

            //if there are no comments
            if (data.length == 0) {
                //disable loading any more commments
                $("#loader_" + id).css('cursor', 'not-allowed');
                $("#loader_" + id).html("No more comments");
                $("#loader_" + id).prop('onclick', null).off('click');
            }
            
            //remeber to add the amount of comments already loaded
            //add this to the object of comment pagination
            commentsSkip[id] += parseInt(data.length);
        });
}


//add a comment function
function addComment(id) {
    var comment = $("#commenter_" + id).val(); //get the value of the comment input box
    $("#commenter_" + id).val("");//reset the input box
	
    postComment(id, comment); //insert the comment
}

//function to insert a comment
function insertComment(id, comment, user, userId, date, now) {
    //create a basic template which the data will go into
    var commentTemplate = "<li class='comment'>    <span class='commentUser'><a href='/user/"+userId+"'>" + user + "</a></span>    <span class='commentTime' title='" + date + "'>" + moment(date).fromNow() + "</span>    <p>" + unescape(comment) + "</p></li>";;

    //if it was in real time, it's a new comment
    //so add it to the bottom 
    if (now) {
        $("#comments_" + id).append(commentTemplate);
    } else {
        //otherwise, they are loaded in with newest first so add them to the top
        $("#comments_" + id).prepend(commentTemplate);
    }
    
}

//ajax function to post a comment under a post
function postComment(postId, comment) {
    //create an object of the details such as the post and actual comment
    var fullComment = {
        postId: postId,
        comment: escape(comment)
    };
    //ajax to the comment route
    $.post("/post/comment",
        fullComment, //send along the data
        function(data, status){ //
            if (data.success) { //if there is data returned
                fullComment.userId = me.userId; //set some properties client side such as username
                fullComment.username = me.username;
                fullComment.date = new Date();
                socket.emit("newComment", [bubbleId, fullComment]); //emit the comment to all other users
            } else {
                alert(data.err);
            }
        });
}

//a function to love a post
function love(id) {
    var heart = document.getElementById("heart." + id); //target the heart element
    heart.className = "heart activeHeart animateHeart"; //add styles to the heart
    //when the heart is clicked, do this function
    heart.onclick = function() {
        unlove(id);
    }

    //target the element that displays how many loves there are
    //increment the counter too, to display the new amount of loves
    var elem = document.getElementById("like." + id);
    curLikes = parseInt(elem.innerHTML);
    elem.innerHTML = curLikes + 1;

    //post to the like route with the current post
    $.post("/post/like",
        {
            postId: id
        },
        function(data, status){
            if (data.success == false)  { //if there was an error, display the error
                alert("Like failed. " + data.error);
                console.log(data.error);
                elem.innerHTML = curLikes; //reset the counter
            }
        });
}

//a function to unlove a post
//works the same as loving except posts to a different route and the animation
//is backwards
//i.e. it becomes uncoloured when you unlove
//it also runs the opposite funciton when clicked
function unlove(id) {
    var heart = document.getElementById("heart." + id);
    heart.className = "heart animateHeart";
    heart.onclick = function() {
        love(id);
    }
    var elem = document.getElementById("like." + id);
    curLikes = parseInt(elem.innerHTML);
    elem.innerHTML = curLikes - 1;

    $.post("/post/dislike",
        {
            postId: id
        },
        function(data, status){
            if (data.success == false)  {
                alert("Like failed. " + data.error);
                console.log(data.error);
                elem.innerHTML = curLikes;
            }
        });
}

//a function to favourite a post - this adds it to the top posts
function favourite(id) {
    var fav = document.getElementById("fav." + id); //target the fav element
    fav.className = "star-five animateHeart activeStar"; //set the styles via classnames

    //when you click on the fav button, run this function
    fav.onclick = function() {
        unfavourite(id);
    }

    //run the ajax via a function
    favPost(id, "/post/favourite");
}

//exactly the same as favouriting except it does the styles backwards
//posts to unfavourite route and also a different function too
function unfavourite(id) {
    var fav = document.getElementById("fav." + id);
    fav.className = "star-five animateHeart";
    fav.onclick = function() {
        favourite(id);
    }

    favPost(id, "/post/unfavourite");
}

//this is the ajax function used
//in a seperate function since the action done when returned is the same
function favPost(id, link) {
    //post to the link parameter
    $.post(link,
    {
        postId: id, //have a post id of the id parameter
        bubbleId: bubbleId //send along the current bubble too
    },
    function(data, status){
        //if there was an error, log it
        if (data.success == false)  {
            console.log(data.error);
        }
    });
}

//show the top posts
function showTopPosts() {
    //this is a ternary operation 
    //if the display is currently in "block" mode, change it to "none", otherwise change it to "block"
    document.getElementById("topPostsContainer").style.display = document.getElementById("topPostsContainer").style.display == "block" ? "none" : "block";
}

//a function to reset the top posts
function resetTopPosts() {
    //delete all the HTML inside the top posts and set it to nothing 
    document.getElementById("topPosts").innerHTML = "";
}

//a simple wrapper function around my mergesort script 
//this reset the top posts
//sorts the posts by whatever the user determined
//and then re-renders them
function sortTop(sortBy, reverse) {
    resetTopPosts();
    topPosts = sort(topPosts, sortBy);
    if (reverse) {
        topPosts = topPosts.reverse();
    }
    addAllPosts(topPosts, '#topPosts');
}