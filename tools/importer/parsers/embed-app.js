/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-app. Base: embed (custom block, not in library).
 * Source: https://www.parker.com/us/en/markets/interactive-library/parker-world.html
 * Library convention (Embed): 1 column, 2 rows - the block-name row, then a single
 * cell with the URL of the external content (an optional poster image would sit above
 * the link in the same cell; the source has none). Local README matches: one cell
 * holding a link to the app URL; the block renders the iframe on allow-listed hosts
 * and a launch panel elsewhere.
 * Source: grid column wrapping an HTML snippet - inline <style>, .parker-embed-wrapper
 * with a .parker-expand-btn button and iframe[src="https://parkerworld.parker.com/"],
 * plus two &nbsp; spacer text components. Only the iframe URL is authorable; the
 * whole column is replaced so the style text, button and spacers don't leak.
 */
export default function parse(element, { document }) {
  const iframe = element.querySelector('.parker-embed-wrapper iframe[src], iframe[src]');
  const src = iframe ? iframe.getAttribute('src') : '';

  // Empty-block guard: no app URL, nothing authorable here
  if (!src) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Row 2 / single cell: optional poster image (none in source) above the URL link
  const link = document.createElement('a');
  link.href = src;
  link.textContent = src;

  const cells = [[link]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-app', cells });
  element.replaceWith(block);
}
