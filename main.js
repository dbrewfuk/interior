(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _analytics = require('./analytics');

var _analytics2 = _interopRequireDefault(_analytics);

var _supports = require('./supports');

var _supports2 = _interopRequireDefault(_supports);

require('./vendor/moment.js');

require('./vendor/velocity');

require('./vendor/instafeed');

require('./vendor/fitvids');

require('./site-navigation');

require('./quick-links');

require('./accordion');

require('./page-anchors');

require('./visibility-toggle');

require('./banner');

require('./quote-slider');

require('./twitter-feed');

require('./facebook-feed');

// Add an `is-legacy` class on browsers that don't supports flexbox.
if (!_supports2['default'].flexbox()) {
  var div = document.createElement('div');
  div.className = 'Error';
  div.innerHTML = 'Your browser does not support Flexbox.\n                   Parts of this site may not appear as expected.';

  document.body.insertBefore(div, document.body.firstChild);
}

// Track various interations with Google Analytics
_analytics2['default'].track();

},{"./accordion":2,"./analytics":4,"./banner":5,"./facebook-feed":6,"./page-anchors":8,"./quick-links":10,"./quote-slider":11,"./site-navigation":12,"./supports":13,"./twitter-feed":14,"./vendor/fitvids":15,"./vendor/instafeed":16,"./vendor/moment.js":17,"./vendor/velocity":18,"./visibility-toggle":19}],2:[function(require,module,exports){
'use strict';

$('.js-expand-trigger').bind('click', function (e) {
  $(this).toggleClass('is-expanded');
  $(this).next('.js-expandable').toggleClass('is-expanded');
  e.preventDefault();
});

},{}],3:[function(require,module,exports){
'use strict';

module.exports = function (element, event, fn) {
  if (element.addEventListener) {
    element.addEventListener(event, fn, false);
  } else {
    element.attachEvent('on' + event, fn);
  }
};

},{}],4:[function(require,module,exports){
/* global ga */

'use strict';

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

  Object.keys(breakpoints).forEach(function (breakpoint) {
    var mql = window.matchMedia(breakpoints[breakpoint]);

    // Set the initial breakpoint on pageload.
    if (mql.matches) {
      ga('set', 'dimension1', breakpoint);
    }

    // Update the breakpoint as the matched media changes, and send an event.
    mql.addListener(function (mql) {
      if (mql.matches) {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          ga('set', 'dimension1', breakpoint);
          ga('send', 'event', 'Breakpoint', 'change', breakpoint);
        }, 1000);
      }
    });
  });
}

function trackOutboundLinks() {
  linkClicked(function () {

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
  linkClicked(function () {
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
  track: function track() {

    trackBreakpoints();
    trackOutboundLinks();
    trackSocialInteractions();

    ga('send', 'pageview');
  }
};

},{"./link-clicked":7,"./parse-url":9}],5:[function(require,module,exports){
'use strict';

if ($('.js-unslider').length > 0) {
	$(function () {
		$('.js-unslider').unslider({
			items: '.js-slider',
			item: '.js-slide',
			arrows: true,
			fluid: true,
			autoplay: false
		});
	});
}

(function ($, f) {
	var Unslider = function Unslider() {
		//  Object clone
		var _ = this;

		//  Set some options
		_.o = {
			speed: 0, // animation speed, false for no transition (integer or boolean)
			delay: 5000, // delay between slides, false for no autoplay (integer or boolean)
			init: 0, // init delay, false for no delay (integer or boolean)
			pause: !f, // pause on hover (boolean)
			loop: !f, // infinitely looping (boolean)
			keys: f, // keyboard shortcuts (boolean)
			dots: f, // display dots pagination (boolean)
			arrows: f, // display prev/next arrows (boolean)
			prev: '&larr;', // text or html inside prev button (string)
			next: '&rarr;', // same as for prev option
			fluid: f, // is it a percentage width? (boolean)
			starting: f, // invoke before animation (function with argument)
			complete: f, // invoke after animation (function with argument)
			items: '>ul', // slides container selector
			item: '>li', // slidable items selector
			activeClass: 'is-active',
			easing: 'easeInOutExpo', // easing function to use for animation
			autoplay: true, // enable autoplay on initialisation
			fluidh: false // enable/disable fluid height
		};

		_.init = function (el, o) {
			//  Check whether we're passing any options in to Unslider
			_.o = $.extend(_.o, o);

			_.el = el;
			_.ul = el.find(_.o.items);
			_.max = [el.outerWidth() | 0, el.outerHeight() | 0];
			_.li = _.ul.find(_.o.item).each(function (index) {
				var me = $(this),
				    width = me.outerWidth(),
				    height = me.outerHeight();

				//  Set the max values
				if (width > _.max[0]) _.max[0] = width;
				if (height > _.max[1]) _.max[1] = height;

				// If it is the first item, let's add the activeClass.
				if (index === 0) {
					me.addClass(_.o.activeClass);
				}
			});

			//  Cached vars
			var ul = _.ul,
			    li = _.li,
			    len = li.length;

			//  Current indeed
			_.i = 0;

			//  Set the main element

			//  Set the relative widths
			ul.css({ position: 'relative', left: 0, width: '100%' });
			if (o.fluid) {
				li.css({});
			} else {
				li.css({});
			}

			//  Autoslide
			o.autoplay && setTimeout(function () {
				if (o.delay | 0) {
					_.play();

					if (o.pause) {
						el.on('mouseover mouseout', function (e) {
							_.stop();
							e.type === 'mouseout' && _.play();
						});
					}
				}
			}, o.init | 0);

			//  Keypresses
			if (o.keys) {
				$(document).keydown(function (e) {
					switch (e.which) {
						case 37:
							_.prev(); // Left
							break;
						case 39:
							_.next(); // Right
							break;
						case 27:
							_.stop(); // Esc
							break;
					}
				});
			}

			//  Dot pagination
			o.dots && nav('dot');

			//  Arrows support
			o.arrows && nav('banner-arrow');

			//  Patch for fluid-width sliders. Screw those guys.
			o.fluid && $(window).resize(function () {
				_.r && clearTimeout(_.r);

				_.r = setTimeout(function () {
					var styl = { height: li.eq(_.i).outerHeight() },
					    width = el.outerWidth();

					styl.width = Math.min(Math.round(width / el.parent().width() * 100), 100) + '%';

					if (o.fluidh) {
						li.css({ width: width + 'px' });
					}
				}, 50);
			}).resize();

			//  Move support
			if ($.event.special.move || $.Event('move')) {
				el.on('movestart', function (e) {
					if (e.distX > e.distY && e.distX < -e.distY || e.distX < e.distY && e.distX > -e.distY) {
						e.preventDefault();
					} else {
						el.data('left', _.ul.offset().left / el.width() * 100);
					}
				}).on('move', function (e) {
					var left = 100 * e.distX / el.width();
					var leftDelta = 100 * e.deltaX / el.width();
					_.ul[0].style.left = parseInt(_.ul[0].style.left.replace('%', '')) + leftDelta + '%';

					_.ul.data('left', left);
				}).on('moveend', function (e) {
					var left = _.ul.data('left');
					if (Math.abs(left) > 30) {
						var i = left > 0 ? _.i - 1 : _.i + 1;
						if (i < 0 || i >= len) i = _.i;
						_.to(i);
					} else {
						_.to(_.i);
					}
				});
			}

			return _;
		};

		//  Move Unslider to a slide index
		_.to = function (index, callback) {
			if (_.t) {
				_.stop();
				_.play();
			}
			var o = _.o,
			    el = _.el,
			    ul = _.ul,
			    li = _.li,
			    current = _.i,
			    target = li.eq(index);

			$.isFunction(o.starting) && !callback && o.starting(el, li.eq(current));

			//  To slide or not to slide
			if ((!target.length || index < 0) && o.loop === f) return;

			//  Check if it's out of bounds
			if (!target.length) index = 0;
			if (index < 0) index = li.length - 1;
			target = li.eq(index);

			var speed = callback ? 5 : o.speed | 0,
			    easing = o.easing,
			    obj = { height: target.outerHeight() };

			if (!ul.queue('fx').length) {
				//  Handle those pesky dots
				el.find('.dot').eq(index).addClass('active').siblings().removeClass('active');

				el.animate(speed) && ul.animate($.extend({}), speed, function (data) {
					_.i = index;

					// Add an active class to the slide and remove it from the previous slide
					ul.children().removeClass(o.activeClass);
					target.addClass(o.activeClass);

					$.isFunction(o.complete) && !callback && o.complete(el, target);
				});
			}
		};

		//  Autoplay functionality
		_.play = function () {
			_.t = setInterval(function () {
				_.to(_.i + 1);
			}, _.o.delay | 0);
		};

		//  Stop autoplay
		_.stop = function () {
			_.t = clearInterval(_.t);
			return _;
		};

		//  Move to previous/next slide
		_.next = function () {
			return _.stop().to(_.i + 1);
		};

		_.prev = function () {
			return _.stop().to(_.i - 1);
		};

		//  Create dots and arrows
		function nav(name, html) {
			if (name == 'dot') {
				html = '<ol class="dots">';
				$.each(_.li, function (index) {
					html += '<li class="' + (index === _.i ? name + ' active' : name) + '">' + index + '</li>';
				});
				html += '</ol>';
			} else {
				html = '<div class="';
				html = html + name + 's"><a class="' + name + ' prev">' + _.o.prev + '</a><a class="' + name + ' next">' + _.o.next + '</a></div>';
			}

			_.el.addClass('has-' + name + 's');
			$('.js-slider').append(html).find('.' + name).click(function () {
				var me = $(this);
				me.hasClass('dot') ? _.stop().to(me.index()) : me.hasClass('prev') ? _.prev() : _.next();
			});
		}
	};

	//  Create a jQuery plugin
	$.fn.unslider = function (o) {
		var len = this.length;

		//  Enable multiple-slider support
		return this.each(function (index) {
			//  Cache a copy of $(this), so it
			var me = $(this),
			    key = 'unslider' + (len > 1 ? '-' + index : ''),
			    instance = new Unslider().init(me, o);

			//  Invoke an Unslider instance
			me.data(key, instance).data('key', key);
		});
	};

	Unslider.version = '1.0.0';
})(jQuery, false);

},{}],6:[function(require,module,exports){
/*
 * FeedEk jQuery RSS/ATOM Feed Plugin v2.0
 * http://jquery-plugins.net/FeedEk/FeedEk.html  https://github.com/enginkizil/FeedEk
 * Author : Engin KIZIL http://www.enginkizil.com   
 */

'use strict';

(function ($) {
    var moment = require('./vendor/moment');
    $.fn.FeedEk = function (opt) {
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
            i,
            s = '',
            dt;

        $.ajax({
            url: 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=' + def.MaxCount + '&output=json&q=' + encodeURIComponent(def.FeedUrl) + '&hl=en&callback=?',
            dataType: 'json',
            success: function success(data) {
                $('.' + element).empty();
                $.each(data.responseData.feed.entries, function (e, item) {
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

},{"./vendor/moment":17}],7:[function(require,module,exports){
'use strict';

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

module.exports = function (fn) {
  addListener(document, 'click', function (event) {
    var e = event || window.event;
    var target = e.target || e.srcElement;
    var link = getLinkAncestor(target);
    if (link) {
      fn.call(link, e);
    }
  });
};

},{"./add-listener":3}],8:[function(require,module,exports){
'use strict';

if ($('.js-scrolltop-fixable').length > 0) {
    var bottom = $('.js-scrolltop-fixable').offset().top;
    $(window).scroll(function () {

        if ($(this).scrollTop() > bottom) {
            $('.js-scrolltop-fixable').addClass('is-fixed');
        } else {
            $('.js-scrolltop-fixable').removeClass('is-fixed');
        }
    });
}

},{}],9:[function(require,module,exports){
'use strict';

var a = document.createElement('a');
var cache = {};

/**
 * Parse the given url and return the properties returned
 * by the `Location` object.
 * @param {string} url - The url to parse.
 * @return {Object} An object with the same keys as `window.location`.
 */
module.exports = function (url) {

  if (cache[url]) return cache[url];

  var httpPort = /:80$/;
  var httpsPort = /:443/;

  a.href = url;

  // Sometimes IE will return no port or just a colon, especially for things
  // like relative port URLs (e.g. "//google.com").
  var protocol = !a.protocol || ':' == a.protocol ? location.protocol : a.protocol;

  // Don't include default ports.
  var port = a.port == '80' || a.port == '443' ? '' : a.port;

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

},{}],10:[function(require,module,exports){
'use strict';

$(document).ready(function () {
    $('.tabs a').click(function (event) {
        event.preventDefault();
        $('.js-tabbed-lists ul').hide();
        $($(this).attr('href')).show();
        $(this).parent('li').addClass('is-selected').siblings().removeClass('is-selected');
    });
});

$(document).on('touchstart click', '.js-quick-links-toggle', function (event) {
    event.stopPropagation();
    $('.quick-links').toggleClass('is-showing');
    $('.full-page-mask').toggleClass('is-showing');
});

$(document).on('click', '.js-mobile-quick-links-toggle', function (event) {
    event.stopPropagation();
    $('.quick-links').toggleClass('is-showing');
    $('.full-page-mask').toggleClass('is-showing');
});

},{}],11:[function(require,module,exports){
'use strict';

if ($('.js-quote-slider').length > 0) {
    var slider = '.js-quote-slider';
    var slides = $('.js-quote-slides');
    var slide = $('.js-quote-slide');
    var activeClass = 'is-active';
    var activeSlide = '.is-active';
    var arrowNext = '.js-arrow-next';
    var arrowPrev = '.js-arrow-prev';

    $(document).on('click', arrowNext, function () {
        var parent = $(this).closest(slider);
        var active = parent.find(activeSlide);
        if ($(active).is(':last-child')) {
            active.removeClass(activeClass);
            $(parent).find(slide).first().addClass(activeClass);
        } else {
            $(active).removeClass(activeClass).next().addClass(activeClass);
        }
    });
    $(document).on('click', arrowPrev, function () {
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

},{}],12:[function(require,module,exports){
'use strict';

$(function () {
    $('.site-navigation a').each(function () {
        var path = '{{ site.baseUrl }}' + window.location.pathname;
        if ($(this).attr('href') == window.location.pathname) {
            $(this).addClass('is-current');
        }
    });
});

$(document).on('click', '.js-site-navigation-toggle', function () {
    $('.site-navigation').toggleClass('is-visible');
    $(this).toggleClass('is-toggled');
});

},{}],13:[function(require,module,exports){
'use strict';

var supports = {};
var style = document.body.style;

module.exports = {
  flexbox: function flexbox() {
    return supports.flexbox || (supports.flexbox = 'flexBasis' in style || 'msFlexAlign' in style || 'webkitBoxDirection' in style);
  }
};

},{}],14:[function(require,module,exports){
'use strict';

if ($('.twitter-widget').length > 0) {
  /*********************************************************************
  *  #### Twitter Post Fetcher v13.0 ####
  *  Coded by Jason Mayes 2015. A present to all the developers out there.
  *  www.jasonmayes.com
  *  Please keep this disclaimer with my code if you use it. Thanks. :-)
  *  Got feedback or questions, ask here:
  *  http://www.jasonmayes.com/projects/twitterApi/
  *  Github: https://github.com/jasonmayes/Twitter-Post-Fetcher
  *  Updates will be posted to this site.
  *********************************************************************/
  (function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define([], factory);
    } else if (typeof exports === 'object') {
      // Node. Does not work with strict CommonJS, but
      // only CommonJS-like environments that support module.exports,
      // like Node.
      module.exports = factory();
    } else {
      // Browser globals.
      factory();
    }
  })(undefined, function () {
    var domNode = '';
    var maxTweets = 20;
    var parseLinks = true;
    var queue = [];
    var inProgress = false;
    var printTime = true;
    var printUser = true;
    var formatterFunction = null;
    var supportsClassName = true;
    var showRts = false;
    var customCallbackFunction = null;
    var showInteractionLinks = false;
    var showImages = true;
    var targetBlank = true;
    var lang = 'en';
    var permalinks = true;
    var script = null;
    var scriptAdded = false;

    function handleTweets(tweets) {
      if (customCallbackFunction === null) {
        var x = tweets.length;
        var n = 0;
        var element = document.getElementsByClassName(domNode)[0];
        var html = '<ul class="tweet-list">';
        while (n < x) {
          html += '<li class="tweet">' + tweets[n] + '</li>';
          n++;
        }
        html += '</ul>';
        element.innerHTML = html;
      } else {
        customCallbackFunction(tweets);
      }
    }

    function strip(data) {
      return data.replace(/<b[^>]*>(.*?)<\/b>/gi, function (a, s) {
        return s;
      }).replace(/class=".*?"|data-query-source=".*?"|dir=".*?"|rel=".*?"/gi, '');
    }

    function targetLinksToNewWindow(el) {
      var links = el.getElementsByTagName('a');
      for (var i = links.length - 1; i >= 0; i--) {
        links[i].setAttribute('target', '_blank');
      }
    }

    function getElementsByClassName(node, classname) {
      var a = [];
      var regex = new RegExp('(^| )' + classname + '( |$)');
      var elems = node.getElementsByTagName('*');
      for (var i = 0, j = elems.length; i < j; i++) {
        if (regex.test(elems[i].className)) {
          a.push(elems[i]);
        }
      }
      return a;
    }

    function extractImageUrl(image_data) {
      if (image_data !== undefined) {
        var data_src = image_data.innerHTML.match(/data-srcset="([A-z0-9%_\.-]+)/i)[0];
        return decodeURIComponent(data_src).split('"')[1];
      }
    }

    var twitterFetcher = {
      fetch: function fetch(config) {
        if (config.maxTweets === undefined) {
          config.maxTweets = 20;
        }
        if (config.enableLinks === undefined) {
          config.enableLinks = true;
        }
        if (config.showUser === undefined) {
          config.showUser = false;
        }
        if (config.showTime === undefined) {
          config.showTime = true;
        }
        if (config.dateFunction === undefined) {
          config.dateFunction = 'default';
        }
        if (config.showRetweet === undefined) {
          config.showRetweet = true;
        }
        if (config.customCallback === undefined) {
          config.customCallback = null;
        }
        if (config.showInteraction === undefined) {
          config.showInteraction = false;
        }
        if (config.showImages === undefined) {
          config.showImages = true;
        }
        if (config.linksInNewWindow === undefined) {
          config.linksInNewWindow = true;
        }
        if (config.showPermalinks === undefined) {
          config.showPermalinks = true;
        }

        if (inProgress) {
          queue.push(config);
        } else {
          inProgress = true;

          domNode = config.domId;
          maxTweets = config.maxTweets;
          parseLinks = config.enableLinks;
          printUser = config.showUser;
          printTime = config.showTime;
          showRts = config.showRetweet;
          formatterFunction = config.dateFunction;
          customCallbackFunction = config.customCallback;
          showInteractionLinks = config.showInteraction;
          showImages = config.showImages;
          targetBlank = config.linksInNewWindow;
          permalinks = config.showPermalinks;

          var head = document.getElementsByTagName('head')[0];
          if (script !== null) {
            head.removeChild(script);
          }
          script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = 'https://cdn.syndication.twimg.com/widgets/timelines/' + config.id + '?&lang=' + (config.lang || lang) + '&callback=twitterFetcher.callback&' + 'suppress_response_codes=true&rnd=' + Math.random();
          head.appendChild(script);
        }
      },
      callback: function callback(data) {
        var div = document.createElement('div');
        div.innerHTML = data.body;
        if (typeof div.getElementsByClassName === 'undefined') {
          supportsClassName = false;
        }

        var tweets = [];
        var authors = [];
        var times = [];
        var images = [];
        var rts = [];
        var tids = [];
        var permalinksURL = [];
        var x = 0;

        if (supportsClassName) {
          var tmp = div.getElementsByClassName('tweet');
          while (x < tmp.length) {
            if (tmp[x].getElementsByClassName('retweet-credit').length > 0) {
              rts.push(true);
            } else {
              rts.push(false);
            }
            if (!rts[x] || rts[x] && showRts) {
              tweets.push(tmp[x].getElementsByClassName('e-entry-title')[0]);
              tids.push(tmp[x].getAttribute('data-tweet-id'));
              authors.push(tmp[x].getElementsByClassName('p-author')[0]);
              times.push(tmp[x].getElementsByClassName('dt-updated')[0]);
              permalinksURL.push(tmp[x].getElementsByClassName('permalink')[0]);
              if (tmp[x].getElementsByClassName('inline-media')[0] !== undefined) {
                images.push(tmp[x].getElementsByClassName('inline-media')[0]);
              } else {
                images.push(undefined);
              }
            }
            x++;
          }
        } else {
          var tmp = getElementsByClassName(div, 'tweet');
          while (x < tmp.length) {
            tweets.push(getElementsByClassName(tmp[x], 'e-entry-title')[0]);
            tids.push(tmp[x].getAttribute('data-tweet-id'));
            authors.push(getElementsByClassName(tmp[x], 'p-author')[0]);
            times.push(getElementsByClassName(tmp[x], 'dt-updated')[0]);
            permalinksURL.push(getElementsByClassName(tmp[x], 'permalink')[0]);
            if (getElementsByClassName(tmp[x], 'inline-media')[0] !== undefined) {
              images.push(getElementsByClassName(tmp[x], 'inline-media')[0]);
            } else {
              images.push(undefined);
            }

            if (getElementsByClassName(tmp[x], 'retweet-credit').length > 0) {
              rts.push(true);
            } else {
              rts.push(false);
            }
            x++;
          }
        }

        if (tweets.length > maxTweets) {
          tweets.splice(maxTweets, tweets.length - maxTweets);
          authors.splice(maxTweets, authors.length - maxTweets);
          times.splice(maxTweets, times.length - maxTweets);
          rts.splice(maxTweets, rts.length - maxTweets);
          images.splice(maxTweets, images.length - maxTweets);
          permalinksURL.splice(maxTweets, permalinksURL.length - maxTweets);
        }

        var arrayTweets = [];
        var x = tweets.length;
        var n = 0;
        while (n < x) {
          if (typeof formatterFunction !== 'string') {
            var datetimeText = times[n].getAttribute('datetime');
            var newDate = new Date(times[n].getAttribute('datetime').replace(/-/g, '/').replace('T', ' ').split('+')[0]);
            var dateString = formatterFunction(newDate, datetimeText);
            times[n].setAttribute('aria-label', dateString);

            if (tweets[n].innerText) {
              // IE hack.
              if (supportsClassName) {
                times[n].innerText = dateString;
              } else {
                var h = document.createElement('p');
                var t = document.createTextNode(dateString);
                h.appendChild(t);
                h.setAttribute('aria-label', dateString);
                times[n] = h;
              }
            } else {
              times[n].textContent = dateString;
            }
          }
          var op = '';
          if (parseLinks) {
            if (targetBlank) {
              targetLinksToNewWindow(tweets[n]);
              if (printUser) {
                targetLinksToNewWindow(authors[n]);
              }
            }
            if (printUser) {
              op += '<span class="twitter-username">' + strip(authors[n].innerHTML) + '</span>';
            }
            op += '<p class="tweet-content">' + strip(tweets[n].innerHTML) + '</p>';
            if (printTime) {
              if (permalinks) {
                op += '<span class="time-posted"><a href="' + permalinksURL[n] + '">' + times[n].getAttribute('aria-label') + '</a></span>';
              } else {
                op += '<span class="time-posted">' + times[n].getAttribute('aria-label') + '</span>';
              }
            }
          } else {
            if (tweets[n].innerText) {
              if (printUser) {
                op += '<span class="twitter-username">' + authors[n].innerText + '</span>';
              }
              op += '<p class="tweet-content">' + tweets[n].innerText + '</p>';
              if (printTime) {
                op += '<span class="time-posted">' + times[n].innerText + '</span>';
              }
            } else {
              if (printUser) {
                op += '<span class="twitter-username">' + authors[n].textContent + '</span>';
              }
              op += '<p class="tweet-content">' + tweets[n].textContent + '</p>';
              if (printTime) {
                op += '<span class="time-posted">' + times[n].textContent + '</span>';
              }
            }
          }
          if (showInteractionLinks) {
            op += '<p class="interact"><a href="https://twitter.com/intent/' + 'tweet?in_reply_to=' + tids[n] + '" class="twitter_reply_icon"' + (targetBlank ? ' target="_blank">' : '>') + 'Reply</a><a href="https://twitter.com/intent/retweet?tweet_id=' + tids[n] + '" class="twitter_retweet_icon"' + (targetBlank ? ' target="_blank">' : '>') + 'Retweet</a>' + '<a href="https://twitter.com/intent/favorite?tweet_id=' + tids[n] + '" class="twitter_fav_icon"' + (targetBlank ? ' target="_blank">' : '>') + 'Favorite</a></p>';
          }

          if (showImages && images[n] !== undefined) {
            op += '<div class="media">' + '<img src="' + extractImageUrl(images[n]) + '" alt="Image from tweet" />' + '</div>';
          }

          arrayTweets.push(op);
          n++;
        }
        handleTweets(arrayTweets);
        inProgress = false;

        if (queue.length > 0) {
          twitterFetcher.fetch(queue[0]);
          queue.splice(0, 1);
        }
      }
    };

    // It must be a global variable because it will be called by JSONP.
    window.twitterFetcher = twitterFetcher;

    return twitterFetcher;
  });
}

},{}],15:[function(require,module,exports){
'use strict';

if ('.js-fitvids'.length > 0) {
  $(document).ready(function () {
    // Target your .container, .wrapper, .post, etc.
    $('.js-fitvids').fitVids();
  });
}
/*jshint browser:true */
/*!
* FitVids 1.1
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
*/

;(function ($) {

  'use strict';

  $.fn.fitVids = function (options) {
    var settings = {
      customSelector: null,
      ignore: null
    };

    if (!document.getElementById('fit-vids-style')) {
      // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
      var head = document.head || document.getElementsByTagName('head')[0];
      var css = '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
      var div = document.createElement('div');
      div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';
      head.appendChild(div.childNodes[1]);
    }

    if (options) {
      $.extend(settings, options);
    }

    return this.each(function () {
      var selectors = ['iframe[src*="player.vimeo.com"]', 'iframe[src*="youtube.com"]', 'iframe[src*="youtube-nocookie.com"]', 'iframe[src*="kickstarter.com"][src*="video.html"]', 'object', 'embed'];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var ignoreList = '.fitvidsignore';

      if (settings.ignore) {
        ignoreList = ignoreList + ', ' + settings.ignore;
      }

      var $allVideos = $(this).find(selectors.join(','));
      $allVideos = $allVideos.not('object object'); // SwfObj conflict patch
      $allVideos = $allVideos.not(ignoreList); // Disable FitVids on this video.

      $allVideos.each(function (count) {
        var $this = $(this);
        if ($this.parents(ignoreList).length > 0) {
          return; // Disable FitVids on this video.
        }
        if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) {
          return;
        }
        if (!$this.css('height') && !$this.css('width') && (isNaN($this.attr('height')) || isNaN($this.attr('width')))) {
          $this.attr('height', 9);
          $this.attr('width', 16);
        }
        var height = this.tagName.toLowerCase() === 'object' || $this.attr('height') && !isNaN(parseInt($this.attr('height'), 10)) ? parseInt($this.attr('height'), 10) : $this.height(),
            width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
            aspectRatio = height / width;
        if (!$this.attr('id')) {
          var videoID = 'fitvid' + count;
          $this.attr('id', videoID);
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', aspectRatio * 100 + '%');
        $this.removeAttr('height').removeAttr('width');
      });
    });
  };
  // Works with either jQuery or Zepto
})(window.jQuery || window.Zepto);

},{}],16:[function(require,module,exports){
'use strict';

(function () {
  var Instafeed, root;

  Instafeed = (function () {

    function Instafeed(params, context) {
      var option, value;
      this.options = {
        target: 'instafeed',
        get: 'popular',
        resolution: 'thumbnail',
        sortBy: 'none',
        links: true,
        mock: false,
        useHttp: false
      };
      if (typeof params === 'object') {
        for (option in params) {
          value = params[option];
          this.options[option] = value;
        }
      }
      this.context = context != null ? context : this;
      this.unique = this._genKey();
    }

    Instafeed.prototype.hasNext = function () {
      return typeof this.context.nextUrl === 'string' && this.context.nextUrl.length > 0;
    };

    Instafeed.prototype.next = function () {
      if (!this.hasNext()) {
        return false;
      }
      return this.run(this.context.nextUrl);
    };

    Instafeed.prototype.run = function (url) {
      var header, instanceName, script;
      if (typeof this.options.clientId !== 'string') {
        if (typeof this.options.accessToken !== 'string') {
          throw new Error('Missing clientId or accessToken.');
        }
      }
      if (typeof this.options.accessToken !== 'string') {
        if (typeof this.options.clientId !== 'string') {
          throw new Error('Missing clientId or accessToken.');
        }
      }
      if (this.options.before != null && typeof this.options.before === 'function') {
        this.options.before.call(this);
      }
      if (typeof document !== 'undefined' && document !== null) {
        script = document.createElement('script');
        script.id = 'instafeed-fetcher';
        script.src = url || this._buildUrl();
        header = document.getElementsByTagName('head');
        header[0].appendChild(script);
        instanceName = 'instafeedCache' + this.unique;
        window[instanceName] = new Instafeed(this.options, this);
        window[instanceName].unique = this.unique;
      }
      return true;
    };

    Instafeed.prototype.parse = function (response) {
      var anchor, fragment, header, htmlString, image, imageString, imageUrl, images, img, imgUrl, instanceName, node, reverse, sortSettings, tmpEl, _i, _j, _k, _len, _len1, _len2, _ref;
      if (typeof response !== 'object') {
        if (this.options.error != null && typeof this.options.error === 'function') {
          this.options.error.call(this, 'Invalid JSON data');
          return false;
        } else {
          throw new Error('Invalid JSON response');
        }
      }
      if (response.meta.code !== 200) {
        if (this.options.error != null && typeof this.options.error === 'function') {
          this.options.error.call(this, response.meta.error_message);
          return false;
        } else {
          throw new Error('Error from Instagram: ' + response.meta.error_message);
        }
      }
      if (response.data.length === 0) {
        if (this.options.error != null && typeof this.options.error === 'function') {
          this.options.error.call(this, 'No images were returned from Instagram');
          return false;
        } else {
          throw new Error('No images were returned from Instagram');
        }
      }
      if (this.options.success != null && typeof this.options.success === 'function') {
        this.options.success.call(this, response);
      }
      this.context.nextUrl = '';
      if (response.pagination != null) {
        this.context.nextUrl = response.pagination.next_url;
      }
      if (this.options.sortBy !== 'none') {
        if (this.options.sortBy === 'random') {
          sortSettings = ['', 'random'];
        } else {
          sortSettings = this.options.sortBy.split('-');
        }
        reverse = sortSettings[0] === 'least' ? true : false;
        switch (sortSettings[1]) {
          case 'random':
            response.data.sort(function () {
              return 0.5 - Math.random();
            });
            break;
          case 'recent':
            response.data = this._sortBy(response.data, 'created_time', reverse);
            break;
          case 'liked':
            response.data = this._sortBy(response.data, 'likes.count', reverse);
            break;
          case 'commented':
            response.data = this._sortBy(response.data, 'comments.count', reverse);
            break;
          default:
            throw new Error('Invalid option for sortBy: \'' + this.options.sortBy + '\'.');
        }
      }
      if (typeof document !== 'undefined' && document !== null && this.options.mock === false) {
        images = response.data;
        if (this.options.limit != null) {
          if (images.length > this.options.limit) {
            images = images.slice(0, this.options.limit + 1 || 9000000000);
          }
        }
        fragment = document.createDocumentFragment();
        if (this.options.filter != null && typeof this.options.filter === 'function') {
          images = this._filter(images, this.options.filter);
        }
        if (this.options.template != null && typeof this.options.template === 'string') {
          htmlString = '';
          imageString = '';
          imgUrl = '';
          tmpEl = document.createElement('div');
          for (_i = 0, _len = images.length; _i < _len; _i++) {
            image = images[_i];
            imageUrl = image.images[this.options.resolution].url;
            if (!this.options.useHttp) {
              imageUrl = imageUrl.replace('http://', '//');
            }
            imageString = this._makeTemplate(this.options.template, {
              model: image,
              id: image.id,
              link: image.link,
              image: imageUrl,
              caption: this._getObjectProperty(image, 'caption.text'),
              likes: image.likes.count,
              comments: image.comments.count,
              location: this._getObjectProperty(image, 'location.name')
            });
            htmlString += imageString;
          }
          tmpEl.innerHTML = htmlString;
          _ref = [].slice.call(tmpEl.childNodes);
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            node = _ref[_j];
            fragment.appendChild(node);
          }
        } else {
          for (_k = 0, _len2 = images.length; _k < _len2; _k++) {
            image = images[_k];
            img = document.createElement('img');
            imageUrl = image.images[this.options.resolution].url;
            if (!this.options.useHttp) {
              imageUrl = imageUrl.replace('http://', '//');
            }
            img.src = imageUrl;
            if (this.options.links === true) {
              anchor = document.createElement('a');
              anchor.href = image.link;
              anchor.appendChild(img);
              fragment.appendChild(anchor);
            } else {
              fragment.appendChild(img);
            }
          }
        }
        document.getElementById(this.options.target).appendChild(fragment);
        header = document.getElementsByTagName('head')[0];
        header.removeChild(document.getElementById('instafeed-fetcher'));
        instanceName = 'instafeedCache' + this.unique;
        window[instanceName] = void 0;
        try {
          delete window[instanceName];
        } catch (e) {}
      }
      if (this.options.after != null && typeof this.options.after === 'function') {
        this.options.after.call(this);
      }
      return true;
    };

    Instafeed.prototype._buildUrl = function () {
      var base, endpoint, final;
      base = 'https://api.instagram.com/v1';
      switch (this.options.get) {
        case 'popular':
          endpoint = 'media/popular';
          break;
        case 'tagged':
          if (typeof this.options.tagName !== 'string') {
            throw new Error('No tag name specified. Use the \'tagName\' option.');
          }
          endpoint = 'tags/' + this.options.tagName + '/media/recent';
          break;
        case 'location':
          if (typeof this.options.locationId !== 'number') {
            throw new Error('No location specified. Use the \'locationId\' option.');
          }
          endpoint = 'locations/' + this.options.locationId + '/media/recent';
          break;
        case 'user':
          if (typeof this.options.userId !== 'number') {
            throw new Error('No user specified. Use the \'userId\' option.');
          }
          if (typeof this.options.accessToken !== 'string') {
            throw new Error('No access token. Use the \'accessToken\' option.');
          }
          endpoint = 'users/' + this.options.userId + '/media/recent';
          break;
        default:
          throw new Error('Invalid option for get: \'' + this.options.get + '\'.');
      }
      final = '' + base + '/' + endpoint;
      if (this.options.accessToken != null) {
        final += '?access_token=' + this.options.accessToken;
      } else {
        final += '?client_id=' + this.options.clientId;
      }
      if (this.options.limit != null) {
        final += '&count=' + this.options.limit;
      }
      final += '&callback=instafeedCache' + this.unique + '.parse';
      return final;
    };

    Instafeed.prototype._genKey = function () {
      var S4;
      S4 = function () {
        return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
      };
      return '' + S4() + S4() + S4() + S4();
    };

    Instafeed.prototype._makeTemplate = function (template, data) {
      var output, pattern, varName, varValue, _ref;
      pattern = /(?:\{{2})([\w\[\]\.]+)(?:\}{2})/;
      output = template;
      while (pattern.test(output)) {
        varName = output.match(pattern)[1];
        varValue = (_ref = this._getObjectProperty(data, varName)) != null ? _ref : '';
        output = output.replace(pattern, '' + varValue);
      }
      return output;
    };

    Instafeed.prototype._getObjectProperty = function (object, property) {
      var piece, pieces;
      property = property.replace(/\[(\w+)\]/g, '.$1');
      pieces = property.split('.');
      while (pieces.length) {
        piece = pieces.shift();
        if (object != null && piece in object) {
          object = object[piece];
        } else {
          return null;
        }
      }
      return object;
    };

    Instafeed.prototype._sortBy = function (data, property, reverse) {
      var sorter;
      sorter = function (a, b) {
        var valueA, valueB;
        valueA = this._getObjectProperty(a, property);
        valueB = this._getObjectProperty(b, property);
        if (reverse) {
          if (valueA > valueB) {
            return 1;
          } else {
            return -1;
          }
        }
        if (valueA < valueB) {
          return 1;
        } else {
          return -1;
        }
      };
      data.sort(sorter.bind(this));
      return data;
    };

    Instafeed.prototype._filter = function (images, filter) {
      var filteredImages, image, _fn, _i, _len;
      filteredImages = [];
      _fn = function (image) {
        if (filter(image)) {
          return filteredImages.push(image);
        }
      };
      for (_i = 0, _len = images.length; _i < _len; _i++) {
        image = images[_i];
        _fn(image);
      }
      return filteredImages;
    };

    return Instafeed;
  })();

  root = typeof exports !== 'undefined' && exports !== null ? exports : window;

  root.Instafeed = Instafeed;
}).call(undefined);

},{}],17:[function(require,module,exports){
'use strict';(function(global, factory){typeof exports === 'object' && typeof module !== 'undefined'?module.exports = factory():typeof define === 'function' && define.amd?define(factory):global.moment = factory();})(undefined, function(){'use strict';var hookCallback;function utils_hooks__hooks(){return hookCallback.apply(null, arguments);}function setHookCallback(callback){hookCallback = callback;}function isArray(input){return Object.prototype.toString.call(input) === '[object Array]';}function isDate(input){return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';}function map(arr, fn){var res=[], i;for(i = 0; i < arr.length; ++i) {res.push(fn(arr[i], i));}return res;}function hasOwnProp(a, b){return Object.prototype.hasOwnProperty.call(a, b);}function extend(a, b){for(var i in b) {if(hasOwnProp(b, i)){a[i] = b[i];}}if(hasOwnProp(b, 'toString')){a.toString = b.toString;}if(hasOwnProp(b, 'valueOf')){a.valueOf = b.valueOf;}return a;}function create_utc__createUTC(input, format, locale, strict){return createLocalOrUTC(input, format, locale, strict, true).utc();}function defaultParsingFlags(){return {empty:false, unusedTokens:[], unusedInput:[], overflow:-2, charsLeftOver:0, nullInput:false, invalidMonth:null, invalidFormat:false, userInvalidated:false, iso:false};}function getParsingFlags(m){if(m._pf == null){m._pf = defaultParsingFlags();}return m._pf;}function valid__isValid(m){if(m._isValid == null){var flags=getParsingFlags(m);m._isValid = !isNaN(m._d.getTime()) && flags.overflow < 0 && !flags.empty && !flags.invalidMonth && !flags.nullInput && !flags.invalidFormat && !flags.userInvalidated;if(m._strict){m._isValid = m._isValid && flags.charsLeftOver === 0 && flags.unusedTokens.length === 0 && flags.bigHour === undefined;}}return m._isValid;}function valid__createInvalid(flags){var m=create_utc__createUTC(NaN);if(flags != null){extend(getParsingFlags(m), flags);}else {getParsingFlags(m).userInvalidated = true;}return m;}var momentProperties=utils_hooks__hooks.momentProperties = [];function copyConfig(to, from){var i, prop, val;if(typeof from._isAMomentObject !== 'undefined'){to._isAMomentObject = from._isAMomentObject;}if(typeof from._i !== 'undefined'){to._i = from._i;}if(typeof from._f !== 'undefined'){to._f = from._f;}if(typeof from._l !== 'undefined'){to._l = from._l;}if(typeof from._strict !== 'undefined'){to._strict = from._strict;}if(typeof from._tzm !== 'undefined'){to._tzm = from._tzm;}if(typeof from._isUTC !== 'undefined'){to._isUTC = from._isUTC;}if(typeof from._offset !== 'undefined'){to._offset = from._offset;}if(typeof from._pf !== 'undefined'){to._pf = getParsingFlags(from);}if(typeof from._locale !== 'undefined'){to._locale = from._locale;}if(momentProperties.length > 0){for(i in momentProperties) {prop = momentProperties[i];val = from[prop];if(typeof val !== 'undefined'){to[prop] = val;}}}return to;}var updateInProgress=false;function Moment(config){copyConfig(this, config);this._d = new Date(+config._d);if(updateInProgress === false){updateInProgress = true;utils_hooks__hooks.updateOffset(this);updateInProgress = false;}}function isMoment(obj){return obj instanceof Moment || obj != null && obj._isAMomentObject != null;}function toInt(argumentForCoercion){var coercedNumber=+argumentForCoercion, value=0;if(coercedNumber !== 0 && isFinite(coercedNumber)){if(coercedNumber >= 0){value = Math.floor(coercedNumber);}else {value = Math.ceil(coercedNumber);}}return value;}function compareArrays(array1, array2, dontConvert){var len=Math.min(array1.length, array2.length), lengthDiff=Math.abs(array1.length - array2.length), diffs=0, i;for(i = 0; i < len; i++) {if(dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])){diffs++;}}return diffs + lengthDiff;}function Locale(){}var locales={};var globalLocale;function normalizeLocale(key){return key?key.toLowerCase().replace('_', '-'):key;}function chooseLocale(names){var i=0, j, next, locale, split;while(i < names.length) {split = normalizeLocale(names[i]).split('-');j = split.length;next = normalizeLocale(names[i + 1]);next = next?next.split('-'):null;while(j > 0) {locale = loadLocale(split.slice(0, j).join('-'));if(locale){return locale;}if(next && next.length >= j && compareArrays(split, next, true) >= j - 1){break;}j--;}i++;}return null;}function loadLocale(name){var oldLocale=null;if(!locales[name] && typeof module !== 'undefined' && module && module.exports){try{oldLocale = globalLocale._abbr;require('./locale/' + name);locale_locales__getSetGlobalLocale(oldLocale);}catch(e) {}}return locales[name];}function locale_locales__getSetGlobalLocale(key, values){var data;if(key){if(typeof values === 'undefined'){data = locale_locales__getLocale(key);}else {data = defineLocale(key, values);}if(data){globalLocale = data;}}return globalLocale._abbr;}function defineLocale(name, values){if(values !== null){values.abbr = name;if(!locales[name]){locales[name] = new Locale();}locales[name].set(values);locale_locales__getSetGlobalLocale(name);return locales[name];}else {delete locales[name];return null;}}function locale_locales__getLocale(key){var locale;if(key && key._locale && key._locale._abbr){key = key._locale._abbr;}if(!key){return globalLocale;}if(!isArray(key)){locale = loadLocale(key);if(locale){return locale;}key = [key];}return chooseLocale(key);}var aliases={};function addUnitAlias(unit, shorthand){var lowerCase=unit.toLowerCase();aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;}function normalizeUnits(units){return typeof units === 'string'?aliases[units] || aliases[units.toLowerCase()]:undefined;}function normalizeObjectUnits(inputObject){var normalizedInput={}, normalizedProp, prop;for(prop in inputObject) {if(hasOwnProp(inputObject, prop)){normalizedProp = normalizeUnits(prop);if(normalizedProp){normalizedInput[normalizedProp] = inputObject[prop];}}}return normalizedInput;}function makeGetSet(unit, keepTime){return function(value){if(value != null){get_set__set(this, unit, value);utils_hooks__hooks.updateOffset(this, keepTime);return this;}else {return get_set__get(this, unit);}};}function get_set__get(mom, unit){return mom._d['get' + (mom._isUTC?'UTC':'') + unit]();}function get_set__set(mom, unit, value){return mom._d['set' + (mom._isUTC?'UTC':'') + unit](value);}function getSet(units, value){var unit;if(typeof units === 'object'){for(unit in units) {this.set(unit, units[unit]);}}else {units = normalizeUnits(units);if(typeof this[units] === 'function'){return this[units](value);}}return this;}function zeroFill(number, targetLength, forceSign){var output='' + Math.abs(number), sign=number >= 0;while(output.length < targetLength) {output = '0' + output;}return (sign?forceSign?'+':'':'-') + output;}var formattingTokens=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g;var localFormattingTokens=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;var formatFunctions={};var formatTokenFunctions={};function addFormatToken(token, padded, ordinal, callback){var func=callback;if(typeof callback === 'string'){func = function(){return this[callback]();};}if(token){formatTokenFunctions[token] = func;}if(padded){formatTokenFunctions[padded[0]] = function(){return zeroFill(func.apply(this, arguments), padded[1], padded[2]);};}if(ordinal){formatTokenFunctions[ordinal] = function(){return this.localeData().ordinal(func.apply(this, arguments), token);};}}function removeFormattingTokens(input){if(input.match(/\[[\s\S]/)){return input.replace(/^\[|\]$/g, '');}return input.replace(/\\/g, '');}function makeFormatFunction(format){var array=format.match(formattingTokens), i, length;for(i = 0, length = array.length; i < length; i++) {if(formatTokenFunctions[array[i]]){array[i] = formatTokenFunctions[array[i]];}else {array[i] = removeFormattingTokens(array[i]);}}return function(mom){var output='';for(i = 0; i < length; i++) {output += array[i] instanceof Function?array[i].call(mom, format):array[i];}return output;};}function formatMoment(m, format){if(!m.isValid()){return m.localeData().invalidDate();}format = expandFormat(format, m.localeData());if(!formatFunctions[format]){formatFunctions[format] = makeFormatFunction(format);}return formatFunctions[format](m);}function expandFormat(format, locale){var i=5;function replaceLongDateFormatTokens(input){return locale.longDateFormat(input) || input;}localFormattingTokens.lastIndex = 0;while(i >= 0 && localFormattingTokens.test(format)) {format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);localFormattingTokens.lastIndex = 0;i -= 1;}return format;}var match1=/\d/;var match2=/\d\d/;var match3=/\d{3}/;var match4=/\d{4}/;var match6=/[+-]?\d{6}/;var match1to2=/\d\d?/;var match1to3=/\d{1,3}/;var match1to4=/\d{1,4}/;var match1to6=/[+-]?\d{1,6}/;var matchUnsigned=/\d+/;var matchSigned=/[+-]?\d+/;var matchOffset=/Z|[+-]\d\d:?\d\d/gi;var matchTimestamp=/[+-]?\d+(\.\d{1,3})?/;var matchWord=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;var regexes={};function addRegexToken(token, regex, strictRegex){regexes[token] = typeof regex === 'function'?regex:function(isStrict){return isStrict && strictRegex?strictRegex:regex;};}function getParseRegexForToken(token, config){if(!hasOwnProp(regexes, token)){return new RegExp(unescapeFormat(token));}return regexes[token](config._strict, config._locale);}function unescapeFormat(s){return s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(matched, p1, p2, p3, p4){return p1 || p2 || p3 || p4;}).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');}var tokens={};function addParseToken(token, callback){var i, func=callback;if(typeof token === 'string'){token = [token];}if(typeof callback === 'number'){func = function(input, array){array[callback] = toInt(input);};}for(i = 0; i < token.length; i++) {tokens[token[i]] = func;}}function addWeekParseToken(token, callback){addParseToken(token, function(input, array, config, token){config._w = config._w || {};callback(input, config._w, config, token);});}function addTimeToArrayFromToken(token, input, config){if(input != null && hasOwnProp(tokens, token)){tokens[token](input, config._a, config, token);}}var YEAR=0;var MONTH=1;var DATE=2;var HOUR=3;var MINUTE=4;var SECOND=5;var MILLISECOND=6;function daysInMonth(year, month){return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();}addFormatToken('M', ['MM', 2], 'Mo', function(){return this.month() + 1;});addFormatToken('MMM', 0, 0, function(format){return this.localeData().monthsShort(this, format);});addFormatToken('MMMM', 0, 0, function(format){return this.localeData().months(this, format);});addUnitAlias('month', 'M');addRegexToken('M', match1to2);addRegexToken('MM', match1to2, match2);addRegexToken('MMM', matchWord);addRegexToken('MMMM', matchWord);addParseToken(['M', 'MM'], function(input, array){array[MONTH] = toInt(input) - 1;});addParseToken(['MMM', 'MMMM'], function(input, array, config, token){var month=config._locale.monthsParse(input, token, config._strict);if(month != null){array[MONTH] = month;}else {getParsingFlags(config).invalidMonth = input;}});var defaultLocaleMonths='January_February_March_April_May_June_July_August_September_October_November_December'.split('_');function localeMonths(m){return this._months[m.month()];}var defaultLocaleMonthsShort='Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');function localeMonthsShort(m){return this._monthsShort[m.month()];}function localeMonthsParse(monthName, format, strict){var i, mom, regex;if(!this._monthsParse){this._monthsParse = [];this._longMonthsParse = [];this._shortMonthsParse = [];}for(i = 0; i < 12; i++) {mom = create_utc__createUTC([2000, i]);if(strict && !this._longMonthsParse[i]){this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');}if(!strict && !this._monthsParse[i]){regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');}if(strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)){return i;}else if(strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)){return i;}else if(!strict && this._monthsParse[i].test(monthName)){return i;}}}function setMonth(mom, value){var dayOfMonth;if(typeof value === 'string'){value = mom.localeData().monthsParse(value);if(typeof value !== 'number'){return mom;}}dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));mom._d['set' + (mom._isUTC?'UTC':'') + 'Month'](value, dayOfMonth);return mom;}function getSetMonth(value){if(value != null){setMonth(this, value);utils_hooks__hooks.updateOffset(this, true);return this;}else {return get_set__get(this, 'Month');}}function getDaysInMonth(){return daysInMonth(this.year(), this.month());}function checkOverflow(m){var overflow;var a=m._a;if(a && getParsingFlags(m).overflow === -2){overflow = a[MONTH] < 0 || a[MONTH] > 11?MONTH:a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH])?DATE:a[HOUR] < 0 || a[HOUR] > 24 || a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)?HOUR:a[MINUTE] < 0 || a[MINUTE] > 59?MINUTE:a[SECOND] < 0 || a[SECOND] > 59?SECOND:a[MILLISECOND] < 0 || a[MILLISECOND] > 999?MILLISECOND:-1;if(getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)){overflow = DATE;}getParsingFlags(m).overflow = overflow;}return m;}function warn(msg){if(utils_hooks__hooks.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn){console.warn('Deprecation warning: ' + msg);}}function deprecate(msg, fn){var firstTime=true, msgWithStack=msg + '\n' + new Error().stack;return extend(function(){if(firstTime){warn(msgWithStack);firstTime = false;}return fn.apply(this, arguments);}, fn);}var deprecations={};function deprecateSimple(name, msg){if(!deprecations[name]){warn(msg);deprecations[name] = true;}}utils_hooks__hooks.suppressDeprecationWarnings = false;var from_string__isoRegex=/^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;var isoDates=[['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/], ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/], ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/], ['GGGG-[W]WW', /\d{4}-W\d{2}/], ['YYYY-DDD', /\d{4}-\d{3}/]];var isoTimes=[['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/], ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/], ['HH:mm', /(T| )\d\d:\d\d/], ['HH', /(T| )\d\d/]];var aspNetJsonRegex=/^\/?Date\((\-?\d+)/i;function configFromISO(config){var i, l, string=config._i, match=from_string__isoRegex.exec(string);if(match){getParsingFlags(config).iso = true;for(i = 0, l = isoDates.length; i < l; i++) {if(isoDates[i][1].exec(string)){config._f = isoDates[i][0] + (match[6] || ' ');break;}}for(i = 0, l = isoTimes.length; i < l; i++) {if(isoTimes[i][1].exec(string)){config._f += isoTimes[i][0];break;}}if(string.match(matchOffset)){config._f += 'Z';}configFromStringAndFormat(config);}else {config._isValid = false;}}function configFromString(config){var matched=aspNetJsonRegex.exec(config._i);if(matched !== null){config._d = new Date(+matched[1]);return;}configFromISO(config);if(config._isValid === false){delete config._isValid;utils_hooks__hooks.createFromInputFallback(config);}}utils_hooks__hooks.createFromInputFallback = deprecate('moment construction falls back to js Date. This is ' + 'discouraged and will be removed in upcoming major ' + 'release. Please refer to ' + 'https://github.com/moment/moment/issues/1407 for more info.', function(config){config._d = new Date(config._i + (config._useUTC?' UTC':''));});function createDate(y, m, d, h, M, s, ms){var date=new Date(y, m, d, h, M, s, ms);if(y < 1970){date.setFullYear(y);}return date;}function createUTCDate(y){var date=new Date(Date.UTC.apply(null, arguments));if(y < 1970){date.setUTCFullYear(y);}return date;}addFormatToken(0, ['YY', 2], 0, function(){return this.year() % 100;});addFormatToken(0, ['YYYY', 4], 0, 'year');addFormatToken(0, ['YYYYY', 5], 0, 'year');addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');addUnitAlias('year', 'y');addRegexToken('Y', matchSigned);addRegexToken('YY', match1to2, match2);addRegexToken('YYYY', match1to4, match4);addRegexToken('YYYYY', match1to6, match6);addRegexToken('YYYYYY', match1to6, match6);addParseToken(['YYYY', 'YYYYY', 'YYYYYY'], YEAR);addParseToken('YY', function(input, array){array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);});function daysInYear(year){return isLeapYear(year)?366:365;}function isLeapYear(year){return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;}utils_hooks__hooks.parseTwoDigitYear = function(input){return toInt(input) + (toInt(input) > 68?1900:2000);};var getSetYear=makeGetSet('FullYear', false);function getIsLeapYear(){return isLeapYear(this.year());}addFormatToken('w', ['ww', 2], 'wo', 'week');addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');addUnitAlias('week', 'w');addUnitAlias('isoWeek', 'W');addRegexToken('w', match1to2);addRegexToken('ww', match1to2, match2);addRegexToken('W', match1to2);addRegexToken('WW', match1to2, match2);addWeekParseToken(['w', 'ww', 'W', 'WW'], function(input, week, config, token){week[token.substr(0, 1)] = toInt(input);});function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear){var end=firstDayOfWeekOfYear - firstDayOfWeek, daysToDayOfWeek=firstDayOfWeekOfYear - mom.day(), adjustedMoment;if(daysToDayOfWeek > end){daysToDayOfWeek -= 7;}if(daysToDayOfWeek < end - 7){daysToDayOfWeek += 7;}adjustedMoment = local__createLocal(mom).add(daysToDayOfWeek, 'd');return {week:Math.ceil(adjustedMoment.dayOfYear() / 7), year:adjustedMoment.year()};}function localeWeek(mom){return weekOfYear(mom, this._week.dow, this._week.doy).week;}var defaultLocaleWeek={dow:0, doy:6};function localeFirstDayOfWeek(){return this._week.dow;}function localeFirstDayOfYear(){return this._week.doy;}function getSetWeek(input){var week=this.localeData().week(this);return input == null?week:this.add((input - week) * 7, 'd');}function getSetISOWeek(input){var week=weekOfYear(this, 1, 4).week;return input == null?week:this.add((input - week) * 7, 'd');}addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');addUnitAlias('dayOfYear', 'DDD');addRegexToken('DDD', match1to3);addRegexToken('DDDD', match3);addParseToken(['DDD', 'DDDD'], function(input, array, config){config._dayOfYear = toInt(input);});function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek){var d=createUTCDate(year, 0, 1).getUTCDay();var daysToAdd;var dayOfYear;d = d === 0?7:d;weekday = weekday != null?weekday:firstDayOfWeek;daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear?7:0) - (d < firstDayOfWeek?7:0);dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;return {year:dayOfYear > 0?year:year - 1, dayOfYear:dayOfYear > 0?dayOfYear:daysInYear(year - 1) + dayOfYear};}function getSetDayOfYear(input){var dayOfYear=Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 86400000) + 1;return input == null?dayOfYear:this.add(input - dayOfYear, 'd');}function defaults(a, b, c){if(a != null){return a;}if(b != null){return b;}return c;}function currentDateArray(config){var now=new Date();if(config._useUTC){return [now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()];}return [now.getFullYear(), now.getMonth(), now.getDate()];}function configFromArray(config){var i, date, input=[], currentDate, yearToUse;if(config._d){return;}currentDate = currentDateArray(config);if(config._w && config._a[DATE] == null && config._a[MONTH] == null){dayOfYearFromWeekInfo(config);}if(config._dayOfYear){yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);if(config._dayOfYear > daysInYear(yearToUse)){getParsingFlags(config)._overflowDayOfYear = true;}date = createUTCDate(yearToUse, 0, config._dayOfYear);config._a[MONTH] = date.getUTCMonth();config._a[DATE] = date.getUTCDate();}for(i = 0; i < 3 && config._a[i] == null; ++i) {config._a[i] = input[i] = currentDate[i];}for(; i < 7; i++) {config._a[i] = input[i] = config._a[i] == null?i === 2?1:0:config._a[i];}if(config._a[HOUR] === 24 && config._a[MINUTE] === 0 && config._a[SECOND] === 0 && config._a[MILLISECOND] === 0){config._nextDay = true;config._a[HOUR] = 0;}config._d = (config._useUTC?createUTCDate:createDate).apply(null, input);if(config._tzm != null){config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);}if(config._nextDay){config._a[HOUR] = 24;}}function dayOfYearFromWeekInfo(config){var w, weekYear, week, weekday, dow, doy, temp;w = config._w;if(w.GG != null || w.W != null || w.E != null){dow = 1;doy = 4;weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);week = defaults(w.W, 1);weekday = defaults(w.E, 1);}else {dow = config._locale._week.dow;doy = config._locale._week.doy;weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);week = defaults(w.w, 1);if(w.d != null){weekday = w.d;if(weekday < dow){++week;}}else if(w.e != null){weekday = w.e + dow;}else {weekday = dow;}}temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);config._a[YEAR] = temp.year;config._dayOfYear = temp.dayOfYear;}utils_hooks__hooks.ISO_8601 = function(){};function configFromStringAndFormat(config){if(config._f === utils_hooks__hooks.ISO_8601){configFromISO(config);return;}config._a = [];getParsingFlags(config).empty = true;var string='' + config._i, i, parsedInput, tokens, token, skipped, stringLength=string.length, totalParsedInputLength=0;tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];for(i = 0; i < tokens.length; i++) {token = tokens[i];parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];if(parsedInput){skipped = string.substr(0, string.indexOf(parsedInput));if(skipped.length > 0){getParsingFlags(config).unusedInput.push(skipped);}string = string.slice(string.indexOf(parsedInput) + parsedInput.length);totalParsedInputLength += parsedInput.length;}if(formatTokenFunctions[token]){if(parsedInput){getParsingFlags(config).empty = false;}else {getParsingFlags(config).unusedTokens.push(token);}addTimeToArrayFromToken(token, parsedInput, config);}else if(config._strict && !parsedInput){getParsingFlags(config).unusedTokens.push(token);}}getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;if(string.length > 0){getParsingFlags(config).unusedInput.push(string);}if(getParsingFlags(config).bigHour === true && config._a[HOUR] <= 12 && config._a[HOUR] > 0){getParsingFlags(config).bigHour = undefined;}config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);configFromArray(config);checkOverflow(config);}function meridiemFixWrap(locale, hour, meridiem){var isPm;if(meridiem == null){return hour;}if(locale.meridiemHour != null){return locale.meridiemHour(hour, meridiem);}else if(locale.isPM != null){isPm = locale.isPM(meridiem);if(isPm && hour < 12){hour += 12;}if(!isPm && hour === 12){hour = 0;}return hour;}else {return hour;}}function configFromStringAndArray(config){var tempConfig, bestMoment, scoreToBeat, i, currentScore;if(config._f.length === 0){getParsingFlags(config).invalidFormat = true;config._d = new Date(NaN);return;}for(i = 0; i < config._f.length; i++) {currentScore = 0;tempConfig = copyConfig({}, config);if(config._useUTC != null){tempConfig._useUTC = config._useUTC;}tempConfig._f = config._f[i];configFromStringAndFormat(tempConfig);if(!valid__isValid(tempConfig)){continue;}currentScore += getParsingFlags(tempConfig).charsLeftOver;currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;getParsingFlags(tempConfig).score = currentScore;if(scoreToBeat == null || currentScore < scoreToBeat){scoreToBeat = currentScore;bestMoment = tempConfig;}}extend(config, bestMoment || tempConfig);}function configFromObject(config){if(config._d){return;}var i=normalizeObjectUnits(config._i);config._a = [i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond];configFromArray(config);}function createFromConfig(config){var input=config._i, format=config._f, res;config._locale = config._locale || locale_locales__getLocale(config._l);if(input === null || format === undefined && input === ''){return valid__createInvalid({nullInput:true});}if(typeof input === 'string'){config._i = input = config._locale.preparse(input);}if(isMoment(input)){return new Moment(checkOverflow(input));}else if(isArray(format)){configFromStringAndArray(config);}else if(format){configFromStringAndFormat(config);}else if(isDate(input)){config._d = input;}else {configFromInput(config);}res = new Moment(checkOverflow(config));if(res._nextDay){res.add(1, 'd');res._nextDay = undefined;}return res;}function configFromInput(config){var input=config._i;if(input === undefined){config._d = new Date();}else if(isDate(input)){config._d = new Date(+input);}else if(typeof input === 'string'){configFromString(config);}else if(isArray(input)){config._a = map(input.slice(0), function(obj){return parseInt(obj, 10);});configFromArray(config);}else if(typeof input === 'object'){configFromObject(config);}else if(typeof input === 'number'){config._d = new Date(input);}else {utils_hooks__hooks.createFromInputFallback(config);}}function createLocalOrUTC(input, format, locale, strict, isUTC){var c={};if(typeof locale === 'boolean'){strict = locale;locale = undefined;}c._isAMomentObject = true;c._useUTC = c._isUTC = isUTC;c._l = locale;c._i = input;c._f = format;c._strict = strict;return createFromConfig(c);}function local__createLocal(input, format, locale, strict){return createLocalOrUTC(input, format, locale, strict, false);}var prototypeMin=deprecate('moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548', function(){var other=local__createLocal.apply(null, arguments);return other < this?this:other;});var prototypeMax=deprecate('moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548', function(){var other=local__createLocal.apply(null, arguments);return other > this?this:other;});function pickBy(fn, moments){var res, i;if(moments.length === 1 && isArray(moments[0])){moments = moments[0];}if(!moments.length){return local__createLocal();}res = moments[0];for(i = 1; i < moments.length; ++i) {if(moments[i][fn](res)){res = moments[i];}}return res;}function min(){var args=[].slice.call(arguments, 0);return pickBy('isBefore', args);}function max(){var args=[].slice.call(arguments, 0);return pickBy('isAfter', args);}function Duration(duration){var normalizedInput=normalizeObjectUnits(duration), years=normalizedInput.year || 0, quarters=normalizedInput.quarter || 0, months=normalizedInput.month || 0, weeks=normalizedInput.week || 0, days=normalizedInput.day || 0, hours=normalizedInput.hour || 0, minutes=normalizedInput.minute || 0, seconds=normalizedInput.second || 0, milliseconds=normalizedInput.millisecond || 0;this._milliseconds = +milliseconds + seconds * 1000 + minutes * 60000 + hours * 3600000;this._days = +days + weeks * 7;this._months = +months + quarters * 3 + years * 12;this._data = {};this._locale = locale_locales__getLocale();this._bubble();}function isDuration(obj){return obj instanceof Duration;}function offset(token, separator){addFormatToken(token, 0, 0, function(){var offset=this.utcOffset();var sign='+';if(offset < 0){offset = -offset;sign = '-';}return sign + zeroFill(~ ~(offset / 60), 2) + separator + zeroFill(~ ~offset % 60, 2);});}offset('Z', ':');offset('ZZ', '');addRegexToken('Z', matchOffset);addRegexToken('ZZ', matchOffset);addParseToken(['Z', 'ZZ'], function(input, array, config){config._useUTC = true;config._tzm = offsetFromString(input);});var chunkOffset=/([\+\-]|\d\d)/gi;function offsetFromString(string){var matches=(string || '').match(matchOffset) || [];var chunk=matches[matches.length - 1] || [];var parts=(chunk + '').match(chunkOffset) || ['-', 0, 0];var minutes=+(parts[1] * 60) + toInt(parts[2]);return parts[0] === '+'?minutes:-minutes;}function cloneWithOffset(input, model){var res, diff;if(model._isUTC){res = model.clone();diff = (isMoment(input) || isDate(input)?+input:+local__createLocal(input)) - +res;res._d.setTime(+res._d + diff);utils_hooks__hooks.updateOffset(res, false);return res;}else {return local__createLocal(input).local();}return model._isUTC?local__createLocal(input).zone(model._offset || 0):local__createLocal(input).local();}function getDateOffset(m){return -Math.round(m._d.getTimezoneOffset() / 15) * 15;}utils_hooks__hooks.updateOffset = function(){};function getSetOffset(input, keepLocalTime){var offset=this._offset || 0, localAdjust;if(input != null){if(typeof input === 'string'){input = offsetFromString(input);}if(Math.abs(input) < 16){input = input * 60;}if(!this._isUTC && keepLocalTime){localAdjust = getDateOffset(this);}this._offset = input;this._isUTC = true;if(localAdjust != null){this.add(localAdjust, 'm');}if(offset !== input){if(!keepLocalTime || this._changeInProgress){add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);}else if(!this._changeInProgress){this._changeInProgress = true;utils_hooks__hooks.updateOffset(this, true);this._changeInProgress = null;}}return this;}else {return this._isUTC?offset:getDateOffset(this);}}function getSetZone(input, keepLocalTime){if(input != null){if(typeof input !== 'string'){input = -input;}this.utcOffset(input, keepLocalTime);return this;}else {return -this.utcOffset();}}function setOffsetToUTC(keepLocalTime){return this.utcOffset(0, keepLocalTime);}function setOffsetToLocal(keepLocalTime){if(this._isUTC){this.utcOffset(0, keepLocalTime);this._isUTC = false;if(keepLocalTime){this.subtract(getDateOffset(this), 'm');}}return this;}function setOffsetToParsedOffset(){if(this._tzm){this.utcOffset(this._tzm);}else if(typeof this._i === 'string'){this.utcOffset(offsetFromString(this._i));}return this;}function hasAlignedHourOffset(input){if(!input){input = 0;}else {input = local__createLocal(input).utcOffset();}return (this.utcOffset() - input) % 60 === 0;}function isDaylightSavingTime(){return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();}function isDaylightSavingTimeShifted(){if(this._a){var other=this._isUTC?create_utc__createUTC(this._a):local__createLocal(this._a);return this.isValid() && compareArrays(this._a, other.toArray()) > 0;}return false;}function isLocal(){return !this._isUTC;}function isUtcOffset(){return this._isUTC;}function isUtc(){return this._isUTC && this._offset === 0;}var aspNetRegex=/(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/;var create__isoRegex=/^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;function create__createDuration(input, key){var duration=input, match=null, sign, ret, diffRes;if(isDuration(input)){duration = {ms:input._milliseconds, d:input._days, M:input._months};}else if(typeof input === 'number'){duration = {};if(key){duration[key] = input;}else {duration.milliseconds = input;}}else if(!!(match = aspNetRegex.exec(input))){sign = match[1] === '-'?-1:1;duration = {y:0, d:toInt(match[DATE]) * sign, h:toInt(match[HOUR]) * sign, m:toInt(match[MINUTE]) * sign, s:toInt(match[SECOND]) * sign, ms:toInt(match[MILLISECOND]) * sign};}else if(!!(match = create__isoRegex.exec(input))){sign = match[1] === '-'?-1:1;duration = {y:parseIso(match[2], sign), M:parseIso(match[3], sign), d:parseIso(match[4], sign), h:parseIso(match[5], sign), m:parseIso(match[6], sign), s:parseIso(match[7], sign), w:parseIso(match[8], sign)};}else if(duration == null){duration = {};}else if(typeof duration === 'object' && ('from' in duration || 'to' in duration)){diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));duration = {};duration.ms = diffRes.milliseconds;duration.M = diffRes.months;}ret = new Duration(duration);if(isDuration(input) && hasOwnProp(input, '_locale')){ret._locale = input._locale;}return ret;}create__createDuration.fn = Duration.prototype;function parseIso(inp, sign){var res=inp && parseFloat(inp.replace(',', '.'));return (isNaN(res)?0:res) * sign;}function positiveMomentsDifference(base, other){var res={milliseconds:0, months:0};res.months = other.month() - base.month() + (other.year() - base.year()) * 12;if(base.clone().add(res.months, 'M').isAfter(other)){--res.months;}res.milliseconds = +other - +base.clone().add(res.months, 'M');return res;}function momentsDifference(base, other){var res;other = cloneWithOffset(other, base);if(base.isBefore(other)){res = positiveMomentsDifference(base, other);}else {res = positiveMomentsDifference(other, base);res.milliseconds = -res.milliseconds;res.months = -res.months;}return res;}function createAdder(direction, name){return function(val, period){var dur, tmp;if(period !== null && !isNaN(+period)){deprecateSimple(name, 'moment().' + name + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');tmp = val;val = period;period = tmp;}val = typeof val === 'string'?+val:val;dur = create__createDuration(val, period);add_subtract__addSubtract(this, dur, direction);return this;};}function add_subtract__addSubtract(mom, duration, isAdding, updateOffset){var milliseconds=duration._milliseconds, days=duration._days, months=duration._months;updateOffset = updateOffset == null?true:updateOffset;if(milliseconds){mom._d.setTime(+mom._d + milliseconds * isAdding);}if(days){get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);}if(months){setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);}if(updateOffset){utils_hooks__hooks.updateOffset(mom, days || months);}}var add_subtract__add=createAdder(1, 'add');var add_subtract__subtract=createAdder(-1, 'subtract');function moment_calendar__calendar(time){var now=time || local__createLocal(), sod=cloneWithOffset(now, this).startOf('day'), diff=this.diff(sod, 'days', true), format=diff < -6?'sameElse':diff < -1?'lastWeek':diff < 0?'lastDay':diff < 1?'sameDay':diff < 2?'nextDay':diff < 7?'nextWeek':'sameElse';return this.format(this.localeData().calendar(format, this, local__createLocal(now)));}function clone(){return new Moment(this);}function isAfter(input, units){var inputMs;units = normalizeUnits(typeof units !== 'undefined'?units:'millisecond');if(units === 'millisecond'){input = isMoment(input)?input:local__createLocal(input);return +this > +input;}else {inputMs = isMoment(input)?+input:+local__createLocal(input);return inputMs < +this.clone().startOf(units);}}function isBefore(input, units){var inputMs;units = normalizeUnits(typeof units !== 'undefined'?units:'millisecond');if(units === 'millisecond'){input = isMoment(input)?input:local__createLocal(input);return +this < +input;}else {inputMs = isMoment(input)?+input:+local__createLocal(input);return +this.clone().endOf(units) < inputMs;}}function isBetween(from, to, units){return this.isAfter(from, units) && this.isBefore(to, units);}function isSame(input, units){var inputMs;units = normalizeUnits(units || 'millisecond');if(units === 'millisecond'){input = isMoment(input)?input:local__createLocal(input);return +this === +input;}else {inputMs = +local__createLocal(input);return +this.clone().startOf(units) <= inputMs && inputMs <= +this.clone().endOf(units);}}function absFloor(number){if(number < 0){return Math.ceil(number);}else {return Math.floor(number);}}function diff(input, units, asFloat){var that=cloneWithOffset(input, this), zoneDelta=(that.utcOffset() - this.utcOffset()) * 60000, delta, output;units = normalizeUnits(units);if(units === 'year' || units === 'month' || units === 'quarter'){output = monthDiff(this, that);if(units === 'quarter'){output = output / 3;}else if(units === 'year'){output = output / 12;}}else {delta = this - that;output = units === 'second'?delta / 1000:units === 'minute'?delta / 60000:units === 'hour'?delta / 3600000:units === 'day'?(delta - zoneDelta) / 86400000:units === 'week'?(delta - zoneDelta) / 604800000:delta;}return asFloat?output:absFloor(output);}function monthDiff(a, b){var wholeMonthDiff=(b.year() - a.year()) * 12 + (b.month() - a.month()), anchor=a.clone().add(wholeMonthDiff, 'months'), anchor2, adjust;if(b - anchor < 0){anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');adjust = (b - anchor) / (anchor - anchor2);}else {anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');adjust = (b - anchor) / (anchor2 - anchor);}return -(wholeMonthDiff + adjust);}utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';function toString(){return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');}function moment_format__toISOString(){var m=this.clone().utc();if(0 < m.year() && m.year() <= 9999){if('function' === typeof Date.prototype.toISOString){return this.toDate().toISOString();}else {return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');}}else {return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');}}function format(inputString){var output=formatMoment(this, inputString || utils_hooks__hooks.defaultFormat);return this.localeData().postformat(output);}function from(time, withoutSuffix){if(!this.isValid()){return this.localeData().invalidDate();}return create__createDuration({to:this, from:time}).locale(this.locale()).humanize(!withoutSuffix);}function fromNow(withoutSuffix){return this.from(local__createLocal(), withoutSuffix);}function to(time, withoutSuffix){if(!this.isValid()){return this.localeData().invalidDate();}return create__createDuration({from:this, to:time}).locale(this.locale()).humanize(!withoutSuffix);}function toNow(withoutSuffix){return this.to(local__createLocal(), withoutSuffix);}function locale(key){var newLocaleData;if(key === undefined){return this._locale._abbr;}else {newLocaleData = locale_locales__getLocale(key);if(newLocaleData != null){this._locale = newLocaleData;}return this;}}var lang=deprecate('moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.', function(key){if(key === undefined){return this.localeData();}else {return this.locale(key);}});function localeData(){return this._locale;}function startOf(units){units = normalizeUnits(units);switch(units){case 'year':this.month(0);case 'quarter':case 'month':this.date(1);case 'week':case 'isoWeek':case 'day':this.hours(0);case 'hour':this.minutes(0);case 'minute':this.seconds(0);case 'second':this.milliseconds(0);}if(units === 'week'){this.weekday(0);}if(units === 'isoWeek'){this.isoWeekday(1);}if(units === 'quarter'){this.month(Math.floor(this.month() / 3) * 3);}return this;}function endOf(units){units = normalizeUnits(units);if(units === undefined || units === 'millisecond'){return this;}return this.startOf(units).add(1, units === 'isoWeek'?'week':units).subtract(1, 'ms');}function to_type__valueOf(){return +this._d - (this._offset || 0) * 60000;}function unix(){return Math.floor(+this / 1000);}function toDate(){return this._offset?new Date(+this):this._d;}function toArray(){var m=this;return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];}function moment_valid__isValid(){return valid__isValid(this);}function parsingFlags(){return extend({}, getParsingFlags(this));}function invalidAt(){return getParsingFlags(this).overflow;}addFormatToken(0, ['gg', 2], 0, function(){return this.weekYear() % 100;});addFormatToken(0, ['GG', 2], 0, function(){return this.isoWeekYear() % 100;});function addWeekYearFormatToken(token, getter){addFormatToken(0, [token, token.length], 0, getter);}addWeekYearFormatToken('gggg', 'weekYear');addWeekYearFormatToken('ggggg', 'weekYear');addWeekYearFormatToken('GGGG', 'isoWeekYear');addWeekYearFormatToken('GGGGG', 'isoWeekYear');addUnitAlias('weekYear', 'gg');addUnitAlias('isoWeekYear', 'GG');addRegexToken('G', matchSigned);addRegexToken('g', matchSigned);addRegexToken('GG', match1to2, match2);addRegexToken('gg', match1to2, match2);addRegexToken('GGGG', match1to4, match4);addRegexToken('gggg', match1to4, match4);addRegexToken('GGGGG', match1to6, match6);addRegexToken('ggggg', match1to6, match6);addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function(input, week, config, token){week[token.substr(0, 2)] = toInt(input);});addWeekParseToken(['gg', 'GG'], function(input, week, config, token){week[token] = utils_hooks__hooks.parseTwoDigitYear(input);});function weeksInYear(year, dow, doy){return weekOfYear(local__createLocal([year, 11, 31 + dow - doy]), dow, doy).week;}function getSetWeekYear(input){var year=weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;return input == null?year:this.add(input - year, 'y');}function getSetISOWeekYear(input){var year=weekOfYear(this, 1, 4).year;return input == null?year:this.add(input - year, 'y');}function getISOWeeksInYear(){return weeksInYear(this.year(), 1, 4);}function getWeeksInYear(){var weekInfo=this.localeData()._week;return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);}addFormatToken('Q', 0, 0, 'quarter');addUnitAlias('quarter', 'Q');addRegexToken('Q', match1);addParseToken('Q', function(input, array){array[MONTH] = (toInt(input) - 1) * 3;});function getSetQuarter(input){return input == null?Math.ceil((this.month() + 1) / 3):this.month((input - 1) * 3 + this.month() % 3);}addFormatToken('D', ['DD', 2], 'Do', 'date');addUnitAlias('date', 'D');addRegexToken('D', match1to2);addRegexToken('DD', match1to2, match2);addRegexToken('Do', function(isStrict, locale){return isStrict?locale._ordinalParse:locale._ordinalParseLenient;});addParseToken(['D', 'DD'], DATE);addParseToken('Do', function(input, array){array[DATE] = toInt(input.match(match1to2)[0], 10);});var getSetDayOfMonth=makeGetSet('Date', true);addFormatToken('d', 0, 'do', 'day');addFormatToken('dd', 0, 0, function(format){return this.localeData().weekdaysMin(this, format);});addFormatToken('ddd', 0, 0, function(format){return this.localeData().weekdaysShort(this, format);});addFormatToken('dddd', 0, 0, function(format){return this.localeData().weekdays(this, format);});addFormatToken('e', 0, 0, 'weekday');addFormatToken('E', 0, 0, 'isoWeekday');addUnitAlias('day', 'd');addUnitAlias('weekday', 'e');addUnitAlias('isoWeekday', 'E');addRegexToken('d', match1to2);addRegexToken('e', match1to2);addRegexToken('E', match1to2);addRegexToken('dd', matchWord);addRegexToken('ddd', matchWord);addRegexToken('dddd', matchWord);addWeekParseToken(['dd', 'ddd', 'dddd'], function(input, week, config){var weekday=config._locale.weekdaysParse(input);if(weekday != null){week.d = weekday;}else {getParsingFlags(config).invalidWeekday = input;}});addWeekParseToken(['d', 'e', 'E'], function(input, week, config, token){week[token] = toInt(input);});function parseWeekday(input, locale){if(typeof input === 'string'){if(!isNaN(input)){input = parseInt(input, 10);}else {input = locale.weekdaysParse(input);if(typeof input !== 'number'){return null;}}}return input;}var defaultLocaleWeekdays='Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');function localeWeekdays(m){return this._weekdays[m.day()];}var defaultLocaleWeekdaysShort='Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');function localeWeekdaysShort(m){return this._weekdaysShort[m.day()];}var defaultLocaleWeekdaysMin='Su_Mo_Tu_We_Th_Fr_Sa'.split('_');function localeWeekdaysMin(m){return this._weekdaysMin[m.day()];}function localeWeekdaysParse(weekdayName){var i, mom, regex;if(!this._weekdaysParse){this._weekdaysParse = [];}for(i = 0; i < 7; i++) {if(!this._weekdaysParse[i]){mom = local__createLocal([2000, 1]).day(i);regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');}if(this._weekdaysParse[i].test(weekdayName)){return i;}}}function getSetDayOfWeek(input){var day=this._isUTC?this._d.getUTCDay():this._d.getDay();if(input != null){input = parseWeekday(input, this.localeData());return this.add(input - day, 'd');}else {return day;}}function getSetLocaleDayOfWeek(input){var weekday=(this.day() + 7 - this.localeData()._week.dow) % 7;return input == null?weekday:this.add(input - weekday, 'd');}function getSetISODayOfWeek(input){return input == null?this.day() || 7:this.day(this.day() % 7?input:input - 7);}addFormatToken('H', ['HH', 2], 0, 'hour');addFormatToken('h', ['hh', 2], 0, function(){return this.hours() % 12 || 12;});function meridiem(token, lowercase){addFormatToken(token, 0, 0, function(){return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);});}meridiem('a', true);meridiem('A', false);addUnitAlias('hour', 'h');function matchMeridiem(isStrict, locale){return locale._meridiemParse;}addRegexToken('a', matchMeridiem);addRegexToken('A', matchMeridiem);addRegexToken('H', match1to2);addRegexToken('h', match1to2);addRegexToken('HH', match1to2, match2);addRegexToken('hh', match1to2, match2);addParseToken(['H', 'HH'], HOUR);addParseToken(['a', 'A'], function(input, array, config){config._isPm = config._locale.isPM(input);config._meridiem = input;});addParseToken(['h', 'hh'], function(input, array, config){array[HOUR] = toInt(input);getParsingFlags(config).bigHour = true;});function localeIsPM(input){return (input + '').toLowerCase().charAt(0) === 'p';}var defaultLocaleMeridiemParse=/[ap]\.?m?\.?/i;function localeMeridiem(hours, minutes, isLower){if(hours > 11){return isLower?'pm':'PM';}else {return isLower?'am':'AM';}}var getSetHour=makeGetSet('Hours', true);addFormatToken('m', ['mm', 2], 0, 'minute');addUnitAlias('minute', 'm');addRegexToken('m', match1to2);addRegexToken('mm', match1to2, match2);addParseToken(['m', 'mm'], MINUTE);var getSetMinute=makeGetSet('Minutes', false);addFormatToken('s', ['ss', 2], 0, 'second');addUnitAlias('second', 's');addRegexToken('s', match1to2);addRegexToken('ss', match1to2, match2);addParseToken(['s', 'ss'], SECOND);var getSetSecond=makeGetSet('Seconds', false);addFormatToken('S', 0, 0, function(){return ~ ~(this.millisecond() / 100);});addFormatToken(0, ['SS', 2], 0, function(){return ~ ~(this.millisecond() / 10);});function millisecond__milliseconds(token){addFormatToken(0, [token, 3], 0, 'millisecond');}millisecond__milliseconds('SSS');millisecond__milliseconds('SSSS');addUnitAlias('millisecond', 'ms');addRegexToken('S', match1to3, match1);addRegexToken('SS', match1to3, match2);addRegexToken('SSS', match1to3, match3);addRegexToken('SSSS', matchUnsigned);addParseToken(['S', 'SS', 'SSS', 'SSSS'], function(input, array){array[MILLISECOND] = toInt(('0.' + input) * 1000);});var getSetMillisecond=makeGetSet('Milliseconds', false);addFormatToken('z', 0, 0, 'zoneAbbr');addFormatToken('zz', 0, 0, 'zoneName');function getZoneAbbr(){return this._isUTC?'UTC':'';}function getZoneName(){return this._isUTC?'Coordinated Universal Time':'';}var momentPrototype__proto=Moment.prototype;momentPrototype__proto.add = add_subtract__add;momentPrototype__proto.calendar = moment_calendar__calendar;momentPrototype__proto.clone = clone;momentPrototype__proto.diff = diff;momentPrototype__proto.endOf = endOf;momentPrototype__proto.format = format;momentPrototype__proto.from = from;momentPrototype__proto.fromNow = fromNow;momentPrototype__proto.to = to;momentPrototype__proto.toNow = toNow;momentPrototype__proto.get = getSet;momentPrototype__proto.invalidAt = invalidAt;momentPrototype__proto.isAfter = isAfter;momentPrototype__proto.isBefore = isBefore;momentPrototype__proto.isBetween = isBetween;momentPrototype__proto.isSame = isSame;momentPrototype__proto.isValid = moment_valid__isValid;momentPrototype__proto.lang = lang;momentPrototype__proto.locale = locale;momentPrototype__proto.localeData = localeData;momentPrototype__proto.max = prototypeMax;momentPrototype__proto.min = prototypeMin;momentPrototype__proto.parsingFlags = parsingFlags;momentPrototype__proto.set = getSet;momentPrototype__proto.startOf = startOf;momentPrototype__proto.subtract = add_subtract__subtract;momentPrototype__proto.toArray = toArray;momentPrototype__proto.toDate = toDate;momentPrototype__proto.toISOString = moment_format__toISOString;momentPrototype__proto.toJSON = moment_format__toISOString;momentPrototype__proto.toString = toString;momentPrototype__proto.unix = unix;momentPrototype__proto.valueOf = to_type__valueOf;momentPrototype__proto.year = getSetYear;momentPrototype__proto.isLeapYear = getIsLeapYear;momentPrototype__proto.weekYear = getSetWeekYear;momentPrototype__proto.isoWeekYear = getSetISOWeekYear;momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;momentPrototype__proto.month = getSetMonth;momentPrototype__proto.daysInMonth = getDaysInMonth;momentPrototype__proto.week = momentPrototype__proto.weeks = getSetWeek;momentPrototype__proto.isoWeek = momentPrototype__proto.isoWeeks = getSetISOWeek;momentPrototype__proto.weeksInYear = getWeeksInYear;momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;momentPrototype__proto.date = getSetDayOfMonth;momentPrototype__proto.day = momentPrototype__proto.days = getSetDayOfWeek;momentPrototype__proto.weekday = getSetLocaleDayOfWeek;momentPrototype__proto.isoWeekday = getSetISODayOfWeek;momentPrototype__proto.dayOfYear = getSetDayOfYear;momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;momentPrototype__proto.utcOffset = getSetOffset;momentPrototype__proto.utc = setOffsetToUTC;momentPrototype__proto.local = setOffsetToLocal;momentPrototype__proto.parseZone = setOffsetToParsedOffset;momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;momentPrototype__proto.isDST = isDaylightSavingTime;momentPrototype__proto.isDSTShifted = isDaylightSavingTimeShifted;momentPrototype__proto.isLocal = isLocal;momentPrototype__proto.isUtcOffset = isUtcOffset;momentPrototype__proto.isUtc = isUtc;momentPrototype__proto.isUTC = isUtc;momentPrototype__proto.zoneAbbr = getZoneAbbr;momentPrototype__proto.zoneName = getZoneName;momentPrototype__proto.dates = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);momentPrototype__proto.years = deprecate('years accessor is deprecated. Use year instead', getSetYear);momentPrototype__proto.zone = deprecate('moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779', getSetZone);var momentPrototype=momentPrototype__proto;function moment__createUnix(input){return local__createLocal(input * 1000);}function moment__createInZone(){return local__createLocal.apply(null, arguments).parseZone();}var defaultCalendar={sameDay:'[Today at] LT', nextDay:'[Tomorrow at] LT', nextWeek:'dddd [at] LT', lastDay:'[Yesterday at] LT', lastWeek:'[Last] dddd [at] LT', sameElse:'L'};function locale_calendar__calendar(key, mom, now){var output=this._calendar[key];return typeof output === 'function'?output.call(mom, now):output;}var defaultLongDateFormat={LTS:'h:mm:ss A', LT:'h:mm A', L:'MM/DD/YYYY', LL:'MMMM D, YYYY', LLL:'MMMM D, YYYY LT', LLLL:'dddd, MMMM D, YYYY LT'};function longDateFormat(key){var output=this._longDateFormat[key];if(!output && this._longDateFormat[key.toUpperCase()]){output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function(val){return val.slice(1);});this._longDateFormat[key] = output;}return output;}var defaultInvalidDate='Invalid date';function invalidDate(){return this._invalidDate;}var defaultOrdinal='%d';var defaultOrdinalParse=/\d{1,2}/;function ordinal(number){return this._ordinal.replace('%d', number);}function preParsePostFormat(string){return string;}var defaultRelativeTime={future:'in %s', past:'%s ago', s:'a few seconds', m:'a minute', mm:'%d minutes', h:'an hour', hh:'%d hours', d:'a day', dd:'%d days', M:'a month', MM:'%d months', y:'a year', yy:'%d years'};function relative__relativeTime(number, withoutSuffix, string, isFuture){var output=this._relativeTime[string];return typeof output === 'function'?output(number, withoutSuffix, string, isFuture):output.replace(/%d/i, number);}function pastFuture(diff, output){var format=this._relativeTime[diff > 0?'future':'past'];return typeof format === 'function'?format(output):format.replace(/%s/i, output);}function locale_set__set(config){var prop, i;for(i in config) {prop = config[i];if(typeof prop === 'function'){this[i] = prop;}else {this['_' + i] = prop;}}this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + /\d{1,2}/.source);}var prototype__proto=Locale.prototype;prototype__proto._calendar = defaultCalendar;prototype__proto.calendar = locale_calendar__calendar;prototype__proto._longDateFormat = defaultLongDateFormat;prototype__proto.longDateFormat = longDateFormat;prototype__proto._invalidDate = defaultInvalidDate;prototype__proto.invalidDate = invalidDate;prototype__proto._ordinal = defaultOrdinal;prototype__proto.ordinal = ordinal;prototype__proto._ordinalParse = defaultOrdinalParse;prototype__proto.preparse = preParsePostFormat;prototype__proto.postformat = preParsePostFormat;prototype__proto._relativeTime = defaultRelativeTime;prototype__proto.relativeTime = relative__relativeTime;prototype__proto.pastFuture = pastFuture;prototype__proto.set = locale_set__set;prototype__proto.months = localeMonths;prototype__proto._months = defaultLocaleMonths;prototype__proto.monthsShort = localeMonthsShort;prototype__proto._monthsShort = defaultLocaleMonthsShort;prototype__proto.monthsParse = localeMonthsParse;prototype__proto.week = localeWeek;prototype__proto._week = defaultLocaleWeek;prototype__proto.firstDayOfYear = localeFirstDayOfYear;prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;prototype__proto.weekdays = localeWeekdays;prototype__proto._weekdays = defaultLocaleWeekdays;prototype__proto.weekdaysMin = localeWeekdaysMin;prototype__proto._weekdaysMin = defaultLocaleWeekdaysMin;prototype__proto.weekdaysShort = localeWeekdaysShort;prototype__proto._weekdaysShort = defaultLocaleWeekdaysShort;prototype__proto.weekdaysParse = localeWeekdaysParse;prototype__proto.isPM = localeIsPM;prototype__proto._meridiemParse = defaultLocaleMeridiemParse;prototype__proto.meridiem = localeMeridiem;function lists__get(format, index, field, setter){var locale=locale_locales__getLocale();var utc=create_utc__createUTC().set(setter, index);return locale[field](utc, format);}function list(format, index, field, count, setter){if(typeof format === 'number'){index = format;format = undefined;}format = format || '';if(index != null){return lists__get(format, index, field, setter);}var i;var out=[];for(i = 0; i < count; i++) {out[i] = lists__get(format, i, field, setter);}return out;}function lists__listMonths(format, index){return list(format, index, 'months', 12, 'month');}function lists__listMonthsShort(format, index){return list(format, index, 'monthsShort', 12, 'month');}function lists__listWeekdays(format, index){return list(format, index, 'weekdays', 7, 'day');}function lists__listWeekdaysShort(format, index){return list(format, index, 'weekdaysShort', 7, 'day');}function lists__listWeekdaysMin(format, index){return list(format, index, 'weekdaysMin', 7, 'day');}locale_locales__getSetGlobalLocale('en', {ordinalParse:/\d{1,2}(th|st|nd|rd)/, ordinal:function ordinal(number){var b=number % 10, output=toInt(number % 100 / 10) === 1?'th':b === 1?'st':b === 2?'nd':b === 3?'rd':'th';return number + output;}});utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);var mathAbs=Math.abs;function duration_abs__abs(){var data=this._data;this._milliseconds = mathAbs(this._milliseconds);this._days = mathAbs(this._days);this._months = mathAbs(this._months);data.milliseconds = mathAbs(data.milliseconds);data.seconds = mathAbs(data.seconds);data.minutes = mathAbs(data.minutes);data.hours = mathAbs(data.hours);data.months = mathAbs(data.months);data.years = mathAbs(data.years);return this;}function duration_add_subtract__addSubtract(duration, input, value, direction){var other=create__createDuration(input, value);duration._milliseconds += direction * other._milliseconds;duration._days += direction * other._days;duration._months += direction * other._months;return duration._bubble();}function duration_add_subtract__add(input, value){return duration_add_subtract__addSubtract(this, input, value, 1);}function duration_add_subtract__subtract(input, value){return duration_add_subtract__addSubtract(this, input, value, -1);}function bubble(){var milliseconds=this._milliseconds;var days=this._days;var months=this._months;var data=this._data;var seconds, minutes, hours, years=0;data.milliseconds = milliseconds % 1000;seconds = absFloor(milliseconds / 1000);data.seconds = seconds % 60;minutes = absFloor(seconds / 60);data.minutes = minutes % 60;hours = absFloor(minutes / 60);data.hours = hours % 24;days += absFloor(hours / 24);years = absFloor(daysToYears(days));days -= absFloor(yearsToDays(years));months += absFloor(days / 30);days %= 30;years += absFloor(months / 12);months %= 12;data.days = days;data.months = months;data.years = years;return this;}function daysToYears(days){return days * 400 / 146097;}function yearsToDays(years){return years * 146097 / 400;}function as(units){var days;var months;var milliseconds=this._milliseconds;units = normalizeUnits(units);if(units === 'month' || units === 'year'){days = this._days + milliseconds / 86400000;months = this._months + daysToYears(days) * 12;return units === 'month'?months:months / 12;}else {days = this._days + Math.round(yearsToDays(this._months / 12));switch(units){case 'week':return days / 7 + milliseconds / 604800000;case 'day':return days + milliseconds / 86400000;case 'hour':return days * 24 + milliseconds / 3600000;case 'minute':return days * 1440 + milliseconds / 60000;case 'second':return days * 86400 + milliseconds / 1000;case 'millisecond':return Math.floor(days * 86400000) + milliseconds;default:throw new Error('Unknown unit ' + units);}}}function duration_as__valueOf(){return this._milliseconds + this._days * 86400000 + this._months % 12 * 2592000000 + toInt(this._months / 12) * 31536000000;}function makeAs(alias){return function(){return this.as(alias);};}var asMilliseconds=makeAs('ms');var asSeconds=makeAs('s');var asMinutes=makeAs('m');var asHours=makeAs('h');var asDays=makeAs('d');var asWeeks=makeAs('w');var asMonths=makeAs('M');var asYears=makeAs('y');function duration_get__get(units){units = normalizeUnits(units);return this[units + 's']();}function makeGetter(name){return function(){return this._data[name];};}var duration_get__milliseconds=makeGetter('milliseconds');var seconds=makeGetter('seconds');var minutes=makeGetter('minutes');var hours=makeGetter('hours');var days=makeGetter('days');var months=makeGetter('months');var years=makeGetter('years');function weeks(){return absFloor(this.days() / 7);}var round=Math.round;var thresholds={s:45, m:45, h:22, d:26, M:11};function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale){return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);}function duration_humanize__relativeTime(posNegDuration, withoutSuffix, locale){var duration=create__createDuration(posNegDuration).abs();var seconds=round(duration.as('s'));var minutes=round(duration.as('m'));var hours=round(duration.as('h'));var days=round(duration.as('d'));var months=round(duration.as('M'));var years=round(duration.as('y'));var a=seconds < thresholds.s && ['s', seconds] || minutes === 1 && ['m'] || minutes < thresholds.m && ['mm', minutes] || hours === 1 && ['h'] || hours < thresholds.h && ['hh', hours] || days === 1 && ['d'] || days < thresholds.d && ['dd', days] || months === 1 && ['M'] || months < thresholds.M && ['MM', months] || years === 1 && ['y'] || ['yy', years];a[2] = withoutSuffix;a[3] = +posNegDuration > 0;a[4] = locale;return substituteTimeAgo.apply(null, a);}function duration_humanize__getSetRelativeTimeThreshold(threshold, limit){if(thresholds[threshold] === undefined){return false;}if(limit === undefined){return thresholds[threshold];}thresholds[threshold] = limit;return true;}function humanize(withSuffix){var locale=this.localeData();var output=duration_humanize__relativeTime(this, !withSuffix, locale);if(withSuffix){output = locale.pastFuture(+this, output);}return locale.postformat(output);}var iso_string__abs=Math.abs;function iso_string__toISOString(){var Y=iso_string__abs(this.years());var M=iso_string__abs(this.months());var D=iso_string__abs(this.days());var h=iso_string__abs(this.hours());var m=iso_string__abs(this.minutes());var s=iso_string__abs(this.seconds() + this.milliseconds() / 1000);var total=this.asSeconds();if(!total){return 'P0D';}return (total < 0?'-':'') + 'P' + (Y?Y + 'Y':'') + (M?M + 'M':'') + (D?D + 'D':'') + (h || m || s?'T':'') + (h?h + 'H':'') + (m?m + 'M':'') + (s?s + 'S':'');}var duration_prototype__proto=Duration.prototype;duration_prototype__proto.abs = duration_abs__abs;duration_prototype__proto.add = duration_add_subtract__add;duration_prototype__proto.subtract = duration_add_subtract__subtract;duration_prototype__proto.as = as;duration_prototype__proto.asMilliseconds = asMilliseconds;duration_prototype__proto.asSeconds = asSeconds;duration_prototype__proto.asMinutes = asMinutes;duration_prototype__proto.asHours = asHours;duration_prototype__proto.asDays = asDays;duration_prototype__proto.asWeeks = asWeeks;duration_prototype__proto.asMonths = asMonths;duration_prototype__proto.asYears = asYears;duration_prototype__proto.valueOf = duration_as__valueOf;duration_prototype__proto._bubble = bubble;duration_prototype__proto.get = duration_get__get;duration_prototype__proto.milliseconds = duration_get__milliseconds;duration_prototype__proto.seconds = seconds;duration_prototype__proto.minutes = minutes;duration_prototype__proto.hours = hours;duration_prototype__proto.days = days;duration_prototype__proto.weeks = weeks;duration_prototype__proto.months = months;duration_prototype__proto.years = years;duration_prototype__proto.humanize = humanize;duration_prototype__proto.toISOString = iso_string__toISOString;duration_prototype__proto.toString = iso_string__toISOString;duration_prototype__proto.toJSON = iso_string__toISOString;duration_prototype__proto.locale = locale;duration_prototype__proto.localeData = localeData;duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);duration_prototype__proto.lang = lang;addFormatToken('X', 0, 0, 'unix');addFormatToken('x', 0, 0, 'valueOf');addRegexToken('x', matchSigned);addRegexToken('X', matchTimestamp);addParseToken('X', function(input, array, config){config._d = new Date(parseFloat(input, 10) * 1000);});addParseToken('x', function(input, array, config){config._d = new Date(toInt(input));});utils_hooks__hooks.version = '2.10.3';setHookCallback(local__createLocal);utils_hooks__hooks.fn = momentPrototype;utils_hooks__hooks.min = min;utils_hooks__hooks.max = max;utils_hooks__hooks.utc = create_utc__createUTC;utils_hooks__hooks.unix = moment__createUnix;utils_hooks__hooks.months = lists__listMonths;utils_hooks__hooks.isDate = isDate;utils_hooks__hooks.locale = locale_locales__getSetGlobalLocale;utils_hooks__hooks.invalid = valid__createInvalid;utils_hooks__hooks.duration = create__createDuration;utils_hooks__hooks.isMoment = isMoment;utils_hooks__hooks.weekdays = lists__listWeekdays;utils_hooks__hooks.parseZone = moment__createInZone;utils_hooks__hooks.localeData = locale_locales__getLocale;utils_hooks__hooks.isDuration = isDuration;utils_hooks__hooks.monthsShort = lists__listMonthsShort;utils_hooks__hooks.weekdaysMin = lists__listWeekdaysMin;utils_hooks__hooks.defineLocale = defineLocale;utils_hooks__hooks.weekdaysShort = lists__listWeekdaysShort;utils_hooks__hooks.normalizeUnits = normalizeUnits;utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;var _moment=utils_hooks__hooks;return _moment;});

},{}],18:[function(require,module,exports){
/*! VelocityJS.org (1.2.2). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License */
/*! VelocityJS.org jQuery Shim (1.0.1). (C) 2014 The jQuery Foundation. MIT @license: en.wikipedia.org/wiki/MIT_License. */
"use strict";

!(function (e) {
  function t(e) {
    var t = e.length,
        r = $.type(e);return "function" === r || $.isWindow(e) ? !1 : 1 === e.nodeType && t ? !0 : "array" === r || 0 === t || "number" == typeof t && t > 0 && t - 1 in e;
  }if (!e.jQuery) {
    var $ = function $(e, t) {
      return new $.fn.init(e, t);
    };$.isWindow = function (e) {
      return null != e && e == e.window;
    }, $.type = function (e) {
      return null == e ? e + "" : "object" == typeof e || "function" == typeof e ? a[o.call(e)] || "object" : typeof e;
    }, $.isArray = Array.isArray || function (e) {
      return "array" === $.type(e);
    }, $.isPlainObject = function (e) {
      var t;if (!e || "object" !== $.type(e) || e.nodeType || $.isWindow(e)) return !1;try {
        if (e.constructor && !n.call(e, "constructor") && !n.call(e.constructor.prototype, "isPrototypeOf")) return !1;
      } catch (r) {
        return !1;
      }for (t in e);return void 0 === t || n.call(e, t);
    }, $.each = function (e, r, a) {
      var n,
          o = 0,
          i = e.length,
          s = t(e);if (a) {
        if (s) for (; i > o && (n = r.apply(e[o], a), n !== !1); o++);else for (o in e) if ((n = r.apply(e[o], a), n === !1)) break;
      } else if (s) for (; i > o && (n = r.call(e[o], o, e[o]), n !== !1); o++);else for (o in e) if ((n = r.call(e[o], o, e[o]), n === !1)) break;return e;
    }, $.data = function (e, t, a) {
      if (void 0 === a) {
        var n = e[$.expando],
            o = n && r[n];if (void 0 === t) return o;if (o && t in o) return o[t];
      } else if (void 0 !== t) {
        var n = e[$.expando] || (e[$.expando] = ++$.uuid);return (r[n] = r[n] || {}, r[n][t] = a, a);
      }
    }, $.removeData = function (e, t) {
      var a = e[$.expando],
          n = a && r[a];n && $.each(t, function (e, t) {
        delete n[t];
      });
    }, $.extend = function () {
      var e,
          t,
          r,
          a,
          n,
          o,
          i = arguments[0] || {},
          s = 1,
          l = arguments.length,
          u = !1;for ("boolean" == typeof i && (u = i, i = arguments[s] || {}, s++), "object" != typeof i && "function" !== $.type(i) && (i = {}), s === l && (i = this, s--); l > s; s++) if (null != (n = arguments[s])) for (a in n) e = i[a], r = n[a], i !== r && (u && r && ($.isPlainObject(r) || (t = $.isArray(r))) ? (t ? (t = !1, o = e && $.isArray(e) ? e : []) : o = e && $.isPlainObject(e) ? e : {}, i[a] = $.extend(u, o, r)) : void 0 !== r && (i[a] = r));return i;
    }, $.queue = function (e, r, a) {
      function n(e, r) {
        var a = r || [];return (null != e && (t(Object(e)) ? !(function (e, t) {
          for (var r = +t.length, a = 0, n = e.length; r > a;) e[n++] = t[a++];if (r !== r) for (; void 0 !== t[a];) e[n++] = t[a++];return (e.length = n, e);
        })(a, "string" == typeof e ? [e] : e) : [].push.call(a, e)), a);
      }if (e) {
        r = (r || "fx") + "queue";var o = $.data(e, r);return a ? (!o || $.isArray(a) ? o = $.data(e, r, n(a)) : o.push(a), o) : o || [];
      }
    }, $.dequeue = function (e, t) {
      $.each(e.nodeType ? [e] : e, function (e, r) {
        t = t || "fx";var a = $.queue(r, t),
            n = a.shift();"inprogress" === n && (n = a.shift()), n && ("fx" === t && a.unshift("inprogress"), n.call(r, function () {
          $.dequeue(r, t);
        }));
      });
    }, $.fn = $.prototype = { init: function init(e) {
        if (e.nodeType) return (this[0] = e, this);throw new Error("Not a DOM node.");
      }, offset: function offset() {
        var t = this[0].getBoundingClientRect ? this[0].getBoundingClientRect() : { top: 0, left: 0 };return { top: t.top + (e.pageYOffset || document.scrollTop || 0) - (document.clientTop || 0), left: t.left + (e.pageXOffset || document.scrollLeft || 0) - (document.clientLeft || 0) };
      }, position: function position() {
        function e() {
          for (var e = this.offsetParent || document; e && "html" === !e.nodeType.toLowerCase && "static" === e.style.position;) e = e.offsetParent;return e || document;
        }var t = this[0],
            e = e.apply(t),
            r = this.offset(),
            a = /^(?:body|html)$/i.test(e.nodeName) ? { top: 0, left: 0 } : $(e).offset();return (r.top -= parseFloat(t.style.marginTop) || 0, r.left -= parseFloat(t.style.marginLeft) || 0, e.style && (a.top += parseFloat(e.style.borderTopWidth) || 0, a.left += parseFloat(e.style.borderLeftWidth) || 0), { top: r.top - a.top, left: r.left - a.left });
      } };var r = {};$.expando = "velocity" + new Date().getTime(), $.uuid = 0;for (var a = {}, n = a.hasOwnProperty, o = a.toString, i = "Boolean Number String Function Array Date RegExp Object Error".split(" "), s = 0; s < i.length; s++) a["[object " + i[s] + "]"] = i[s].toLowerCase();$.fn.init.prototype = $.fn, e.Velocity = { Utilities: $ };
  }
})(window), (function (e) {
  "object" == typeof module && "object" == typeof module.exports ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : e();
})(function () {
  return (function (e, t, r, a) {
    function n(e) {
      for (var t = -1, r = e ? e.length : 0, a = []; ++t < r;) {
        var n = e[t];n && a.push(n);
      }return a;
    }function o(e) {
      return (g.isWrapped(e) ? e = [].slice.call(e) : g.isNode(e) && (e = [e]), e);
    }function i(e) {
      var t = $.data(e, "velocity");return null === t ? a : t;
    }function s(e) {
      return function (t) {
        return Math.round(t * e) * (1 / e);
      };
    }function l(e, r, a, n) {
      function o(e, t) {
        return 1 - 3 * t + 3 * e;
      }function i(e, t) {
        return 3 * t - 6 * e;
      }function s(e) {
        return 3 * e;
      }function l(e, t, r) {
        return ((o(t, r) * e + i(t, r)) * e + s(t)) * e;
      }function u(e, t, r) {
        return 3 * o(t, r) * e * e + 2 * i(t, r) * e + s(t);
      }function c(t, r) {
        for (var n = 0; m > n; ++n) {
          var o = u(r, e, a);if (0 === o) return r;var i = l(r, e, a) - t;r -= i / o;
        }return r;
      }function p() {
        for (var t = 0; b > t; ++t) w[t] = l(t * x, e, a);
      }function f(t, r, n) {
        var o,
            i,
            s = 0;do i = r + (n - r) / 2, o = l(i, e, a) - t, o > 0 ? n = i : r = i; while (Math.abs(o) > h && ++s < v);return i;
      }function d(t) {
        for (var r = 0, n = 1, o = b - 1; n != o && w[n] <= t; ++n) r += x;--n;var i = (t - w[n]) / (w[n + 1] - w[n]),
            s = r + i * x,
            l = u(s, e, a);return l >= y ? c(t, s) : 0 == l ? s : f(t, r, r + x);
      }function g() {
        V = !0, (e != r || a != n) && p();
      }var m = 4,
          y = 0.001,
          h = 1e-7,
          v = 10,
          b = 11,
          x = 1 / (b - 1),
          S = ("Float32Array" in t);if (4 !== arguments.length) return !1;for (var P = 0; 4 > P; ++P) if ("number" != typeof arguments[P] || isNaN(arguments[P]) || !isFinite(arguments[P])) return !1;e = Math.min(e, 1), a = Math.min(a, 1), e = Math.max(e, 0), a = Math.max(a, 0);var w = S ? new Float32Array(b) : new Array(b),
          V = !1,
          C = function C(t) {
        return (V || g(), e === r && a === n ? t : 0 === t ? 0 : 1 === t ? 1 : l(d(t), r, n));
      };C.getControlPoints = function () {
        return [{ x: e, y: r }, { x: a, y: n }];
      };var T = "generateBezier(" + [e, r, a, n] + ")";return (C.toString = function () {
        return T;
      }, C);
    }function u(e, t) {
      var r = e;return (g.isString(e) ? v.Easings[e] || (r = !1) : r = g.isArray(e) && 1 === e.length ? s.apply(null, e) : g.isArray(e) && 2 === e.length ? b.apply(null, e.concat([t])) : g.isArray(e) && 4 === e.length ? l.apply(null, e) : !1, r === !1 && (r = v.Easings[v.defaults.easing] ? v.defaults.easing : h), r);
    }function c(e) {
      if (e) {
        var t = new Date().getTime(),
            r = v.State.calls.length;r > 10000 && (v.State.calls = n(v.State.calls));for (var o = 0; r > o; o++) if (v.State.calls[o]) {
          var s = v.State.calls[o],
              l = s[0],
              u = s[2],
              f = s[3],
              d = !!f,
              m = null;f || (f = v.State.calls[o][3] = t - 16);for (var y = Math.min((t - f) / u.duration, 1), h = 0, b = l.length; b > h; h++) {
            var S = l[h],
                w = S.element;if (i(w)) {
              var V = !1;if (u.display !== a && null !== u.display && "none" !== u.display) {
                if ("flex" === u.display) {
                  var C = ["-webkit-box", "-moz-box", "-ms-flexbox", "-webkit-flex"];$.each(C, function (e, t) {
                    x.setPropertyValue(w, "display", t);
                  });
                }x.setPropertyValue(w, "display", u.display);
              }u.visibility !== a && "hidden" !== u.visibility && x.setPropertyValue(w, "visibility", u.visibility);for (var T in S) if ("element" !== T) {
                var k = S[T],
                    A,
                    F = g.isString(k.easing) ? v.Easings[k.easing] : k.easing;if (1 === y) A = k.endValue;else {
                  var E = k.endValue - k.startValue;if ((A = k.startValue + E * F(y, u, E), !d && A === k.currentValue)) continue;
                }if ((k.currentValue = A, "tween" === T)) m = A;else {
                  if (x.Hooks.registered[T]) {
                    var j = x.Hooks.getRoot(T),
                        H = i(w).rootPropertyValueCache[j];H && (k.rootPropertyValue = H);
                  }var N = x.setPropertyValue(w, T, k.currentValue + (0 === parseFloat(A) ? "" : k.unitType), k.rootPropertyValue, k.scrollData);x.Hooks.registered[T] && (i(w).rootPropertyValueCache[j] = x.Normalizations.registered[j] ? x.Normalizations.registered[j]("extract", null, N[1]) : N[1]), "transform" === N[0] && (V = !0);
                }
              }u.mobileHA && i(w).transformCache.translate3d === a && (i(w).transformCache.translate3d = "(0px, 0px, 0px)", V = !0), V && x.flushTransformCache(w);
            }
          }u.display !== a && "none" !== u.display && (v.State.calls[o][2].display = !1), u.visibility !== a && "hidden" !== u.visibility && (v.State.calls[o][2].visibility = !1), u.progress && u.progress.call(s[1], s[1], y, Math.max(0, f + u.duration - t), f, m), 1 === y && p(o);
        }
      }v.State.isTicking && P(c);
    }function p(e, t) {
      if (!v.State.calls[e]) return !1;for (var r = v.State.calls[e][0], n = v.State.calls[e][1], o = v.State.calls[e][2], s = v.State.calls[e][4], l = !1, u = 0, c = r.length; c > u; u++) {
        var p = r[u].element;if ((t || o.loop || ("none" === o.display && x.setPropertyValue(p, "display", o.display), "hidden" === o.visibility && x.setPropertyValue(p, "visibility", o.visibility)), o.loop !== !0 && ($.queue(p)[1] === a || !/\.velocityQueueEntryFlag/i.test($.queue(p)[1])) && i(p))) {
          i(p).isAnimating = !1, i(p).rootPropertyValueCache = {};var f = !1;$.each(x.Lists.transforms3D, function (e, t) {
            var r = /^scale/.test(t) ? 1 : 0,
                n = i(p).transformCache[t];i(p).transformCache[t] !== a && new RegExp("^\\(" + r + "[^.]").test(n) && (f = !0, delete i(p).transformCache[t]);
          }), o.mobileHA && (f = !0, delete i(p).transformCache.translate3d), f && x.flushTransformCache(p), x.Values.removeClass(p, "velocity-animating");
        }if (!t && o.complete && !o.loop && u === c - 1) try {
          o.complete.call(n, n);
        } catch (d) {
          setTimeout(function () {
            throw d;
          }, 1);
        }s && o.loop !== !0 && s(n), i(p) && o.loop === !0 && !t && ($.each(i(p).tweensContainer, function (e, t) {
          /^rotate/.test(e) && 360 === parseFloat(t.endValue) && (t.endValue = 0, t.startValue = 360), /^backgroundPosition/.test(e) && 100 === parseFloat(t.endValue) && "%" === t.unitType && (t.endValue = 0, t.startValue = 100);
        }), v(p, "reverse", { loop: !0, delay: o.delay })), o.queue !== !1 && $.dequeue(p, o.queue);
      }v.State.calls[e] = !1;for (var g = 0, m = v.State.calls.length; m > g; g++) if (v.State.calls[g] !== !1) {
        l = !0;break;
      }l === !1 && (v.State.isTicking = !1, delete v.State.calls, v.State.calls = []);
    }var f = (function () {
      if (r.documentMode) return r.documentMode;for (var e = 7; e > 4; e--) {
        var t = r.createElement("div");if ((t.innerHTML = "<!--[if IE " + e + "]><span></span><![endif]-->", t.getElementsByTagName("span").length)) return (t = null, e);
      }return a;
    })(),
        d = (function () {
      var e = 0;return t.webkitRequestAnimationFrame || t.mozRequestAnimationFrame || function (t) {
        var r = new Date().getTime(),
            a;return (a = Math.max(0, 16 - (r - e)), e = r + a, setTimeout(function () {
          t(r + a);
        }, a));
      };
    })(),
        g = { isString: function isString(e) {
        return "string" == typeof e;
      }, isArray: Array.isArray || function (e) {
        return "[object Array]" === Object.prototype.toString.call(e);
      }, isFunction: function isFunction(e) {
        return "[object Function]" === Object.prototype.toString.call(e);
      }, isNode: function isNode(e) {
        return e && e.nodeType;
      }, isNodeList: function isNodeList(e) {
        return "object" == typeof e && /^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(e)) && e.length !== a && (0 === e.length || "object" == typeof e[0] && e[0].nodeType > 0);
      }, isWrapped: function isWrapped(e) {
        return e && (e.jquery || t.Zepto && t.Zepto.zepto.isZ(e));
      }, isSVG: function isSVG(e) {
        return t.SVGElement && e instanceof t.SVGElement;
      }, isEmptyObject: function isEmptyObject(e) {
        for (var t in e) return !1;return !0;
      } },
        $,
        m = !1;if ((e.fn && e.fn.jquery ? ($ = e, m = !0) : $ = t.Velocity.Utilities, 8 >= f && !m)) throw new Error("Velocity: IE8 and below require jQuery to be loaded before Velocity.");if (7 >= f) return void (jQuery.fn.velocity = jQuery.fn.animate);var y = 400,
        h = "swing",
        v = { State: { isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent), isAndroid: /Android/i.test(navigator.userAgent), isGingerbread: /Android 2\.3\.[3-7]/i.test(navigator.userAgent), isChrome: t.chrome, isFirefox: /Firefox/i.test(navigator.userAgent), prefixElement: r.createElement("div"), prefixMatches: {}, scrollAnchor: null, scrollPropertyLeft: null, scrollPropertyTop: null, isTicking: !1, calls: [] }, CSS: {}, Utilities: $, Redirects: {}, Easings: {}, Promise: t.Promise, defaults: { queue: "", duration: y, easing: h, begin: a, complete: a, progress: a, display: a, visibility: a, loop: !1, delay: !1, mobileHA: !0, _cacheValues: !0 }, init: function init(e) {
        $.data(e, "velocity", { isSVG: g.isSVG(e), isAnimating: !1, computedStyle: null, tweensContainer: null, rootPropertyValueCache: {}, transformCache: {} });
      }, hook: null, mock: !1, version: { major: 1, minor: 2, patch: 2 }, debug: !1 };t.pageYOffset !== a ? (v.State.scrollAnchor = t, v.State.scrollPropertyLeft = "pageXOffset", v.State.scrollPropertyTop = "pageYOffset") : (v.State.scrollAnchor = r.documentElement || r.body.parentNode || r.body, v.State.scrollPropertyLeft = "scrollLeft", v.State.scrollPropertyTop = "scrollTop");var b = (function () {
      function e(e) {
        return -e.tension * e.x - e.friction * e.v;
      }function t(t, r, a) {
        var n = { x: t.x + a.dx * r, v: t.v + a.dv * r, tension: t.tension, friction: t.friction };return { dx: n.v, dv: e(n) };
      }function r(r, a) {
        var n = { dx: r.v, dv: e(r) },
            o = t(r, 0.5 * a, n),
            i = t(r, 0.5 * a, o),
            s = t(r, a, i),
            l = 1 / 6 * (n.dx + 2 * (o.dx + i.dx) + s.dx),
            u = 1 / 6 * (n.dv + 2 * (o.dv + i.dv) + s.dv);return (r.x = r.x + l * a, r.v = r.v + u * a, r);
      }return function a(e, t, n) {
        var o = { x: -1, v: 0, tension: null, friction: null },
            i = [0],
            s = 0,
            l = 0.0001,
            u = 0.016,
            c,
            p,
            f;for (e = parseFloat(e) || 500, t = parseFloat(t) || 20, n = n || null, o.tension = e, o.friction = t, c = null !== n, c ? (s = a(e, t), p = s / n * u) : p = u;;) if ((f = r(f || o, p), i.push(1 + f.x), s += 16, !(Math.abs(f.x) > l && Math.abs(f.v) > l))) break;return c ? function (e) {
          return i[e * (i.length - 1) | 0];
        } : s;
      };
    })();v.Easings = { linear: function linear(e) {
        return e;
      }, swing: function swing(e) {
        return 0.5 - Math.cos(e * Math.PI) / 2;
      }, spring: function spring(e) {
        return 1 - Math.cos(4.5 * e * Math.PI) * Math.exp(6 * -e);
      } }, $.each([["ease", [0.25, 0.1, 0.25, 1]], ["ease-in", [0.42, 0, 1, 1]], ["ease-out", [0, 0, 0.58, 1]], ["ease-in-out", [0.42, 0, 0.58, 1]], ["easeInSine", [0.47, 0, 0.745, 0.715]], ["easeOutSine", [0.39, 0.575, 0.565, 1]], ["easeInOutSine", [0.445, 0.05, 0.55, 0.95]], ["easeInQuad", [0.55, 0.085, 0.68, 0.53]], ["easeOutQuad", [0.25, 0.46, 0.45, 0.94]], ["easeInOutQuad", [0.455, 0.03, 0.515, 0.955]], ["easeInCubic", [0.55, 0.055, 0.675, 0.19]], ["easeOutCubic", [0.215, 0.61, 0.355, 1]], ["easeInOutCubic", [0.645, 0.045, 0.355, 1]], ["easeInQuart", [0.895, 0.03, 0.685, 0.22]], ["easeOutQuart", [0.165, 0.84, 0.44, 1]], ["easeInOutQuart", [0.77, 0, 0.175, 1]], ["easeInQuint", [0.755, 0.05, 0.855, 0.06]], ["easeOutQuint", [0.23, 1, 0.32, 1]], ["easeInOutQuint", [0.86, 0, 0.07, 1]], ["easeInExpo", [0.95, 0.05, 0.795, 0.035]], ["easeOutExpo", [0.19, 1, 0.22, 1]], ["easeInOutExpo", [1, 0, 0, 1]], ["easeInCirc", [0.6, 0.04, 0.98, 0.335]], ["easeOutCirc", [0.075, 0.82, 0.165, 1]], ["easeInOutCirc", [0.785, 0.135, 0.15, 0.86]]], function (e, t) {
      v.Easings[t[0]] = l.apply(null, t[1]);
    });var x = v.CSS = { RegEx: { isHex: /^#([A-f\d]{3}){1,2}$/i, valueUnwrap: /^[A-z]+\((.*)\)$/i, wrappedValueAlreadyExtracted: /[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/, valueSplit: /([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/gi }, Lists: { colors: ["fill", "stroke", "stopColor", "color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "outlineColor"], transformsBase: ["translateX", "translateY", "scale", "scaleX", "scaleY", "skewX", "skewY", "rotateZ"], transforms3D: ["transformPerspective", "translateZ", "scaleZ", "rotateX", "rotateY"] }, Hooks: { templates: { textShadow: ["Color X Y Blur", "black 0px 0px 0px"], boxShadow: ["Color X Y Blur Spread", "black 0px 0px 0px 0px"], clip: ["Top Right Bottom Left", "0px 0px 0px 0px"], backgroundPosition: ["X Y", "0% 0%"], transformOrigin: ["X Y Z", "50% 50% 0px"], perspectiveOrigin: ["X Y", "50% 50%"] }, registered: {}, register: function register() {
          for (var e = 0; e < x.Lists.colors.length; e++) {
            var t = "color" === x.Lists.colors[e] ? "0 0 0 1" : "255 255 255 1";x.Hooks.templates[x.Lists.colors[e]] = ["Red Green Blue Alpha", t];
          }var r, a, n;if (f) for (r in x.Hooks.templates) {
            a = x.Hooks.templates[r], n = a[0].split(" ");var o = a[1].match(x.RegEx.valueSplit);"Color" === n[0] && (n.push(n.shift()), o.push(o.shift()), x.Hooks.templates[r] = [n.join(" "), o.join(" ")]);
          }for (r in x.Hooks.templates) {
            a = x.Hooks.templates[r], n = a[0].split(" ");for (var e in n) {
              var i = r + n[e],
                  s = e;x.Hooks.registered[i] = [r, s];
            }
          }
        }, getRoot: function getRoot(e) {
          var t = x.Hooks.registered[e];return t ? t[0] : e;
        }, cleanRootPropertyValue: function cleanRootPropertyValue(e, t) {
          return (x.RegEx.valueUnwrap.test(t) && (t = t.match(x.RegEx.valueUnwrap)[1]), x.Values.isCSSNullValue(t) && (t = x.Hooks.templates[e][1]), t);
        }, extractValue: function extractValue(e, t) {
          var r = x.Hooks.registered[e];if (r) {
            var a = r[0],
                n = r[1];return (t = x.Hooks.cleanRootPropertyValue(a, t), t.toString().match(x.RegEx.valueSplit)[n]);
          }return t;
        }, injectValue: function injectValue(e, t, r) {
          var a = x.Hooks.registered[e];if (a) {
            var n = a[0],
                o = a[1],
                i,
                s;return (r = x.Hooks.cleanRootPropertyValue(n, r), i = r.toString().match(x.RegEx.valueSplit), i[o] = t, s = i.join(" "));
          }return r;
        } }, Normalizations: { registered: { clip: function clip(e, t, r) {
            switch (e) {case "name":
                return "clip";case "extract":
                var a;return (x.RegEx.wrappedValueAlreadyExtracted.test(r) ? a = r : (a = r.toString().match(x.RegEx.valueUnwrap), a = a ? a[1].replace(/,(\s+)?/g, " ") : r), a);case "inject":
                return "rect(" + r + ")";}
          }, blur: function blur(e, t, r) {
            switch (e) {case "name":
                return v.State.isFirefox ? "filter" : "-webkit-filter";case "extract":
                var a = parseFloat(r);if (!a && 0 !== a) {
                  var n = r.toString().match(/blur\(([0-9]+[A-z]+)\)/i);a = n ? n[1] : 0;
                }return a;case "inject":
                return parseFloat(r) ? "blur(" + r + ")" : "none";}
          }, opacity: function opacity(e, t, r) {
            if (8 >= f) switch (e) {case "name":
                return "filter";case "extract":
                var a = r.toString().match(/alpha\(opacity=(.*)\)/i);return r = a ? a[1] / 100 : 1;case "inject":
                return (t.style.zoom = 1, parseFloat(r) >= 1 ? "" : "alpha(opacity=" + parseInt(100 * parseFloat(r), 10) + ")");} else switch (e) {case "name":
                return "opacity";case "extract":
                return r;case "inject":
                return r;}
          } }, register: function register() {
          9 >= f || v.State.isGingerbread || (x.Lists.transformsBase = x.Lists.transformsBase.concat(x.Lists.transforms3D));for (var e = 0; e < x.Lists.transformsBase.length; e++) !(function () {
            var t = x.Lists.transformsBase[e];x.Normalizations.registered[t] = function (e, r, n) {
              switch (e) {case "name":
                  return "transform";case "extract":
                  return i(r) === a || i(r).transformCache[t] === a ? /^scale/i.test(t) ? 1 : 0 : i(r).transformCache[t].replace(/[()]/g, "");case "inject":
                  var o = !1;switch (t.substr(0, t.length - 1)) {case "translate":
                      o = !/(%|px|em|rem|vw|vh|\d)$/i.test(n);break;case "scal":case "scale":
                      v.State.isAndroid && i(r).transformCache[t] === a && 1 > n && (n = 1), o = !/(\d)$/i.test(n);break;case "skew":
                      o = !/(deg|\d)$/i.test(n);break;case "rotate":
                      o = !/(deg|\d)$/i.test(n);}return (o || (i(r).transformCache[t] = "(" + n + ")"), i(r).transformCache[t]);}
            };
          })();for (var e = 0; e < x.Lists.colors.length; e++) !(function () {
            var t = x.Lists.colors[e];x.Normalizations.registered[t] = function (e, r, n) {
              switch (e) {case "name":
                  return t;case "extract":
                  var o;if (x.RegEx.wrappedValueAlreadyExtracted.test(n)) o = n;else {
                    var i,
                        s = { black: "rgb(0, 0, 0)", blue: "rgb(0, 0, 255)", gray: "rgb(128, 128, 128)", green: "rgb(0, 128, 0)", red: "rgb(255, 0, 0)", white: "rgb(255, 255, 255)" };/^[A-z]+$/i.test(n) ? i = s[n] !== a ? s[n] : s.black : x.RegEx.isHex.test(n) ? i = "rgb(" + x.Values.hexToRgb(n).join(" ") + ")" : /^rgba?\(/i.test(n) || (i = s.black), o = (i || n).toString().match(x.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g, " ");
                  }return (8 >= f || 3 !== o.split(" ").length || (o += " 1"), o);case "inject":
                  return (8 >= f ? 4 === n.split(" ").length && (n = n.split(/\s+/).slice(0, 3).join(" ")) : 3 === n.split(" ").length && (n += " 1"), (8 >= f ? "rgb" : "rgba") + "(" + n.replace(/\s+/g, ",").replace(/\.(\d)+(?=,)/g, "") + ")");}
            };
          })();
        } }, Names: { camelCase: function camelCase(e) {
          return e.replace(/-(\w)/g, function (e, t) {
            return t.toUpperCase();
          });
        }, SVGAttribute: function SVGAttribute(e) {
          var t = "width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";return ((f || v.State.isAndroid && !v.State.isChrome) && (t += "|transform"), new RegExp("^(" + t + ")$", "i").test(e));
        }, prefixCheck: function prefixCheck(e) {
          if (v.State.prefixMatches[e]) return [v.State.prefixMatches[e], !0];for (var t = ["", "Webkit", "Moz", "ms", "O"], r = 0, a = t.length; a > r; r++) {
            var n;if ((n = 0 === r ? e : t[r] + e.replace(/^\w/, function (e) {
              return e.toUpperCase();
            }), g.isString(v.State.prefixElement.style[n]))) return (v.State.prefixMatches[e] = n, [n, !0]);
          }return [e, !1];
        } }, Values: { hexToRgb: function hexToRgb(e) {
          var t = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
              r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
              a;return (e = e.replace(t, function (e, t, r, a) {
            return t + t + r + r + a + a;
          }), a = r.exec(e), a ? [parseInt(a[1], 16), parseInt(a[2], 16), parseInt(a[3], 16)] : [0, 0, 0]);
        }, isCSSNullValue: function isCSSNullValue(e) {
          return 0 == e || /^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(e);
        }, getUnitType: function getUnitType(e) {
          return /^(rotate|skew)/i.test(e) ? "deg" : /(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(e) ? "" : "px";
        }, getDisplayType: function getDisplayType(e) {
          var t = e && e.tagName.toString().toLowerCase();return /^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(t) ? "inline" : /^(li)$/i.test(t) ? "list-item" : /^(tr)$/i.test(t) ? "table-row" : /^(table)$/i.test(t) ? "table" : /^(tbody)$/i.test(t) ? "table-row-group" : "block";
        }, addClass: function addClass(e, t) {
          e.classList ? e.classList.add(t) : e.className += (e.className.length ? " " : "") + t;
        }, removeClass: function removeClass(e, t) {
          e.classList ? e.classList.remove(t) : e.className = e.className.toString().replace(new RegExp("(^|\\s)" + t.split(" ").join("|") + "(\\s|$)", "gi"), " ");
        } }, getPropertyValue: function getPropertyValue(e, r, n, o) {
        function s(e, r) {
          function n() {
            u && x.setPropertyValue(e, "display", "none");
          }var l = 0;if (8 >= f) l = $.css(e, r);else {
            var u = !1;if ((/^(width|height)$/.test(r) && 0 === x.getPropertyValue(e, "display") && (u = !0, x.setPropertyValue(e, "display", x.Values.getDisplayType(e))), !o)) {
              if ("height" === r && "border-box" !== x.getPropertyValue(e, "boxSizing").toString().toLowerCase()) {
                var c = e.offsetHeight - (parseFloat(x.getPropertyValue(e, "borderTopWidth")) || 0) - (parseFloat(x.getPropertyValue(e, "borderBottomWidth")) || 0) - (parseFloat(x.getPropertyValue(e, "paddingTop")) || 0) - (parseFloat(x.getPropertyValue(e, "paddingBottom")) || 0);return (n(), c);
              }if ("width" === r && "border-box" !== x.getPropertyValue(e, "boxSizing").toString().toLowerCase()) {
                var p = e.offsetWidth - (parseFloat(x.getPropertyValue(e, "borderLeftWidth")) || 0) - (parseFloat(x.getPropertyValue(e, "borderRightWidth")) || 0) - (parseFloat(x.getPropertyValue(e, "paddingLeft")) || 0) - (parseFloat(x.getPropertyValue(e, "paddingRight")) || 0);return (n(), p);
              }
            }var d;d = i(e) === a ? t.getComputedStyle(e, null) : i(e).computedStyle ? i(e).computedStyle : i(e).computedStyle = t.getComputedStyle(e, null), "borderColor" === r && (r = "borderTopColor"), l = 9 === f && "filter" === r ? d.getPropertyValue(r) : d[r], ("" === l || null === l) && (l = e.style[r]), n();
          }if ("auto" === l && /^(top|right|bottom|left)$/i.test(r)) {
            var g = s(e, "position");("fixed" === g || "absolute" === g && /top|left/i.test(r)) && (l = $(e).position()[r] + "px");
          }return l;
        }var l;if (x.Hooks.registered[r]) {
          var u = r,
              c = x.Hooks.getRoot(u);n === a && (n = x.getPropertyValue(e, x.Names.prefixCheck(c)[0])), x.Normalizations.registered[c] && (n = x.Normalizations.registered[c]("extract", e, n)), l = x.Hooks.extractValue(u, n);
        } else if (x.Normalizations.registered[r]) {
          var p, d;p = x.Normalizations.registered[r]("name", e), "transform" !== p && (d = s(e, x.Names.prefixCheck(p)[0]), x.Values.isCSSNullValue(d) && x.Hooks.templates[r] && (d = x.Hooks.templates[r][1])), l = x.Normalizations.registered[r]("extract", e, d);
        }if (!/^[\d-]/.test(l)) if (i(e) && i(e).isSVG && x.Names.SVGAttribute(r)) if (/^(height|width)$/i.test(r)) try {
          l = e.getBBox()[r];
        } catch (g) {
          l = 0;
        } else l = e.getAttribute(r);else l = s(e, x.Names.prefixCheck(r)[0]);return (x.Values.isCSSNullValue(l) && (l = 0), v.debug >= 2 && console.log("Get " + r + ": " + l), l);
      }, setPropertyValue: function setPropertyValue(e, r, a, n, o) {
        var s = r;if ("scroll" === r) o.container ? o.container["scroll" + o.direction] = a : "Left" === o.direction ? t.scrollTo(a, o.alternateValue) : t.scrollTo(o.alternateValue, a);else if (x.Normalizations.registered[r] && "transform" === x.Normalizations.registered[r]("name", e)) x.Normalizations.registered[r]("inject", e, a), s = "transform", a = i(e).transformCache[r];else {
          if (x.Hooks.registered[r]) {
            var l = r,
                u = x.Hooks.getRoot(r);n = n || x.getPropertyValue(e, u), a = x.Hooks.injectValue(l, a, n), r = u;
          }if ((x.Normalizations.registered[r] && (a = x.Normalizations.registered[r]("inject", e, a), r = x.Normalizations.registered[r]("name", e)), s = x.Names.prefixCheck(r)[0], 8 >= f)) try {
            e.style[s] = a;
          } catch (c) {
            v.debug && console.log("Browser does not support [" + a + "] for [" + s + "]");
          } else i(e) && i(e).isSVG && x.Names.SVGAttribute(r) ? e.setAttribute(r, a) : e.style[s] = a;v.debug >= 2 && console.log("Set " + r + " (" + s + "): " + a);
        }return [s, a];
      }, flushTransformCache: function flushTransformCache(e) {
        function t(t) {
          return parseFloat(x.getPropertyValue(e, t));
        }var r = "";if ((f || v.State.isAndroid && !v.State.isChrome) && i(e).isSVG) {
          var a = { translate: [t("translateX"), t("translateY")], skewX: [t("skewX")], skewY: [t("skewY")], scale: 1 !== t("scale") ? [t("scale"), t("scale")] : [t("scaleX"), t("scaleY")], rotate: [t("rotateZ"), 0, 0] };$.each(i(e).transformCache, function (e) {
            /^translate/i.test(e) ? e = "translate" : /^scale/i.test(e) ? e = "scale" : /^rotate/i.test(e) && (e = "rotate"), a[e] && (r += e + "(" + a[e].join(" ") + ") ", delete a[e]);
          });
        } else {
          var n, o;$.each(i(e).transformCache, function (t) {
            return (n = i(e).transformCache[t], "transformPerspective" === t ? (o = n, !0) : (9 === f && "rotateZ" === t && (t = "rotate"), void (r += t + n + " ")));
          }), o && (r = "perspective" + o + " " + r);
        }x.setPropertyValue(e, "transform", r);
      } };x.Hooks.register(), x.Normalizations.register(), v.hook = function (e, t, r) {
      var n = a;return (e = o(e), $.each(e, function (e, o) {
        if ((i(o) === a && v.init(o), r === a)) n === a && (n = v.CSS.getPropertyValue(o, t));else {
          var s = v.CSS.setPropertyValue(o, t, r);"transform" === s[0] && v.CSS.flushTransformCache(o), n = s;
        }
      }), n);
    };var S = function S() {
      function e() {
        return l ? T.promise || null : f;
      }function n() {
        function e(e) {
          function p(e, t) {
            var r = a,
                i = a,
                s = a;return (g.isArray(e) ? (r = e[0], !g.isArray(e[1]) && /^[\d-]/.test(e[1]) || g.isFunction(e[1]) || x.RegEx.isHex.test(e[1]) ? s = e[1] : (g.isString(e[1]) && !x.RegEx.isHex.test(e[1]) || g.isArray(e[1])) && (i = t ? e[1] : u(e[1], o.duration), e[2] !== a && (s = e[2]))) : r = e, t || (i = i || o.easing), g.isFunction(r) && (r = r.call(n, w, P)), g.isFunction(s) && (s = s.call(n, w, P)), [r || 0, i, s]);
          }function f(e, t) {
            var r, a;return (a = (t || "0").toString().toLowerCase().replace(/[%A-z]+$/, function (e) {
              return (r = e, "");
            }), r || (r = x.Values.getUnitType(e)), [a, r]);
          }function d() {
            var e = { myParent: n.parentNode || r.body, position: x.getPropertyValue(n, "position"), fontSize: x.getPropertyValue(n, "fontSize") },
                a = e.position === N.lastPosition && e.myParent === N.lastParent,
                o = e.fontSize === N.lastFontSize;N.lastParent = e.myParent, N.lastPosition = e.position, N.lastFontSize = e.fontSize;var s = 100,
                l = {};if (o && a) l.emToPx = N.lastEmToPx, l.percentToPxWidth = N.lastPercentToPxWidth, l.percentToPxHeight = N.lastPercentToPxHeight;else {
              var u = i(n).isSVG ? r.createElementNS("http://www.w3.org/2000/svg", "rect") : r.createElement("div");v.init(u), e.myParent.appendChild(u), $.each(["overflow", "overflowX", "overflowY"], function (e, t) {
                v.CSS.setPropertyValue(u, t, "hidden");
              }), v.CSS.setPropertyValue(u, "position", e.position), v.CSS.setPropertyValue(u, "fontSize", e.fontSize), v.CSS.setPropertyValue(u, "boxSizing", "content-box"), $.each(["minWidth", "maxWidth", "width", "minHeight", "maxHeight", "height"], function (e, t) {
                v.CSS.setPropertyValue(u, t, s + "%");
              }), v.CSS.setPropertyValue(u, "paddingLeft", s + "em"), l.percentToPxWidth = N.lastPercentToPxWidth = (parseFloat(x.getPropertyValue(u, "width", null, !0)) || 1) / s, l.percentToPxHeight = N.lastPercentToPxHeight = (parseFloat(x.getPropertyValue(u, "height", null, !0)) || 1) / s, l.emToPx = N.lastEmToPx = (parseFloat(x.getPropertyValue(u, "paddingLeft")) || 1) / s, e.myParent.removeChild(u);
            }return (null === N.remToPx && (N.remToPx = parseFloat(x.getPropertyValue(r.body, "fontSize")) || 16), null === N.vwToPx && (N.vwToPx = parseFloat(t.innerWidth) / 100, N.vhToPx = parseFloat(t.innerHeight) / 100), l.remToPx = N.remToPx, l.vwToPx = N.vwToPx, l.vhToPx = N.vhToPx, v.debug >= 1 && console.log("Unit ratios: " + JSON.stringify(l), n), l);
          }if (o.begin && 0 === w) try {
            o.begin.call(m, m);
          } catch (y) {
            setTimeout(function () {
              throw y;
            }, 1);
          }if ("scroll" === k) {
            var S = /^x$/i.test(o.axis) ? "Left" : "Top",
                V = parseFloat(o.offset) || 0,
                C,
                A,
                F;o.container ? g.isWrapped(o.container) || g.isNode(o.container) ? (o.container = o.container[0] || o.container, C = o.container["scroll" + S], F = C + $(n).position()[S.toLowerCase()] + V) : o.container = null : (C = v.State.scrollAnchor[v.State["scrollProperty" + S]], A = v.State.scrollAnchor[v.State["scrollProperty" + ("Left" === S ? "Top" : "Left")]], F = $(n).offset()[S.toLowerCase()] + V), s = { scroll: { rootPropertyValue: !1, startValue: C, currentValue: C, endValue: F, unitType: "", easing: o.easing, scrollData: { container: o.container, direction: S, alternateValue: A } }, element: n }, v.debug && console.log("tweensContainer (scroll): ", s.scroll, n);
          } else if ("reverse" === k) {
            if (!i(n).tweensContainer) return void $.dequeue(n, o.queue);"none" === i(n).opts.display && (i(n).opts.display = "auto"), "hidden" === i(n).opts.visibility && (i(n).opts.visibility = "visible"), i(n).opts.loop = !1, i(n).opts.begin = null, i(n).opts.complete = null, b.easing || delete o.easing, b.duration || delete o.duration, o = $.extend({}, i(n).opts, o);var E = $.extend(!0, {}, i(n).tweensContainer);for (var j in E) if ("element" !== j) {
              var H = E[j].startValue;E[j].startValue = E[j].currentValue = E[j].endValue, E[j].endValue = H, g.isEmptyObject(b) || (E[j].easing = o.easing), v.debug && console.log("reverse tweensContainer (" + j + "): " + JSON.stringify(E[j]), n);
            }s = E;
          } else if ("start" === k) {
            var E;i(n).tweensContainer && i(n).isAnimating === !0 && (E = i(n).tweensContainer), $.each(h, function (e, t) {
              if (RegExp("^" + x.Lists.colors.join("$|^") + "$").test(e)) {
                var r = p(t, !0),
                    n = r[0],
                    o = r[1],
                    i = r[2];if (x.RegEx.isHex.test(n)) {
                  for (var s = ["Red", "Green", "Blue"], l = x.Values.hexToRgb(n), u = i ? x.Values.hexToRgb(i) : a, c = 0; c < s.length; c++) {
                    var f = [l[c]];o && f.push(o), u !== a && f.push(u[c]), h[e + s[c]] = f;
                  }delete h[e];
                }
              }
            });for (var R in h) {
              var O = p(h[R]),
                  z = O[0],
                  q = O[1],
                  M = O[2];R = x.Names.camelCase(R);var I = x.Hooks.getRoot(R),
                  B = !1;if (i(n).isSVG || "tween" === I || x.Names.prefixCheck(I)[1] !== !1 || x.Normalizations.registered[I] !== a) {
                (o.display !== a && null !== o.display && "none" !== o.display || o.visibility !== a && "hidden" !== o.visibility) && /opacity|filter/.test(R) && !M && 0 !== z && (M = 0), o._cacheValues && E && E[R] ? (M === a && (M = E[R].endValue + E[R].unitType), B = i(n).rootPropertyValueCache[I]) : x.Hooks.registered[R] ? M === a ? (B = x.getPropertyValue(n, I), M = x.getPropertyValue(n, R, B)) : B = x.Hooks.templates[I][1] : M === a && (M = x.getPropertyValue(n, R));var W,
                    G,
                    D,
                    X = !1;if ((W = f(R, M), M = W[0], D = W[1], W = f(R, z), z = W[0].replace(/^([+-\/*])=/, function (e, t) {
                  return (X = t, "");
                }), G = W[1], M = parseFloat(M) || 0, z = parseFloat(z) || 0, "%" === G && (/^(fontSize|lineHeight)$/.test(R) ? (z /= 100, G = "em") : /^scale/.test(R) ? (z /= 100, G = "") : /(Red|Green|Blue)$/i.test(R) && (z = z / 100 * 255, G = "")), /[\/*]/.test(X))) G = D;else if (D !== G && 0 !== M) if (0 === z) G = D;else {
                  l = l || d();var Y = /margin|padding|left|right|width|text|word|letter/i.test(R) || /X$/.test(R) || "x" === R ? "x" : "y";switch (D) {case "%":
                      M *= "x" === Y ? l.percentToPxWidth : l.percentToPxHeight;break;case "px":
                      break;default:
                      M *= l[D + "ToPx"];}switch (G) {case "%":
                      M *= 1 / ("x" === Y ? l.percentToPxWidth : l.percentToPxHeight);break;case "px":
                      break;default:
                      M *= 1 / l[G + "ToPx"];}
                }switch (X) {case "+":
                    z = M + z;break;case "-":
                    z = M - z;break;case "*":
                    z = M * z;break;case "/":
                    z = M / z;}s[R] = { rootPropertyValue: B, startValue: M, currentValue: M, endValue: z, unitType: G, easing: q }, v.debug && console.log("tweensContainer (" + R + "): " + JSON.stringify(s[R]), n);
              } else v.debug && console.log("Skipping [" + I + "] due to a lack of browser support.");
            }s.element = n;
          }s.element && (x.Values.addClass(n, "velocity-animating"), L.push(s), "" === o.queue && (i(n).tweensContainer = s, i(n).opts = o), i(n).isAnimating = !0, w === P - 1 ? (v.State.calls.push([L, m, o, null, T.resolver]), v.State.isTicking === !1 && (v.State.isTicking = !0, c())) : w++);
        }var n = this,
            o = $.extend({}, v.defaults, b),
            s = {},
            l;switch ((i(n) === a && v.init(n), parseFloat(o.delay) && o.queue !== !1 && $.queue(n, o.queue, function (e) {
          v.velocityQueueEntryFlag = !0, i(n).delayTimer = { setTimeout: setTimeout(e, parseFloat(o.delay)), next: e };
        }), o.duration.toString().toLowerCase())) {case "fast":
            o.duration = 200;break;case "normal":
            o.duration = y;break;case "slow":
            o.duration = 600;break;default:
            o.duration = parseFloat(o.duration) || 1;}v.mock !== !1 && (v.mock === !0 ? o.duration = o.delay = 1 : (o.duration *= parseFloat(v.mock) || 1, o.delay *= parseFloat(v.mock) || 1)), o.easing = u(o.easing, o.duration), o.begin && !g.isFunction(o.begin) && (o.begin = null), o.progress && !g.isFunction(o.progress) && (o.progress = null), o.complete && !g.isFunction(o.complete) && (o.complete = null), o.display !== a && null !== o.display && (o.display = o.display.toString().toLowerCase(), "auto" === o.display && (o.display = v.CSS.Values.getDisplayType(n))), o.visibility !== a && null !== o.visibility && (o.visibility = o.visibility.toString().toLowerCase()), o.mobileHA = o.mobileHA && v.State.isMobile && !v.State.isGingerbread, o.queue === !1 ? o.delay ? setTimeout(e, o.delay) : e() : $.queue(n, o.queue, function (t, r) {
          return r === !0 ? (T.promise && T.resolver(m), !0) : (v.velocityQueueEntryFlag = !0, void e(t));
        }), "" !== o.queue && "fx" !== o.queue || "inprogress" === $.queue(n)[0] || $.dequeue(n);
      }var s = arguments[0] && (arguments[0].p || $.isPlainObject(arguments[0].properties) && !arguments[0].properties.names || g.isString(arguments[0].properties)),
          l,
          f,
          d,
          m,
          h,
          b;if ((g.isWrapped(this) ? (l = !1, d = 0, m = this, f = this) : (l = !0, d = 1, m = s ? arguments[0].elements || arguments[0].e : arguments[0]), m = o(m))) {
        s ? (h = arguments[0].properties || arguments[0].p, b = arguments[0].options || arguments[0].o) : (h = arguments[d], b = arguments[d + 1]);var P = m.length,
            w = 0;if (!/^(stop|finish)$/i.test(h) && !$.isPlainObject(b)) {
          var V = d + 1;b = {};for (var C = V; C < arguments.length; C++) g.isArray(arguments[C]) || !/^(fast|normal|slow)$/i.test(arguments[C]) && !/^\d/.test(arguments[C]) ? g.isString(arguments[C]) || g.isArray(arguments[C]) ? b.easing = arguments[C] : g.isFunction(arguments[C]) && (b.complete = arguments[C]) : b.duration = arguments[C];
        }var T = { promise: null, resolver: null, rejecter: null };l && v.Promise && (T.promise = new v.Promise(function (e, t) {
          T.resolver = e, T.rejecter = t;
        }));var k;switch (h) {case "scroll":
            k = "scroll";break;case "reverse":
            k = "reverse";break;case "finish":case "stop":
            $.each(m, function (e, t) {
              i(t) && i(t).delayTimer && (clearTimeout(i(t).delayTimer.setTimeout), i(t).delayTimer.next && i(t).delayTimer.next(), delete i(t).delayTimer);
            });var A = [];return ($.each(v.State.calls, function (e, t) {
              t && $.each(t[1], function (r, n) {
                var o = b === a ? "" : b;return o === !0 || t[2].queue === o || b === a && t[2].queue === !1 ? void $.each(m, function (r, a) {
                  a === n && ((b === !0 || g.isString(b)) && ($.each($.queue(a, g.isString(b) ? b : ""), function (e, t) {
                    g.isFunction(t) && t(null, !0);
                  }), $.queue(a, g.isString(b) ? b : "", [])), "stop" === h ? (i(a) && i(a).tweensContainer && o !== !1 && $.each(i(a).tweensContainer, function (e, t) {
                    t.endValue = t.currentValue;
                  }), A.push(e)) : "finish" === h && (t[2].duration = 1));
                }) : !0;
              });
            }), "stop" === h && ($.each(A, function (e, t) {
              p(t, !0);
            }), T.promise && T.resolver(m)), e());default:
            if (!$.isPlainObject(h) || g.isEmptyObject(h)) {
              if (g.isString(h) && v.Redirects[h]) {
                var F = $.extend({}, b),
                    E = F.duration,
                    j = F.delay || 0;return (F.backwards === !0 && (m = $.extend(!0, [], m).reverse()), $.each(m, function (e, t) {
                  parseFloat(F.stagger) ? F.delay = j + parseFloat(F.stagger) * e : g.isFunction(F.stagger) && (F.delay = j + F.stagger.call(t, e, P)), F.drag && (F.duration = parseFloat(E) || (/^(callout|transition)/.test(h) ? 1000 : y), F.duration = Math.max(F.duration * (F.backwards ? 1 - e / P : (e + 1) / P), 0.75 * F.duration, 200)), v.Redirects[h].call(t, t, F || {}, e, P, m, T.promise ? T : a);
                }), e());
              }var H = "Velocity: First argument (" + h + ") was not a property map, a known action, or a registered redirect. Aborting.";return (T.promise ? T.rejecter(new Error(H)) : console.log(H), e());
            }k = "start";}var N = { lastParent: null, lastPosition: null, lastFontSize: null, lastPercentToPxWidth: null, lastPercentToPxHeight: null, lastEmToPx: null, remToPx: null, vwToPx: null, vhToPx: null },
            L = [];$.each(m, function (e, t) {
          g.isNode(t) && n.call(t);
        });var F = $.extend({}, v.defaults, b),
            R;if ((F.loop = parseInt(F.loop), R = 2 * F.loop - 1, F.loop)) for (var O = 0; R > O; O++) {
          var z = { delay: F.delay, progress: F.progress };O === R - 1 && (z.display = F.display, z.visibility = F.visibility, z.complete = F.complete), S(m, "reverse", z);
        }return e();
      }
    };v = $.extend(S, v), v.animate = S;var P = t.requestAnimationFrame || d;return (v.State.isMobile || r.hidden === a || r.addEventListener("visibilitychange", function () {
      r.hidden ? (P = function (e) {
        return setTimeout(function () {
          e(!0);
        }, 16);
      }, c()) : P = t.requestAnimationFrame || d;
    }), e.Velocity = v, e !== t && (e.fn.velocity = S, e.fn.velocity.defaults = v.defaults), $.each(["Down", "Up"], function (e, t) {
      v.Redirects["slide" + t] = function (e, r, n, o, i, s) {
        var l = $.extend({}, r),
            u = l.begin,
            c = l.complete,
            p = { height: "", marginTop: "", marginBottom: "", paddingTop: "", paddingBottom: "" },
            f = {};l.display === a && (l.display = "Down" === t ? "inline" === v.CSS.Values.getDisplayType(e) ? "inline-block" : "block" : "none"), l.begin = function () {
          u && u.call(i, i);for (var r in p) {
            f[r] = e.style[r];var a = v.CSS.getPropertyValue(e, r);p[r] = "Down" === t ? [a, 0] : [0, a];
          }f.overflow = e.style.overflow, e.style.overflow = "hidden";
        }, l.complete = function () {
          for (var t in f) e.style[t] = f[t];c && c.call(i, i), s && s.resolver(i);
        }, v(e, p, l);
      };
    }), $.each(["In", "Out"], function (e, t) {
      v.Redirects["fade" + t] = function (e, r, n, o, i, s) {
        var l = $.extend({}, r),
            u = { opacity: "In" === t ? 1 : 0 },
            c = l.complete;l.complete = n !== o - 1 ? l.begin = null : function () {
          c && c.call(i, i), s && s.resolver(i);
        }, l.display === a && (l.display = "In" === t ? "auto" : "none"), v(this, u, l);
      };
    }), v);
  })(window.jQuery || window.Zepto || window, window, document);
});

},{}],19:[function(require,module,exports){
'use strict';

$(document).on({
    mouseenter: function mouseenter() {
        $(this).find('.js-is-hidden').addClass('is-visible');
    },
    mouseleave: function mouseleave() {
        $(this).find('.js-is-hidden').removeClass('is-visible');
    }
}, '.js-toggle-visible');

},{}]},{},[1])


//# sourceMappingURL=main.js.map