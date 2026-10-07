/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news. Base: cards.
 * Source: https://www.parker.com/us/en/home.html
 * Source is a text-only news list (no images), so it maps to the Cards (no images)
 * structure: 1 column, one card per row. Each row holds the linked article title
 * plus its source/date meta line.
 *
 * Markets template (e.g. /us/en/markets/aerospace-and-defense.html): the matched
 * element is a .layout-col-6-6 container with two .col-ml-mr text columns. Each
 * item is a <p> holding the article link, a <br> and a "Blog" label. One row per
 * item: [p > a title, p label]. The first non-empty H2 ("Aerospace Education") is
 * kept as default content BEFORE the block; the second column's placeholder
 * <h2>&nbsp;</h2> is dropped. Only used when no home news-v2 items are present,
 * so the home path is unchanged.
 *
 * Help & Support (help.parker.com/us/en/support/find-a-part/18605 and
 * part-information/18605, template support-topic): the matched element is
 * ul.ph-grid-3 (product category list, plain-text <li>s - not links on the
 * source). No images, so this follows the Cards (no images) convention:
 * emitted as "cards-news (columns)", one single-cell row per item [p > a], each
 * category linked to its ph.parker.com product category page. The mapping
 * below is taken from the Products submenu of content/nav.plain.html and is
 * matched by normalised name (lowercase, '&' -> 'and', punctuation stripped);
 * unmatched names link to the category index (CATEGORY_FALLBACK). Taken only
 * when the element is/contains ul.ph-grid-3, which no www.parker.com template has.
 */

const CATEGORY_BASE = 'https://ph.parker.com/us/en/category';
const CATEGORY_FALLBACK = CATEGORY_BASE;

// Products submenu (content/nav.plain.html): category name -> slug under CATEGORY_BASE
const PRODUCT_CATEGORIES = {
  'Adhesives, Coatings and Encapsulants': 'adhesives-coatings-and-encapsulants',
  'Aerospace Systems and Technologies': 'aerospace-systems-and-technologies',
  'Air Preparation (FRL) and Dryers': 'air-preparation-frl-and-dryers',
  'Bioprocessing and Medical Technologies': 'bioprocessing-and-medical-technologies',
  'Cylinders and Actuators': 'cylinders-and-actuators',
  'EMI Shielding': 'emi-shielding',
  'Filters, Collectors, Separators, Purifiers': 'filters-collectors-separators-purifiers',
  'Fittings and Quick Couplings': 'fittings-and-quick-couplings',
  'Gas Generators': 'gas-generators',
  'Hose, Piping and Tubing': 'hose-piping-and-tubing',
  'Motors, Drives and Controllers': 'motors-drives-and-controllers',
  'Mounting and Vibration Control': 'mounting-and-vibration-control',
  'Power Take Offs and Drive Systems': 'power-take-offs-and-drive-systems',
  'Pumps': 'pumps',
  'Refrigeration and Air Conditioning': 'refrigeration-and-air-conditioning',
  'Regulators, Monitors, Sensors and Flow Control': 'regulators-monitors-sensors-and-flow-control',
  'Seals and O-Rings': 'seals-and-o-rings',
  'Thermal and Power Management': 'thermal-and-power-management',
  'Valves': 'valves',
};

// Source wording that differs from the nav label for the same category
// (help list: "Regulators, Monitoring, ..." vs nav: "Regulators, Monitors, ...").
const CATEGORY_ALIASES = {
  'Regulators, Monitoring, Sensors and Flow Control': 'Regulators, Monitors, Sensors and Flow Control',
};

const normName = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');

const CATEGORY_BY_NORM = {};
Object.keys(PRODUCT_CATEGORIES).forEach((name) => {
  CATEGORY_BY_NORM[normName(name)] = `${CATEGORY_BASE}/${PRODUCT_CATEGORIES[name]}`;
});
Object.keys(CATEGORY_ALIASES).forEach((alias) => {
  CATEGORY_BY_NORM[normName(alias)] = CATEGORY_BY_NORM[normName(CATEGORY_ALIASES[alias])];
});

const isHelpCategoryList = (element) => element.matches('ul.ph-grid-3')
  || !!element.querySelector('ul.ph-grid-3');

// help.parker.com category list: one single-cell row per <li> -> [p > a category page]
function parseCategoryList(element, document) {
  const lists = element.matches('ul.ph-grid-3')
    ? [element]
    : Array.from(element.querySelectorAll('ul.ph-grid-3'));
  const cells = [];
  lists.forEach((ul) => {
    Array.from(ul.querySelectorAll(':scope > li')).forEach((li) => {
      const name = li.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
      if (!name) return;
      const srcLink = li.querySelector('a[href]'); // keep a source link if one ever exists
      const a = document.createElement('a');
      a.setAttribute('href', srcLink ? srcLink.getAttribute('href')
        : (CATEGORY_BY_NORM[normName(name)] || CATEGORY_FALLBACK));
      a.textContent = name;
      const p = document.createElement('p');
      p.append(a);
      cells.push([p]);
    });
  });
  return cells;
}

const isBlank = (el) => !el || !el.textContent.replace(/\u00a0/g, ' ').trim();

// Markets blog-link list: [p > a, p label] per item; heading moved before the block.
function parseLinkList(element, document) {
  const sectionHeading = Array.from(element.querySelectorAll('h2, h3'))
    .find((h) => !isBlank(h));

  const itemParas = Array.from(element.querySelectorAll('p'))
    .filter((p) => p.querySelector(':scope > a[href]'));

  const cells = [];
  itemParas.forEach((para) => {
    const link = para.querySelector(':scope > a[href]');
    if (!link || isBlank(link)) return;

    // Label = the paragraph's text outside the link (e.g. "Blog" after the <br>)
    const label = Array.from(para.childNodes)
      .filter((n) => n !== link && n.nodeName !== 'BR')
      .map((n) => n.textContent)
      .join(' ')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const titleP = document.createElement('p');
    titleP.append(link);
    const contentCell = [titleP];
    if (label) {
      const labelP = document.createElement('p');
      labelP.textContent = label;
      contentCell.push(labelP);
    }
    cells.push([contentCell]);
  });

  return { sectionHeading, cells };
}

// Help & Support LANDING page (help.parker.com/us/en/support, template
// support-landing): "More Help" list, matched element is the <ul> itself:
//   ul > li (x12) > a.MuiLink-root[href][title] " Certificates & Compliance"
// -> "cards-news (columns)", Cards (no images): one single-cell row per item
// [p > a], text trimmed, source href kept as-is (rewriteLinks in
// parker-cleanup resolves it); title/target/class attributes dropped.
// Taken only for a <ul> that is not ul.ph-grid-3 and has li > a children -
// home/markets match containers, never a <ul>, so their paths are untouched.
// Iterates the <li>s (not the links).
const isLandingLinkList = (element) => element.matches('ul:not(.ph-grid-3)')
  && !!element.querySelector(':scope > li > a[href]');

function parseLandingLinkList(element, document) {
  const cells = [];
  Array.from(element.querySelectorAll(':scope > li')).forEach((li) => {
    const link = li.querySelector(':scope > a[href]');
    if (!link) return;
    const text = link.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return;
    const a = document.createElement('a');
    a.setAttribute('href', link.getAttribute('href'));
    a.textContent = text;
    const p = document.createElement('p');
    p.append(a);
    cells.push([p]);
  });
  return cells;
}

export default function parse(element, { document }) {
  // Help & Support landing "More Help" link list (help.parker.com/us/en/support) - separate branch
  if (isLandingLinkList(element)) {
    const landingCells = parseLandingLinkList(element, document);
    if (landingCells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-news (columns)', cells: landingCells }));
    return;
  }

  // Help & Support product category list (help.parker.com) - separate branch
  if (isHelpCategoryList(element)) {
    const helpCells = parseCategoryList(element, document);
    if (helpCells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news (columns)', cells: helpCells });
    element.replaceWith(block);
    return;
  }

  const items = Array.from(element.querySelectorAll('.cmp-news-v2-component__list'));

  let cells = [];
  let sectionHeading = null;

  items.forEach((item) => {
    const titleLink = item.querySelector('.cmp-news-v2-component__list-title-link, .cmp-news-v2-component__list-title a, a[href]');
    const meta = item.querySelector('.cmp-news-v2-component__author');

    const contentCell = [];
    if (titleLink) contentCell.push(titleLink);
    if (meta) contentCell.push(meta);

    if (contentCell.length > 0) {
      cells.push([contentCell]);
    }
  });

  // Fallback: markets blog-link list (no news-v2 component items)
  if (items.length === 0) {
    ({ sectionHeading, cells } = parseLinkList(element, document));
  }

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  if (sectionHeading) element.before(sectionHeading);
  element.replaceWith(block);
}
