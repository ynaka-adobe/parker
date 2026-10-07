/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-contact. Base: columns (custom contact-panel block).
 * Source: https://help.parker.com/us/en/support/general-help (template support-topic)
 * Structure (Columns convention + blocks/columns-contact/README.md): one row, 2 cells:
 *   [h2 heading, p intro] | [p > a tel:, p > a mailto:, p > strong > a CTA].
 *
 * Source (.row:has(> .ph-content-section__topic + .ph-content-section__info)):
 *   .ph-content-section__topic: <h1>Parker Help Center</h1><h3>Still can't find ...</h3>
 *   .ph-content-section__info:  <h2 class="vw"><a href="tel:...">..</a></h2>
 *                               <a href="mailto:..." class="em">..</a>
 *                               <a class="MuiButton-root ..." href="https://parker.com/us/en/contact.html">Contact Form</a>
 * The bare-domain parker.com CTA href is normalised to https://www.parker.com/...
 * (rewriteLinks in the cleanup transformer only recognises www.parker.com).
 */

const NBSP = /\u00a0/g;
const clean = (s) => s.replace(NBSP, ' ').replace(/\s+/g, ' ').trim();
const PHONE_RE = /^\+?\d[\d\s().-]{6,}$/;

// https://parker.com/... -> https://www.parker.com/...
function fixParkerHref(href) {
  try {
    const u = new URL(href);
    if (u.hostname === 'parker.com') {
      u.hostname = 'www.parker.com';
      u.protocol = 'https:';
      return u.href;
    }
  } catch (e) { /* relative or invalid: leave as is */ }
  return href;
}

function linkPara(document, href, text, wrapTag) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.textContent = text;
  if (wrapTag) {
    const w = document.createElement(wrapTag);
    w.append(a);
    p.append(w);
  } else {
    p.append(a);
  }
  return p;
}

export default function parse(element, { document }) {
  const topic = element.querySelector(':scope > .ph-content-section__topic')
    || element.querySelector('.ph-content-section__topic');
  const info = element.querySelector(':scope > .ph-content-section__info')
    || element.querySelector('.ph-content-section__info');

  // Cell 1: heading + intro
  const textCell = [];
  if (topic) {
    const headingEl = topic.querySelector('h1, h2');
    if (headingEl && clean(headingEl.textContent)) {
      const h2 = document.createElement('h2');
      h2.textContent = clean(headingEl.textContent);
      textCell.push(h2);
    }
    Array.from(topic.querySelectorAll('h3, h4, p'))
      .filter((el) => el !== headingEl && clean(el.textContent))
      .forEach((el) => {
        const p = document.createElement('p');
        p.textContent = clean(el.textContent);
        textCell.push(p);
      });
  }

  // Cell 2: phone, email, CTA - in source order
  const contactCell = [];
  if (info) {
    // A phone number shown as plain text (no tel: link) comes first
    if (!info.querySelector('a[href^="tel:"]')) {
      const phoneEl = Array.from(info.querySelectorAll('h2, h3'))
        .find((h) => PHONE_RE.test(clean(h.textContent)));
      if (phoneEl) {
        const num = clean(phoneEl.textContent);
        contactCell.push(linkPara(document, `tel:${num.replace(/[^\d+-]/g, '')}`, num));
      }
    }
    Array.from(info.querySelectorAll('a[href]')).forEach((a) => {
      const href = a.getAttribute('href');
      const text = clean(a.textContent);
      if (!text) return;
      if (/^(tel|mailto):/i.test(href)) {
        contactCell.push(linkPara(document, href, text));
      } else {
        // CTA button (e.g. "Contact Form") -> primary button (p > strong > a)
        contactCell.push(linkPara(document, fixParkerHref(href), text, 'strong'));
      }
    });
  }

  // Empty-block guard
  if (textCell.length === 0 && contactCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[textCell.length ? textCell : '', contactCell.length ? contactCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contact', cells });
  element.replaceWith(block);
}
