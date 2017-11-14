$.get("/me/bubbles", function(data, status){
    $('#sidebarLoading').remove()
    data = data.data;
    for (bubble in data) {
        b = data[bubble];
        $('#meIcon').after(`
        <li class='elem bubbleIcon' id='bubbleIcon_${b.bubbleId}' onclick="window.location.href = '/feed/${b.bubbleId}'">
            <img src='/bubblePictures/${b.bubblePicture}'>
            <div class='bubbleName'>${b.bubbleName}</div>
        </li>`);
    }
});