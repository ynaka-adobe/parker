/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns.
 * Source: https://www.parker.com/us/en/home.html
 * Structure (library): flexible columns. Here: 2 columns -> [text content | media].
 * Handles two instances (.cmp-parker-blue-theme..., .grey-bg...) with the same
 * image-box-container layout. Text and media order preserved from DOM.
 *
 * Markets template (e.g. /us/en/markets/aerospace-and-defense.html) - same
 * .image-box-container markup, plus:
 *  - Variant: when the matched grid column carries
 *    .cmp-parker-secondary-img-box-theme (sky-blue Ebrake band, charcoal
 *    Next-Gen band) the block is emitted as "columns-media (full-bleed)";
 *    otherwise plain "columns-media". No home columns-media instance has that
 *    class, so the home output is unaffected.
 *  - Cell order follows the source's VISUAL order: the columns carry
 *    order-left / order-right classes (.left-box.order-right +
 *    .image-wrapper.order-left = image on the left). The home layout
 *    (.cmp-parker-ibd-align-center) keeps its original DOM order
 *    [text | media] so the home import stays byte-identical.
 *  - "Watch Video" CTAs (Scene7 VideoViewer URLs) are plain .btn-align links
 *    and are kept as links.
 */

// Returns 'left' | 'right' | null from Bootstrap-style order-left/order-right classes
function visualSide(el) {
  if (!el || !el.classList) return null;
  if (el.classList.contains('order-left')) return 'left';
  if (el.classList.contains('order-right')) return 'right';
  return null;
}

export default function parse(element, { document }) {
  // Text column: heading, subtitle, description, CTA
  const textBox = element.querySelector('.left-box, .image-box-container__opacity-overlay, [class*="left-box"]');

  // Media column: image wrapper / picture
  const mediaBox = element.querySelector('.image-wrapper, .image-container, [class*="image-wrapper"]');
  const image = element.querySelector('.image-wrapper img, .image-container img, picture img, img');

  const textCell = [];
  if (textBox) {
    // Eyebrow / header text (e.g. "About Parker", "Interactive") that sits above the title
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

  // Visual order (markets): image cell first when the media column is placed on the
  // left. Home's .cmp-parker-ibd-align-center layout keeps the original [text | media].
  let imageFirst = false;
  if (!element.classList.contains('cmp-parker-ibd-align-center')) {
    const textCol = (textBox && textBox.closest('.left-box')) || textBox;
    const mediaCol = element.querySelector('.image-wrapper') || mediaBox;
    const mediaSide = visualSide(mediaCol);
    const textSide = visualSide(textCol);
    if (mediaSide === 'left' || (mediaSide === null && textSide === 'right')) {
      imageFirst = true;
    }
  }

  const cells = [];
  cells.push(imageFirst ? [mediaCell, textCell] : [textCell, mediaCell]);

  // Full-bleed option when the matched grid column is a "secondary image box" band
  const fullBleed = element.classList.contains('cmp-parker-secondary-img-box-theme');
  const block = fullBleed
    ? WebImporter.Blocks.createBlock(document, { name: 'columns-media (full-bleed)', cells })
    : WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
