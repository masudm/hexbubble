var searchTimeout;

$("#search").on('change keyup paste', function() {
    let term = $('#search').val();
    if (term.length > 2) {
        $("#searchResults").html("Loading...");
        window.clearTimeout(searchTimeout);
        searchTimeout = window.setTimeout(function() {
            search(term);
        }, 1 * 1000);
    }
});

$('#search').focusout(function() {
    window.setTimeout(function() {
        $("#searchResults").html("");
    }, 100);
});

function search(term) {
    $.post('/search/users', {
        term: term
    }, function(data, status) {
        result = "";
        for (i in data) {
            result += `<a href='/user/${data[i].userId}'><li class='button'>${data[i].name}</li></a>`;
        }
        $("#searchResults").html(result);
        if (data.length == 0) {
            $("#searchResults").html("No results.");
        }
    });
}