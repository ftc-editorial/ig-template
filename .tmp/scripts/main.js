(function () {
  'use strict';

  /* eslint-disable no-console */
  const toggleBtnAttribute = '[data-o-toggle-button]';
  const toggleTargetAttribute = '[data-o-toggle-target]';

  function Toggle(rootEl, config={linkClass: 'o-header__nav-link'}) {
    const oToggle = this;

    function init() {
      if (!rootEl) {
        rootEl = document.body;
      } else if (!(rootEl instanceof HTMLElement)) {
        rootEl = document.querySelector(rootEl);
      }

      const btnEl = rootEl.querySelector(toggleBtnAttribute);
      const targetEl = rootEl.querySelector(toggleTargetAttribute);

      if (!btnEl) { return; }

      oToggle.rootEl = rootEl;
      oToggle.button = btnEl;
      oToggle.target = targetEl;
      oToggle.isOpen = false;

      //toggle.button.addEventListener('click', handleToggle);
      oToggle.button.addEventListener('click', handleToggle);
      oToggle.target.addEventListener('click', handleLinkClick);
      document.body.addEventListener('click',handleClick);
      document.body.addEventListener('keydown', handleEsc);     
    }

    function handleToggle() {
      oToggle.isOpen = !oToggle.isOpen;

      if (oToggle.isOpen) {
        oToggle.button.setAttribute('aria-expanded', 'true');
        oToggle.target.setAttribute('aria-hidden', 'false');
      } else {
        oToggle.button.setAttribute('aria-expanded', 'false');
        oToggle.target.setAttribute('aria-hidden', 'true');
      }
    }

    function handleEsc(e) {
      if (oToggle.isOpen && e.keyCode === 27) {
          handleToggle();
      }
    }
  // If clicked on navagation's link, the menu should collasped.
  // If clicked on navagation other than the link, nothing happens.
  // Delegate to oToggle.target.
  // Do not combine delegate for `oToggle.button` and `oToggle.target` into a single oToggle.rootEl since that might complicate event handlilng inside `handleToggle`.
    function handleLinkClick (e) {
      if (oToggle.isOpen && e.target.classList.contains(config.linkClass)) {
        handleToggle();
      }
    }

    function handleClick(e) {
      if (oToggle.isOpen && !rootEl.contains(e.target)) {
        handleToggle();
      }
    }

    init();
  }

  Toggle.init = function(el) {
    const toggleInstances = [];

    if (!el) {
      el = document.body;
    } else if (!(el instanceof HTMLElement)) {
      el = document.querySelector(el);
    }

    const toggleEls = el.querySelectorAll('[data-o-component=o-toggle]');

    for (let i = 0; i < toggleEls.length; i++) {
      toggleInstances.push(new Toggle(toggleEls[i]));
    }

    return toggleInstances;
  };

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
  			navEl.className = 'o-header__auto-nav';
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

  const states = ['top', 'fixed', 'bottom'];

  class Scrollmation {
    constructor(rootEl, config) {
      if (!rootEl) {
  			throw new Error('You must specify root element');
  		} else if (!(rootEl instanceof HTMLElement)) {
  			rootEl = document.querySelector(rootEl);
  		}

      if (!rootEl) {
  			return;
  		}

      const targetEl = rootEl.querySelector('.sticky-element');

      this.rootEl = rootEl;
      this.targetEl = targetEl;
      this._currentState = -1;
      this.setWidth();
      this.updateState();

      this.rootEl.setAttribute('data-scrollmation--js', 'true');

      if (Scrollmation._inst) {
        Scrollmation._inst.push(this);
      } else {
        Scrollmation._inst = [this];
      }
  // Insure only attach scroll and resize event once.
      if (!Scrollmation._eventsAttached) {
        window.addEventListener('scroll', Scrollmation.handleScroll);
        window.addEventListener('resize', Scrollmation.handleResize);

        Scrollmation._eventsAttached = true;
      }
    }

    get viewportHeight() {
      return window.innerHeight;
    }
  /**
   * Height difference between rootEl and targetEl
   * If the difference <= 0,scrollmation should not happen.
   */
    get heightDiff() {
      return this.rootEl.offsetHeight - this.targetEl.offsetHeight;
    }

    set state(newState) {
      if (this._currentState === newState) {
        return;
      }
      this._currentState = newState;
      this.targetEl.setAttribute('data-sticky', states[newState]);
    }
  /**
   * root element's rect
   */
    get bounds() {
      return this.rootEl.getBoundingClientRect();
    }

    setWidth() {
      this.targetEl.style.width = this.rootEl.offsetWidth + 'px';
    }

    updateState() {
      // targetEl's top should align to the top of rootEl
      if (this.bounds.top > 0) {
        this.state = Scrollmation.STICK_TOP;
        return;
      }
      // targetEl's bottom should align to the bottom of rootEl
      if (this.bounds.bottom < this.viewportHeight) {
        this.state = Scrollmation.STICK_BOTTOM;
        return;
      }

      this.state = Scrollmation.FIXED;
      return;
    }

    static handleScroll() {
      for (let inst of Scrollmation._inst) {
        if (!inst.rootEl.hasAttribute('data-scrollmation--js')) {
          continue;
        }
        inst.updateState();
      }
    }

    static handleResize() {
      for (let inst of Scrollmation._inst) {
        if (!inst.rootEl.hasAttribute('data-scrollmation--js')) {
          continue;
        }
        inst.setWidth();
        inst.updateState();
      }    
    }

    static init(el) {
      const instances = [];
      if (!el) {
  			el = document.body;
  		} else if (!(el instanceof HTMLElement)) {
  			el = document.querySelector(el);
  		}

      const rootEls = el.querySelectorAll('.ig-scrollmation');
      for (let rootEl of rootEls) {
        if (rootEl.hasAttribute('data-scrollmation--js')) {
          continue;
        }
        instances.push(new Scrollmation(rootEl));
      }
      return instances;
    }
  }

  Scrollmation.STICK_TOP = 0;
  Scrollmation.FIXED = 1;
  Scrollmation.STICK_BOTTOM = 2;

  // import Share from 'ftc-share';

  // Share.init();
  Toggle.init();

  PageLogger.init('.section', {
  	navContainer: '.o-header__center'
  });

  Scrollmation.init();

}());
//# sourceMappingURL=main.js.map
