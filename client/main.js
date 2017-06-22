import Share from 'ftc-share';
import Toggle from './js/toggle';
import PageLogger from './js/page-logger';
import Scrollmation from './js/scrollmation.js';

Share.init();
Toggle.init();

PageLogger.init('.section', {
	navContainer: '.o-header__center'
});

Scrollmation.init();