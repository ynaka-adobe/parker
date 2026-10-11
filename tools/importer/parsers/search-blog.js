/* eslint-disable */
/* global WebImporter */
/**
 * Parser for search-blog. Base: search.
 * Source: https://blog.parker.com/us/en/home.html (template blog-home)
 * Matched element: .cmp-parker-blog-search (input + clear/submit buttons + a
 * client-side "Please enter minimum 3 letters" error message).
 *
 * Search convention: 1 column, 1 content row holding a link to the query index
 * to search. The source widget has no authorable content (input, icon buttons
 * and the validation message are all rendered by the block / placeholders), so
 * the parser emits only the query-index link. blocks/search-blog falls back to
 * the same path when no link is authored.
 * Generated: 2026-10-11
 */
const QUERY_INDEX = '/us/en/query-index.json';

export default function parse(element, { document }) {
  // Only treat the element as a search widget if it actually has the search field.
  const field = element.querySelector('input.blog-search-input, .cmp-parker-blog-search-field input, input');
  if (!field) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const link = document.createElement('a');
  link.href = QUERY_INDEX;
  link.textContent = QUERY_INDEX;
  const p = document.createElement('p');
  p.append(link);

  const cells = [[p]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'search-blog', cells });
  element.replaceWith(block);
}
