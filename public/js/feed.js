var postsNum = 0;
var commentsSkip = {};
var skip = 0;

//socket io real time connections
var socket = io();

//when you get a new post, add the new post
socket.on('newPost', function(post) {
    //add the post
    addPost("/user/" + post.userId, post.username, post.date, post.post, 0, false, true, post.postId, 0)
});

//preload
var hasPreloaded = false;
$(window).scroll(function() {
    if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
        if (!hasPreloaded) {
            hasPreloaded = true;
            preload();
        }
    }
 });

document.getElementById('postPicture').onchange = function (e) {
    loadImage(e.target.files[0], function (img) {
            $("#postPicturePreview").html(img);
        }, { // Options
            maxWidth: 150,
            maxHeight: 150
        } 
    );
};

$(document).ready(function() {
    //join socket bubble when the document is ready.
    socket.emit('joinBubble', bubbleId);
    addAllPosts(posts);
    
    var sidebarIcon = $("#bubbleIcon_" + bubbleId);
    sidebarIcon.addClass('active');
    $("#meIcon").after(sidebarIcon.clone());
    sidebarIcon.remove();
});

function preload() {
    console.log('preloading....');
    skip += 10;
    $.post("/feed",
    {
        token: localStorage.getItem('token'),
        skip: skip,
        bubbleId: bubbleId
    },
    function(data, status){
        if (data.success) {
            if (data.data.posts != "[]") {
                addAllPosts(JSON.parse(data.data.posts));
                hasPreloaded = false;
            }
        } else {
            console.log(data.err);
        }
    });
}

function addAllPosts(posts) {
    for (i in posts) {
        if (posts[i].likeId != null && posts[i].likeId != 0) {
            addPost('/user/' + posts[i].userId, posts[i].username, posts[i].dateCreated, posts[i].post, posts[i].likes, true, false, posts[i].postId);
        } else {
            addPost('/user/' + posts[i].userId, posts[i].username, posts[i].dateCreated, posts[i].post, posts[i].likes, false, false, posts[i].postId);
        }
        postsNum += i;
    }
}

/*$("#post").keyup(function(ev) {
    if (ev.which === 13) {
        newPost();
    }
});*/

$('#posts').on('keyup', '.commenter', function(ev) {
    if (ev.which === 13) {
        var id = (ev.currentTarget.id);
        id = id.substr(id.indexOf("_") + 1);
        addComment(id);
    }
});

function newPost() {
    postsNum += 1;
    var p = escape($("#post").val());//.replace(/\s/g, '');
    $("#post").val("");
    
    var files = $('#postPicture')[0].files;
    var file = files[0];
    document.getElementById("postPicture").value = "";
    $("#postPicturePreview").html("");

    if (file) {
        if (file.size > (1024 * 1024 * 2)) {
            alert("Max total file size of 2mb reached");
            return false;
        }

        var formData = new FormData($("#postForm")[0]);
        formData.append('token', localStorage.getItem('token'));
        formData.append('bubbleId', bubbleId);
        formData.append('post', p);

        $.ajax({
            url: '/post/new/upload',
            type: 'POST',
            data: formData,
            async: true,
            success: function (data) {
                onUpload(data);
            },
            cache: false,
            contentType: false,
            processData: false
        }).uploadProgress(function (e) {
            if (e.lengthComputable) {
                var percentage = Math.round((e.loaded * 100) / e.total);
                console.log(percentage);
            }
        });
    } else {
        $.post("/post/new",
        {
            token: localStorage.getItem('token'),
            post: p,
            bubbleId: bubbleId
        },
        function(data){
            onUpload(data);
        });
    }
}

function onUpload(data) {
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
        alert("Error posting.");
        console.log(data);
    }
}

function addPost(userlink, username, date, post, likes, isLiked, isNewPost, id, comments) {
    var heart = "";
    var heartAction = "onclick='love(\"" + id + "\")'";
    if (isLiked) {
        heart = "activeHeart";
        heartAction = "onclick='unlove(\"" + id + "\")'";
    }

    if (post.indexOf("|img|") > -1) {
        post = (post.split("|img|"));
        var img = '<img class="postPicture" src="/postPictures/'+post[1]+'"/>';
        post = post[0] + "<br>" + img;
    }

    var postStructure = "<div class='post shadow'><div class='postUser'>    <!-- <img class='postProfilePic'> -->    <div class='postUserName'><a href='" + userlink + "'>" + username + "</a></div>    <div class='postUserDate' title='" + date + "'>" + moment(date).fromNow() + "</div></div><div class='postData'>" + unescape(post) + "</div><div class='postLikes'>    <div>    <div class='heart " + heart + "' id='heart." + id + "' " + heartAction + "></div>    <span class='likeNum'>Likes: <span id='like." + id + "'>" + likes + "</span></span>    </div>    <div class='postCommentsInfo button' onclick='getComments(\"" + id + "\")' id='loader_" + id + "'>Load more comments...</div></div><div class='postComments'>    <ul id='comments_" + id + "'>    </ul>    <input type='text' placeholder='Comment....' class='commenter' id='commenter_" + id + "'>    <div class='submitComment button' onclick='addComment(\"" + id + "\")'>Submit</div></div>    </div>    <br>    <br>";    
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
    var comment = $("#commenter_" + id).val();
    $("#commenter_" + id).val("");

    insertComment(id, comment, me.username, new Date(), true);	
    postComment(id, comment);			
}

function insertComment(id, comment, user, date, now) {
    var commentTemplate = "<li class='comment'>    <span class='commentUser'><a href='#'>" + user + "</a></span>    <span class='commentTime' title='" + date + "'>" + moment(date).fromNow() + "</span>    <p>" + unescape(comment) + "</p></li>";;

    if (now) {
        $("#comments_" + id).append(commentTemplate);
    } else {
        $("#comments_" + id).prepend(commentTemplate);
    }
    
}

function postComment(postId, comment) {
    $.post("/post/comment",
        {
            postId: postId,
            comment: escape(comment)
        },
        function(data, status){
            console.log(data);
        });
}

function love(id) {
    var heart = document.getElementById("heart." + id);
    heart.className = "heart activeHeart animateHeart";
    heart.onclick = function() {
        unlove(id);
    }
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