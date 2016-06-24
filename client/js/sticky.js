// @param options = {
// 	start: ,
//  end: ,
// 	containerEl: ,
// 	debug: false
// }

function Sticky(fixedEl, options={start: 0}) {
	const oSticky = this;
	const rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function(callback){ window.setTimeout(callback, 1000/60) }


	function init() {

		if (typeof options.start !== 'number') {
			console.log('Start position must be a number');
			return;
		}
		if (options.end && typeof options.end !== 'nubmer') {
			console.log('End position must be a number');
			return;
		}
		oSticky.lastPosition = -1;
		oSticky.start = options.start;
		oSticky.end = options.end;
		if (!(fixedEl instanceof HTMLElement)) {
			fixedEl = document.querySelector(fixedEl);
		}
		oSticky.fixedEl = fixedEl;
		loop();
	}

	function loop(){
	    // Avoid calculations if not needed
	    const scrollY = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

	    if (oSticky.lastPosition == scrollY) {
	        rAF(loop);
	        return false;
	    } else {
	    	oSticky.lastPosition = scrollY;
	    }

	    const abovePeak = oSticky.lastPosition < oSticky.start;
	    var belowTrough = false;

	    if (typeof oSticky.end === 'number') {
	    	belowTrough = oSticky.lastPosition > oSticky.end;
	    }

	    const between = !abovePeak && !belowTrough;

	    if (options.debug) {
	    	console.log('abovePeak: ' + abovePeak + ', between: ' + between + ', belowTrough: ' + belowTrough);
	    }

	    var sticked = oSticky.fixedEl.getAttribute('aria-sticky');
	    var troughed = oSticky.fixedEl.getAttribute('aria-troughed');

	    if (between && !sticked) {
	    	oSticky.fixedEl.setAttribute('aria-sticky', 'true');
	    } else if (!between && sticked) {
	    	oSticky.fixedEl.removeAttribute('aria-sticky');
	    }

	    if (belowTrough && !troughed) {
	    	oSticky.fixedEl.setAttribute('aria-troughed', 'true');
	    } else if (!belowTrough && troughed) {
	    	oSticky.fixedEl.removeAttribute('aria-troughed');
	    }

	    rAF( loop );
	}
	init();
}

module.exports = Sticky;