/* eslint-disable no-console */

import Share from 'ftc-share';
import Sticky, {Scrollmation} from 'ftc-sticky';
import Toggle from './toggle';
import PageLogger from './page-logger';

Share.init();
Toggle.init();

// Only enable sticky and scrollmation effects when HTML tag has `enabel-scrollmation` class.
if (document.documentElement.classList.contains('enable-scrollmation')) {
	Sticky.init();
	Scrollmation.init();
}

PageLogger.init('.section', {
	navContainer: '.o-header__center'
});