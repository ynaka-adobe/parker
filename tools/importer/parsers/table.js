/* eslint-disable */
/* global WebImporter */
/**
 * Parser for table (vanilla block). Base: table.
 * Source: https://blog.parker.com/us/en/emg_cho/radar-across-every-domain.html
 * (template blog-article): a plain authored <table> in the article body
 * ("Radar Domain | Primary Challenge | Recommended Solution", 3 data rows).
 * Without this parser the importer turns a raw <table> into a block named after
 * its first row ("radar-domain") and the header text is lost.
 *
 * Block structure (library convention): first row = block name only ("Table",
 * added by createBlock); each subsequent row = one source row. The first source
 * row holds the column headers, which blocks/table renders as <thead> (default,
 * no "no-header" variant). Cell content (b/br/links) is kept; empty and
 * &nbsp;-only paragraphs are dropped.
 * Generated: 2026-10-11
 */
export default function parse(element, { document }) {
  const table = element.matches('table') ? element : element.querySelector('table');
  if (!table) return;

  const cells = [];
  [...table.querySelectorAll('tr')].forEach((tr) => {
    const row = [...tr.children].filter((c) => c.matches('td, th')).map((c) => {
      c.querySelectorAll('p').forEach((p) => {
        if (!p.textContent.replace(/ /g, ' ').trim() && !p.querySelector('img')) p.remove();
      });
      // single-paragraph cells: keep the inline content only
      const ps = c.querySelectorAll(':scope > p');
      if (ps.length === 1 && c.children.length === 1) return [...ps[0].childNodes];
      return [...c.childNodes];
    });
    if (row.length) cells.push(row);
  });
  if (!cells.length) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'table', cells });
  table.replaceWith(block);
}
