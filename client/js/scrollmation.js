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

    this._currentState = '';
  }

  get yDiff() {
    return this.rootEl.offsetHeight - this.targetEl.offsetHeight;
  }

  set state(newState) {

  }
}

Scrollmation.STICK_TOP = 1;
Scrollmation.FIXED = 2;
Scrollmation.STICK_BOTTOM = 3;