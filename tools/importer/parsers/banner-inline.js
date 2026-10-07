/* eslint-disable */
/* global WebImporter */
/**
 * Parser for banner-inline. Base: banner (custom block, not in library).
 * Source: https://www.parker.com/us/en/markets/aerospace-and-defense.html
 * Local model (blocks/banner-inline/README.md): standalone, one row / one cell:
 *   [H2 heading, optional paragraph, p > a CTA].
 * Source: .layout-col-8-4 grid column holding two .cmp-parker-blue-theme image-box
 * containers side by side - the first carries the title (h2.image-box-container__title,
 * empty description), the second only the .btn-align CTA ("Watch Now").
 */
export default function parse(element, { document }) {
  const heading = element.querySelector('.image-box-container__title, h2, h3');

  // Non-empty description paragraphs (the source description divs are usually empty)
  const descParas = Array.from(element.querySelectorAll('.image-box-container__description'))
    .flatMap((d) => {
      const ps = Array.from(d.querySelectorAll('p'));
      if (ps.length) return ps;
      return d.textContent.trim() ? [d] : [];
    })
    .filter((p) => p.textContent.replace(/\u00a0/g, ' ').trim());

  const ctaLinks = Array.from(element.querySelectorAll('.btn-align a[href], a.btn[href]'));

  // Empty-block guard
  if (!heading && descParas.length === 0 && ctaLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];
  if (heading) contentCell.push(heading);
  contentCell.push(...descParas);
  ctaLinks.forEach((a) => {
    const p = document.createElement('p');
    p.append(a);
    contentCell.push(p);
  });

  const cells = [[contentCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'banner-inline', cells });
  element.replaceWith(block);
}
