/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-contact. Base: cards (custom contact-directory block).
 * Source: https://help.parker.com/us/en/support/hr-benefits (template support-topic)
 * Structure: custom block - blocks/cards-contact/README.md and cards-contact.js
 * define 3 cells per row (not the 2-column library Cards table), one row per
 * contact group:
 *   [h3 group heading] | [p > a href="tel:..." phone, or empty] | [details].
 *
 * Source (.ph-content-section__info:has(> h2.hhr)):
 *   <h1>HR and Benefits Overview</h1>                 -> default content BEFORE the block (as h2)
 *   <h2 class="hhr">Group</h2>                         -> one row per h2.hhr
 *   <div class="ph-content-section__info__cols row">   -> the group's columns (siblings up to the next h2.hhr)
 *     <div class="col-*"><h2 class="ht">216-896-3000</h2></div>        -> phone (optional)
 *     <div class="col-*"><p><span>Line<br></span>..<a>..</a></p></div> -> details (address lines, links, email)
 *     <div class="col-*">Internal Employee &nbsp;<a>..</a></div>       -> bare-text details (wrapped in <p>)
 * Iterates the h2.hhr headings (block-level, not links), so the inline-merge
 * trap does not apply.
 */

const NBSP = /\u00a0/g;
const clean = (s) => s.replace(NBSP, ' ').replace(/\s+/g, ' ').trim();
const PHONE_RE = /^\+?[\d][\d\s().-]{6,}$/;

// Normalise a details paragraph: unwrap spans, collapse nbsp/space runs, drop
// leading/trailing <br>s and blank text (the source address spans end with a <br>).
function tidyPara(p) {
  p.querySelectorAll('span').forEach((s) => s.replaceWith(...s.childNodes));
  p.removeAttribute('class');
  p.querySelectorAll('a').forEach((a) => {
    a.removeAttribute('class');
    a.removeAttribute('target');
  });
  const walker = p.ownerDocument.createTreeWalker(p, 4 /* SHOW_TEXT */);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach((t) => { t.textContent = t.textContent.replace(NBSP, ' ').replace(/ {2,}/g, ' '); });
  const isJunk = (n) => n && ((n.nodeType === 3 && !n.textContent.trim()) || n.nodeName === 'BR');
  while (isJunk(p.lastChild)) p.lastChild.remove();
  while (isJunk(p.firstChild)) p.firstChild.remove();
  if (p.firstChild && p.firstChild.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^\s+/, '');
  if (p.lastChild && p.lastChild.nodeType === 3) p.lastChild.textContent = p.lastChild.textContent.replace(/\s+$/, '');
  return p;
}

// Phone cell: keep an existing tel: link, else link the number
function phonePara(document, phoneEl) {
  const p = document.createElement('p');
  const existing = phoneEl.querySelector('a[href^="tel:"]');
  if (existing) {
    existing.removeAttribute('class');
    p.append(existing);
    return p;
  }
  const text = clean(phoneEl.textContent);
  const a = document.createElement('a');
  a.setAttribute('href', `tel:${text.replace(/[^\d+-]/g, '')}`);
  a.textContent = text;
  p.append(a);
  return p;
}

// ---------------------------------------------------------------------------
// Help & Support LANDING page (help.parker.com/us/en/support, template
// support-landing): "Contact Information" MUI grid, one card per region:
//   .MuiGrid-container > .MuiGrid-root (x4) > div >
//     [div region, a[href^="tel:"] phone, (a email)]
// Row 1 ("USA, Canada, Mexico") has two anchors WITHOUT href: the phone number
// and the email address -> tel:/mailto: links are built from their text.
// -> "cards-contact (grid)" (custom block, same 3-cell rows as above):
//   [h3 region] | [p > a tel:] | [p > a mailto:, or empty]
// Taken only for a .MuiGrid-container with a tel: link and no h2.hhr groups,
// so the support-topic (h2.hhr) path below is untouched. Iterates the grid
// items (block-level divs), not the anchors.
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function isLandingContactGrid(element) {
  return element.matches('.MuiGrid-container')
    && !!element.querySelector('a[href^="tel:"]')
    && !element.querySelector('h2.hhr');
}

function linkPara(document, href, text) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.textContent = text;
  p.append(a);
  return p;
}

function parseLandingContactGrid(element, document) {
  const cells = [];
  Array.from(element.children).filter((c) => c.matches('.MuiGrid-root')).forEach((item) => {
    const card = item.querySelector(':scope > div') || item;
    const regionEl = card.querySelector(':scope > div');
    const region = regionEl ? clean(regionEl.textContent) : '';
    let phone = null;
    let email = null;
    Array.from(card.querySelectorAll(':scope > a')).forEach((a) => {
      const text = clean(a.textContent);
      const href = (a.getAttribute('href') || '').trim();
      if (!text && !href) return;
      if (!email && (/^mailto:/i.test(href) || (!href && EMAIL_RE.test(text)))) {
        email = linkPara(document, href || `mailto:${text}`, text || href.replace(/^mailto:/i, ''));
      } else if (!phone && (/^tel:/i.test(href) || (!href && PHONE_RE.test(text)))) {
        phone = linkPara(document, href || `tel:${text.replace(/[^\d+-]/g, '')}`, text || href.replace(/^tel:/i, ''));
      }
    });
    // html2md preProcess (runs before parsers in the real import) unwraps the
    // href-less anchors of row 1, leaving bare text after the region div.
    // Fall back to the card's remaining text for any value not found above.
    if (!phone || !email) {
      const rest = clean(Array.from(card.childNodes)
        .filter((n) => n !== regionEl && !(n.nodeType === 1 && n.matches('a[href]')))
        .map((n) => ` ${n.textContent} `)
        .join(' '));
      const emailMatch = rest.match(/[^\s@]+@[^\s@]+\.[a-z]{2,}/i);
      if (!email && emailMatch) email = linkPara(document, `mailto:${emailMatch[0]}`, emailMatch[0]);
      const phoneMatch = rest.replace(emailMatch ? emailMatch[0] : '', ' ').match(/\+?\d[\d\s().-]{5,}\d/);
      if (!phone && phoneMatch) {
        const text = phoneMatch[0].trim();
        phone = linkPara(document, `tel:${text.replace(/[^\d+-]/g, '')}`, text);
      }
    }
    if (!region && !phone && !email) return;
    const h3 = document.createElement('h3');
    h3.textContent = region;
    cells.push([h3, phone || '', email || '']);
  });
  return cells;
}

export default function parse(element, { document }) {
  // Help & Support landing contact grid (help.parker.com/us/en/support) - separate branch
  if (isLandingContactGrid(element)) {
    const landingCells = parseLandingContactGrid(element, document);
    if (landingCells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-contact (grid)', cells: landingCells }));
    return;
  }

  const groupHeadings = Array.from(element.querySelectorAll(':scope > h2.hhr'));
  const firstGroup = groupHeadings[0];

  // Leading overview heading(s) before the first group -> default content before the block
  const leading = Array.from(element.querySelectorAll(':scope > h1, :scope > h2:not(.hhr)'))
    .filter((h) => !firstGroup || (h.compareDocumentPosition(firstGroup) & 4 /* FOLLOWING */))
    .filter((h) => clean(h.textContent));

  const cells = [];
  groupHeadings.forEach((heading) => {
    const title = clean(heading.textContent);
    if (!title) return;
    const h3 = document.createElement('h3');
    h3.textContent = title;

    // Siblings belonging to this group: everything up to the next h2.hhr
    const cols = [];
    let sib = heading.nextElementSibling;
    while (sib && !sib.matches('h2.hhr')) {
      if (sib.matches('.ph-content-section__info__cols, .row')) cols.push(...Array.from(sib.children));
      else cols.push(sib);
      sib = sib.nextElementSibling;
    }

    let phone = null;
    const details = [];
    cols.forEach((col) => {
      const phoneEl = col.matches('h2, h3') ? col : col.querySelector(':scope > h2, :scope > h3');
      if (!phone && phoneEl && PHONE_RE.test(clean(phoneEl.textContent))) {
        phone = phonePara(document, phoneEl);
        return;
      }
      const paras = col.matches('p') ? [col] : Array.from(col.querySelectorAll('p'));
      if (paras.length) {
        paras.forEach((p) => {
          if (clean(p.textContent) || p.querySelector('a')) details.push(tidyPara(p));
        });
      } else if (clean(col.textContent) || col.querySelector('a')) {
        // bare text / links directly in the column -> wrap in a paragraph
        const p = document.createElement('p');
        p.append(...col.childNodes);
        details.push(tidyPara(p));
      }
    });

    cells.push([h3, phone || '', details.length ? details : '']);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-contact', cells });
  leading.forEach((h) => {
    const h2 = document.createElement('h2');
    h2.textContent = clean(h.textContent);
    element.before(h2);
  });
  element.replaceWith(block);
}
