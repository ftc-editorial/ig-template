function logPages(pageName, pageNumber) {
	try {
	  ga('send', 'pageview', pageName + '?page=' + pageNumber);
	  fa('send', 'pageview', pageName + '?page=' + pageNumber);
	  ftcLog();
	} catch (ignore) {

	}	
}

const Page = {
	init: function(id, el) {
		this.id = id;
		this.el = el;
		this.visible = false;
		this.counter = 0;
	},
	setVisible: function (newValue) {
		if (newValue !== this.visible) {
			this.visible = newValue;
			if (this.visible) {
				this.counter += 1;
				this.logPages('Page', this.id);
			}
		}
	},

	logPages: function(pageName, pageNumber) {
		console.log(pageName + ': ' + pageNumber);
		console.log('Logging page ' + this.id + ' for ' + this.counter + ' times');
	}
};

function PageCounter(pageEls) {
	const pageCounter = this;
	const pageInstances = [];

	function init() {
		pageCounter.dir = 0;
		pageCounter.lastY = window.pageYOffset;
		pageCounter.winHeight = window.innerHeight;

		for (let i = 0, len = pageEls.length; i < len; i++) {
			const newPage = Object.create(Page);
			newPage.init(i+1, pageEls[i]);
			pageInstances.push(newPage);
		}
	
		window.addEventListener('DOMContentLoaded', handleScroll);
		window.addEventListener('resize', handleResize);
		window.addEventListener('scroll', handleScroll);
		window.addEventListener('unload', function() {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
		});
	}

	function handleResize() {
		pageCounter.winHeight = window.innerHeight;
	}

	function handleScroll() {
		const scrollY = window.pageYOffset;

		if (scrollY > pageCounter.lastY) {
			pageCounter.dir = 1;
		} else if (scrollY < pageCounter.lastY) {
			pageCounter.dir = -1;
		}
		pageCounter.lastY = scrollY;

		pageInstances.forEach(function(page) {
			const pageRect = page.el.getBoundingClientRect();
			const top = pageRect.top;
			const bottom = pageRect.bottom;

			if (top >= pageCounter.winHeight) {
				console.log(page.id + ': top below viewport.');
				page.setVisible(false);
			}

			if (top > 0 && top < pageCounter.winHeight) {
				console.log(page.id + ': top in viewport.');
		// If user refreshed page and viewport spans two pages. Those two pages will both logged.
				if (pageCounter.dir === 1 || pageCounter.dir === 0) {
					page.setVisible(true);
				}
			}

			if (top < 0 && bottom > pageCounter.winHeight) {
				console.log(page.id + ': top above; bottom below.');
			}

			if (bottom < pageCounter.winHeight && bottom > 0) {
				console.log(page.id + ': bottom in viewport.');
				if (pageCounter.dir === -1 || pageCounter.dir === 0) {
					page.setVisible(true);
				}
			}

			if (bottom < 0) {
				console.log(page.id + ': bottom above.');
				page.setVisible(false);
			}
		});
	}	
}