const defaultRootAttribute = '[data-o-component=o-sticky]';
const defaultTargetAttribute = '[data-o-sticky-target]';

function stickyElsAndTransitionPoints (el, config) {
	const tmp = [];
	const rootEls = el.querySelectorAll(config.rootSelector);

	for (let i = 0, len = rootEls.length; i < len; i++) {
		const rootEl = rootEls[i];

		const targetEl = rootEl.querySelector(config.targetSelector);
		const rootRect = rootEl.getBoundingClientRect();

		tmp.push({
			rootEl: rootEl,
			targetEl: targetEl,
			start: rootRect.top,
			end: rootRect.bottom - targetEl.offsetHeight
		});
	}
	return tmp;
}

// config = {
// 	offset: 0,
// 	rootSelector: string,
//	targetSelector: string
// }
class Sticky {
	constructor(el, config) {
		if (!el && !config) {
			el = document.body;
			config = {offset: 0};
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

		if (!config.rootSelector) {
			config.rootSelector = defaultRootAttribute;
		}

		if (!config.targetSelector) {
			config.targetSelector = defaultTargetAttribute;
		}
	
		this.offset = config.offset;
		this.stickys = stickyElsAndTransitionPoints(el, config);

		this.handleScroll = this.handleScroll.bind(this);
		this.handleResize = this.handleResize.bind(this);

		this.handleResize();
		this.handleScroll();

		// window.addEventListener('DOMContentLoaded', this.handleScroll);
		window.addEventListener('scroll', this.handleScroll);
		window.addEventListener('resize', this.handleResize);
		window.addEventListener('unload', function() {

		});
	}

	handleScroll() {
		this.stikcys.forEach(function(sticky) {

			const rootRect = sticky.rootEl.getBoundingClientRect();
			sticky.start = rootRect.top;
			sticky.end = rootRect.bottom - sticky.targetEl.offsetHeight;

			if (sticky.start > this.offset) {
				sticky.targetEl.setAttribute('aria-sticky', 'top');
			}

			if (sticky.start < this.offset && sticky.end > this.offset) {
				sticky.targetEl.setAttribute('aria-sticky', 'fixed');
			}

			if (sticky.end < this.offset) {
				sticky.targetEl.setAttribute('aria-sticky', 'bottom');
			}
		}, this);
	}

	handleResize() {
		this.stickys.forEach(function(sticky) {
			sticky.targetEl.style.width = sticky.rootEl.offsetWidth + 'px';
		}, this);
	}
}


export default Sticky;