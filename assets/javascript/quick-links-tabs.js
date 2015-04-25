$(document).ready(function() {
            $('.tabs a').click(function(event) {
                event.preventDefault();
                $('.list-group ul').hide();
                $($(this).attr('href')).show();
                $(this).parent('li').addClass('is-selected').siblings().removeClass('is-selected');
            });
        });