/* eslint-disable no-console */
const stickyRootSelector = '.ig-scrollmation';
const stickyTargetSelector = '.ig-scrollmation__sticky';

class Sticky {
	constructor(rootEl, config) {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}

		const rootRect = rootEl.getBoundingClientRect();
		const targetEl = rootEl.querySelector(stickyTargetSelector);

		if (!targetEl) {
			console.log('Abort. Sticky target does not exist for ' + this.rootEl);
			return;
		}
		const fixedRange = rootEl.offsetHeight - targetEl.offsetHeight;
		if (fixedRange < 0) {
			console.log('Abort. Root element is heigher than sticky element. No need of scrollmantion effect.');
			return;
		}

		config = config ||  {};

		this.rootEl = rootEl;
		this.targetEl = targetEl;
		this.start = (config.start && typeof config.start === 'number') ? config.start : 0;
		this.fixedRange = fixedRange;
		this.state = '';
		this.rootHeight = rootEl.offsetHeight;
		this.targetHeight = targetEl.offsetHeight;

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
		const rectTop = this.rootEl.getBoundingClientRect().top;

		if (rectTop > this.start) {
			this.setState('top');
			
		} else if (rectTop <= this.start) {
			const movedDistance = Math.abs(rectTop - this.start);

			if (movedDistance < this.fixedRange) {
				this.setState('fixed');
			} else {
				this.setState('bottom');
			}
		}
	}

	static init(el) {
		const stickyInstances = [];
		if (!el) {
			el = document.body;
		} else if (!(el instanceof HTMLElement)) {
			el = document.querySelector(el);
		}

		const stickyElements = el.querySelectorAll(stickyRootSelector);
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