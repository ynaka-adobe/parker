import { getMetadata } from '../../scripts/aem.js';
import { ensureAtJsLoaded } from '../../scripts/target.js';

/**
 * at.js only auto-merges `window.targetPageParams()` into the implicit
 * global-mbox / pageLoad request — NOT into named `getOffers` mbox calls like
 * this block's mbox. So we must attach the demo persona profile parameters
 * ourselves, using the `profile.<key>` prefix at.js recognizes and routes
 * into profileParameters for audience "Profile Parameter" rules.
 * @returns {Record<string, string>}
 */
function demoProfileMboxParameters() {
  const params = (typeof window.targetPageParams === 'function' ? window.targetPageParams() : {}) || {};
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  );
}

/**
 * Adobe Target HTML offer slot.
 * - VEC / page-load: point activities at `.target-offer` or `[data-mbox-name="…"]`
 *   (see scripts.js applyTargetPageLoad after blocks load when `<meta name="target">` is set).
 * - First table row with a single cell = mbox name triggers a post-init getOffers
 *   request (with the demo persona's profile parameters attached) when real at.js
 *   is wired (deps/at/at.js).
 */

function directChildRowOf(el, node) {
  let row = node;
  while (row.parentElement && row.parentElement !== el) {
    row = row.parentElement;
  }
  return row.parentElement === el ? row : null;
}

function collectMboxFromFirstRow(rows) {
  if (rows.length < 2) return { mboxName: '', contentRows: rows };
  const cells = [...rows[0].querySelectorAll(':scope > div')];
  if (cells.length !== 1) return { mboxName: '', contentRows: rows };
  const text = cells[0].textContent.trim();
  if (!text) return { mboxName: '', contentRows: rows };
  return { mboxName: text, contentRows: rows.slice(1) };
}

/** @param {HTMLElement} el */
function buildSlot(el) {
  const mboxPara = el.querySelector('p.target-offer-mbox');
  let mboxName = '';
  const slot = document.createElement('div');
  slot.className = 'target-offer__slot';

  if (mboxPara) {
    mboxName = mboxPara.textContent.trim();
    const configRow = directChildRowOf(el, mboxPara);
    const defaultRoot = el.querySelector(':scope > .target-offer-default');
    if (configRow) configRow.remove();
    if (defaultRoot) {
      while (defaultRoot.firstChild) slot.append(defaultRoot.firstChild);
      defaultRoot.remove();
    }
  } else {
    const rows = [...el.querySelectorAll(':scope > div')];
    const parsed = collectMboxFromFirstRow(rows);
    mboxName = parsed.mboxName;
    const frag = document.createDocumentFragment();
    parsed.contentRows.forEach((row) => frag.append(row));
    if (parsed.mboxName && rows[0]?.parentElement === el) rows[0].remove();
    el.append(frag);
    while (el.firstChild) slot.append(el.firstChild);
  }

  el.append(slot);
  return { slot, mboxName };
}

/**
 * Requests offer content for a single mbox.
 * @returns {Promise<string|null|undefined>} the offer HTML, or null/undefined if no offer matched
 */
async function requestMboxContent(mboxName, parameters) {
  const request = {
    execute: {
      mboxes: [{
        index: 0,
        name: mboxName,
        ...(Object.keys(parameters).length ? { parameters } : {}),
      }],
    },
  };
  const response = await window.adobe.target.getOffers({ request });
  const mboxResult = response?.execute?.mboxes?.[0];
  const raw = mboxResult?.options?.[0]?.content;
  return Array.isArray(raw) ? raw[0] : raw;
}

async function applyMboxContent(slot, mboxName) {
  if (!mboxName) return;
  await ensureAtJsLoaded();
  if (!window.adobe?.target?.getOffers) return;

  try {
    const parameters = demoProfileMboxParameters();
    let html = await requestMboxContent(mboxName, parameters);
    // Target's very first getOffers call for a brand-new visitor can return no
    // offer at all: the visitor's profile (including profile parameters sent
    // in that same request) isn't committed server-side until the response
    // completes. An immediate retry runs with that now-established profile
    // and correctly resolves the matching audience/offer.
    if (html == null || html === '') {
      html = await requestMboxContent(mboxName, parameters);
    }
    if (html == null || html === '') return;

    slot.innerHTML = typeof html === 'string' ? html : '';
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.error(ex);
  }
}

export default async function init(el) {
  el.classList.add('target-offer--decorated');
  const exportSpan = el.querySelector(':scope > .target-offer-export-id');
  const exportId = (exportSpan?.textContent || el.dataset.targetExportId || '').trim();
  if (exportId) {
    el.dataset.exportId = exportId;
  }
  exportSpan?.remove();

  const { slot, mboxName } = buildSlot(el);
  if (mboxName) {
    el.dataset.mboxName = mboxName;
  }

  if (!getMetadata('target')) return;

  await applyMboxContent(slot, mboxName);
}
