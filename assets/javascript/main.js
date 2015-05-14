import analytics from './analytics';
import supports from './supports';
import './vendor/velocity';
import './site-navigation';
import './quick-links';
import './accordion';
import './page-anchors';
import './visibility-toggle';
import './banner';





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


        