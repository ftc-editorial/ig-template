/* eslint-disable no-console */
const slideRootSelector = '.ig-slide';
const slideContainerSelector = '.ig-slide-target';
const slideDataAttr = 'data-slide-set';
const slideImgSelector = '.ig-slide-image';
const slideCaptionSelector = '.ig-slide-caption';

class Slide {
	constructor(rootEl, config) {
		if (!rootEl) {
			rootEl = document.body
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}
		this.enabled = false;
		const rootRect = rootEl.getBoundingClientRect();
		const containerEl = rootEl.querySelector(slideContainerSelector);	

		if (!containerEl) {
			console.log('Abort. Container elm does not exist for ' + this.rootEl);
			return;
		}

		const slideRange = rootEl.offsetHeight - containerEl.offsetHeight;

		const imgEl = containerEl.querySelector(slideImgSelector);
		const captionEl = containerEl.querySelector(slideCaptionSelector);

		if (!imgEl) {
			console.log(containerEl, ' deos not have img or caption elm. Abort.');
			return;
		}

		const images = imgEl.getAttribute(slideDataAttr).trim().split(' ');
		const captions = captionEl.getAttribute(slideDataAttr).trim().split(' ');

		const imageLen = images.length;

		if (!imageLen) {
			console.log('No slides images');
			return;
		}

		this.enabled = true;

		var slideInterval = (slideRange === 0 ) ? 0 : slideRange / imageLen;
// minimal pixels per scroll.
		slideInterval = (slideInterval > 4) ? slideInterval : 4;

		config = config ||  {};

		this.rootEl = rootEl;

		this.slideRange = slideRange;
		this.slideInterval = slideInterval;

		this.imgEl = imgEl;
		this.images = images;

		this.captionEl = captionEl;
		this.captions = captions;
		
		this.currentImgIndex = -1;
		this.start = (config.start && typeof config.start === 'number') ? config.start : 0;

		this.updatePosition();
	}

	setImage(index) {
		if (this.currentImgIndex !== index) {
			this.currentImgIndex = index;
			if (this.imgEl && this.images[index]) {
				this.imgEl.src = this.images[index];
			}

			if (this.captionEl && this.captions[index]) {
				this.captionEl.textContent = this.captions[index];
			}
		}
	}

	updatePosition() {
		const rectTop = this.rootEl.getBoundingClientRect().top;

		if (rectTop > this.start) {
				this.setImage(0);

		} else if (rectTop <= this.start) {
			const movedDistance = Math.abs(rectTop - this.start);

			if (movedDistance < this.slideRange) {

				const remainder = Math.floor( movedDistance / this.slideInterval);
				this.setImage(remainder);

			} else {
				this.setImage(this.images.length - 1);
			}
		}
	}

	static init(el) {
		const slideInstances = [];
		if (!el) {
			el = document.body;
		} else if (!(el instanceof HTMLElement)) {
			el = document.querySelector(el);
		}

		const slideElements = el.querySelectorAll(slideRootSelector);

		for (let i = 0; i < slideElements.length; i++) {
			
			const instance = new Slide(slideElements[i]);
			
			slideInstances.push(instance);
		}

		function handleScroll() {
			for (let i = 0, len = slideInstances.length; i < len; i++) {
				if (slideInstances[i].enabled) {
					slideInstances[i].updatePosition();
				}
			}
		}

		window.addEventListener('scroll', handleScroll);
		window.addEventListener('unload', function() {
			window.removeEventListener('scroll', handleScroll);
		});
		
		return slideInstances;
	}
}

export default Slide;