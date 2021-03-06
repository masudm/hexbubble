//a simple function to get the current parameter in the URLs
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

//load in the particles
//only if a query in the url "parameter" is not false
var head = document.getElementsByTagName('head')[0];
var js = document.createElement("script");
var js2 = document.createElement("script");
if (getUrlParameter('particles') != "false") {
    js.src = "/js/particles.js";
    js2.src = "/js/particleslib.js";
    head.appendChild(js);
    //head.appendChild(js2);
}