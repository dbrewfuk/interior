
import analytics from './analytics';
import supports from './supports';
import './vendor/moment.js';
import './vendor/velocity';
import './vendor/instafeed';

var supports = require('./supports');

import './vendor/prism.js';




// Stuff to be organized later...

$('.js-msu-clear-search').on('click', function(){

});






// Add an `is-legacy` class on browsers that don't supports flexbox.
if (!supports.flexbox()) {
  let div = document.createElement('div');
  div.className = 'Error';
  div.innerHTML = `Your browser does not support Flexbox.
                   Parts of this site may not appear as expected.`;

  document.body.insertBefore(div, document.body.firstChild);
}

// Track various interations with Google Analytics
analytics.track();














      