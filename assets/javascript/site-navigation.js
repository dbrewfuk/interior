$(function() {
    $('.site-navigation a').each(function() {
        var path = '{{ site.baseUrl }}' + window.location.pathname;
        if ($(this).attr('href') == window.location.pathname) {
            $(this).addClass('is-current');
        }
    });
});

$(document).on('click', '.js-site-navigation-toggle', function() {
    $('.site-navigation').toggleClass('is-visible');
    $(this).toggleClass('is-toggled');
});
