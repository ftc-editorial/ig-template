/* eslint-disable no-console */
const stickyRootAttribute = '[data-o-component~=o-sticky]';
const stickyTargetClass = '.o-sticky-target';

class Sticky {
	constructor(rootEl, config) {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}

		this.rootEl = rootEl;
		const targetEl = rootEl.querySelector(stickyTargetClass);
		if (!targetEl) {
			console.log('Abort. Sticky target does not exist for ' + this.rootEl);
			return;
		}

		config = config ||  {};

		this.targetEl = targetEl;

		const rootRect = rootEl.getBoundingClientRect();

		this.start = rootRect.top;
		this.end = rootEl.bottom - this.targetEl.offsetHeight;

		this.state = 'top';
		this.offset = config.offset || 0;

		this.setTargetElWidth();
		this.updatePosition();
	}

	setState(newState) {
		if (this.state !== newState) {
			this.state = newState;
			this.targetEl.setAttribute('aria-sticky', newState);
		}
	}

	setTargetElWidth() {
		this.targetEl.style.width = this.rootEl.offsetWidth + 'px';
	}

	updatePosition() {
		const rootRect = this.rootEl.getBoundingClientRect();
		this.start = rootRect.top;
		this.end = rootRect.bottom - this.targetEl.offsetHeight;
		if (this.start > this.offset) {
			this.setState('top');
		}

		if (this.start < this.offset && this.end > this.offset) {
			this.setState('fixed');
		}

		if (this.end < this.offset) {
			this.setState('bottom');
		}
	}

	static init(el) {
		const stickyInstances = [];
		if (!el) {
			el = document.body;
		} else if (!(el instanceof HTMLElement)) {
			el = document.querySelector(el);
		}

		const stickyElements = el.querySelectorAll(stickyRootAttribute);
		for (let i = 0; i < stickyElements.length; i++) {
			stickyInstances.push(new Sticky(stickyElements[i]));
		}

		function handleScroll() {
			for (let i = 0, len = stickyInstances.length; i < len; i++) {
				stickyInstances[i].updatePosition();
			}
		}

		function handleResize() {
			for (let i = 0, len = stickyInstances.length; i < len; i++) {
				stickyInstances[i].setTargetElWidth();
			}
		}

		window.addEventListener('scroll', handleScroll);
		window.addEventListener('resize', handleResize);
		window.addEventListener('unload', function() {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
		});

		return stickyInstances;
	}
}

export default Sticky;