/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns.
 * Source: https://www.parker.com/us/en/home.html
 * Structure (library): flexible columns. Here: 2 columns -> [text content | media].
 * Handles two instances (.cmp-parker-blue-theme..., .grey-bg...) with the same
 * image-box-container layout. Text and media order preserved from DOM.
 */
export default function parse(element, { document }) {
  // Text column: heading, subtitle, description, CTA
  const textBox = element.querySelector('.left-box, .image-box-container__opacity-overlay, [class*="left-box"]');

  // Media column: image wrapper / picture
  const mediaBox = element.querySelector('.image-wrapper, .image-container, [class*="image-wrapper"]');
  const image = element.querySelector('.image-wrapper img, .image-container img, picture img, img');

  const textCell = [];
  if (textBox) {
    // Eyebrow / header text (e.g. "About Parker") that sits above the title
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

  const cells = [];
  cells.push([textCell, mediaCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
