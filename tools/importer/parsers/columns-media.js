/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns.
 * Source: https://www.parker.com/us/en/home.html
 * Structure (library): flexible columns. Here: 2 columns -> [text content | media].
 * Handles two instances (.cmp-parker-blue-theme..., .grey-bg...) with the same
 * image-box-container layout. Text and media order preserved from DOM.
 *
 * Markets template (e.g. /us/en/markets/aerospace-and-defense.html) - same
 * .image-box-container markup, plus:
 *  - Variant: when the matched grid column carries
 *    .cmp-parker-secondary-img-box-theme (sky-blue Ebrake band, charcoal
 *    Next-Gen band) or .cmp-parker-yellow-theme on the markets landing page
 *    (markets-2: gold Parker World band; page-gated, see FULL_BLEED_YELLOW_PAGES)
 *    the block is emitted as "columns-media (full-bleed)"; otherwise
 *    plain "columns-media". No home columns-media instance has either class,
 *    so the home output is unaffected.
 *  - Cell order follows the source's VISUAL order: the columns carry
 *    order-left / order-right classes (.left-box.order-right +
 *    .image-wrapper.order-left = image on the left). The home layout
 *    (.cmp-parker-ibd-align-center) keeps its original DOM order
 *    [text | media] so the home import stays byte-identical.
 *  - "Watch Video" CTAs (Scene7 VideoViewer URLs) are plain .btn-align links
 *    and are kept as links.
 *
 * Help & Support (help.parker.com/us/en/support/order-status, template
 * support-topic): the matched element is .row.rowValign with two Bootstrap
 * columns: .ph-bg__img-block (img) and a text column (h2/h3 heading + p).
 * Emitted as plain "columns-media", one row of two cells in source visual order
 * ([picture | text] on order-status). Visual order = DOM order unless a column
 * carries a Bootstrap order-* / order-md-* class. Taken only when the element
 * contains .ph-bg__img-block, which no www.parker.com template has.
 */

// Bootstrap order value for a column ("order-md-2", "order-first", "order-last"); 0 when unset.
function bootstrapOrder(col) {
  let order = 0;
  Array.from(col.classList).forEach((c) => {
    const m = c.match(/^order-(?:(?:sm|md|lg|xl)-)?(first|last|\d+)$/);
    if (!m) return;
    if (m[1] === 'first') order = -1;
    else if (m[1] === 'last') order = 99;
    else order = parseInt(m[1], 10);
  });
  return order;
}

const isHelpMediaRow = (element) => !!element.querySelector('.ph-bg__img-block');

// help.parker.com image + text row -> one row [picture | text] in visual order
function parseHelpMediaRow(element, document) {
  const imgCol = element.querySelector('.ph-bg__img-block');
  const cols = Array.from(imgCol.parentElement.children)
    .map((col, i) => ({ col, i, order: bootstrapOrder(col) }))
    .sort((a, b) => (a.order - b.order) || (a.i - b.i))
    .map((c) => c.col);

  const row = [];
  let hasContent = false;
  cols.forEach((col) => {
    if (col === imgCol) {
      const img = col.querySelector('img');
      if (img) hasContent = true;
      row.push(img || ''); // keep the column count stable
      return;
    }
    const textCell = [];
    let heading = col.querySelector('h1, h2, h3, h4');
    if (heading && heading.tagName === 'H1') {
      // keep a single page H1: author an in-content h1 as h2
      const h2 = document.createElement('h2');
      h2.append(...heading.childNodes);
      heading.replaceWith(h2);
      heading = h2;
    }
    if (heading) textCell.push(heading);
    Array.from(col.querySelectorAll('p')).forEach((p) => {
      if (p.textContent.replace(/\u00a0/g, ' ').trim() || p.querySelector('img, a')) textCell.push(p);
    });
    if (textCell.length) {
      hasContent = true;
      row.push(textCell);
    }
  });

  return hasContent ? [row] : [];
}

// Returns 'left' | 'right' | null from Bootstrap-style order-left/order-right classes
function visualSide(el) {
  if (!el || !el.classList) return null;
  if (el.classList.contains('order-left')) return 'left';
  if (el.classList.contains('order-right')) return 'right';
  return null;
}

// Pages whose gold .cmp-parker-yellow-theme band is authored full-bleed (template
// markets-2). The class alone is not enough: /us/en/markets/off-highway.html (template
// markets) has a structurally identical yellow band ("Diesel Engine Sealing Solution")
// that must stay plain "columns-media" so the markets output does not change.
const FULL_BLEED_YELLOW_PAGES = ['/us/en/markets.html'];

function pagePath(url, params) {
  const raw = (params && params.originalURL) || url || '';
  try {
    return new URL(raw).pathname;
  } catch (e) {
    return '';
  }
}

export default function parse(element, { document, url, params }) {
  // Help & Support image + text row (help.parker.com) - separate branch
  if (isHelpMediaRow(element)) {
    const helpCells = parseHelpMediaRow(element, document);
    if (helpCells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells: helpCells });
    element.replaceWith(block);
    return;
  }

  // Text column: heading, subtitle, description, CTA
  const textBox = element.querySelector('.left-box, .image-box-container__opacity-overlay, [class*="left-box"]');

  // Media column: image wrapper / picture
  const mediaBox = element.querySelector('.image-wrapper, .image-container, [class*="image-wrapper"]');
  const image = element.querySelector('.image-wrapper img, .image-container img, picture img, img');

  const textCell = [];
  if (textBox) {
    // Eyebrow / header text (e.g. "About Parker", "Interactive") that sits above the title
    const eyebrow = textBox.querySelector('.cmp-parker-image-box-container__header-text');
    const heading = textBox.querySelector('.image-box-container__title, h1, h2, h3');
    const subtitle = textBox.querySelector('.image-box-container__subtitle');
    const description = textBox.querySelector('.image-box-container__description');
    const ctaLinks = Array.from(textBox.querySelectorAll('.btn-align a, a.btn'));
    if (eyebrow) textCell.push(eyebrow);
    if (heading) textCell.push(heading);
    if (subtitle) textCell.push(subtitle);
    if (description) textCell.push(description);
    textCell.push(...ctaLinks);
  }

  const mediaCell = [];
  if (image) {
    mediaCell.push(image);
  } else if (mediaBox) {
    mediaCell.push(mediaBox);
  }

  // Empty-block guard
  if (textCell.length === 0 && mediaCell.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Visual order (markets): image cell first when the media column is placed on the
  // left. Home's .cmp-parker-ibd-align-center layout keeps the original [text | media].
  let imageFirst = false;
  if (!element.classList.contains('cmp-parker-ibd-align-center')) {
    const textCol = (textBox && textBox.closest('.left-box')) || textBox;
    const mediaCol = element.querySelector('.image-wrapper') || mediaBox;
    const mediaSide = visualSide(mediaCol);
    const textSide = visualSide(textCol);
    if (mediaSide === 'left' || (mediaSide === null && textSide === 'right')) {
      imageFirst = true;
    }
  }

  const cells = [];
  cells.push(imageFirst ? [mediaCell, textCell] : [textCell, mediaCell]);

  // Full-bleed option when the matched grid column is a "secondary image box" band
  // (markets template) or the gold "yellow theme" band on the markets landing page
  // (markets-2 Parker World band, .cmp-parker-yellow-theme, no secondary class; see
  // FULL_BLEED_YELLOW_PAGES). No home columns-media instance carries either class.
  const fullBleed = element.classList.contains('cmp-parker-secondary-img-box-theme')
    || (element.classList.contains('cmp-parker-yellow-theme')
      && FULL_BLEED_YELLOW_PAGES.includes(pagePath(url, params)));
  const block = fullBleed
    ? WebImporter.Blocks.createBlock(document, { name: 'columns-media (full-bleed)', cells })
    : WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
