/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news. Base: cards.
 * Source: https://www.parker.com/us/en/home.html
 * Source is a text-only news list (no images), so it maps to the Cards (no images)
 * structure: 1 column, one card per row. Each row holds the linked article title
 * plus its source/date meta line.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-news-v2-component__list'));

  const cells = [];

  items.forEach((item) => {
    const titleLink = item.querySelector('.cmp-news-v2-component__list-title-link, .cmp-news-v2-component__list-title a, a[href]');
    const meta = item.querySelector('.cmp-news-v2-component__author');

    const contentCell = [];
    if (titleLink) contentCell.push(titleLink);
    if (meta) contentCell.push(meta);

    if (contentCell.length > 0) {
      cells.push([contentCell]);
    }
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
