/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-blog. Base: cards.
 * Source: https://blog.parker.com/us/en/home.html (template blog-home)
 * Matched element: .cmp-blog-recent-blogs (MUI grid of recent blog posts).
 *
 * Cards convention: 2 columns, one row per card.
 *   cell 1: image (img.blog-post-img; alt taken from its title attribute)
 *   cell 2: p meta "Contributed By: <author>" <br> "<date>"
 *           h2 title (h2.blog-post-title)
 *           p description (span.blog-post-description)
 *           p > a "Read Blog" (a.blog-post-read-btn, href to article)
 * blocks/cards-blog splits the meta paragraph on <br> into author / date.
 *
 * Iteration is keyed on div.MuiCard-root.blog-post (block-level div, not an
 * inline wrapper), with .blog-post fallback.
 * Generated: 2026-10-11
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('div.MuiCard-root.blog-post')];
  if (!items.length) items = [...element.querySelectorAll('.blog-post')];

  const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  const cells = [];
  items.forEach((item) => {
    const authorWrap = item.querySelector('.blog-post-author');
    const spans = authorWrap ? [...authorWrap.querySelectorAll(':scope > span')] : [];
    let author = text(spans[0]);
    let date = text(spans[1]);
    // The importer unwraps the author/date <span>s before parsing, leaving one text
    // run ("Contributed By: …Oct 01, 2026"); split the trailing date off it.
    if (!spans.length && authorWrap) {
      const meta = text(authorWrap);
      const m = meta.match(/^(.*?)\s*([A-Z][a-z]{2,8}\.? \d{1,2}, \d{4})$/);
      author = m ? m[1] : meta;
      date = m ? m[2] : '';
    }
    const titleEl = item.querySelector('h2.blog-post-title, .blog-post-title, h2, h3');
    const img = item.querySelector('img.blog-post-img, img');
    const descEl = item.querySelector('span.blog-post-description, .blog-post-description');
    const linkEl = item.querySelector('a.blog-post-read-btn, .blog-post-actions a, a[href]');

    const title = text(titleEl);
    if (!title && !linkEl) return;

    // Image cell
    let imageCell = '';
    if (img) {
      const image = document.createElement('img');
      image.src = img.getAttribute('src');
      image.alt = img.getAttribute('alt') || img.getAttribute('title') || title;
      imageCell = image;
    }

    // Text cell
    const body = [];
    if (author || date) {
      const meta = document.createElement('p');
      if (author) meta.append(author);
      if (author && date) meta.append(document.createElement('br'));
      if (date) meta.append(date);
      body.push(meta);
    }
    if (title) {
      const h2 = document.createElement('h2');
      h2.textContent = title;
      body.push(h2);
    }
    const desc = text(descEl);
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      body.push(p);
    }
    if (linkEl) {
      const a = document.createElement('a');
      a.href = linkEl.getAttribute('href');
      a.textContent = text(linkEl) || 'Read Blog';
      const p = document.createElement('p');
      p.append(a);
      body.push(p);
    }

    cells.push([imageCell, body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-blog', cells });
  element.replaceWith(block);
}
