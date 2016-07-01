const helper = require('./helper');
const defaultRootAttribute = '[data-o-component=o-sticky]';
const defaultTargetAttribute = '[data-o-sticky-target]';

const StickyWidget = {
	init: function(rootEl, config) {
		const rootRect = rootEl.getBoundingClientRect();

		this.rootEl = rootEl;
		this.targetEl = rootEl.querySelector(config.targetSelector);

		this.start = rootRect.top;
		this.end = rootRect.bottom - this.targetEl.offsetHeight
		this.state = 'top';
	},

	setState: function(newState) {
		if (newState !== this.state) {
			this.state = newState;
			this.targetEl.setAttribute('aria-sticky', newState);
		}
	}
};

function generateStickyWidgets (el, config) {
	const tmp = [];
	const rootEls = el.querySelectorAll(config.rootSelector);

	for (let i = 0, len = rootEls.length; i < len; i++) {
		const rootEl = rootEls[i];
		const stickyWidget = Object.create(StickyWidget);
		stickyWidget.init(rootEls[i], config);
		tmp.push(stickyWidget)
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

		config = helper.merge(config, {
			offset: 0,
			rootSelector: defaultRootAttribute,
			targetSelector: defaultTargetAttribute
		});

		this.offset = config.offset;
		this.stickys = generateStickyWidgets(el, config);

		this.handleScroll = this.handleScroll.bind(this);
		this.handleResize = this.handleResize.bind(this);

		this.handleResize();
		this.handleScroll();
		this.addEvent();
		// window.addEventListener('DOMContentLoaded', this.handleScroll);
	}

	addEvent() {
		window.addEventListener('scroll', this.handleScroll);
		window.addEventListener('resize', this.handleResize);
		window.addEventListener('unload', function() {
			window.removeEventListener('scroll', this.handleScroll);
			window.removeEventListener('resize', this.handleResize);
		});
	}

	handleScroll() {
		this.stickys.forEach(function(sticky) {

			const rootRect = sticky.rootEl.getBoundingClientRect();
			sticky.start = rootRect.top;
			sticky.end = rootRect.bottom - sticky.targetEl.offsetHeight;

			if (sticky.start > this.offset) {
				sticky.setState('top');
			}

			if (sticky.start < this.offset && sticky.end > this.offset) {
				sticky.setState('fixed');
			}

			if (sticky.end < this.offset) {
				sticky.setState('bottom');
			}
			// console.log(sticky);

		}, this);
	}

	handleResize() {
		this.stickys.forEach(function(sticky) {
			sticky.targetEl.style.width = sticky.rootEl.offsetWidth + 'px';
		}, this);
	}
}

export default Sticky;