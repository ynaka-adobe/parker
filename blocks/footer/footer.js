/**
 * Fetch the footer fragment. Metadata-independent dual-fetch:
 * /content first (localhost / aem up), then site root (DA/EDS production).
 * @returns {Promise<{html: string, base: string}>}
 */
async function fetchFooterHtml() {
  let base = '/content/';
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) {
    base = '/';
    resp = await fetch('/footer.plain.html');
  }
  if (!resp.ok) return { html: '', base };
  return { html: await resp.text(), base };
}

/**
 * Rewrite relative image srcs so they resolve against the fragment location.
 * @param {Element} root
 * @param {String} base
 */
function resolveImageSrcs(root, base) {
  root.querySelectorAll('img').forEach((img) => {
    const raw = img.getAttribute('src') || '';
    if (raw && !raw.startsWith('/') && !/^https?:/.test(raw) && !raw.startsWith('data:')) {
      img.setAttribute('src', `${base}${raw}`);
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const { html, base } = await fetchFooterHtml();
  block.textContent = '';

  const footer = document.createElement('div');
  footer.className = 'footer-columns';
  footer.innerHTML = html;
  resolveImageSrcs(footer, base);

  // label the columns: contact, then link columns, then legal bar (last)
  const cols = [...footer.children];
  cols.forEach((col, i) => {
    if (i === 0) col.classList.add('footer-contact');
    else if (i === cols.length - 1) col.classList.add('footer-legal');
    else col.classList.add('footer-col');
  });

  // mark the social column so its links can render as icon buttons
  const socialCol = cols.find((c) => /Follow Us/i.test(c.textContent));
  if (socialCol) {
    socialCol.classList.add('footer-social');
    socialCol.querySelectorAll('a').forEach((a) => {
      a.classList.add('footer-social-link');
      a.setAttribute('aria-label', a.textContent.trim());
      const key = a.textContent.trim().toLowerCase();
      a.dataset.social = key;
    });
  }

  block.append(footer);
}
