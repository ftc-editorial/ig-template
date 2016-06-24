const togglerBtnAttribute = '[data-o-toggler-button]'
const togglerTargetAttribute = '[data-o-toggler-target]'

function Toggler(rootEl, config={linkClass: 'o-header__nav-link'}) {
  const toggler = this;

  function init() {
    if (!rootEl) {
      rootEl = document.body;
    } else if (!(rootEl instanceof HTMLElement)) {
      rootEl = document.querySelector(rootEl);
    }

    const btnEl = rootEl.querySelector(togglerBtnAttribute);
    const targetEl = rootEl.querySelector(togglerTargetAttribute);

    if (!btnEl) { return; }

    toggler.rootEl = rootEl;
    toggler.button = btnEl;
    toggler.target = targetEl;
    toggler.isOpen = false;

    //toggler.button.addEventListener('click', handleToggle);
    toggler.button.addEventListener('click', handleToggle);
    toggler.target.addEventListener('click', handleLinkClick);
    document.body.addEventListener('click',handleClick);
    document.body.addEventListener('keydown', handleEsc);     
  }

  function handleToggle() {
    toggler.isOpen = !toggler.isOpen;

    if (toggler.isOpen) {
      toggler.button.setAttribute('aria-expanded', 'true');
      toggler.target.setAttribute('aria-hidden', 'false');
    } else {
      toggler.button.setAttribute('aria-expanded', 'false');
      toggler.target.setAttribute('aria-hidden', 'true');
    }
  }

  function handleEsc(e) {
    if (toggler.isOpen && e.keyCode === 27) {
        handleToggle();
    }
  }
// If clicked on navagation's link, the menu should collasped.
// If clicked on navagation other than the link, nothing happens.
// Delegate to toggler.target.
// Do not combine delegate for `toggler.button` and `toggler.target` into a single toggler.rootEl since that might complicate event handlilng inside `handleToggle`.
  function handleLinkClick (e) {
    if (toggler.isOpen && e.target.classList.contains(config.linkClass)) {
      handleToggle();
    }
  }

  function handleClick(e) {
    if (toggler.isOpen && !rootEl.contains(e.target)) {
      handleToggle();
    }
  }

  init();
}

Toggler.init = function(el) {
  const togglerInstances = [];

  if (!el) {
    el = document.body;
  } else if (!(el instanceof HTMLElement)) {
    el = document.querySelector(el);
  }

  const togglerEls = el.querySelectorAll('[data-o-component=o-toggler]');

  for (let i = 0; i < togglerEls.length; i++) {
    togglerInstances.push(new Toggler(togglerEls[i]));
  }

  return togglerInstances
}

module.exports = Toggler;