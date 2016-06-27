const offset = 0;
function Sticky (rootEl) {
	const oSticky = this;

	function init() {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}

		oSticky.rootEl = rootEl;
		oSticky.targetEl = rootEl.querySelector('[data-o-sticky-target]');
		
		oSticky.targetEl.style.width = rootEl.offsetWidth + 'px';

		const rootRect = rootEl.getBoundingClientRect();
		oSticky.start = rootRect.top;

		// const targetRect = oSticky.targetEl.getBoundingClientRect();
		oSticky.end = rootRect.bottom - oSticky.targetEl.offsetHeight;

		window.addEventListener('DOMContentLoaded', handleScroll);
		window.addEventListener('scroll', handleScroll);
		window.addEventListener('resize', function() {
			oSticky.targetEl.style.width = rootEl.offsetWidth + 'px';
		});
	}

	function handleScroll() {
		const rootRect = rootEl.getBoundingClientRect();
		oSticky.start = rootRect.top;

		// const targetRect = oSticky.targetEl.getBoundingClientRect();
		oSticky.end = rootRect.bottom - oSticky.targetEl.offsetHeight;


		if (oSticky.start > offset) {
			oSticky.targetEl.setAttribute('aria-sticky', 'top');
		}

		if (oSticky.start < offset && oSticky.end > offset) {
			oSticky.targetEl.setAttribute('aria-sticky', 'fixed');
		}

		if (oSticky.end < offset) {
			oSticky.targetEl.setAttribute('aria-sticky', 'bottom');
		}
	}

	init();
}

const sticky = new Sticky('.red');
console.log(sticky);