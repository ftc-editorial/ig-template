const scrollmationRootAttr = '[data-o-component~=o-scrollmation]';
const scrollmationTargetClass = '.o-scrollmation-target';
const scrollmationSrcSetAttr = 'data-o-scrollmation-srcset';

class Scrollmation {
	constructor(rootEl, config) {
		if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}
		config = config ? config : {};

		const imgEl = rootEl.querySelector(scrollmationTargetClass);
		if (!imgEl) {
			console.log('Scrollmation target does not exist. Abort.');
			return;
		}

		this.rootEl = rootEl;
		this.imgEl = imgEl;
		this.images = imgEl.getAttribute(scrollmationSrcSetAttr).trim().split(' ');
// push the initial image to the beginning of the images array.
		// const imagesLen = this.images.unshift(imgEl.src);
		const imagesLen = this.images.length;

		this.currentImgIndex = -1;

		this.start = config.start || 0;
		const endLine  = config.end || rootEl.offsetHeight;

		const totalRange = endLine - this.start;

// split `distance` to evenly pieces based on the number of images.
// length + 1 to leave space for the last one.
		this.segmentDistance = totalRange / (imagesLen + 1);
// upperbound to start should have imageLen * segmentDistance
		this.allowedRange = totalRange - this.segmentDistance;
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
			console.log('not started, using first image.');
		} else {
			if (movedDistance < this.allowedRange) {
				const remainder = Math.floor( movedDistance / this.segmentDistance);
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
		// window.addEventListener('load', handleScroll);

		return scrollInstances;
	}
}

export default Scrollmation;