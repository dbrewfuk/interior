$(document).on({
    mouseenter: function() {
        $(this).find('.js-is-hidden').addClass('is-visible');
    },
    mouseleave: function() {
        $(this).find('.js-is-hidden').removeClass('is-visible');
    }
}, '.js-toggle-visible');

