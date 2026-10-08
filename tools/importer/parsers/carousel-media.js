/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-media. Base: carousel.
 * Source: https://www.parker.com/us/en/industries/digital/pts.html (template pts)
 * Structure (library Carousel + blocks/carousel-media/README.md): 2 columns, one row
 * per slide: [picture] | [eyebrow p, H2 title, ul and/or paragraph(s), optional CTA].
 *
 * Matched element: a .parker-carousel slick slider whose slides hold an
 * image-box (.row.image-box-container: .left-box text column + .image-wrapper
 * picture column). Two instances on the PTS page:
 *  - PTS 3.0 Update slider: each slide's image-box sits in a light-grey panel
 *    (.slick-slide > div > div.grey-bg > .image-box-container) -> emitted as
 *    "carousel-media (panel)"; 7 slides, eyebrow + H2 + ul + "Sign up for PTS emails".
 *  - Mobile-app FAQ slider: no panel (div with empty class) -> plain
 *    "carousel-media"; 12 slides, eyebrow + H2 question + paragraph, no CTA.
 * Iteration key: the stable block-level .image-box-container wrappers (never the
 * slick slides / links); copies inside .slick-cloned slides are skipped. Hidden
 * slides (aria-hidden="true", i.e. every slide but the current one) are content
 * and are kept. Slider chrome (arrow images, dots) is not part of any slide and
 * is dropped with the element.
 */

const cleanText = (s) => (s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

// Non-empty description children (ul/ol/p), in order. Bare text is wrapped in a <p>.
function descriptionNodes(desc, document) {
  if (!desc) return [];
  const out = [];
  Array.from(desc.childNodes).forEach((n) => {
    if (n.nodeType === 3) {
      const text = cleanText(n.textContent);
      if (text) {
        const p = document.createElement('p');
        p.textContent = text;
        out.push(p);
      }
      return;
    }
    if (n.nodeType !== 1) return;
    if (!cleanText(n.textContent) && !n.querySelector('img')) return;
    out.push(n);
  });
  return out;
}

export default function parse(element, { document }) {
  const boxes = Array.from(element.querySelectorAll('.image-box-container'))
    .filter((box) => !box.closest('.slick-cloned'));

  // Panel option: slides sit on a light-grey panel (.grey-bg wrapper)
  const panel = boxes.some((box) => box.parentElement && box.parentElement.classList.contains('grey-bg'));

  const cells = [];
  boxes.forEach((box) => {
    const textCol = box.querySelector('.left-box') || box;
    const image = box.querySelector('.image-wrapper img, .image-container img, picture img');

    const textCell = [];
    const eyebrow = textCol.querySelector('.cmp-parker-image-box-container__header-text');
    const heading = textCol.querySelector('.image-box-container__title, h2, h3');
    if (eyebrow && cleanText(eyebrow.textContent)) {
      const p = document.createElement('p');
      p.textContent = cleanText(eyebrow.textContent);
      textCell.push(p);
    }
    if (heading && cleanText(heading.textContent)) {
      const h2 = document.createElement('h2');
      h2.append(...heading.childNodes);
      textCell.push(h2);
    }
    textCell.push(...descriptionNodes(textCol.querySelector('.image-box-container__description'), document));
    Array.from(textCol.querySelectorAll('.btn-align a[href], a.btn[href]')).forEach((a) => {
      if (!cleanText(a.textContent)) return;
      const p = document.createElement('p');
      p.append(a);
      textCell.push(p);
    });

    if (!image && textCell.length === 0) return;
    cells.push([image || '', textCell.length ? textCell : '']);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = panel
    ? WebImporter.Blocks.createBlock(document, { name: 'carousel-media (panel)', cells })
    : WebImporter.Blocks.createBlock(document, { name: 'carousel-media', cells });
  element.replaceWith(block);
}
