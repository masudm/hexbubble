var searchTimeout; //set a global variable to hold the timeout

//when anything changes in the search input...
$("#search").on('change keyup paste', function() {
    var term = $('#search').val(); //get the search term

    //if the term is more than two characters, display the search results
    if (term.length > 2) {
        $("#searchResults").html("Loading..."); //add a loading indicator to show that something is happening

        window.clearTimeout(searchTimeout); //clear the searchTimeout var of anything
        
        //set it to a new timeout that searches after one second
        //this prevents display glitches
        searchTimeout = window.setTimeout(function() {
            search(term);
        }, 1 * 1000);
    }
});

//when someone is not focusing on the search anymore,
//set a timeout to reset the search after 100ms - this gives the user time to refocus
$('#search').focusout(function() {
    window.setTimeout(function() {
        $("#searchResults").html("");
    }, 300);
});

//a function to search using a term
function search(term) {
    //post to the search route
    $.post('/search/users', {
        term: term //send along the term to find
    }, function(data, status) {
        result = ""; //the data that will be rendered

        //for each bit of data returned, add it to the results
        for (i in data) {
            result += "<a href='/user/" + data[i].userId + "'><li class='button'>" + data[i].name + "</li></a>";
        }

        //add it to the html
        $("#searchResults").html(result);

        //if there is no data, tell the user
        if (data.length == 0) {
            $("#searchResults").html("No results.");
        }
    });
}