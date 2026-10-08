/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-video. Base: cards.
 * Source: https://www.parker.com/us/en/industries/digital/pts.html (template pts)
 * Structure (library Cards + blocks/cards-video/README.md): 2 columns, one row per
 * video: [thumbnail picture] | [H3 caption, p > a (link to the MP4)].
 *
 * Matched element: the .parker-carousel of watch-now video tiles
 * (.slick-slide > div > .cmp-watchnowvideo__parkerdivision > .watch-now-video-container
 *  > .img-container [picture > img#thumnail-image, .play-arrow-icon-container,
 *  .cmp-component__author > h4.cmp-component__header caption]).
 * Iterates the block-level .cmp-watchnowvideo__parkerdivision wrappers, skipping any
 * inside .slick-cloned slides (this slider has none today). The play icon is not
 * content. The section heading (.slider-carousel-container > h2 "VIDEOS") is kept as
 * default content placed BEFORE the block.
 *
 * The MP4 URLs are NOT in the rendered DOM (the component opens them from the AEM
 * page model). They are embedded below as a constant map caption -> URL, taken from
 * migration-work/pts-model.json (responsivegrid/parkercarousel_20048 items:
 * title/videoTitle -> videoURL). Nothing is read from disk at import time.
 */

const VIDEO_URLS = {
  'Amusement Park Success Story': 'https://www.parker.com/content/dam/parker/na/united-states/industries/digital/pts/PTS-Success-Amusement-Park-v6-rev_1_1.mp4',
  'Potato Processing Plant Success Story': 'https://www.parker.com/content/dam/parker/na/united-states/industries/digital/pts/PTS-Success-Potato-Processing-Plant-v5_1.mp4',
  'Transporter of Natural Gas Success Story': 'https://www.parker.com/content/dam/parker/na/united-states/industries/digital/pts/PTS-Success-Transporter-of-Natural-Gas-v4_1.mp4',
};

const cleanText = (s) => (s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

// Case/whitespace-insensitive lookup in VIDEO_URLS.
function videoUrlFor(caption) {
  const key = cleanText(caption).toLowerCase();
  const hit = Object.keys(VIDEO_URLS).find((k) => k.toLowerCase() === key);
  return hit ? VIDEO_URLS[hit] : null;
}

export default function parse(element, { document }) {
  const sectionHeading = element.querySelector('.slider-carousel-container > h2, :scope > h2');

  const tiles = Array.from(element.querySelectorAll('.cmp-watchnowvideo__parkerdivision'))
    .filter((tile) => !tile.closest('.slick-cloned'));

  const cells = [];
  tiles.forEach((tile) => {
    const image = tile.querySelector('.img-container picture img, img#thumnail-image')
      || Array.from(tile.querySelectorAll('img')).find((img) => !img.closest('.play-arrow-icon-container'));
    const captionEl = tile.querySelector('.cmp-component__header, h4, h3');
    const caption = cleanText(captionEl ? captionEl.textContent : (image && image.getAttribute('title')));
    const href = videoUrlFor(caption)
      || videoUrlFor(image ? image.getAttribute('title') : '');

    const textCell = [];
    if (caption) {
      const h3 = document.createElement('h3');
      h3.textContent = caption;
      textCell.push(h3);
    }
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = href;
      p.append(a);
      textCell.push(p);
    }
    if (!image && textCell.length === 0) return;
    cells.push([image || '', textCell.length ? textCell : '']);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-video', cells });
  if (sectionHeading) element.before(sectionHeading);
  element.replaceWith(block);
}
