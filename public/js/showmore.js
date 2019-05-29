$(document).ready(function () {

    let list = $(".list .card");
    let numToShow = 4;
    let button = $("#next");
    let numInList = list.length;
    list.hide();
    if (numInList > numToShow) {
        button.show();
    }
    list.slice(0, numToShow).show();

    button.click(function () {
        let showing = list.filter(':visible').length;
        list.slice(showing - 1, showing + numToShow).fadeIn();
        let nowShowing = list.filter(':visible').length;
        if (nowShowing >= numInList) {
            button.hide();
        }
    });

});