// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment. Metadata-independent dual-fetch:
 * /content first (localhost / aem up), then site root (DA/EDS production).
 * @returns {Promise<string>} the nav fragment HTML
 */
async function fetchNavHtml() {
  let base = '/content/';
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    base = '/';
    resp = await fetch('/nav.plain.html');
  }
  if (!resp.ok) return { html: '', base };
  return { html: await resp.text(), base };
}

/**
 * Rewrite relative image srcs (e.g. "images/x.png") so they resolve against the
 * nav fragment's location rather than the current page URL.
 * @param {Element} root
 * @param {String} base
 */
function resolveImageSrcs(root, base) {
  root.querySelectorAll('img').forEach((img) => {
    const raw = img.getAttribute('src') || '';
    if (raw && !raw.startsWith('/') && !/^https?:/.test(raw) && !raw.startsWith('data:')) {
      img.setAttribute('src', `${base}${raw}`);
    }
  });
}

/**
 * Collapse every open dropdown in the given container.
 * @param {Element} container
 * @param {Boolean} expanded
 */
function toggleAllDrops(container, expanded = false) {
  container.querySelectorAll('.nav-drop').forEach((drop) => {
    drop.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });
}

/**
 * Toggle the mobile menu open/closed.
 * @param {Element} nav
 * @param {Boolean|null} forceExpanded
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // when collapsing (or on desktop) close any open dropdowns
  if (expanded || isDesktop.matches) toggleAllDrops(nav, false);
}

/**
 * Wire dropdown open/close behavior for nav items that contain a sub-list.
 * Desktop: hover opens, mouse-leave closes. Mobile: click toggles (accordion).
 * @param {Element} nav
 */
function decorateDropdowns(nav) {
  nav.querySelectorAll('.nav-sections li').forEach((li) => {
    if (!li.querySelector(':scope > ul')) return;
    li.classList.add('nav-drop');
    li.setAttribute('aria-expanded', 'false');

    li.addEventListener('mouseenter', () => {
      if (isDesktop.matches) {
        toggleAllDrops(nav, false);
        li.setAttribute('aria-expanded', 'true');
      }
    });
    li.addEventListener('mouseleave', () => {
      if (isDesktop.matches) li.setAttribute('aria-expanded', 'false');
    });

    // click on the chevron area toggles the panel (mobile accordion + desktop tap)
    const link = li.querySelector(':scope > a');
    if (link) {
      const toggleDrop = () => {
        const open = li.getAttribute('aria-expanded') === 'true';
        if (!isDesktop.matches) toggleAllDrops(nav, false);
        li.setAttribute('aria-expanded', open ? 'false' : 'true');
      };
      const chevron = document.createElement('button');
      chevron.type = 'button';
      chevron.className = 'nav-drop-toggle';
      chevron.setAttribute('aria-label', `Toggle ${link.textContent.trim()} submenu`);
      chevron.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDrop();
      });
      // on mobile, a tap on the row (but not on the link label) also toggles,
      // so the accordion is reachable without pixel-precise chevron taps
      li.addEventListener('click', (e) => {
        if (isDesktop.matches) return;
        if (e.target.closest(':scope > a') === link) return;
        e.preventDefault();
        toggleDrop();
      });
      link.after(chevron);
    }
  });
}

/**
 * Build a search form from the search copy in the fragment (last section).
 * The fragment only carries the placeholder copy; the form control is built here.
 * @param {Element} searchSection
 */
function decorateSearch(searchSection) {
  if (!searchSection) return;
  const p = searchSection.querySelector('p');
  const placeholder = p ? p.textContent.trim() : 'Search';
  searchSection.textContent = '';
  const form = document.createElement('form');
  form.className = 'nav-search-form';
  form.action = 'https://www.parker.com/us/en/search.html';
  form.setAttribute('role', 'search');
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-search-submit';
  submit.setAttribute('aria-label', 'Search');
  form.append(input, submit);
  searchSection.append(form);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const { html, base } = await fetchNavHtml();
  block.textContent = '';

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.innerHTML = html;
  resolveImageSrcs(nav, base);

  // label the three top-level sections: utility bar, main header, search
  const classes = ['utility', 'sections', 'search'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // wrap the utility bar's content so the black bar stays full-bleed while its
  // links cluster in a width-capped, right-aligned column
  const utility = nav.querySelector('.nav-utility');
  if (utility) {
    const inner = document.createElement('div');
    inner.className = 'nav-utility-inner';
    while (utility.firstChild) inner.append(utility.firstChild);
    utility.append(inner);
  }

  // brand: the logo is the first image inside the main header section. Hoist its
  // <p> out to be a direct grid child of nav so it can occupy the `brand` area
  // (logo left; nav + search stacked in the right column).
  const mainSection = nav.querySelector('.nav-sections');
  if (mainSection) {
    const brand = mainSection.querySelector('p:has(img), p a img');
    if (brand) {
      const brandP = brand.closest('p');
      if (brandP) {
        brandP.classList.add('nav-brand');
        nav.insertBefore(brandP, mainSection);
      }
    }
  }

  decorateDropdowns(nav);
  decorateSearch(nav.querySelector('.nav-search'));

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // close menu on escape
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      if (!isDesktop.matches) toggleMenu(nav, false);
      else toggleAllDrops(nav, false);
    }
  });

  // reset state when crossing the desktop/mobile breakpoint
  isDesktop.addEventListener('change', () => {
    toggleAllDrops(nav, false);
    document.body.style.overflowY = '';
    nav.setAttribute('aria-expanded', 'false');
    const button = nav.querySelector('.nav-hamburger button');
    if (button) button.setAttribute('aria-label', 'Open navigation');
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
