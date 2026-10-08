/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-teaser. Base: cards.
 * Source: https://www.parker.com/us/en/markets/aerospace-and-defense.html
 * Structure (library + blocks/cards-teaser/README.md): 2 columns, one row per tile:
 *   cell 1 = picture, cell 2 = [h3 title, description paragraph(s), "Learn More" link].
 * Source: .parker-carousel slick slider. Iterates the stable div.card wrappers (not
 * the slick slides: only some carry .slick-active, and slick may add .slick-cloned
 * copies in a live DOM). The published date (.card-details) is not part of the tile.
 * The section heading (.slider-carousel-container > h2, "Aerospace Submarkets") is
 * kept as default content placed BEFORE the block.
 *
 * Grid source (markets-2 /us/en/markets.html and markets pages whose tiles sit in
 * a .layout-col-* container of .cmp-parker-card-container cards, NOT a
 * .parker-carousel slider): emitted as "cards-teaser (grid)". In that path the
 * card titles (h4.card-title in the source) are re-tagged as h3. The section
 * heading / intro paragraph live in sibling grid columns (cmp-title h2,
 * title-description-container) and are not touched here, so they stay default
 * content outside the block. The hidden published date (.card-details) is dropped
 * and the link label is the authored text (e.g. "Explore Now").
 * The .parker-carousel path is unchanged (plain "cards-teaser", title tag kept).
 *
 * Help & Support source (help.parker.com/us/en/support/*, template support-topic):
 * option cards are <a class="ph-card-basic__link" href>Title<span>Description</span></a>,
 * either inside a MUI grid (.MuiGrid-container > ... > .MuiCard-root > a), a
 * .ph-grid-2 of <article>s, or a lone featured card directly in / after the
 * .jumbotron (the matched element is then the link itself). Title-only cards
 * have no <span>. No images, so this follows the Cards (no images) convention:
 * emitted as "cards-teaser (grid, text)", one single-cell row per card
 * [h3 > a (title text, trimmed), p (description, if any)].
 * Only taken when the element is/contains a.ph-card-basic__link, which no
 * www.parker.com template has, so the branches below are untouched.
 *
 * Help & Support landing (help.parker.com/us/en/support, template
 * support-landing): MUI tile grid and "More Contact Information" card grid -
 * see the LANDING section above parse(); taken only for .MuiGrid-container
 * elements without a.ph-card-basic__link.
 *
 * PTS page (www.parker.com/us/en/industries/digital/pts.html, template pts):
 *  - Feature icons: a .layout-col-4 grid column of 8 title-link items
 *    (.aem-container > .cmp-titlelink_container [img.cmp-titlelink_icons,
 *    h2.cmp-titlelink_title] + a sibling text component <p>) and no .card.
 *    Emitted as "cards-teaser (grid, icons)", one row per item
 *    [icon picture | h3 title (source h2), description paragraph(s)].
 *    Iterates the block-level .cmp-titlelink_container wrappers. Taken only when
 *    the element has .cmp-titlelink_container and no .card, which no other
 *    template's cards-teaser instance has.
 *  - Success Stories: plain .parker-carousel card slider -> existing slider path
 *    (plain "cards-teaser", .slick-cloned skipped), unchanged.
 *  - Resources: .layout-col-4 grid of bordered cards with a pill CTA -> existing
 *    grid path, emitted as "cards-teaser (grid, buttons)" on PTS_PAGES only
 *    (page-gated so markets / markets-2 grids stay "cards-teaser (grid)").
 */

const HELP_CARD = 'a.ph-card-basic__link';
const HELP_DESC_CLASS = 'ph-card-basic__desc';

// html2md preProcess runs BEFORE any transform/parser: it unwraps every class-less
// <span> (removeSpans) and then rewrites each <a>'s innerHTML, which merges the
// title and description text nodes into one ("On the WebsiteLog in to ...").
// The bundled import script is evaluated in the page before html2md is called, so
// tag the description spans here (a classed span is kept by removeSpans). Matches
// nothing on www.parker.com pages, so other templates' DOMs are untouched.
try {
  if (typeof document !== 'undefined' && document.querySelectorAll) {
    document.querySelectorAll(`${HELP_CARD} > span`).forEach((s) => s.classList.add(HELP_DESC_CLASS));
  }
} catch (e) { /* not in a browser page context */ }

// True for the help.parker.com option-card markup (matched element = link or container).
function isHelpCards(element) {
  return element.matches(HELP_CARD) || !!element.querySelector(HELP_CARD);
}

const cleanText = (s) => s.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

// One single-cell row per card: [h3 > a title, p description]
function parseHelpCards(element, document) {
  const links = element.matches(HELP_CARD)
    ? [element]
    : Array.from(element.querySelectorAll(HELP_CARD));

  const cells = [];
  links.forEach((link) => {
    const descEl = link.querySelector(':scope > span');
    // Title = the link's own text outside the description span
    const title = cleanText(Array.from(link.childNodes)
      .filter((n) => n !== descEl)
      .map((n) => n.textContent)
      .join(' '));
    const desc = descEl ? cleanText(descEl.textContent) : '';
    if (!title && !desc) return;

    const href = link.getAttribute('href');
    const h3 = document.createElement('h3');
    if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = title || desc;
      h3.append(a);
    } else {
      h3.textContent = title || desc;
    }
    const cell = [h3];
    if (desc && title) {
      const p = document.createElement('p');
      p.textContent = desc;
      cell.push(p);
    }
    cells.push([cell]);
  });

  return cells;
}

// True when the matched element is a card grid rather than the slick slider.
function isCardGrid(element) {
  if (element.matches('.parker-carousel') || element.closest('.parker-carousel')
    || element.querySelector('.parker-carousel')) return false;
  const isLayoutCol = Array.from(element.classList).some((c) => c.startsWith('layout-col-'));
  return isLayoutCol && !!element.querySelector('.cmp-parker-card-container .card');
}

// Re-tag a heading element (keeps id/class attributes and child nodes).
function retag(document, el, tagName) {
  if (!el || el.tagName.toLowerCase() === tagName) return el;
  const h = document.createElement(tagName);
  Array.from(el.attributes).forEach((a) => h.setAttribute(a.name, a.value));
  h.append(...el.childNodes);
  el.replaceWith(h);
  return h;
}

// ---------------------------------------------------------------------------
// Help & Support LANDING page (help.parker.com/us/en/support, template
// support-landing). Two MUI grids, neither of which has a.ph-card-basic__link
// (so isHelpCards() is false for them) nor any www.parker.com class.
// No images -> Cards (no images) convention: 1 column, one card per row.
//
// 1. Topic tiles - main.ph-main > section.tile_container .MuiGrid-container:
//      .MuiGrid-container > .MuiGrid-root (x12) > div > a[href] "Title"
//    -> "cards-teaser (grid, text)", one single-cell row per tile [h3 > a].
// 2. "More Contact Information" cards - .MuiGrid-container whose items are
//      .MuiGrid-root > div > [div title, div description, a.MuiLink-root CTA]
//    -> "cards-teaser (text, buttons)", one single-cell row per card
//       [h3 title (unlinked), p description, p > strong > a CTA].
// Both iterate the grid items (block-level .MuiGrid-root divs), never links.
// ---------------------------------------------------------------------------

const LANDING_GRID = '.MuiGrid-container';

const gridItems = (grid) => Array.from(grid.children).filter((c) => c.matches('.MuiGrid-root'));

function isLandingTileGrid(element) {
  return element.matches(LANDING_GRID) && !!element.closest('section.tile_container')
    && gridItems(element).some((item) => item.querySelector(':scope > div > a[href]'));
}

function isLandingButtonCards(element) {
  return element.matches(LANDING_GRID) && !element.closest('section.tile_container')
    && gridItems(element).some((item) => item.querySelector(':scope > div > a.MuiLink-root[href]'));
}

function parseLandingTiles(element, document) {
  const cells = [];
  gridItems(element).forEach((item) => {
    const link = item.querySelector(':scope > div > a[href]');
    if (!link) return;
    const title = cleanText(link.textContent);
    if (!title) return;
    const h3 = document.createElement('h3');
    const a = document.createElement('a');
    a.setAttribute('href', link.getAttribute('href'));
    a.textContent = title;
    h3.append(a);
    cells.push([[h3]]);
  });
  return cells;
}

function parseLandingButtonCards(element, document) {
  const cells = [];
  gridItems(element).forEach((item) => {
    const card = item.querySelector(':scope > div');
    if (!card) return;
    const cta = card.querySelector(':scope > a.MuiLink-root[href]');
    const texts = Array.from(card.querySelectorAll(':scope > div'))
      .map((d) => cleanText(d.textContent))
      .filter(Boolean);
    const [title, ...descs] = texts;
    if (!title && !cta) return;
    const cell = [];
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      cell.push(h3);
    }
    descs.forEach((d) => {
      const p = document.createElement('p');
      p.textContent = d;
      cell.push(p);
    });
    if (cta && cleanText(cta.textContent)) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      const a = document.createElement('a');
      a.setAttribute('href', cta.getAttribute('href'));
      a.textContent = cleanText(cta.textContent);
      strong.append(a);
      p.append(strong);
      cell.push(p);
    }
    cells.push([cell]);
  });
  return cells;
}

// ---------------------------------------------------------------------------
// PTS page (template pts) - see header.
// ---------------------------------------------------------------------------

const PTS_PAGES = [
  '/us/en/industries/digital/pts.html',
  '/us/en/additional-information/asset-intelligence/asset-management.html',
];

function pagePath(url, params) {
  const raw = (params && params.originalURL) || url || '';
  try {
    return new URL(raw).pathname;
  } catch (e) {
    return '';
  }
}

const TITLELINK = '.cmp-titlelink_container';

function isIconFeatures(element) {
  return !!element.querySelector(TITLELINK) && !element.querySelector('.card')
    && !element.matches('.parker-carousel') && !element.querySelector('.parker-carousel');
}

// One row per feature: [icon | h3 title, description p(s)]
function parseIconFeatures(element, document) {
  const cells = [];
  Array.from(element.querySelectorAll(TITLELINK)).forEach((item) => {
    const icon = item.querySelector('img.cmp-titlelink_icons, img');
    const titleEl = item.querySelector('.cmp-titlelink_title, h1, h2, h3, h4, h5, h6');
    const title = titleEl ? cleanText(titleEl.textContent) : '';
    // The description is the sibling text component inside the item's own container.
    const scope = (item.parentElement && item.parentElement.closest('.aem-container')) || item.parentElement;
    const descs = scope
      ? Array.from(scope.querySelectorAll('p'))
        .filter((p) => !item.contains(p) && cleanText(p.textContent))
      : [];
    if (!icon && !title && descs.length === 0) return;
    const textCell = [];
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      textCell.push(h3);
    }
    descs.forEach((p) => {
      p.removeAttribute('style');
      textCell.push(p);
    });
    cells.push([icon || '', textCell.length ? textCell : '']);
  });
  return cells;
}

export default function parse(element, { document, url, params }) {
  // PTS feature icons (.cmp-titlelink_container grid) - separate branch
  if (isIconFeatures(element)) {
    const iconCells = parseIconFeatures(element, document);
    if (iconCells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser (grid, icons)', cells: iconCells });
    element.replaceWith(block);
    return;
  }

  // Help & Support landing page grids (help.parker.com/us/en/support) - separate branches
  if (!isHelpCards(element) && (isLandingTileGrid(element) || isLandingButtonCards(element))) {
    const tiles = isLandingTileGrid(element);
    const landingCells = tiles
      ? parseLandingTiles(element, document)
      : parseLandingButtonCards(element, document);
    if (landingCells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const name = tiles ? 'cards-teaser (grid, text)' : 'cards-teaser (text, buttons)';
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name, cells: landingCells }));
    return;
  }

  // Help & Support option cards (help.parker.com) - separate branch
  if (isHelpCards(element)) {
    const helpCells = parseHelpCards(element, document);
    if (helpCells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser (grid, text)', cells: helpCells });
    element.replaceWith(block);
    return;
  }

  const grid = isCardGrid(element);

  // Section heading sitting above the slider (default content, not part of the block)
  const sectionHeading = element.querySelector('.slider-carousel-container > h2, :scope > h2')
    || Array.from(element.querySelectorAll('h2')).find((h) => !h.closest('.card'));

  const cards = Array.from(element.querySelectorAll('.card'))
    .filter((card) => !card.closest('.slick-cloned'));

  const cells = [];
  const seen = new Set();

  cards.forEach((card) => {
    const image = card.querySelector('.card-img-top, picture img, img');
    const body = card.querySelector('.card-body') || card;
    let title = body.querySelector('.card-title, h3, h2, h4');
    // Grid tiles: source titles are h4 -> author as h3
    if (grid && title && /^H[1-6]$/.test(title.tagName)) title = retag(document, title, 'h3');

    // Description: non-empty paragraphs inside .card-description (skip date details)
    const descRoot = body.querySelector('.card-description') || body;
    const descParas = Array.from(descRoot.querySelectorAll('p'))
      .filter((p) => !p.closest('.card-details') && !p.closest('.btn-align'))
      .filter((p) => p.textContent.replace(/\u00a0/g, ' ').trim());

    const ctaLinks = Array.from(body.querySelectorAll('.btn-align a[href], a.btn[href]'));

    // De-duplicate (cloned slides) by title + first link - slider path only;
    // a grid has no clones, so every tile is kept.
    if (!grid) {
      const key = `${title ? title.textContent.trim() : ''}|${ctaLinks[0] ? ctaLinks[0].getAttribute('href') : ''}`;
      if (seen.has(key)) return;
      seen.add(key);
    }

    const textCell = [];
    if (title) textCell.push(title);
    textCell.push(...descParas);
    ctaLinks.forEach((a) => {
      const p = document.createElement('p');
      p.append(a);
      textCell.push(p);
    });

    if (image || textCell.length > 0) {
      cells.push([image || '', textCell]);
    }
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // PTS Resources: bordered grid cards with pill CTAs -> (grid, buttons)
  const gridName = PTS_PAGES.includes(pagePath(url, params)) ? 'cards-teaser (grid, buttons)' : 'cards-teaser (grid)';
  const block = grid
    ? WebImporter.Blocks.createBlock(document, { name: gridName, cells })
    : WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', cells });
  if (sectionHeading) element.before(sectionHeading);
  element.replaceWith(block);
}
