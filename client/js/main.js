const oShare = require('ftc-share');
const oToggle = require('./toggle');
import Sticky from './sticky';
const PageCounter = require('./pager');
oShare.init();
oToggle.init();
oSticky.init();
new PageCounter(document.querySelectorAll('.section__container'));