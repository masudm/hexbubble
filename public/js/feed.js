var postsNum = 0;
var commentsSkip = {};

//socket io real time connections
var socket = io();

//when you get a new post, add the new post
socket.on('newPost', function(post) {
    //check if the post is by yourself (ie if the ids match)
    var isMe = false;
    if (post.userId == me.userId) {
        isMe = true;
    }

    //add the post
    addPost("/user/" + post.userId, post.username, post.date, post.post, 1, isMe, true, post.postId, 0)
});

$(document).ready(function() {
    //join socket bubble when the document is ready.
    socket.emit('joinBubble', bubbleId);

    
    for (i in posts) {
        if (posts[i].likeId != null && posts[i].likeId != 0) {
            addPost('/user/' + posts[i].userId, posts[i].username, posts[i].dateCreated, posts[i].post, posts[i].likes, true, false, posts[i].postId);
        } else {
            addPost('/user/' + posts[i].userId, posts[i].username, posts[i].dateCreated, posts[i].post, posts[i].likes, false, false, posts[i].postId);
        }
        postsNum = i;
    }
    
    var sidebarIcon = $("#bubbleIcon_" + bubbleId);
    sidebarIcon.addClass('active');
    $("#meIcon").after(sidebarIcon.clone());
    sidebarIcon.remove();
});

/*$("#post").keyup(function(ev) {
    if (ev.which === 13) {
        newPost();
    }
});*/

$('#posts').on('keyup', '.commenter', function(ev) {
    if (ev.which === 13) {
        let id = (ev.currentTarget.id);
        id = id.substr(id.indexOf("_") + 1);
        addComment(id);
    }
});

function newPost() {
    postsNum += 1;
    var p = escape($("#post").val());//.replace(/\s/g, '');
    $("#post").val("");
    $.post("/post/new",
        {
            token: localStorage.getItem('token'),
            post: p,
            bubbleId: bubbleId
        },
        function(data, status){
            if (data.success == true) {
                var fullPost = {
                    userId: me.userId,
                    username: me.username, 
                    time: moment(),
                    post: p,
                    likes: 1,
                    postId: data.postId
                };

                socket.emit("newPost", [bubbleId, fullPost]);
            } else {
                alert("Error posting.");
            }
            
        });
}

function addPost(userlink, username, date, post, likes, isLiked, isNewPost, id, comments) {
    var heart = "";
    var heartAction = `onclick='love("${id}")'`;
    if (isLiked) {
        heart = "activeHeart";
        heartAction = "";
    }
    var postStructure = `
    <div class='post shadow'>
        <div class='postUser'>
            <!-- <img class='postProfilePic'> -->
            <div class='postUserName'><a href='${userlink}'>${username}</a></div>
            <div class='postUserDate' title='${date}'>${moment(date).fromNow()}</div>
        </div>
        <div class='postData'>${unescape(post)}</div>
        <div class='postLikes'>
            <div>
            <div class='heart ${heart}' id='heart.${id}' ${heartAction}></div>
            <span class='likeNum'>Likes: <span id='like.${id}'>${likes}</span></span>
            </div>
            <div class='postCommentsInfo button' onclick='getComments("${id}")' id='loader_${id}'>Load more comments...</div>
        </div>
        
        <div class='postComments'>
            <ul id='comments_${id}'>
            </ul>
            <input type='text' placeholder='Comment....' class='commenter' id='commenter_${id}'>
            <div class='submitComment button' onclick='addComment("${id}")'>Submit</div>
        </div>
    </div>
    <br>
    <br>`;

    if (isNewPost) {
        $("#posts").prepend(postStructure);
        post = unescape(post);
        
        if (post.substring(0, 4) == "/tts") {
            post = post.substring(4, post.length);
            var msg = new SpeechSynthesisUtterance(post);
            window.speechSynthesis.speak(msg);
        }
    } else {
        $("#posts").append(postStructure);
    }

    commentsSkip[id] = 0;
}

function getComments(id) {
    skip = 0;
    if (commentsSkip[id] != undefined) {
        skip = commentsSkip[id];
    }
    $.post("/post/comments",
        {
            postId: id,
            skip: skip
        },
        function(data, status){
            for (comment in data) {
                insertComment(id, data[comment].comment, data[comment].username, data[comment].dateCreated, false);
            }


            if (data.length == 0) {
                $("#loader_" + id).css('cursor', 'not-allowed');
                $("#loader_" + id).html("No more comments.");
                $("#loader_" + id).prop('onclick', null).off('click');
            }
            
            commentsSkip[id] += parseInt(data.length);
        });
}

function addComment(id) {
    let comment = $("#commenter_" + id).val();
    $("#commenter_" + id).val("");

    insertComment(id, comment, me.username, Date(), true);	
    postComment(id, comment);			
}

function insertComment(id, comment, user, date, now) {
    let commentTemplate = `
    <li class='comment'>
        <span class='commentUser'><a href='#'>${user}</a></span>
        <span class='commentTime' title='${date}'>${moment(date).fromNow()}</span>
        <p>${unescape(comment)}</p>
    </li>`;

    if (now) {
        $("#comments_" + id).append(commentTemplate);
    } else {
        $("#comments_" + id).prepend(commentTemplate);
    }
    
}

function postComment(postId, comment) {
    $.post("/post/comment",
        {
            postId,
            comment: escape(comment)
        },
        function(data, status){
            console.log(data);
        });
}

function love(id) {
    var heart = document.getElementById("heart." + id);
    heart.className = "heart activeHeart animateHeart";
    var elem = document.getElementById("like." + id);
    curLikes = parseInt(elem.innerHTML);
    elem.innerHTML = curLikes + 1;

    $.post("/post/like",
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