/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-card. Base: hero.
 * Source: https://www.parker.com/us/en/markets/aerospace-and-defense.html
 * Local model (blocks/hero-card/README.md): standalone, 1 column:
 *   row 1 = background picture; row 2 = [eyebrow p, h2, description p, CTA link].
 * Source: .cmp-parker-white-background grid column with a .cq-dd-image teaser
 * ("FEATURED WHITE PAPER" eyebrow, h2.cmp-teaser__title-link wrapped in an
 * href-less <a>, .cmp-teaser__description, .btn-align "Download the PDF").
 */
export default function parse(element, { document }) {
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image__image, picture img, img');

  const eyebrow = element.querySelector('.cmp-teaser__header-text, .cmp-teaser__header p');
  const heading = element.querySelector('.cmp-teaser__title h2, .cmp-teaser__title h1, .cmp-teaser__title h3, .cmp-teaser__title-link, h2');
  const descRoot = element.querySelector('.cmp-teaser__description');
  const descParas = descRoot
    ? (descRoot.querySelectorAll('p').length ? Array.from(descRoot.querySelectorAll('p')) : [descRoot])
      .filter((p) => p.textContent.replace(/\u00a0/g, ' ').trim())
    : [];
  const ctaLinks = Array.from(element.querySelectorAll('.btn-align a[href], a.btn[href], .cmp-teaser__action-link[href]'));

  // Empty-block guard
  if (!image && !heading && descParas.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Row 1: background picture (optional)
  if (image) cells.push([image]);

  // Row 2: eyebrow, heading, description, CTA
  const contentCell = [];
  if (eyebrow && eyebrow.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    contentCell.push(p);
  }
  if (heading) contentCell.push(heading);
  contentCell.push(...descParas);
  ctaLinks.forEach((a) => {
    const p = document.createElement('p');
    p.append(a);
    contentCell.push(p);
  });
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-card', cells });
  element.replaceWith(block);
}
