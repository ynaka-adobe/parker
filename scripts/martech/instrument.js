import { getMetadata } from '../aem.js';

window.adobeDataLayer = window.adobeDataLayer || [];
const push = (o) => window.adobeDataLayer.push(o);

const locale = () => `/${window.location.pathname.split('/').slice(1, 3).join('/')}`; // /us/en
const template = () => getMetadata('template') || '';

/**
 * Derives the Component ID and Block Name from a block's class list.
 * First class = block name; extra classes (variants) refine the Component ID.
 * @param {Element} block The block element
 * @returns {{id: string, block: string}} component id and block name
 */
function ids(block) {
  const parts = [...block.classList].filter((c) => c !== 'block');
  return { id: parts.join('--') || 'unknown', block: parts[0] || 'unknown' };
}

/**
 * Position = ordinal of the block within <main>; Section Index = its section ordinal.
 * @param {Element} block The block element
 * @returns {{position: number, sectionIndex: number}} block coordinates
 */
function coords(block) {
  const blocks = [...document.querySelectorAll('main .block')];
  const sections = [...document.querySelectorAll('main > .section')];
  return {
    position: blocks.indexOf(block) + 1,
    sectionIndex: sections.indexOf(block.closest('.section')) + 1,
  };
}

// 1) Impressions — once per block at 50% visibility → event1
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting && !e.target.dataset.impressed) {
      e.target.dataset.impressed = '1';
      const { id, block } = ids(e.target);
      push({
        event: 'component-impression',
        component: { id, block, ...coords(e.target) },
        page: { path: window.location.pathname, template: template(), locale: locale() },
      });
    }
  });
}, { threshold: 0.5 });

// 2) Link clicks inside blocks → CTA click (event2) or Download (event3)
document.addEventListener('click', (ev) => {
  const a = ev.target.closest('main .block a, main .block button');
  if (!a) return;
  const block = a.closest('.block');
  const { id, block: name } = ids(block);
  const url = a.getAttribute('href') || '';
  const isDownload = /\.(pdf|docx?|xlsx?|pptx?|zip|csv)(\?|$)/i.test(url) || url.includes('/content/dam/');
  if (isDownload) {
    push({
      event: 'download',
      component: { id, block: name, ...coords(block) },
      link: { file: url.split('/').pop(), url },
    });
  } else {
    push({
      event: 'cta-click',
      component: { id, block: name, ...coords(block) },
      link: {
        text: a.textContent.trim(),
        url,
        type: a.hostname && a.hostname !== window.location.hostname ? 'exit' : 'internal',
      },
    });
  }
});

// 3) Scroll milestones → event6 (25/50/75/100)
const seen = new Set();
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY + window.innerHeight;
  const pct = Math.round((scrolled / document.body.scrollHeight) * 100);
  [25, 50, 75, 100].forEach((m) => {
    if (pct >= m && !seen.has(m)) {
      seen.add(m);
      push({ event: 'scroll', depth: m });
    }
  });
}, { passive: true });

/**
 * Observes every decorated block in main for impression tracking.
 */
export default function instrument() {
  document.querySelectorAll('main .block').forEach((b) => io.observe(b));
}
