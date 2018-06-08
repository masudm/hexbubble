$.get("/me/bubbles", function(data, status){
    $('#sidebarLoading').remove()
    data = data.data;
    for (bubble in data) {
        b = data[bubble];

        manage = true;
        containerClass = "";
        manageDiv = "";

        if (manage) {
            containerClass = "noHeight";
            manageDiv = "<div class='manageBubble'><span class='button'>Manage</span></div>";
        }
        
        $('#meIcon').after("<li class='elem bubbleIcon "+containerClass+"' id='bubbleIcon_" + b.bubbleId + "' onclick=\"window.location.href = '/feed/" + b.bubbleId + "'\">\n            <img src='/bubblePictures/" + b.bubblePicture + "'>\n            <div class='bubbleName'>" + b.bubbleName + "</div>"+manageDiv+"\n        </li>");
    }
});