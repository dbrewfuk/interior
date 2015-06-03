if ($('.js-unslider').length > 0){
$(function() {
    $('.js-unslider').unslider({
    	items: '.js-slider',
    	item: '.js-slide',
    	arrows: true,
    	fluid: true,
    	autoplay: false
    });
});
}

(function($, f) {
	var Unslider = function() {
		//  Object clone
		var _ = this;

		//  Set some options
		_.o = {
			speed: 0,     // animation speed, false for no transition (integer or boolean)
			delay: 5000,    // delay between slides, false for no autoplay (integer or boolean)
			init: 0,        // init delay, false for no delay (integer or boolean)
			pause: !f,      // pause on hover (boolean)
			loop: !f,       // infinitely looping (boolean)
			keys: f,        // keyboard shortcuts (boolean)
			dots: f,        // display dots pagination (boolean)
			arrows: f,      // display prev/next arrows (boolean)
			prev: '&larr;', // text or html inside prev button (string)
			next: '&rarr;', // same as for prev option
			fluid: f,       // is it a percentage width? (boolean)
			starting: f,    // invoke before animation (function with argument)
			complete: f,    // invoke after animation (function with argument)
			items: '>ul',   // slides container selector
			item: '>li',    // slidable items selector
			activeClass: 'is-active',
			easing: 'easeInOutExpo',// easing function to use for animation
			autoplay: true,  // enable autoplay on initialisation
			fluidh: false // enable/disable fluid height
		};

		_.init = function(el, o) {
			//  Check whether we're passing any options in to Unslider
			_.o = $.extend(_.o, o);

			_.el = el;
			_.ul = el.find(_.o.items);
			_.max = [el.outerWidth() | 0, el.outerHeight() | 0];
			_.li = _.ul.find(_.o.item).each(function(index) {
				var me = $(this),
					width = me.outerWidth(),
					height = me.outerHeight();

				//  Set the max values
				if (width > _.max[0]) _.max[0] = width;
				if (height > _.max[1]) _.max[1] = height;
		

			// If it is the first item, let's add the activeClass.
				if ( index === 0 ) {
					me.addClass( _.o.activeClass );
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
			ul.css({position: 'relative', left: 0, width: '100%'});
			if(o.fluid) {
				li.css({});
			} else {
				li.css({});
			}

			//  Autoslide
			o.autoplay && setTimeout(function() {
				if (o.delay | 0) {
					_.play();

					if (o.pause) {
						el.on('mouseover mouseout', function(e) {
							_.stop();
							e.type === 'mouseout' && _.play();
						});
					}
				}
			}, o.init | 0);

			//  Keypresses
			if (o.keys) {
				$(document).keydown(function(e) {
					switch(e.which) {
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
			o.fluid && $(window).resize(function() {
				_.r && clearTimeout(_.r);

				_.r = setTimeout(function() {
					var styl = {height: li.eq(_.i).outerHeight()},
						width = el.outerWidth();

				
					styl.width = Math.min(Math.round((width / el.parent().width()) * 100), 100) + '%';
			
					if (o.fluidh) {
					li.css({ width: width + 'px' });
				}
				}, 50);
			}).resize();

			//  Move support
			if ($.event.special.move || $.Event('move')) {
				el.on('movestart', function(e) {
					if ((e.distX > e.distY && e.distX < -e.distY) || (e.distX < e.distY && e.distX > -e.distY)) {
						e.preventDefault();
					}else{
						el.data('left', _.ul.offset().left / el.width() * 100);
					}
				}).on('move', function(e) {
					var left = 100 * e.distX / el.width();
				        var leftDelta = 100 * e.deltaX / el.width();
					_.ul[0].style.left = parseInt(_.ul[0].style.left.replace('%', ''))+leftDelta+'%';

					_.ul.data('left', left);
				}).on('moveend', function(e) {
					var left = _.ul.data('left');
					if (Math.abs(left) > 30){
						var i = left > 0 ? _.i-1 : _.i+1;
						if (i < 0 || i >= len) i = _.i;
						_.to(i);
					}else{
						_.to(_.i);
					}
				});
			}

			return _;
		};

		//  Move Unslider to a slide index
		_.to = function(index, callback) {
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
				obj = {height: target.outerHeight()};

			if (!ul.queue('fx').length) {
				//  Handle those pesky dots
				el.find('.dot').eq(index).addClass('active').siblings().removeClass('active');
		

				el.animate(speed) && ul.animate($.extend({}), speed, function(data) {
 					_.i = index;

					// Add an active class to the slide and remove it from the previous slide
					ul.children().removeClass( o.activeClass );
					target.addClass( o.activeClass );

					$.isFunction(o.complete) && !callback && o.complete(el, target);
				});
			
			}

		};

		//  Autoplay functionality
		_.play = function() {
			_.t = setInterval(function() {
				_.to(_.i + 1);
			}, _.o.delay | 0);
		};

		//  Stop autoplay
		_.stop = function() {
			_.t = clearInterval(_.t);
			return _;
		};

		//  Move to previous/next slide
		_.next = function() {
			return _.stop().to(_.i + 1);
		};

		_.prev = function() {
			return _.stop().to(_.i - 1);
		};

		//  Create dots and arrows
		function nav(name, html) {
			if (name == 'dot') {
				html = '<ol class="dots">';
					$.each(_.li, function(index) {
						html += '<li class="' + (index === _.i ? name + ' active' : name) + '">' + index + '</li>';
					});
				html += '</ol>';
			} else {
				html = '<div class="';
				html = html + name + 's"><a class="' + name + ' prev">' + _.o.prev + '</a><a class="' + name + ' next">' + _.o.next + '</a></div>';
			}

			_.el.addClass('has-' + name + 's');
			$('.js-slider').append(html).find('.' + name).click(function() {
				var me = $(this);
				me.hasClass('dot') ? _.stop().to(me.index()) : me.hasClass('prev') ? _.prev() : _.next();
			});
		}
	};

	//  Create a jQuery plugin
	$.fn.unslider = function(o) {
		var len = this.length;

		//  Enable multiple-slider support
		return this.each(function(index) {
			//  Cache a copy of $(this), so it
			var me = $(this),
				key = 'unslider' + (len > 1 ? '-' + index : ''),
				instance = (new Unslider()).init(me, o);

			//  Invoke an Unslider instance
			me.data(key, instance).data('key', key);
		});
	};

	Unslider.version = '1.0.0';
})(jQuery, false);