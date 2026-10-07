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
 */

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

export default function parse(element, { document }) {
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

  const block = grid
    ? WebImporter.Blocks.createBlock(document, { name: 'cards-teaser (grid)', cells })
    : WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', cells });
  if (sectionHeading) element.before(sectionHeading);
  element.replaceWith(block);
}
