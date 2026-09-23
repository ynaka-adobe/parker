/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-category. Base: cards.
 * Source: https://www.parker.com/us/en/home.html
 * Structure (library): 2 columns. Row 1 = block name. Each subsequent row = one card:
 *   cell 1 = image (mandatory), cell 2 = text content (title, optional description, optional CTA).
 * Source is a slick carousel; iterate over `.card` elements to avoid empty slide wrappers.
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('.card'));

  const cells = [];

  cards.forEach((card) => {
    const image = card.querySelector('.card-img-top, picture img, img');

    const body = card.querySelector('.card-body') || card;
    const title = body.querySelector('.card-title, h1, h2, h3, h4, h5, h6');
    const description = body.querySelector('.card-description');
    const ctaLinks = Array.from(card.querySelectorAll('a[href]'));

    const textCell = [];
    if (title) textCell.push(title);
    if (description && description.textContent.trim()) textCell.push(description);
    textCell.push(...ctaLinks);

    // Only emit a card row if there is an image or text content
    if (image || textCell.length > 0) {
      cells.push([image || '', textCell]);
    }
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });
  element.replaceWith(block);
}
