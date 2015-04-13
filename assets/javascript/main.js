(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var analytics = require('./analytics');
var supports = require('./supports');


// Add an `is-legacy` class on browsers that don't supports flexbox.
if (!supports.flexbox()) {
    var div = document.createElement('div');
    div.className = 'Error';
    div.innerHTML = 'Your browser does not support Flexbox. ' +
        'Parts of this site may not appear as expected.';

    document.body.insertBefore(div, document.body.firstChild);
}


// Track various interations with Google Analytics
analytics.track();


/**
 * Plugin: jquery.zRSSFeed
 * 
 * Version: 1.2.0
 * (c) Copyright 2010-2013, Zazar Ltd
 * 
 * Description: jQuery plugin for display of RSS feeds via Google Feed API
 *              (Based on original plugin jGFeed by jQuery HowTo. Filesize function by Cary Dunn.)
 * 
 * History:
 * 1.2.0 - Added month names to date formats
 * 1.1.9 - New dateformat option to allow feed date formatting
 * 1.1.8 - Added historical option to enable scoring in the Google Feed API
 * 1.1.7 - Added feed offset, link redirect & link content options
 * 1.1.6 - Added sort options
 * 1.1.5 - Target option now applies to all feed links
 * 1.1.4 - Added option to hide media and now compressed with Google Closure
 * 1.1.3 - Check for valid published date
 * 1.1.2 - Added user callback function due to issue with ajaxStop after jQuery 1.4.2
 * 1.1.1 - Correction to null xml entries and support for media with jQuery < 1.5
 * 1.1.0 - Added support for media in enclosure tags
 * 1.0.3 - Added feed link target
 * 1.0.2 - Fixed issue with GET parameters (Seb Dangerfield) and SSL option
 * 1.0.1 - Corrected issue with multiple instances
 *
 **/

(function($) {

    $.fn.rssfeed = function(url, options, fn) {

        // Set plugin defaults
        var defaults = {
            limit: 10,
            offset: 1,
            header: true,
            titletag: 'h3 class="article__headline"',
            date: true,
            dateformat: 'MMMM <span>dd</span>',
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
            '<ul class="article-list">';


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
            	   rowArray[rowIndex]['html'] += '<' + options.titletag + '><a href="' + options.linkredirect + feedLink + '" title="View this feed at ' + feeds.title + '">' + entry.title + '</a></' + options.titletag + '>'
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

},{"./analytics":3,"./supports":6}],2:[function(require,module,exports){
module.exports = function(element, event, fn) {
  if (element.addEventListener) {
    element.addEventListener(event, fn, false);
  }
  else {
    element.attachEvent('on' + event, fn);
  }
};

},{}],3:[function(require,module,exports){
/* global ga */

var linkClicked = require('./link-clicked');
var parseUrl = require('./parse-url');


var breakpoints = {
  xs: '(max-width: 383px)',
  sm: '(min-width: 384px) and (max-width: 575px)',
  md: '(min-width: 576px) and (max-width: 767px)',
  lg: '(min-width: 768px)'
};


function trackBreakpoints() {
  // Do nothing in browsers that don't support `window.matchMedia`.
  if (!window.matchMedia) return;

  // Prevent rapid breakpoint changes from all firing at once.
  var timeout;

  Object.keys(breakpoints).forEach(function(breakpoint) {
    var mql = window.matchMedia(breakpoints[breakpoint]);

    // Set the initial breakpoint on pageload.
    if (mql.matches) {
      ga('set', 'dimension1', breakpoint);
    }

    // Update the breakpoint as the matched media changes, and send an event.
    mql.addListener(function(mql) {
      if (mql.matches) {
        clearTimeout(timeout);
        timeout = setTimeout(function() {
          ga('set', 'dimension1', breakpoint);
          ga('send', 'event', 'Breakpoint', 'change', breakpoint);
        }, 1000);
      }
    });
  });
}


function trackOutboundLinks() {
  linkClicked(function() {

    // Ignore outbound links on social buttons.
    if (this.getAttribute('data-social-network')) return;

    if (isLinkOutbound(this)) {
      // Opening links in an external tabs allows the ga beacon to send.
      // When following links directly, sometimes they don't make it.
      this.target = '_blank';

      ga('send', 'event', 'Outbound Link', 'click', this.href);
    }
  });
}


function trackSocialInteractions() {
  linkClicked(function() {
    var socialNetwork = this.getAttribute('data-social-network');
    if (socialNetwork) {
      var socialAction = this.getAttribute('data-social-action');
      var socialTarget = location.href;

      // Opening links in an external tab allows the ga beacon to send.
      // When following links directly, sometimes they don't make it.
      this.target = '_blank';

      ga('send', 'social', socialNetwork, socialAction, socialTarget);
    }
  });
}


function isLinkOutbound(link) {
  var url = parseUrl(link.href);
  var loc = parseUrl(location.href);
  return url.origin != loc.origin;
}


module.exports = {
  track: function() {

    trackBreakpoints();
    trackOutboundLinks();
    trackSocialInteractions();

    ga('send', 'pageview');
  }
};

},{"./link-clicked":4,"./parse-url":5}],4:[function(require,module,exports){
var addListener = require('./add-listener');

function isLink(el) {
  return el.nodeName && el.nodeName.toLowerCase() == 'a' && el.href;
}

function getLinkAncestor(el) {
  if (isLink(el)) return el;
  while (el.parentNode && el.parentNode.nodeType == 1) {
    if (isLink(el)) return el;
    el = el.parentNode;
  }
}

module.exports = function(fn) {
  addListener(document, 'click', function(event) {
    var e = event || window.event;
    var target = e.target || e.srcElement;
    var link = getLinkAncestor(target);
    if (link) {
      fn.call(link, e);
    }
  });
};

},{"./add-listener":2}],5:[function(require,module,exports){
var a = document.createElement('a');
var cache = {};

/**
 * Parse the given url and return the properties returned
 * by the `Location` object.
 * @param {string} url - The url to parse.
 * @return {Object} An object with the same keys as `window.location`.
 */
module.exports = function(url) {

  if (cache[url]) return cache[url];

  var httpPort = /:80$/;
  var httpsPort = /:443/;

  a.href = url;

  // Sometimes IE will return no port or just a colon, especially for things
  // like relative port URLs (e.g. "//google.com").
  var protocol = !a.protocol || ':' == a.protocol ?
      location.protocol : a.protocol;

  // Don't include default ports.
  var port = (a.port == '80' || a.port == '443') ? '' : a.port;

  // Sometimes IE incorrectly includes a port (e.g. `:80` or `:443`)  even
  // when no port is specified in the URL.
  // http://bit.ly/1rQNoMg
  var host = a.host.replace(protocol == 'http:' ? httpPort : httpsPort, '');

  // Not all browser support `origin` so we have to build it.
  var origin = a.origin ? a.origin : protocol + '//' + host;

  // Sometimes IE doesn't include the leading slash for pathname.
  // http://bit.ly/1rQNoMg
  var pathname = a.pathname.charAt(0) == '/' ? a.pathname : '/' + a.pathname;

  return cache[url] = {
    hash: a.hash,
    host: host,
    hostname: a.hostname,
    href: a.href,
    origin: origin,
    path: pathname + a.search,
    pathname: pathname,
    port: port,
    protocol: protocol,
    search: a.search
  };
};

},{}],6:[function(require,module,exports){
var supports = {};
var style = document.body.style;

module.exports = {
  flexbox: function() {
    return supports.flexbox || (supports.flexbox = ('flexBasis' in style ||
        'msFlexAlign' in style || 'webkitBoxDirection' in style));
  }
};

},{}]},{},[1])


//# sourceMappingURL=main.js.map