/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://www.parker.com/us/en/home.html
 * Structure (library): 1 column, 3 rows -> [name], [background image], [title + subheading + CTA]
 */
export default function parse(element, { document }) {
  // Background image (row 2)
  const bgImage = element.querySelector('.cmp-teaser__image img, .cmp-image__image, picture img, img');

  // Title (styled heading)
  const heading = element.querySelector('.cmp-teaser__title h1, .cmp-teaser__title h2, .cmp-teaser__title-link, [class*="hero-text"], h1, h2');

  // Subheading / description text
  const description = element.querySelector('.cmp-teaser__description, .cmp-teaser__header p');

  // Call-to-action links
  const ctaLinks = Array.from(element.querySelectorAll('.btn-align a, a.btn, .cmp-teaser__action-link'));

  // Empty-block guard
  if (!heading && !description && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (optional)
  if (bgImage) cells.push([bgImage]);

  // Row 3: content cell (title + subheading + CTA)
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
