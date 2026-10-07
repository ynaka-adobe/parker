/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Parker site-wide cleanup.
 * Removes non-authorable site chrome (header, footer, nav, breadcrumb, chat
 * widgets), injected script-tag placeholders, tracking iframes/pixels, and
 * empty AEM grid columns.
 * All selectors verified against migration-work/cleaned.html (markets:
 * /us/en/markets/aerospace-and-defense.html) and the home snapshot
 * (tools/importer/bd-snapshots/www.parker.com/us/en/home.html.html).
 *
 * Home-safety notes (home output must not change):
 * - Nothing new is removed from inside the content grid in beforeTransform,
 *   because the home template has a positional
 *   `div.aem-GridColumn:nth-of-type(7)` section selector that would shift.
 *   Empty grid columns are therefore removed in afterTransform only.
 * - New beforeTransform removals are body-level widgets outside #spa-root.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

// Anything that makes a grid column carry authorable content even without text.
const MEDIA_SELECTOR = 'img, picture, video, iframe, svg, table';

function isEmptyColumn(col) {
  return col.textContent.trim() === '' && !col.querySelector(MEDIA_SELECTOR);
}

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Chat/messaging widgets and tracking iframes can wrap or block block-matching.
    // Verified in cleaned.html: <div class="parker-comchatskill">,
    // <iframe id="db-sync">, <iframe id="embeddedMessagingSiteContextFrame">.
    WebImporter.DOMUtils.remove(element, [
      '.parker-comchatskill',
      '#db-sync',
      '#embeddedMessagingSiteContextFrame',
    ]);
    // Body-level widgets outside #spa-root (present on both home and markets):
    //   div#embedded-messaging.embedded-messaging -> Salesforce chat launcher button
    //   div#ZN_2rDBq8r3Zv6zWTP                    -> Qualtrics site-intercept container
    WebImporter.DOMUtils.remove(element, [
      '#embedded-messaging',
      'div[id^="ZN_"]',
      // live-rendered pages keep the SPA's <noscript>"You need to enable JavaScript…"
      'noscript',
    ]);
    // Authored-but-hidden grid columns (e.g. the inactive "Filtration Group" hero
    // teaser: .cmp-parker-black-text.aem-GridColumn--default--hide) and
    // tracking pixels (img#db_lr_pixel_ad -> id.rlcdn.com, zero-size/blob: imgs).
    WebImporter.DOMUtils.remove(element, [
      '.aem-GridColumn--default--hide',
      '#db_lr_pixel_ad',
      'img[src*="rlcdn.com"]',
      'img[src*="/akam/"]',
      'img[src^="blob:"]',
      'img[width="0"][height="0"]',
    ]);
  }

  if (hookName === H.after) {
    // Non-authorable site chrome and leftover elements.
    // Verified in cleaned.html:
    //   #parker_h_f_header_root  -> global header/top-bar/mega-nav
    //   nav#parker_h_f_sub_item  -> sub navigation inside header
    //   #parker_h_f_footer_wrapper -> global footer
    //   #h1tagheader             -> injected "Home" h1 shell element (not authored)
    //   nav.cmp-breadcrumb       -> breadcrumb under the page title (generated from path)
    //   iframe / script          -> tracking + injected script tags
    WebImporter.DOMUtils.remove(element, [
      '#parker_h_f_header_root',
      '#parker_h_f_footer_wrapper',
      '#h1tagheader',
      'nav#parker_h_f_sub_item',
      '.aem-GridColumn:has(> nav.cmp-breadcrumb)',
      'nav.cmp-breadcrumb',
      'iframe',
      'script',
    ]);

    // Title components (page-title H1 band, "Key Trends"-style H2 bands): keep the
    // heading, unwrap its dead self-link
    // (<hN class="cmp-title__text"><a href="#" class="cmp-title__link">).
    element.querySelectorAll('.cmp-title__text > a.cmp-title__link[href="#"]').forEach((a) => {
      a.replaceWith(...a.childNodes);
    });

    // Image-box description paragraphs (e.g. Parker World charcoal intro) end with
    // "<br>&nbsp;" spacers: strip trailing <br>s and whitespace/nbsp-only text nodes.
    element.querySelectorAll('.image-box-container__description p').forEach((p) => {
      let last = p.lastChild;
      while (last && ((last.nodeType === 3 && !last.textContent.replace(/ /g, ' ').trim())
        || (last.nodeType === 1 && last.tagName === 'BR'))) {
        last.remove();
        last = p.lastChild;
      }
    });

    // Empty AEM grid columns (e.g. markets: empty .layout-col-4-4-4 container,
    // empty plain .aem-GridColumn after the blog link list; home: empty column
    // after the hero). Deepest first so emptied parents are caught too.
    const columns = [...element.querySelectorAll('.aem-Grid > .aem-GridColumn')].reverse();
    columns.forEach((col) => {
      if (isEmptyColumn(col)) col.remove();
    });

    rewriteLinks(element);
  }
}

// Pages migrated to EDS (served extensionless). Links to these become site-relative
// extensionless paths; every other parker.com page link points back to parker.com,
// because EDS 404s on ".html" paths and those pages don't exist here yet.
// Extend this list as more pages are migrated.
const MIGRATED_PATHS = new Set([
  '/us/en/home',
  '/us/en/markets',
  '/us/en/markets/aerospace-and-defense',
  '/us/en/markets/aerospace-industry-trends',
  '/us/en/markets/clean-tech-trends',
  '/us/en/markets/digitalization-trends',
  '/us/en/markets/electrification-trends',
  '/us/en/markets/electronics-and-semiconductors',
  '/us/en/markets/energy',
  '/us/en/markets/hvac-and-refrigeration',
  '/us/en/markets/in-plant-and-industrial-equipment',
  '/us/en/markets/interactive-library',
  '/us/en/markets/interactive-library/parker-world',
  '/us/en/markets/life-sciences',
  '/us/en/markets/off-highway',
  '/us/en/markets/transportation',
]);
const SOURCE_ORIGIN = 'https://www.parker.com';

function rewriteLinks(element) {
  element.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    let url;
    if (href.startsWith('/') && !href.startsWith('//')) url = new URL(href, SOURCE_ORIGIN);
    else if (href.startsWith(`${SOURCE_ORIGIN}/`)) url = new URL(href);
    else return; // mailto:, other hosts, anchors
    const path = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    if (MIGRATED_PATHS.has(path)) {
      a.setAttribute('href', `${path}${url.search}${url.hash}`);
    } else if (href.startsWith('/') && path !== '/') {
      a.setAttribute('href', `${SOURCE_ORIGIN}${href}`);
    }
  });
}
