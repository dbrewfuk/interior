$(document).ready(function() {
            $('.tabs a').click(function(event) {
                event.preventDefault();
                $('.js-tabbed-lists ul').hide();
                $($(this).attr('href')).show();
                $(this).parent('li').addClass('is-selected').siblings().removeClass('is-selected');
            });
        });

$(document).on('touchstart click', '.js-quick-links-toggle', function(event) {
            event.stopPropagation();
            $('.quick-links').toggleClass('is-showing');
            $('.full-page-mask').toggleClass('is-showing');
        });

    $(document).on('click', '.js-mobile-quick-links-toggle', function(event) {
            event.stopPropagation();
            $('.quick-links').toggleClass('is-showing');
            $('.full-page-mask').toggleClass('is-showing');
        });