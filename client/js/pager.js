function logPages(pageName, pageNumber) {
	try {
	  ga('send', 'pageview', pageName + '?page=' + pageNumber);
	  fa('send', 'pageview', pageName + '?page=' + pageNumber);
	  ftcLog();
	} catch (ignore) {

	}	
}


const sections = document.querySelectorAll('.section__container');
const height = window.innerHeight;
var previousY = window.pageYOffset;

const secInfo = [];
for (let i = 0; i < sections.length; i++) {
	const tmp = {
		id: i + 1,
		el: sections[i],
		_visible: false,
		counter: 0,
		get visible() {
			return this._visible;
		},
		set visible(newValue) {
			if (newValue !== this._visible) {
				this._visible = newValue;
				if (this._visible) {
					this.counter += 1;
					this.logPages('News', this.id);
				}
			}
		},
		logPages: function(pageName, pageNumber) {
			console.log('Logged page: ' + pageName + ' ' + pageNumber);
		}
	};

	secInfo.push(tmp);
}

window.addEventListener('scroll', function() {
	var dir;
	const currentY = window.pageYOffset;
	const scrolled = currentY - previousY;
	previousY = currentY;
	if (scrolled > 0) {
		dir = 1;
	}

	if (scrolled < 0) {
		dir = -1;
	}

	for(let i = 0; i < secInfo.length; i++) {
		const currentInfo = secInfo[i];
		const rect = currentInfo.el.getBoundingClientRect();
		const top = rect.top;
		const bottom = rect.bottom;

		if (top >= height) {
			console.log(currentInfo.id + ': top below viewport.');
			currentInfo.visible = false;	
		}

		if (top > 0 && top < height) {
			console.log(currentInfo.id + ': top in viewport.');
			if (dir === 1) {
				currentInfo.visible = true;
			}
		}

		if (top < 0 && bottom > height) {
			console.log(currentInfo.id + ': top above; bottom below.');
		}

		if (bottom < height && bottom > 0) {
			console.log(currentInfo.id + ': bottom in viewport.');
			if (dir === -1) {
				currentInfo.visible = true;
			}

		}

		if (bottom < 0) {
			console.log(currentInfo.id + ': bottom above.');
			currentInfo.visible = false;
		}

		console.log(currentInfo);			
	}	
});