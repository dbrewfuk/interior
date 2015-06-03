/*
 * FeedEk jQuery RSS/ATOM Feed Plugin v2.0
 * http://jquery-plugins.net/FeedEk/FeedEk.html  https://github.com/enginkizil/FeedEk
 * Author : Engin KIZIL http://www.enginkizil.com   
 */

(function($) {
    var moment = require('./vendor/moment');
    $.fn.FeedEk = function(opt) {
        var def = $.extend({
            MaxCount: 5,
            ShowDesc: false,
            ShowPubDate: true,
            CharacterLimit: 140,
            TitleLinkTarget: '_blank',
            DateFormat: 'LLL',
            DateFormatLang: 'en'
        }, opt);

        var element = $(this).attr('class'),
            i, s = '',
            dt;

        $.ajax({
            url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=' + def.MaxCount + '&output=json&q=' + encodeURIComponent(def.FeedUrl) + '&hl=en&callback=?',
            dataType: 'json',
            success: function(data) {
                $('.' + element).empty();
                $.each(data.responseData.feed.entries, function(e, item) {
                    s += '<li class="post"><a class="post-link" href="' + item.link + '" target="' + def.TitleLinkTarget + '" ></a><p class="post-content">' + item.title + '</p>';

                    if (def.ShowPubDate) {
                        dt = new Date(item.publishedDate);
                        if ($.trim(def.DateFormat).length > 0) {
                            try {
                                moment.locale(def.DateFormatLang);
                                s += '<div class="time-posted">' + moment(dt).startOf('day').fromNow() + '</div>';
                            } catch (e) {
                                s += '<div class="time-posted">' + dt.toLocaleDateString() + '</div>';
                            }
                        } else {
                            s += '<div class="time-posted">' + dt.toLocaleDateString() + '</div>';
                        }
                    }
                    if (def.ShowDesc) {
                        if (def.DescCharacterLimit > 0 && item.content.length > def.DescCharacterLimit) {
                            s += '<div class="post-content">' + item.content.substr(0, def.DescCharacterLimit) + '...</div>';
                        } else {
                            s += '<div class="post-content">' + item.content + '</div>';
                        }
                    }
                });
                $('.' + element).append('<ul class="post-list">' + s + '</ul>');
            }
        });
    };
})(jQuery);



var $selector = $('.facebook-feed');
if ($selector.length) {
    $('.facebook-feed').FeedEk({
        FeedUrl: 'http://www.facebook.com/feeds/page.php?format=rss20&id=153638914692940',
        MaxCount: 3,
        ShowDesc: false,
        ShowPubDate: true,
        DescCharacterLimit: 140,
        DateFormat: 'LL',
        DateFormatLang: 'en'
    });
}
