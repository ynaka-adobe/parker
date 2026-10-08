/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-category. Base: cards.
 * Source: https://www.parker.com/us/en/home.html
 * Structure (library): 2 columns. Row 1 = block name. Each subsequent row = one card:
 *   cell 1 = image (mandatory), cell 2 = text content (title, optional description, optional CTA).
 * Source is a slick carousel; iterate over `.card` elements to avoid empty slide wrappers.
 *
 * Product category (ph.parker.com/us/en/category/*, template product-category):
 * ul#category-list-category-items ([data-testid] equivalent) with no .card.
 * Each li holds <a href="/us/en/series/..."><div><div><img></div><div><h5> Label</h5></div></div></a>.
 * Emitted as "cards-category (grid)", one row per li:
 *   [picture] | [<p><a href="(absolute ph.parker.com URL)">trimmed h5 label</a></p>].
 * Iteration is keyed on the block-level li items (not the anchors) so the
 * importer's inline-element merging can never collapse tiles. Taken only for
 * the ph.parker.com list id / data-testid, which no www.parker.com markup has.
 *
 * Products landing (ph.parker.com/us/en/category, template product-landing):
 * 19 grids ul#category-products-category-{n}-subcategories-list ([data-testid]
 * equivalent), same tile shape: li > a[href] > div > (div#...-image-container > img)
 * + (div#...-content > h5#...-name " Label"). Same "cards-category (grid)" output.
 */
const PRODUCT_TILE_LIST = [
  'ul#category-list-category-items',
  'ul[data-testid="category-list-category-items"]',
  'ul[id^="category-products-category-"][id$="-subcategories-list"]',
  'ul[data-testid^="category-products-category-"][data-testid$="-subcategories-list"]',
].join(', ');
const PH_ORIGIN = 'https://ph.parker.com';

function absoluteHref(href) {
  if (!href) return '';
  try {
    return new URL(href, `${PH_ORIGIN}/`).href;
  } catch (e) {
    return href;
  }
}

function parseProductTiles(element, document) {
  const rows = [];
  Array.from(element.children).filter((li) => li.tagName === 'LI').forEach((li) => {
    const img = li.querySelector('img');
    const link = li.querySelector('a[href]');
    const title = li.querySelector('h5, h4, h3, h6, [id^="category-list-category-title"]');
    const label = (title ? title.textContent : (img && img.getAttribute('alt')) || '')
      .replace(/\s+/g, ' ').trim();
    let textCell = '';
    if (label) {
      const p = document.createElement('p');
      if (link) {
        const a = document.createElement('a');
        a.setAttribute('href', absoluteHref(link.getAttribute('href')));
        a.textContent = label;
        p.append(a);
      } else {
        p.textContent = label;
      }
      textCell = p;
    }
    if (img || textCell) rows.push([img || '', textCell]);
  });
  return rows;
}

export default function parse(element, { document }) {
  if (element.matches && element.matches(PRODUCT_TILE_LIST) && !element.querySelector('.card')) {
    const tileRows = parseProductTiles(element, document);
    if (tileRows.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const tiles = WebImporter.Blocks.createBlock(document, { name: 'cards-category (grid)', cells: tileRows });
    element.replaceWith(tiles);
    return;
  }

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
