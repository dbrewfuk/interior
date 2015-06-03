if ($('.js-quote-slider').length > 0) {
var slider = '.js-quote-slider';
var slides = $('.js-quote-slides');
var slide = $('.js-quote-slide');
var activeClass = 'is-active';
var activeSlide = '.is-active';
var arrowNext = '.js-arrow-next';
var arrowPrev = '.js-arrow-prev';

$(document).on('click', arrowNext, function() {
    var parent = $(this).closest(slider);
    var active = parent.find(activeSlide);
    if ($(active).is(':last-child')) {
        active.removeClass(activeClass);
        $(parent).find(slide).first().addClass(activeClass);
    } else {
        $(active).removeClass(activeClass).next().addClass(activeClass);
    }
});
$(document).on('click', arrowPrev, function() {
    var parent = $(this).closest(slider);
    var active = parent.find(activeSlide);
    if ($(active).is(':first-child')) {
        active.removeClass(activeClass);
        $(parent).find(slide).last().addClass(activeClass);
    } else {
        $(active).removeClass(activeClass).prev().addClass(activeClass);
    }
});
}