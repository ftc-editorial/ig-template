/* eslint-disable no-console */
const scrollmationRootAttr = '[data-o-component~=o-scrollmation]';
const scrollmationTargetClass = '.o-scrollmation-target';
const scrollmationImageClass = '.o-scrollmation-image';
const scrollmationSrcSetAttr = 'data-o-scrollmation-srcset';

class Scrollslide {
	constructor(rootEl, config) {
		if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}
		config = config ? config : {};

		const targetEl = rootEl.querySelector(scrollmationTargetClass);
		if (!targetEl) {
			console.log('Scrollmation target does not exist. Abort.');
			return;
		}

		const imgEl = targetEl.querySelector(scrollmationImageClass);
		if (!imgEl) {
			console.log('Image element does not exist. Abort.');
			return;
		}

		const images = imgEl.getAttribute(scrollmationSrcSetAttr).trim().split(' ')
		const imageLen = images.length;
		const rootElHeight = rootEl.offsetHeight;
		const targetElHeight = targetEl.offsetHeight;

		var segmentHeight;

		if (rootElHeight < targetElHeight) {
			segmentHeight = 4;
		} else if (rootElHeight > targetElHeight * imageLen) {
			segmentHeight = targetElHeight;
		} else {
			segmentHeight = (rootElHeight - targetElHeight) / (imageLen - 1);
		}

		console.log(segmentHeight);

		this.rootEl = rootEl;
		this.images = images;
		this.imgEl = imgEl;	
		this.currentImgIndex = -1;
		this.start = config.start || 0;
		this.segmentHeight = segmentHeight;
		this.allowedRange = imageLen * segmentHeight;

		console.log("rootElHeight: " + rootElHeight, "targetElHeight: " + targetElHeight, "segmentHeight: " + segmentHeight, "allowedRange: " + this.allowedRange);

		this.updatePosition();
	}

	setImage(index) {
// if the the image should not change, just do not set it.
		if (this.currentImgIndex !== index) {
			this.currentImgIndex = index;
			this.imgEl.src = this.images[index];
		}
	}

	updatePosition() {
		const rectTop = this.rootEl.getBoundingClientRect().top;
		const movedDistance = Math.abs(rectTop - this.start);


		if (rectTop > this.start) {
			this.setImage(0);
			console.log(movedDistance)
		} else {
			console.log(movedDistance)
			if (movedDistance < this.allowedRange) {
				const remainder = Math.floor( movedDistance / this.segmentHeight);
				this.setImage(remainder);
				console.log('use image: ' + remainder);
			} else {
				this.setImage(this.images.length - 1);
				console.log('out of range, use the last image');
			}
		}
	}

	static init(el) {
		const scrollInstances = [];
		if (!el) {
			el = document.body;
		} else if (!(el instanceof HTMLElement)) {
			el = document.querySelector(el);
		}

		const scrollElements = el.querySelectorAll(scrollmationRootAttr);
		for (let i = 0; i < scrollElements.length; i++) {
			scrollInstances.push(new Scrollmation(scrollElements[i]));
		}

		function handleScroll() {
			for (let i = 0, len = scrollInstances.length; i < len; i++) {
				scrollInstances[i].updatePosition();
			}
		}

		window.addEventListener('scroll', handleScroll);
		window.addEventListener('unload', function() {
			window.removeEventListener('scroll', handleScroll);
		});

		return scrollInstances;
	}
}

export default Scrollmation;