/* eslint-disable no-console */

const pageLoggerPath = window.location.pathname;
var viewportHeight = window.innerHeight;

class PageLogger {
	constructor(rootEl, id) {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}
		const rootRect = rootEl.getBoundingClientRect();

		this.rootEl = rootEl;
		this.id = id;
		this.visible = false;
		this.counter = 0;
		this.name = pageLoggerPath + '?page=' + this.id;
		this.linkEl = this.generateNavLink();
// set initial bounds and direction
		this.top = rootRect.top;
		this.bottom = rootRect.bottom;

		this.updateVisibility();
	}
/* global ga:false, fa:false */
	logPage() {
		try {
			ga('set', 'contentGroup1', 'Data News');
			ga('send', 'pageview', this.name);
			fa('send', 'pageview', this.name);
		} catch (ignore) {
			console.log('Logging page ' + this.name + ' for ' + this.counter + ' times');
		}
	}

	setVisibility(newValue) {
		if (this.visible !== newValue) {
			this.visible = newValue;
			if (this.visible) {
				this.counter++;
				this.logPage();
				this.linkEl.classList.add('active');
			} else {
				this.linkEl.classList.remove('active');
			}
		}
	}

	updateVisibility() {
		if (this.top > viewportHeight) {
// the top of this section is below the viewport.
			this.setVisibility(false);
		}

// this section is partially visible, but the bottom is below veiwport. set it visible.
		if (this.top < viewportHeight && this.bottom >= viewportHeight) {
			this.setVisibility(true);
		}
// the bottom is above viewport, set it no visible.
		if (this.bottom < viewportHeight) {
			this.setVisibility(false);
		}

	}

	updateBounds() {
		const rootRect = this.rootEl.getBoundingClientRect();
		this.top = rootRect.top;
		this.bottom = rootRect.bottom;
		this.updateVisibility();
	}

	generateNavLink() {
		const aEl = document.createElement('a');
		aEl.href = '#' + this.rootEl.id;
		aEl.className = 'o-header__nav-link';
		aEl.innerHTML = this.id;
		return aEl;
	}

// `els` expects a css slector or an array of elements
// config.enableAutonav: true,
// config.navContainer: element
	static init(sectionEls, config) {
		if (!sectionEls) {
			console.log('SectionLogger.init(sectionEls) should be passed a css selector or an array of elements. NULL. Abort.');
			return;
		}
		
		if (typeof sectionEls === 'string') {
			sectionEls = document.querySelectorAll(sectionEls);
		}

		const pageInstances = [];

		for (let i = 0, len = sectionEls.length; i < len; i++) {
			pageInstances.push(new PageLogger(sectionEls[i], i+1));
		}

		function createNav() {
			const navEl = document.createElement('nav');
			navEl.className = 'o-header__auto-nav'
			for(let i = 0, len = pageInstances.length; i < len; i++) {
				navEl.appendChild(pageInstances[i].linkEl);
			}
			document.querySelector('.o-header .o-header__center').appendChild(navEl);
			return navEl;
		}

		if (document.documentElement.classList.contains('enable-autonav')) {
			if (!config.navContainer) {
				config.navContainer = document.body;
			} else if (!(config.navContainer instanceof HTMLElement)) {
				config.navContainer = document.querySelector(config.navContainer);
			}
			config.navContainer.appendChild(createNav());
		}

		function handleScroll() {
// calculate direction here with window.pageYOffset?
			for(let i = 0, len = pageInstances.length; i < len; i++) {
				pageInstances[i].updateBounds();
			}			
		}

		function handleResize() {
			viewportHeight = window.innerHeight;
			handleScroll();
		}

		window.addEventListener('scroll', handleScroll);
		window.addEventListener('resize', handleResize);
		window.addEventListener('unload', function() {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
		});
		// console.log(pageInstances);
		return pageInstances;
	}
}

export default PageLogger;