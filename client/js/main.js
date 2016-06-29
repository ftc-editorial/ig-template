const oShare = require('ftc-share');
const oToggle = require('./toggle');
const Sticky = require('./sticky');
const PageCounter = require('./pager');
oShare.init();
oToggle.init();

// Only enable sticky effect when HTML tag has `enabel-scrollmation` class.
if (document.documentElement.classList.contains('enable-scrollmation')) {
	new Sticky();	
}

new PageCounter('.section__container');
