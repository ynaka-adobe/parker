/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Parker section breaks and Section Metadata.
 *
 * Two mutually exclusive strategies, chosen per page from payload.template.name:
 *
 * 1. POSITIONAL (default; used by "home" and any template not listed in
 *    THEME_SECTION_TEMPLATES). Unchanged from the original implementation:
 *    inserts an <hr> before every non-first entry of payload.template.sections
 *    and a Section Metadata block for each styled entry.
 *
 * 2. THEME (templates listed in THEME_SECTION_TEMPLATES, i.e. "markets").
 *    The 13 market pages arrange their colour bands differently, so the
 *    representative page's positional sections[] do not generalize. Instead,
 *    every top-level column of the AEM content grid becomes one section, and
 *    its Section Metadata style is derived from the source theme class on the
 *    column (see THEME_STYLES). Unstyled columns get a plain break. Hidden,
 *    breadcrumb and empty columns are skipped (cleanup removes them).
 *
 * Only one strategy ever runs for a page, so breaks are never inserted twice.
 *
 * Both strategies insert breaks in beforeTransform (while every section
 * element still exists, before block parsers replace them) using a marker
 * attribute on the <hr>; Section Metadata is inserted in afterTransform
 * anchored to that marker. Elements are processed in reverse so live-element
 * inserts never shift not-yet-processed elements.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// ---------------------------------------------------------------------------
// THEME strategy configuration
// ---------------------------------------------------------------------------

// Templates whose sections are derived from source theme classes.
const THEME_SECTION_TEMPLATES = new Set(['markets']);

const THEME_STYLE_ATTR = 'data-excat-theme-style';
const THEME_FIRST_ATTR = 'data-excat-theme-first';

// Source theme class -> Section Metadata style. Checked in order on the
// top-level grid column. Every class verified in migration-work/cleaned.html
// (aerospace-and-defense) and page-structure.json styling notes:
//   cmp-parker-purpose-blue-theme -> "solid Parker blue" image+text band
//   cmp-parker-blue-theme         -> "solid bright blue" (inline CTA strip children;
//                                    also the home "Our Purpose" band)
//   cmp-parker-gold-theme         -> gold closing CTA strip
//   cmp-parker-charcoal-theme     -> "solid dark charcoal/navy" image+text band
//   grey-bg                       -> light grey bands (intro text, image+text, FAQs)
// No cmp-parker-light-grey class exists in the source; grey-bg is the only grey class.
const THEME_STYLES = [
  ['cmp-parker-purpose-blue-theme', 'sky-blue'],
  ['cmp-parker-blue-theme', 'sky-blue'],
  ['cmp-parker-gold-theme', 'gold'],
  ['cmp-parker-charcoal-theme', 'charcoal'],
  ['grey-bg', 'grey'],
];

// Page-title band (<div class="cmp-title"><h1 class="cmp-title__text">) has a
// grey background in the source but no theme class on its column.
const TITLE_BAND_STYLE = 'grey';

const MEDIA_SELECTOR = 'img, picture, video, iframe, svg, table';

function themeFromClassList(el) {
  for (const [cls, style] of THEME_STYLES) {
    if (el.classList.contains(cls)) return style;
  }
  return null;
}

function isEmpty(el) {
  return el.textContent.trim() === '' && !el.querySelector(MEDIA_SELECTOR);
}

// Style for one top-level content column, or null for a plain section.
function columnStyle(col) {
  const own = themeFromClassList(col);
  if (own) return own;
  if (col.querySelector(':scope > .cmp-title')) return TITLE_BAND_STYLE;

  // Layout containers (e.g. .layout-col-8-4 inline CTA strip) carry no theme
  // themselves; the colour comes from their inner columns
  // (.aem-container > div.cmp-parker-blue-theme x2). Use it only when every
  // non-empty inner column shares the same theme.
  const container = col.querySelector(':scope > .aem-container');
  if (!container) return null;
  const inner = [...container.children].filter((c) => !isEmpty(c));
  if (!inner.length) return null;
  const styles = new Set(inner.map(themeFromClassList));
  if (styles.size === 1) {
    const [only] = styles;
    return only;
  }
  return null;
}

// The AEM content grid: #spa-root > div > div > div.aem-container.aem-Grid >
// div.aem-GridColumn > div.aem-container.aem-Grid (header/footer columns hold
// no nested grid, so the first match is the page content grid).
function findContentGrid(root) {
  const title = root.querySelector('.cmp-title');
  const fromTitle = title && title.closest('.aem-Grid');
  return fromTitle || root.querySelector('.aem-Grid > .aem-GridColumn > .aem-container.aem-Grid');
}

function contentColumns(grid) {
  return [...grid.children].filter((col) => col.classList.contains('aem-GridColumn')
    && !col.classList.contains('aem-GridColumn--default--hide')
    && !col.querySelector(':scope > nav.cmp-breadcrumb')
    && !isEmpty(col));
}

function themeBefore(element) {
  const grid = findContentGrid(element);
  if (!grid) return;
  const columns = contentColumns(grid);
  for (let i = columns.length - 1; i >= 0; i -= 1) {
    const style = columnStyle(columns[i]);
    if (i === 0 && !style) continue; // first section: no leading break, no metadata
    const hr = document.createElement('hr');
    if (style) hr.setAttribute(THEME_STYLE_ATTR, style);
    if (i === 0) hr.setAttribute(THEME_FIRST_ATTR, 'true');
    columns[i].before(hr);
  }
}

function themeAfter(element) {
  const markers = [...element.querySelectorAll(`hr[${THEME_STYLE_ATTR}]`)].reverse();
  markers.forEach((marker) => {
    const metadataBlock = WebImporter.Blocks.createBlock(document, {
      name: 'Section Metadata',
      cells: { style: marker.getAttribute(THEME_STYLE_ATTR) },
    });
    marker.after(metadataBlock);
    marker.removeAttribute(THEME_STYLE_ATTR);
    if (marker.hasAttribute(THEME_FIRST_ATTR)) marker.remove(); // first section never gets a real break
  });
}

// ---------------------------------------------------------------------------
// POSITIONAL strategy (original behaviour, unchanged)
// ---------------------------------------------------------------------------

// section.selector is an array of candidate selectors — try each in order, first match wins.
function querySection(root, selectors) {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const template = payload.template || {};

  const useThemeSections = THEME_SECTION_TEMPLATES.has(template.name);

  if (useThemeSections && hookName === 'beforeTransform') themeBefore(element);
  if (useThemeSections && hookName === 'afterTransform') themeAfter(element);

  // POSITIONAL branch below is skipped entirely for theme templates.
  const sections = useThemeSections ? [] : ((payload.template && payload.template.sections) || []);

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // no selector matched — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue; // neither the marker nor the original element survived — skip

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
