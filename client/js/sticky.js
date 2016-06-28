function Sticky (rootEl) {

	if (!rootEl) {
		rootEl = document.body;
	} else if (!(rootEl instanceof HTMLElement)) {
		rootEl = document.querySelector(rootEl);
	}
	this.rootEl = rootEl;

	const targetEl = rootEl.querySelector('[data-o-sticky-target]');
	targetEl.style.width = rootEl.offsetWidth + 'px';
	this.targetEl = targetEl;

	const rootRect = rootEl.getBoundingClientRect();

	this.start = rootRect.top;
	this.end = rootRect.bottom - targetEl.offsetHeight;

}

Sticky.init = function(el, config) {
	const stickyInstances = [];

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

	const stickyEls = el.querySelectorAll('[data-o-component=o-sticky]');

	for (let i = 0, len = stickyEls.length; i < len; i++) {
		stickyInstances.push(new Sticky(stickyEls[i]));
	}


	window.addEventListener('DOMContentLoaded', handleScroll);
	window.addEventListener('scroll', handleScroll);
	window.addEventListener('resize', handleResize);

	return stickyInstances;

	function handleResize() {
		stickyInstances.forEach(function(sticky) {
			sticky.targetEl.style.width = sticky.rootEl.offsetWidth + 'px';
		});
	}

	function handleScroll() {

		stickyInstances.forEach(function(sticky) {
			const rootRect = sticky.rootEl.getBoundingClientRect();
			sticky.start = rootRect.top;
			sticky.end = rootRect.bottom - sticky.targetEl.offsetHeight;

			if (sticky.start > config.offset) {
				sticky.targetEl.setAttribute('aria-sticky', 'top');
			}

			if (sticky.start < config.offset && sticky.end > config.offset) {
				sticky.targetEl.setAttribute('aria-sticky', 'fixed');
			}

			if (sticky.end < config.offset) {
				sticky.targetEl.setAttribute('aria-sticky', 'bottom');
			}
		});
	}
}

module.exports = Sticky;