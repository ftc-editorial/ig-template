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

		const rootRect = rootEl.getBoundingClientRect();
		const targetEl = rootEl.querySelector(stickyTargetClass);

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

		this.initSlides();
		this.setTargetElWidth();
		this.updatePosition();
	}

	initSlides() {
		const slidesTargetClass = this.targetEl.getAttribute('data-slides-target');
		if (!slidesTargetClass) {
			console.log('Slides not enabled.')
			return;
		}
		const imgEl = this.targetEl.querySelector(slidesTargetClass);

		if (!imgEl) {
			console.log('Cannot find slides image container.');
			return;
		}

		const images = imgEl.getAttribute('data-slides-set').trim().split(' ');
		const imageLen = images.length;
		if (!imageLen) {
			console.log('No slides images');
			return;
		}
		const slideInterval = (this.fixedRange === 0 ) ? 0 : this.fixedRange / imageLen;

		console.log(slideInterval);

		this.enableSlides = true;
		this.imgEl = imgEl;
		this.images = images;
		this.slideInterval = slideInterval;
		this.currentImgIndex = -1;		
	}

	setState(newState) {
		if (this.state !== newState) {
			this.state = newState;
			this.targetEl.setAttribute('aria-sticky', newState);
		}
	}

	setImage(index) {
		if (this.currentImgIndex !== index) {
			this.currentImgIndex = index;
			this.imgEl.src = this.images[index];
		}
	}

	setTargetElWidth() {
		this.targetEl.style.width = this.rootEl.offsetWidth + 'px';
	}

	updatePosition() {
		const rectTop = this.rootEl.getBoundingClientRect().top;

		if (rectTop > this.start) {
			this.setState('top');
			if (this.enableSlides) {
				this.setImage(0);
			}			
		} else if (rectTop <= this.start) {
			const movedDistance = Math.abs(rectTop - this.start);

			if (movedDistance < this.fixedRange) {
				this.setState('fixed');

				if (this.enableSlides) {
					const remainder = Math.floor( movedDistance / this.slideInterval);
					this.setImage(remainder);
				}

			} else {
				this.setState('bottom');
				if (this.enableSlides) {
					this.setImage(this.images.length - 1);
				}
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