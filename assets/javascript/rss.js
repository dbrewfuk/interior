(function($) {

    $.fn.rssfeed = function(url, options, fn) {

        // Set plugin defaults
        var defaults = {
            limit: 10,
            offset: 1,
            header: true,
            titletag: 'h3 class="article__headline"',
            date: true,
            dateformat: 'MMMM dd',
            content: true,
            snippet: true,
            showerror: true,
            errormsg: '',
            key: null,
            ssl: false,
            linktarget: '_self',
            linkredirect: '',
            linkcontent: false,
            sort: '',
            sortasc: true,
            historical: false,
            images: true
        };
        var options = $.extend(defaults, options);

        // Functions
        return this.each(function(i, e) {
            var $e = $(e);
            var s = '';

            // Check for SSL protocol
            if (options.ssl) s = 's';

            // Add feed class to user div
            if (!$e.hasClass('rssFeed')) $e.addClass('rssFeed');

            // Check for valid url
            if (url == null) return false;

            // Add start offset to feed length
            if (options.offset > 0) options.offset -= 1;
            options.limit += options.offset;

            // Create Google Feed API address
            var api = "http" + s + "://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=" + encodeURIComponent(url);
            api += "&num=" + options.limit;
            if (options.historical) api += "&scoring=h";
            if (options.key != null) api += "&key=" + options.key;
            api += "&output=json_xml"

            // Send request
            $.getJSON(api, function(data) {

                // Check for error
                if (data.responseStatus == 200) {

                    // Process the feeds
                    _process(e, data.responseData, options);

                    // Optional user callback function
                    if ($.isFunction(fn)) fn.call(this, $e);

                } else {

                    // Handle error if required
                    if (options.showerror)
                        if (options.errormsg != '') {
                            var msg = options.errormsg;
                        } else {
                            var msg = data.responseDetails;
                        };
                    $(e).html('<div class="rssError"><p>' + msg + '</p></div>');
                };
            });
        });
    };

    // Function to create HTML result
    var _process = function(e, data, options) {

        // Get JSON feed data
        var feeds = data.feed;
        if (!feeds) {
            return false;
        }
        var rowArray = [];
        var rowIndex = 0;
        var html = '';
        var row = 'odd';

        // Get XML data for media (parseXML not used as requires 1.5+)
        if (options.images) {
            var xml = _getXMLDocument(data.xmlString);
            var xmlEntries = xml.getElementsByTagName('entry');
        }

        // Add header if required
        if (options.header)
            html += '<div class="feed__header rssHeader"><h2 class="feed__title">Latest News</h2>' +
            '<a class="header__feed-link href="' + feeds.link + '" title="' + feeds.description + '">Read more news at ' + feeds.title + '</a>' +
            '</div>';

        // Add body
        html += '<div class="rssBody">' +
            '<ul>';


        // Add feeds
        for (var i = options.offset; i < feeds.entries.length; i++) {

            rowIndex = i - options.offset;
            rowArray[rowIndex] = [];

            // Get individual feed
            var entry = feeds.entries[i];
            var pubDate;
            var sort = '';
            var feedLink = entry.link;

            // Apply sort column
            switch (options.sort) {
                case 'title':
                    sort = entry.title;
                    break;
                case 'date':
                    sort = entry.publishedDate;
                    break;
            }
            rowArray[rowIndex]['sort'] = sort;

            // Format published date
            if (entry.publishedDate) {

                var entryDate = new Date(entry.publishedDate);
                var pubDate = entryDate.toLocaleDateString() + ' ' + entryDate.toLocaleTimeString();

                switch (options.dateformat) {
                    case 'datetime':
                        break;
                    case 'date':
                        pubDate = entryDate.toLocaleDateString();
                        break;
                    case 'time':
                        pubDate = entryDate.toLocaleTimeString();
                        break;
                    case 'timeline':
                        pubDate = _getLapsedTime(entryDate);
                        break;
                    default:
                        pubDate = _formatDate(entryDate, options.dateformat);
                        break;
                }
            }

            // Add feed row
            if (options.linkredirect) feedLink = encodeURIComponent(feedLink);

            //Start with date
            if (options.date && pubDate) rowArray[rowIndex]['html'] = '<a class="article__link-mask" href="' + options.linkredirect + feedLink + '"></a><div class="article__meta-content">' + pubDate + '</div>'
            	   // Add any media
            if (options.images && xmlEntries.length > 0) {

                var xmlContent = entry.content;
                var xmlMedia = $(xmlContent).find('img').eq(0);

                if (xmlMedia.length > 0) {



                    for (var m = 0; m < xmlMedia.length; m++) {
      
                    	

                        var xmlUrl = xmlMedia[m].getAttribute("src");
                        var xmlType = xmlMedia[m].getAttribute("type");
                        var xmlSize = xmlMedia[m].getAttribute("length");
                        rowArray[rowIndex]['html'] += '<div class="article__image-wrapper"><div class="article__image-inner"><div class="article__image" style="background-image:url(\'' + xmlUrl + '\');"></div></div></div>';
                    }

                }
            }
            rowArray[rowIndex]['html'] += '<' + options.titletag + '><a href="' + options.linkredirect + feedLink + '" title="View this feed at ' + feeds.title + '">' + entry.title + '</a></' + options.titletag + '>'

            
            if (options.content) {

                // Use feed snippet if available and optioned
                if (options.snippet && entry.contentSnippet != '') {
                    var content = entry.contentSnippet;

                } else {
                    var content = entry.content;
                }

                if (options.linkcontent) {
                    content = '<a href="' + options.linkredirect + feedLink + '" title="View this feed at ' + feeds.title + '">' + content + '</a>'
                }

             

                rowArray[rowIndex]['html'] += '<p>' + content + '</p>'
            }

            



        }

        // Sort if required
        if (options.sort) {
            rowArray.sort(function(a, b) {

                // Apply sort direction
                if (options.sortasc) {
                    var c = a['sort'];
                    var d = b['sort'];
                } else {
                    var c = b['sort'];
                    var d = a['sort'];
                }

                if (options.sort == 'date') {
                    return new Date(c) - new Date(d);
                } else {
                    c = c.toLowerCase();
                    d = d.toLowerCase();
                    return (c < d) ? -1 : (c > d) ? 1 : 0;
                }
            });
        }

        // Add rows to output
        $.each(rowArray, function(e) {

            html += '<li class="article--snippet rssRow ' + row + '">' + rowArray[e]['html'] + '</li>';

            // Alternate row classes
            if (row == 'odd') {
                row = 'even';
            } else {
                row = 'odd';
            }
        });

        html += '</ul>' +
            '</div>'

        $(e).html(html);

        // Apply target to links
        $('a', e).attr('target', options.linktarget);
    };

    var _formatFilesize = function(bytes) {
        var s = ['bytes', 'kb', 'MB', 'GB', 'TB', 'PB'];
        var e = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(e))).toFixed(2) + " " + s[e];
    }

    var _formatDate = function(date, mask) {

        // Convert to date and set return to the mask
        var fmtDate = new Date(date);
        date = mask;

        // Replace mask tokens
        date = date.replace('dd', _formatDigit(fmtDate.getDate()));
        date = date.replace('MMMM', _getMonthName(fmtDate.getMonth()));
        date = date.replace('MM', _formatDigit(fmtDate.getMonth() + 1));
        date = date.replace('yyyy', fmtDate.getFullYear());
        date = date.replace('hh', _formatDigit(fmtDate.getHours()));
        date = date.replace('mm', _formatDigit(fmtDate.getMinutes()));
        date = date.replace('ss', _formatDigit(fmtDate.getSeconds()));

        return date;
    }

    var _formatDigit = function(digit) {
        digit += '';
        if (digit.length < 2) digit = '0' + digit;
        return digit;
    }

    var _getMonthName = function(month) {
        var name = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return name[month];
    }

    var _getXMLDocument = function(string) {
        var browser = navigator.appName;
        var xml;
        if (browser == 'Microsoft Internet Explorer') {
            xml = new ActiveXObject('Microsoft.XMLDOM');
            xml.async = 'false';
            xml.loadXML(string);
        } else {
            xml = (new DOMParser()).parseFromString(string, 'text/xml');
        }
        return xml;
    }

    var _getLapsedTime = function(date) {

        // Get current date and format date parameter
        var todayDate = new Date();
        var pastDate = new Date(date);

        // Get lasped time in seconds
        var lapsedTime = Math.round((todayDate.getTime() - pastDate.getTime()) / 1000)

        // Return lasped time in seconds, minutes, hours, days and weeks
        if (lapsedTime < 60) {
            return '< 1 min';
        } else if (lapsedTime < (60 * 60)) {
            var t = Math.round(lapsedTime / 60) - 1;
            var u = 'min';
        } else if (lapsedTime < (24 * 60 * 60)) {
            var t = Math.round(lapsedTime / 3600) - 1;
            var u = 'hour';
        } else if (lapsedTime < (7 * 24 * 60 * 60)) {
            var t = Math.round(lapsedTime / 86400) - 1;
            var u = 'day';
        } else {
            var t = Math.round(lapsedTime / 604800) - 1;
            var u = 'week';
        }

        // Check for plural units
        if (t > 1) u += 's';
        return t + ' ' + u;
    }

})(jQuery);