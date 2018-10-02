//ajax request to get the sidebar
$.get("/me/bubbles", function(data, status){
    $('#sidebarLoading').remove(); //remove the loading symbol
    
    data = data.data; //set the data to the data object
    
    //for each bubble in the data object
    for (bubble in data) {
        b = data[bubble]; //get the data for that bubble
        
        manage = !!b.admin; //the !! converts 0 or 1 into its respective bool op.
        
        //append all the bubble templates to it;s respective container
        containerClass = "";
        manageDiv = "";

        if (manage) {
            containerClass = "noHeight";
            manageDiv = "<a href='/manage/" + b.bubbleId + "'><div class='manageBubble'><span class='button'>Manage</span></div></a>";
        }
        
        $('#meIcon').after("<li class='elem bubbleIcon "+containerClass+"' id='bubbleIcon_" + b.bubbleId + "' onclick=\"window.location.href = '/feed/" + b.bubbleId + "'\">\n            <img src='/bubblePictures/" + b.bubblePicture + "'>\n            <div class='bubbleName'>" + b.bubbleName + "</div>"+manageDiv+"\n        </li>");
    }
});