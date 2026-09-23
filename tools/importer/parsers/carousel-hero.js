/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://www.parker.com/us/en/home.html
 * Structure (library): 2 columns. Row 1 = block name. Each subsequent row = one slide:
 *   cell 1 = image (mandatory), cell 2 = text content (title, description, CTA).
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-carousel__item'));

  const cells = [];

  items.forEach((item) => {
    const image = item.querySelector('.cmp-teaser__image img, .cmp-image__image, picture img, img');

    const content = item.querySelector('.cmp-teaser__content');
    const contentCell = [];
    if (content) {
      const eyebrow = content.querySelector('.cmp-teaser__header-text');
      const heading = content.querySelector('.cmp-teaser__title h1, .cmp-teaser__title h2, .cmp-teaser__title-link, h1, h2, h3');
      const description = content.querySelector('.cmp-teaser__description');
      const ctaLinks = Array.from(content.querySelectorAll('.btn-align a, a.btn'));
      if (eyebrow) contentCell.push(eyebrow);
      if (heading) contentCell.push(heading);
      if (description) contentCell.push(description);
      contentCell.push(...ctaLinks);
    }

    // Only add a slide row if it has an image (mandatory) or content
    if (image || contentCell.length > 0) {
      cells.push([image || '', contentCell]);
    }
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
