/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-app. Base: embed (custom block, not in library).
 * Source: https://www.parker.com/us/en/markets/interactive-library/parker-world.html
 * Library convention (Embed): 1 column, 2 rows - the block-name row (with optional
 * variants), then a single cell with the URL of the external content (an optional
 * poster image would sit above the link in the same cell; the sources have none).
 * Local README matches: one cell holding a link to the app URL; the block renders
 * the iframe on allow-listed hosts and a launch panel elsewhere ('launch' variant:
 * always the launch panel).
 *
 * Two sources, same 1-column / 2-row output:
 * 1. Parker World: grid column wrapping an HTML snippet - inline <style>,
 *    .parker-embed-wrapper with a .parker-expand-btn button and
 *    iframe[src="https://parkerworld.parker.com/"], plus two &nbsp; spacer text
 *    components. Only the iframe URL is authorable; the whole column is replaced so
 *    the style text, button and spacers don't leak. Variant: none.
 * 2. Help & Support Master Directory: the cleanup transformer replaces the live
 *    directory app with div.excat-md-app > a (URL cell; link text = app name).
 *    Variant: 'launch' - it always opens the live app in a new tab.
 */
export default function parse(element, { document }) {
  // Source 2: row 2 / single cell = the app link (URL + app name)
  const launchLink = element.matches('.excat-md-app') ? element.querySelector('a[href]') : null;
  if (launchLink) {
    const cells = [[launchLink]];
    const block = WebImporter.Blocks.createBlock(document, { name: 'embed-app (launch)', cells });
    element.replaceWith(block);
    return;
  }

  // Source 1
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
