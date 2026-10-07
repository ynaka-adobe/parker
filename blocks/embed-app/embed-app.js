/*
 * embed-app — full-width interactive application embed (e.g. Parker World).
 *
 * Authoring: one row / one cell holding a link to the app URL. The link text
 * (when it is not just the URL) is used as the app name / iframe title.
 *
 * The embedded app may restrict who can frame it (parkerworld.parker.com sends
 * CSP `frame-ancestors 'self' https://www.parker.com`), so the iframe is only
 * rendered when the page is served from an allow-listed host. Everywhere else
 * (aem.page, aem.live, localhost) a launch panel opening the app in a new tab
 * is rendered instead.
 */

/** Hosts allowed by the app's CSP frame-ancestors — extend as needed. */
export const EMBEDDABLE_HOSTS = ['www.parker.com'];

const DEFAULT_APP_NAME = 'Parker World';

const EXPAND_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 14H5v5h5v-2H7zm-2-4h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z"/></svg>';
const COLLAPSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z"/></svg>';

/**
 * Whether the current page host may frame the app.
 * @param {string} [hostname] host to test (defaults to the current page host)
 * @returns {boolean}
 */
export function isEmbeddableHost(hostname = window.location.hostname) {
  return EMBEDDABLE_HOSTS.includes(hostname.toLowerCase());
}

/**
 * Reads the authored app URL and name from the block.
 * @param {Element} block
 * @returns {{ url: URL, name: string } | null}
 */
function readConfig(block) {
  const link = block.querySelector('a[href]');
  const raw = (link ? link.getAttribute('href') : block.textContent).trim();
  let url;
  try {
    url = new URL(raw, window.location.href);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol)) return null;

  const text = link ? link.textContent.trim() : '';
  const isUrlText = !text || /^https?:\/\//i.test(text) || text === url.hostname;
  return { url, name: isUrlText ? DEFAULT_APP_NAME : text };
}

/**
 * Launch panel shown on hosts that cannot frame the app.
 */
function buildLaunchPanel(url, name) {
  const panel = document.createElement('div');
  panel.className = 'embed-app-launch';

  const heading = document.createElement('h2');
  heading.className = 'embed-app-launch-title';
  heading.textContent = name;

  const copy = document.createElement('p');
  copy.textContent = 'This interactive experience opens in a new tab.';

  const cta = document.createElement('p');
  cta.className = 'button-container';
  const a = document.createElement('a');
  a.className = 'button';
  a.href = url.href;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = `Launch ${DEFAULT_APP_NAME}`;
  cta.append(a);

  panel.append(heading, copy, cta);
  return panel;
}

/**
 * Iframe + expand/collapse toggle shown on allow-listed hosts.
 */
function buildFrame(block, url, name) {
  const frame = document.createElement('div');
  frame.className = 'embed-app-frame';

  const iframe = document.createElement('iframe');
  iframe.src = url.href;
  iframe.title = name;
  iframe.loading = 'lazy';
  iframe.allowFullscreen = true;
  iframe.setAttribute('allow', 'fullscreen');

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'embed-app-toggle';

  const canFullscreen = typeof block.requestFullscreen === 'function' && document.fullscreenEnabled;

  const isExpanded = () => (canFullscreen
    ? document.fullscreenElement === block
    : block.classList.contains('embed-app-expanded'));

  const syncToggle = () => {
    const expanded = isExpanded();
    block.classList.toggle('embed-app-expanded', expanded);
    document.body.classList.toggle('embed-app-no-scroll', expanded && !canFullscreen);
    toggle.setAttribute('aria-pressed', String(expanded));
    toggle.setAttribute('aria-label', expanded ? `Exit full screen: ${name}` : `Expand ${name} to full screen`);
    toggle.innerHTML = expanded ? COLLAPSE_ICON : EXPAND_ICON;
  };

  const setOverlay = (on) => {
    block.classList.toggle('embed-app-expanded', on);
    syncToggle();
  };

  toggle.addEventListener('click', async () => {
    if (canFullscreen) {
      try {
        if (isExpanded()) await document.exitFullscreen();
        else await block.requestFullscreen();
      } catch {
        // fall through; fullscreenchange keeps state in sync
      }
    } else {
      setOverlay(!isExpanded());
    }
  });

  if (canFullscreen) {
    document.addEventListener('fullscreenchange', syncToggle);
  } else {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isExpanded()) {
        setOverlay(false);
        toggle.focus();
      }
    });
  }

  syncToggle();
  frame.append(iframe, toggle);
  return frame;
}

export default function decorate(block) {
  const config = readConfig(block);
  if (!config) return;
  const { url, name } = config;

  if (isEmbeddableHost()) {
    block.replaceChildren(buildFrame(block, url, name));
    block.classList.add('embed-app-is-embedded');
  } else {
    block.replaceChildren(buildLaunchPanel(url, name));
    block.classList.add('embed-app-is-launch');
  }
}
