$('.js-expand-trigger').bind('click', function() {

    
    $.when(toggle(this)).done(checkActive(this));
 

    function checkActive(elem) {
        if (($(elem).parent().hasClass('is-active')) && ($(elem).parent().find('.is-expanded').length === 0)) {
            $(elem).parent().removeClass('is-active');
        } else {
            $(elem).parent().addClass('is-active');
        }
    }

    function toggle(elem) {

        $(elem).toggleClass('is-expanded');
        $(elem).next('.js-expandable').toggleClass('is-expanded');





    }

});
