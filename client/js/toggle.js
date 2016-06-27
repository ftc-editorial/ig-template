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
}

module.exports = Toggle;