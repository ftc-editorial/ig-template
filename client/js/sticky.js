const helper = require('./helper');
// @param config = {
//	offset: number
// 	startPoint: number,
//  endPoint: number || null,
// 	targetEl: HTMLElement,
// 	debug: false
// }

function Sticky(rootEl, config) {
	const oSticky = this;
	const rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function(callback){ window.setTimeout(callback, 1000/60) };
// Add default config if not set.
	config = helper.merge(config, {
		offset: 0,
		debug: false
	});

	function init() {

		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}

		oSticky.targetEl = rootEl.hasAttribute('aria-controls') ? rootEl.getAttribute('aria-controls') : null;

		for (let prop in config) {
			oSticky[prop] = config[prop];
		}

		if (!oSticky.targetEl) {
			return;
		}

		if (!(oSticky.targetEl instanceof HTMLElement)) {
			oSticky.targetEl = rootEl.querySelector(oSticky.targetEl);
		}

		const stickyRange = findRange(rootEl, oSticky.targetEl);

		if (!oSticky.hasOwnProperty('startPoint')) {
			oSticky.startPoint = stickyRange.start;
		}

		if (!oSticky.hasOwnProperty('endPoint')) {
			oSticky.endPoint = stickyRange.end;
		}

		oSticky.rootEl = rootEl;
		oSticky.lastPosition = -1;
		oSticky.lastHeight = -1;
		loop();
	}

	function loop(){

	    const scrollY = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
// Avoid calculations if not scrolled.
	    if (oSticky.lastPosition == scrollY) {
	        rAF(loop);
	        return false;
	    } 

	    oSticky.lastPosition = scrollY;

// If you decide to start the effect before rootEl reaches the top the window:
	    const aboveTop = (oSticky.lastPosition + oSticky.offset) < oSticky.startPoint;

	    const belowBottom = (oSticky.endPoint === 'null') ? false : (oSticky.lastPosition + oSticky.offset) > oSticky.endPoint;
		const stickyState = oSticky.targetEl.getAttribute('aria-sticky');

	    if (config.debug) {
	    	console.log('aboveTop: ' + aboveTop + ', belowBottom: ' + belowBottom);
	    }

	    if (aboveTop) {
	    	oSticky.targetEl.setAttribute('aria-sticky', 'top');
	    } else if (belowBottom) {
	    	oSticky.targetEl.setAttribute('aria-sticky', 'bottom');
	    } else {
	    	oSticky.targetEl.setAttribute('aria-sticky', 'fixed');
	    }

	    rAF( loop );
	}

	function findRange(rootEl, targetEl) {
		const rootElCoords = helper.getElementCoords(rootEl);
			
		return {
			start: rootElCoords.top, 
			end: rootElCoords.bottom - targetEl.offsetHeight 
		};
	}

	init();
}
// el could be a HTMLElement, string, or plain object.
Sticky.init = function(el, config) {
	const StickyInstances = [];

	if (!el) {
		el = document.body;
		config = {};
	} else if (!config) {
		if (!(el instanceof HTMLElement)) {
			if (typeof el === 'string') {
				el = document.querySelector(el);
			} else {
				config = el;
				el = document.body;
			}
		}
	}

	const stickyEls = el.querySelectorAll('[data-o-component=o-sticky]');

	for (let i = 0; i < stickyEls.length; i++) {
		StickyInstances.push(new Sticky(stickyEls[i], config));
	}
	return StickyInstances;
}

module.exports = Sticky;