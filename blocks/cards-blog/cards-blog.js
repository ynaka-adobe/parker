import { createOptimizedPicture } from '../../scripts/aem.js';
import { filterPersonaRows } from '../../scripts/persona.js';

/* no authorable options yet; any extra classes on the block are ignored */

const DATE_RE = /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}|\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|\d{4}-\d{2}-\d{2})\s*$/i;

function span(className, text) {
  const s = document.createElement('span');
  s.className = className;
  s.textContent = text.trim();
  return s;
}

/* turn the meta paragraph(s) into an author / date row */
function buildMeta(metaEls) {
  const meta = document.createElement('div');
  meta.className = 'cards-blog-card-meta';
  const parts = [];
  metaEls.forEach((el) => {
    // split on <br> so "author<br>date" yields two parts
    el.innerHTML.split(/<br\s*\/?>/i).forEach((html) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const text = tmp.textContent.trim();
      if (text) parts.push(text);
    });
  });

  let author = parts.join(' ');
  let date = '';
  if (parts.length > 1 && DATE_RE.test(parts[parts.length - 1])) {
    date = parts.pop();
    author = parts.join(' ');
  } else {
    const m = author.match(DATE_RE);
    if (m) {
      [, date] = m;
      author = author.slice(0, m.index);
    }
  }
  if (author) {
    const a = span('cards-blog-card-author', author);
    a.title = a.textContent;
    meta.append(a);
  }
  if (date) meta.append(span('cards-blog-card-date', date));
  return meta;
}

function buildCard(row, eager) {
  const li = document.createElement('li');
  const cells = [...row.children];
  const imageCell = cells.find((c) => c.querySelector('picture, img') && !c.querySelector('h1, h2, h3, h4, h5, h6'));
  const bodyCells = cells.filter((c) => c !== imageCell);

  // collect body children from all non-image cells (tolerates authors splitting content)
  const nodes = bodyCells.flatMap((c) => [...c.children]);
  // a picture inside the body cell (single-column authoring) is treated as the image
  let picture = imageCell ? imageCell.querySelector('picture') : null;
  if (!picture) {
    const inBody = nodes.find((n) => n.querySelector && n.querySelector('picture'));
    if (inBody) picture = inBody.querySelector('picture');
  }

  const headingIdx = nodes.findIndex((n) => /^H[1-6]$/.test(n.tagName));
  const metaEls = headingIdx > 0
    ? nodes.slice(0, headingIdx).filter((n) => n.tagName === 'P' && !n.querySelector('picture'))
    : [];
  const heading = headingIdx >= 0 ? nodes[headingIdx] : null;
  const rest = nodes.filter((n, i) => i > headingIdx && !metaEls.includes(n)
    && !(picture && n.contains(picture)));
  const ctaEls = rest.filter((n) => n.tagName === 'P' && n.querySelector('a')
    && n.textContent.trim() === n.querySelector('a').textContent.trim());
  const descEls = rest.filter((n) => !ctaEls.includes(n));

  const header = document.createElement('div');
  header.className = 'cards-blog-card-header';
  if (metaEls.length) header.append(buildMeta(metaEls));
  if (heading) {
    heading.classList.add('cards-blog-card-title');
    header.append(heading);
  }
  if (header.children.length) li.append(header);

  if (picture) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'cards-blog-card-image';
    const img = picture.querySelector('img');
    imgWrap.append(img
      ? createOptimizedPicture(img.src, img.alt, eager, [{ width: '750' }])
      : picture);
    li.append(imgWrap);
  }

  if (descEls.length) {
    const body = document.createElement('div');
    body.className = 'cards-blog-card-body';
    body.append(...descEls);
    li.append(body);
  }

  if (ctaEls.length) {
    const cta = document.createElement('div');
    cta.className = 'cards-blog-card-cta';
    ctaEls.forEach((p) => {
      p.classList.add('button-container');
      const a = p.querySelector('a');
      a.classList.add('button');
      // every card says "Read Blog": add the title so each link name is unique
      if (heading) a.append(span('cards-blog-sr-only', `: ${heading.textContent.trim()}`));
    });
    cta.append(...ctaEls);
    li.append(cta);
  }
  return li;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  filterPersonaRows([...block.children]).forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture, img')) return;
    // first row (up to 3 columns) is above the fold and holds the LCP image
    const li = buildCard(row, ul.children.length < 3);
    if (row.dataset.personaTags) li.dataset.personaTags = row.dataset.personaTags;
    ul.append(li);
  });
  block.replaceChildren(ul);
}
