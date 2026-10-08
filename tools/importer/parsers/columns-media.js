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
 *
 * Product category (ph.parker.com/us/en/category/*, template product-category):
 * the matched element is #category-list-details-description-container
 * ([data-testid] equivalent): category thumbnail
 * (img#category-list-details-desktop-image, alt is a stale product name) plus
 * the intro paragraph(s). Emitted as "columns-media (compact)", one row
 * [picture | text]. The image alt is set to the page H1
 * (#category-list-details-title). The server HTML nests the intro inside the
 * (empty) short-description p - <p id="...short-description"><p>text</p></p> -
 * which an HTML parse flattens to <p></p><p>text</p><p></p> while a live DOM
 * keeps the nesting; both shapes are handled without duplicating text. Taken
 * only when the element itself matches the ph.parker.com container id /
 * data-testid, which no www.parker.com / help.parker.com markup has.
 *
 * PTS page (www.parker.com/us/en/industries/digital/pts.html, template pts; same
 * .image-box-container markup, generic path below). Page-gated by PTS_PAGES, so no
 * other template's output changes:
 *  - Gold "THE SIMPLE ASSET MANAGEMENT TOOL" band: the media column is a video
 *    poster (img#thumnail-image + play icon) whose MP4 exists only in the AEM page
 *    model (migration-work/pts-model.json, image_box_descriptio.fileReference), not
 *    in the DOM. The media cell becomes [poster picture, p > a "Watch Video" -> MP4]
 *    using the constant PTS_VIDEO_BANDS (poster file name -> MP4 URL).
 *  - Gold "GET STARTED WITH PTS" band: the description wraps its paragraphs in a
 *    bordered 1-row / 1-cell <table> (WYSIWYG artefact); the table is unwrapped so
 *    the paragraphs are authored directly (no nested table in the block).
 */

const PRODUCT_CATEGORY_DESC = '#category-list-details-description-container, [data-testid="category-list-details-description-container"]';

const isProductCategoryDesc = (element) => !!(element.matches && element.matches(PRODUCT_CATEGORY_DESC));

// Non-empty paragraph texts of the container, in document order. A <p> that
// (still) holds nested <p>s contributes only its own nodes outside them; the
// nested ones are visited on their own by querySelectorAll.
function productCategoryParagraphs(element, document) {
  const paras = [];
  Array.from(element.querySelectorAll('p')).forEach((p) => {
    const nodes = Array.from(p.childNodes).filter((n) => !(n.nodeType === 1 && n.tagName === 'P'));
    const text = nodes.map((n) => n.textContent).join('').replace(/\u00a0/g, ' ').trim();
    if (!text) return;
    const para = document.createElement('p');
    para.append(...nodes);
    paras.push(para);
  });
  return paras;
}

// ph.parker.com category intro -> one row [picture | paragraphs]
function parseProductCategoryDesc(element, document) {
  const img = element.querySelector('#category-list-details-desktop-image, [data-testid="category-list-details-desktop-image"]')
    || element.querySelector('img');
  if (img) {
    const h1 = document.querySelector('#category-list-details-title, [data-testid="category-list-details-title"]')
      || document.querySelector('h1');
    const title = h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : '';
    if (title) img.setAttribute('alt', title);
  }
  const paras = productCategoryParagraphs(element, document);
  if (!img && !paras.length) return [];
  return [[img || '', paras.length ? paras : '']];
}

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

// PTS page (template pts) and its canonical alias.
const PTS_PAGES = [
  '/us/en/industries/digital/pts.html',
  '/us/en/additional-information/asset-intelligence/asset-management.html',
];

// Poster image file name -> MP4 (from migration-work/pts-model.json:
// responsivegrid/image_box_descriptio: thumbnailImageURL / fileReference, isVideoUrl=true).
const PTS_VIDEO_BANDS = {
  'PTS-PTS-Logo.png': 'https://www.parker.com/content/dam/parker/na/united-states/industries/digital/pts/6C5BE368B115B075F4D3035A23E3940B.mp4',
};

// MP4 for a video-poster media column, or null.
function ptsVideoUrl(mediaBox, image) {
  if (!image || !mediaBox || !mediaBox.querySelector('.play-arrow-icon-container, #thumnail-image')) return null;
  const src = (image.getAttribute('src') || '').split('?')[0];
  const file = src.substring(src.lastIndexOf('/') + 1);
  return PTS_VIDEO_BANDS[file] || null;
}

// Replace each 1-row / 1-cell table with the cell's children.
function unwrapSingleCellTables(root) {
  if (!root) return;
  Array.from(root.querySelectorAll('table')).forEach((table) => {
    const cells = table.querySelectorAll('td, th');
    if (table.querySelectorAll('tr').length !== 1 || cells.length !== 1) return;
    table.replaceWith(...cells[0].childNodes);
  });
}

export default function parse(element, { document, url, params }) {
  // Product category intro (ph.parker.com) - separate branch
  if (isProductCategoryDesc(element)) {
    const productCells = parseProductCategoryDesc(element, document);
    if (productCells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media (compact)', cells: productCells });
    element.replaceWith(block);
    return;
  }

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

  const isPts = PTS_PAGES.includes(pagePath(url, params));
  if (isPts && textBox) unwrapSingleCellTables(textBox.querySelector('.image-box-container__description'));

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

  // PTS video band: poster + link to the MP4 (URL from the page model)
  const videoUrl = isPts ? ptsVideoUrl(mediaBox, image) : null;
  if (videoUrl) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('href', videoUrl);
    a.textContent = 'Watch Video';
    p.append(a);
    mediaCell.push(p);
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
