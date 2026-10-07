/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news. Base: cards.
 * Source: https://www.parker.com/us/en/home.html
 * Source is a text-only news list (no images), so it maps to the Cards (no images)
 * structure: 1 column, one card per row. Each row holds the linked article title
 * plus its source/date meta line.
 *
 * Markets template (e.g. /us/en/markets/aerospace-and-defense.html): the matched
 * element is a .layout-col-6-6 container with two .col-ml-mr text columns. Each
 * item is a <p> holding the article link, a <br> and a "Blog" label. One row per
 * item: [p > a title, p label]. The first non-empty H2 ("Aerospace Education") is
 * kept as default content BEFORE the block; the second column's placeholder
 * <h2>&nbsp;</h2> is dropped. Only used when no home news-v2 items are present,
 * so the home path is unchanged.
 */

const isBlank = (el) => !el || !el.textContent.replace(/\u00a0/g, ' ').trim();

// Markets blog-link list: [p > a, p label] per item; heading moved before the block.
function parseLinkList(element, document) {
  const sectionHeading = Array.from(element.querySelectorAll('h2, h3'))
    .find((h) => !isBlank(h));

  const itemParas = Array.from(element.querySelectorAll('p'))
    .filter((p) => p.querySelector(':scope > a[href]'));

  const cells = [];
  itemParas.forEach((para) => {
    const link = para.querySelector(':scope > a[href]');
    if (!link || isBlank(link)) return;

    // Label = the paragraph's text outside the link (e.g. "Blog" after the <br>)
    const label = Array.from(para.childNodes)
      .filter((n) => n !== link && n.nodeName !== 'BR')
      .map((n) => n.textContent)
      .join(' ')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const titleP = document.createElement('p');
    titleP.append(link);
    const contentCell = [titleP];
    if (label) {
      const labelP = document.createElement('p');
      labelP.textContent = label;
      contentCell.push(labelP);
    }
    cells.push([contentCell]);
  });

  return { sectionHeading, cells };
}

export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-news-v2-component__list'));

  let cells = [];
  let sectionHeading = null;

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

  // Fallback: markets blog-link list (no news-v2 component items)
  if (items.length === 0) {
    ({ sectionHeading, cells } = parseLinkList(element, document));
  }

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  if (sectionHeading) element.before(sectionHeading);
  element.replaceWith(block);
}
