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
 */
export default function parse(element, { document }) {
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
    const title = body.querySelector('.card-title, h3, h2, h4');

    // Description: non-empty paragraphs inside .card-description (skip date details)
    const descRoot = body.querySelector('.card-description') || body;
    const descParas = Array.from(descRoot.querySelectorAll('p'))
      .filter((p) => !p.closest('.card-details') && !p.closest('.btn-align'))
      .filter((p) => p.textContent.replace(/\u00a0/g, ' ').trim());

    const ctaLinks = Array.from(body.querySelectorAll('.btn-align a[href], a.btn[href]'));

    // De-duplicate (cloned slides) by title + first link
    const key = `${title ? title.textContent.trim() : ''}|${ctaLinks[0] ? ctaLinks[0].getAttribute('href') : ''}`;
    if (seen.has(key)) return;
    seen.add(key);

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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', cells });
  if (sectionHeading) element.before(sectionHeading);
  element.replaceWith(block);
}
