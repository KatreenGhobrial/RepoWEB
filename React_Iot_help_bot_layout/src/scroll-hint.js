var scrollHint = document.getElementById("scrollHint");

function checkScrollHint() {
    if (scrollHint == null) {
        return;
    }

    var pageHeight = document.body.scrollHeight;
    var screenHeight = window.innerHeight;
    var scrollTop = window.scrollY;

    var pageIsLong = pageHeight > screenHeight + 50;
    var userNearBottom = scrollTop + screenHeight >= pageHeight - 80;

    if (pageIsLong && userNearBottom === false) {
        scrollHint.classList.remove("hidden");
    } else {
        scrollHint.classList.add("hidden");
    }
}

if (scrollHint != null) {
    scrollHint.addEventListener("click", function() {
        window.scrollBy({
            top: 500,
            behavior: "smooth"
        });
    });
}

window.addEventListener("scroll", function() {
    checkScrollHint();
});

window.addEventListener("resize", function() {
    checkScrollHint();
});

window.addEventListener("load", function() {
    checkScrollHint();
});

setTimeout(function() {
    checkScrollHint();
}, 300);

setTimeout(function() {
    checkScrollHint();
}, 1000);