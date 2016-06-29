const pagePath = window.location.pathname;

const PageWidget = {
	init: function(id, el) {
		this.id = id;
		this.el = el;
		this.visible = false;
		this.counter = 0;
		this.name = pagePath + '?page=' + this.id
	},
	setVisible: function (newValue) {
		if (newValue !== this.visible) {
			this.visible = newValue;
			if (this.visible) {
				this.counter += 1;
				this.logPages(this.name, this.counter);
			}
		}
	},

	logPages: function (pageName, counter) {
		try {
		  ga('send', 'pageview', pageName);
		  fa('send', 'pageview', pageName);
		  ftcLog();
		} catch (ignore) {
			console.log('Logging page ' + pageName + ' for ' + counter + ' times');
		}	
	}
};

function generatePageWidgets (pageEls) {
	const tmp = [];
	if (typeof pageEls === 'string') {
		pageEls = document.querySelectorAll(pageEls);
	}

	for (let i = 0, len = pageEls.length; i < len; i++) {
		const pageWidget = Object.create(PageWidget);
		pageWidget.init(i+1, pageEls[i]);
		tmp.push(pageWidget);
	}
	return tmp;
}

function PageCounter(pageEls) {
	const pageCounter = this;

	function init() {

		pageCounter.dir = 0;
		pageCounter.lastY = window.pageYOffset;
		pageCounter.winHeight = window.innerHeight;

		pageCounter.pages = generatePageWidgets(pageEls);

		addEvent();
	}

	function addEvent() {
// Brwosers will automatically scrolle to previous position after refreshed and fire `scroll`.	
		// window.addEventListener('DOMContentLoaded', handleScroll);
		window.addEventListener('resize', handleResize);
		window.addEventListener('scroll', handleScroll);
		window.addEventListener('unload', function() {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
		});		
	}

	function handleResize(e) {
		console.log(e.type)
		pageCounter.winHeight = window.innerHeight;
	}

	function handleScroll(e) {
		// console.log(e.type);

		const scrollY = window.pageYOffset;

		if (scrollY > pageCounter.lastY) {
			pageCounter.dir = 1;
		} else if (scrollY < pageCounter.lastY) {
			pageCounter.dir = -1;
		}
		pageCounter.lastY = scrollY;

		pageCounter.pages.forEach(function(page) {
			const pageRect = page.el.getBoundingClientRect();
			const top = pageRect.top;
			const bottom = pageRect.bottom;

			if (top >= pageCounter.winHeight) {
				// console.log(page.id + ': top below viewport.');
				page.setVisible(false);
			}

			if (top > 0 && top < pageCounter.winHeight) {
				// console.log(page.id + ': top in viewport.');
// If user refreshed page and viewport spans two pages. Those two pages will both logged.
				if (pageCounter.dir === 1 || pageCounter.dir === 0) {
					page.setVisible(true);
				}
			}

			if (top < 0 && bottom > pageCounter.winHeight) {
				// console.log(page.id + ': top above; bottom below.');
			}

			if (bottom < pageCounter.winHeight && bottom > 0) {
				// console.log(page.id + ': bottom in viewport.');
				if (pageCounter.dir === -1 || pageCounter.dir === 0) {
					page.setVisible(true);
				}
			}

			if (bottom < 0) {
				// console.log(page.id + ': bottom above.');
				page.setVisible(false);
			}
			// console.log(page);
		});
	}
	init();	
}

module.exports = PageCounter;