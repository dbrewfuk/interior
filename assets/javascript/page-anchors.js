if ($('.js-scrolltop-fixable').length > 0) {
    var bottom = $('.js-scrolltop-fixable').offset().top;
    $(window).scroll(function() {
    	
            if ($(this).scrollTop() > bottom) {
                $('.js-scrolltop-fixable').addClass('is-fixed');
            } else {
            	$('.js-scrolltop-fixable').removeClass('is-fixed');
            }
    })
}
