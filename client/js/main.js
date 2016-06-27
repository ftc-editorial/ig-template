const oShare = require('ftc-share');
const oToggle = require('./toggle');
const oSticky = require('./sticky');
oShare.init();
oToggle.init();

const Page = {
	init: function(id, el) {
		this.id = id;
		this.el = el;
		this.top = el.getBoundingClientRect().top;
		this.bottom = el.getBoundingClientRect().bottom;
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

const pageCounter = {
	dir: 0, // default: not scrolled. 1: down; -1: up.
	lastY: window.pageYOffset,
	winHeight: window.innerHeight
};

const pageInstances = [];

const pageEls = document.querySelectorAll('.section__container');

for (let i = 0, len = pageEls.length; i < len; i++) {
	const newPage = Object.create(Page);
	newPage.init(i+1, pageEls[i]);
	pageInstances.push(newPage);
}

const page = Object.create(Page);
page.init(1, pageEls[0]);

window.addEventListener('DOMContentLoaded', handleScroll);
window.addEventListener('scroll', handleScroll);
window.addEventListener('resize', handleResize);
window.addEventListener('unload', function() {
	window.removeEventListener('scroll', handleScroll);
	window.removeEventListener('resize', handleResize);
	alert('Are you sure');
});

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

	const pageRect = page.el.getBoundingClientRect();
	page.top = pageRect.top;
	page.bottom = pageRect.bottom;

	if (page.top >= pageCounter.winHeight) {
		console.log(page.id + ': top below viewport.');
		page.setVisible(false);
	}

	if (page.top > 0 && page.top < pageCounter.winHeight) {
		console.log(page.id + ': top in viewport.');
// If user refreshed page and viewport spans two pages. Those two pages will both logged.
		if (pageCounter.dir === 1 || pageCounter.dir === 0) {
			page.setVisible(true);
		}
	}

	if (page.top < 0 && page.bottom > pageCounter.winHeight) {
		console.log(page.id + ': top above; bottom below.');
	}

	if (page.bottom < pageCounter.winHeight && page.bottom > 0) {
		console.log(page.id + ': bottom in viewport.');
		if (pageCounter.dir === -1 || pageCounter.dir === 0) {
			page.setVisible(true);
		}
	}

	if (page.bottom < 0) {
		console.log(page.id + ': bottom above.');
		page.setVisible(false);
	}

}
