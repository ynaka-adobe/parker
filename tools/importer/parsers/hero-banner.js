/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://www.parker.com/us/en/home.html
 * Structure (library): 1 column, 3 rows -> [name], [background image], [title + subheading + CTA]
 *
 * Also used by the markets template (e.g. /us/en/markets/aerospace-and-defense.html):
 * same .cq-dd-image teaser markup (h2.cmp-teaser__title-link inside an href-less <a>,
 * multi-paragraph .cmp-teaser__description) but usually NO CTA. The CTA list is
 * optional, so the content cell is then just [title, description].
 *
 * PTS template (/us/en/industries/digital/pts.html): the same .left-to-right-gradient
 * teaser carries a small logo above the heading
 * (.cmp-teaser__content > .cmp-logo-container > img.cmp-logo-image, the PTS 3.0 logo).
 * It is kept as an image at the start of the content cell, before the H2:
 * [logo, title, description]. Taken only when .cmp-logo-container holds an <img>,
 * which no home / markets snapshot or scrape has, so their output is unchanged.
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

  // Optional logo above the heading (PTS 3.0 logo); never the background image.
  const logo = Array.from(element.querySelectorAll('.cmp-logo-container img'))
    .find((img) => img !== bgImage) || null;

  // Row 3: content cell ([logo] + title + subheading + CTA)
  const contentCell = [];
  if (logo) contentCell.push(logo);
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
