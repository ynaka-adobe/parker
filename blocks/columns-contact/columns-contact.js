export default function decorate(block) {
  // contact panel: one row, two columns -> [heading + intro text] | [phone, email, CTA button]
  const cols = [...block.firstElementChild?.children ?? []];
  block.classList.add(`columns-contact-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col, i) => {
      col.classList.add(i === 0 ? 'columns-contact-intro' : 'columns-contact-details');
    });
  });

  // phone / email links render as plain text links; only an authored bold/italic link stays a pill
  block.querySelectorAll('a.button').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (!/^(tel|mailto):/i.test(href)) return;
    a.classList.remove('button', 'primary', 'secondary');
    const container = a.closest('.button-container');
    if (container) {
      container.classList.remove('button-container');
      container.classList.add(href.toLowerCase().startsWith('tel:') ? 'columns-contact-phone' : 'columns-contact-email');
    }
  });

  // unwrapped phone/email paragraphs (e.g. text not decorated as buttons)
  block.querySelectorAll('.columns-contact-details p').forEach((p) => {
    if (p.classList.length) return;
    const a = p.querySelector('a[href^="tel:"], a[href^="mailto:"]');
    if (!a) return;
    p.classList.add(a.href.startsWith('tel:') ? 'columns-contact-phone' : 'columns-contact-email');
  });
}
