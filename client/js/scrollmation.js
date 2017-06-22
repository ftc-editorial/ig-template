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

    const targetEl = rootEl.querySelector('.ig-scrollmation__slides');

    this.rootEl = rootEl;
    this.targetEl = targetEl;
    this._currentState = -1;
    this.updateState();

    this.rootEl.setAttribute('data-scrollmation--js', 'true');

    if (Scrollmation._inst) {
      Scrollmation._inst.push(this);
    } else {
      Scrollmation._inst = [this];
    }

    if (!Scrollmation._eventsAttached) {
      window.addEventListener('scroll', Scrollmation.handleScrollOrResize);
      window.addEventListener('resize', Scrollmation.handleScrollOrResize);

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

  static handleScrollOrResize() {
    for (let inst of Scrollmation._inst) {
      if (!inst.rootEl.hasAttribute('data-scrollmation--js')) {
        continue;
      }
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

export default Scrollmation;