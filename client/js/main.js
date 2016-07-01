const Share = require('ftc-share');
// const oToggle = require('./toggle');
import Toggle from './toggle';
// const Sticky = require('./sticky');
import Sticky from './sticky';
// const PageCounter = require('./pager');
import PageCounter from './pager';
Share.init();
Toggle.init();

// Only enable sticky effect when HTML tag has `enabel-scrollmation` class.
if (document.documentElement.classList.contains('enable-scrollmation')) {
	new Sticky();	
}

new PageCounter('.section__container');
