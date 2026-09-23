/* eslint-disable */
/* global WebImporter */
/**
 * Parser for banner-cta. Base: banner (custom block, not in library).
 * Source: https://www.parker.com/us/en/home.html
 * Local model (blocks/banner-cta/README.md): standalone block, single block table,
 * one row / one cell of content. Source content: eyebrow, title, description, CTA.
 */
export default function parse(element, { document }) {
  const scope = element.querySelector('.image-box-container__opacity-overlay, .left-box') || element;

  const eyebrow = scope.querySelector('.cmp-parker-image-box-container__header-text, .image-box-container__header p');
  const heading = scope.querySelector('.image-box-container__title, h1, h2, h3');
  const description = scope.querySelector('.image-box-container__description');
  const ctaLinks = Array.from(scope.querySelectorAll('.btn-align a, a.btn'));

  // Empty-block guard
  if (!eyebrow && !heading && !description && ctaLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];
  if (eyebrow) contentCell.push(eyebrow);
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);

  const cells = [];
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'banner-cta', cells });
  element.replaceWith(block);
}
