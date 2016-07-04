const Share = require('ftc-share');
import Toggle from './toggle';
import Sticky from './sticky';
import PageCounter from './pager';
Share.init();
Toggle.init();

// Only enable sticky effect when HTML tag has `enabel-scrollmation` class.
if (document.documentElement.classList.contains('enable-scrollmation')) {
	new Sticky();	
}

new PageCounter('.section__container');
