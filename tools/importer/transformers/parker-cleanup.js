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
  const support = isSupportPage(payload);
  // Landing-only cleanup runs FIRST so its .parts-doc-search form is replaced
  // before supportBefore() turns every remaining form.ph-form into the
  // Cross-Reference link.
  if (support && hookName === H.before && isSupportLandingPage(payload)) supportLandingBefore(element);
  if (support && hookName === H.before && isMasterDirectoryPage(payload)) masterDirectoryBefore(element, payload);
  if (support && hookName === H.before) supportBefore(element, payload);
  if (support && hookName === H.after) supportAfter(element);
  const product = isProductPage(payload);
  if (product && hookName === H.before) productBefore(element, payload);
  if (product && hookName === H.before && isProductLandingPage(payload)) productLandingBefore(element);
  if (product && hookName === H.after && isProductLandingPage(payload)) productLandingAfter(element);
  if (product && hookName === H.after) productAfter(element);
  const pts = isPtsPage(payload);
  if (pts && hookName === H.before) ptsBefore(element);
  if (pts && hookName === H.after) ptsAfter(element);
  const blog = isBlogPage(payload);
  // Blog ARTICLE pages only (template blog-article); never blog-home.
  const blogArticle = blog && isBlogArticlePage(element, payload);
  if (blog && hookName === H.before) blogBefore(element, payload);
  // After blogBefore(): it drops the bare-origin og:image this step replaces.
  if (blogArticle && hookName === H.before) blogArticleBefore(element, payload);
  if (blogArticle && hookName === H.after) blogArticleAfter(element);
  if (blog && hookName === H.after) blogAfter(element, payload, blogArticle);

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

    rewriteLinks(element, payload);

    // Runs after the shared removals above: trailing iframes/scripts would
    // otherwise count as content after the empty sections' <hr>s.
    if (blog) blogTrailingSections(element);
  }
}

// ---------------------------------------------------------------------------
// Help & Support pages (help.parker.com). Everything below runs ONLY when
// isSupportPage() is true, so www.parker.com templates are unaffected.
// Selectors verified in migration-work/cleaned.html (order-status), the raw
// snapshot tools/importer/bd-snapshots/help.parker.com/us/en/support/order-status.html
// and the rendered topic pages in migration-work/support-gaps/*.html.
// ---------------------------------------------------------------------------

const HELP_ORIGIN = 'https://help.parker.com';
const KEEP_HREF_ATTR = 'data-excat-keep-href';

function pageUrl(payload) {
  const raw = payload && payload.params && payload.params.originalURL;
  if (!raw) return null;
  try { return new URL(raw); } catch (e) { return null; }
}

function isSupportPage(payload) {
  const url = pageUrl(payload);
  if (url && url.hostname === 'help.parker.com') return true;
  const name = payload && payload.template && payload.template.name;
  return typeof name === 'string' && name.startsWith('support');
}

// Replace el with a new tag, keeping its children.
function retag(el, tagName) {
  const doc = el.ownerDocument;
  const repl = doc.createElement(tagName);
  repl.append(...el.childNodes);
  el.replaceWith(repl);
  return repl;
}

// Trim leading/trailing whitespace inside an element (first/last text nodes).
function trimText(el) {
  const walker = el.ownerDocument.createTreeWalker(el, 4 /* SHOW_TEXT */);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  const visible = texts.filter((t) => t.textContent.replace(/ /g, ' ').trim());
  if (!visible.length) return;
  const first = visible[0];
  const last = visible[visible.length - 1];
  first.textContent = first.textContent.replace(/^[\s ]+/, '');
  last.textContent = last.textContent.replace(/[\s ]+$/, '');
}

function normalizeTitle(text) {
  return text.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
}

function makeLinkPara(doc, href, text, wrapTag) {
  const p = doc.createElement('p');
  const a = doc.createElement('a');
  a.setAttribute('href', href);
  a.textContent = text;
  if (wrapTag) {
    const wrap = doc.createElement(wrapTag);
    wrap.append(a);
    p.append(wrap);
  } else {
    p.append(a);
  }
  return { p, a };
}

// ---------------------------------------------------------------------------
// Help & Support LANDING page only (https://help.parker.com/us/en/support,
// template support-landing). Gated by isSupportLandingPage(), so no other
// page (support-topic or www.parker.com) is affected.
// Selectors verified in tools/importer/bd-snapshots/help.parker.com/us/en/support.html.
// ---------------------------------------------------------------------------

const LANDING_PATH = '/us/en/support';
const LANDING_TITLE = 'Help & Support | Parker US';

function isSupportLandingPage(payload) {
  const url = pageUrl(payload);
  if (url) return url.hostname === 'help.parker.com' && url.pathname.replace(/\/+$/, '') === LANDING_PATH;
  return !!(payload && payload.template && payload.template.name === 'support-landing');
}

// Master Directory (Global Sales Offices): a live, data-driven directory app (filters,
// A-Z index, name search, 4 offices per page). It can't be migrated as static content,
// so main.ph-main is replaced with a launch link the embed-app parser turns into an
// 'embed-app (launch)' block pointing at the live directory.
const MASTER_DIRECTORY_PATH = '/us/en/support/master-directory/global-offices';

function isMasterDirectoryPage(payload) {
  const url = pageUrl(payload);
  if (url) return url.hostname === 'help.parker.com' && url.pathname.replace(/\/+$/, '') === MASTER_DIRECTORY_PATH;
  return !!(payload && payload.template && payload.template.name === 'master-directory');
}

function masterDirectoryBefore(element, payload) {
  const doc = element.ownerDocument;
  const main = element.querySelector('main.ph-main');
  if (!main) return;
  const url = pageUrl(payload);
  const app = doc.createElement('div');
  app.className = 'excat-md-app';
  const a = doc.createElement('a');
  a.setAttribute('href', url ? url.href.split('?')[0] : `${HELP_ORIGIN}${MASTER_DIRECTORY_PATH}`);
  a.setAttribute(KEEP_HREF_ATTR, '');
  a.textContent = 'Master Directory';
  app.append(a);
  main.replaceChildren(app);
}

// A div holding only text (no element children) - the MUI/emotion "heading" divs.
const isTextDiv = (el) => el.tagName === 'DIV' && el.children.length === 0
  && !!el.textContent.replace(/\u00a0/g, ' ').trim();

function supportLandingBefore(element) {
  const doc = element.ownerDocument;

  // Page title: source <title>/og:title "Home - Help & Support" -> site style
  // ("Home | Parker US", "Trends & Markets | Parker US"). createMetadata reads these.
  doc.title = LANDING_TITLE;
  doc.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]')
    .forEach((m) => m.setAttribute('content', LANDING_TITLE));

  // Part Documents advanced-search form (div.container.parts-doc-search form.ph-form:
  // Document Category select + Keywords input + SEARCH button) -> bold link to the
  // live landing page (the search only works there). Must run before the generic
  // form.ph-form -> Cross-Reference replacement in supportBefore().
  element.querySelectorAll('.parts-doc-search form.ph-form').forEach((form) => {
    const { p, a } = makeLinkPara(doc, `${HELP_ORIGIN}${LANDING_PATH}`, 'Search Part Documents', 'strong');
    a.setAttribute(KEEP_HREF_ATTR, 'true'); // keep the absolute live URL (not the migrated page)
    form.replaceWith(p);
  });

  // Decorative dividers between the bands: main.ph-main > div > hr.MuiDivider-root
  // (the section transformer inserts its own main.ph-main > hr breaks).
  // "View More" toggle under the topic tiles: div.col-12.text-center >
  // a.ph-overflow__read-more-toggle[href="#view-more"] > img + h4 "View More".
  WebImporter.DOMUtils.remove(element, [
    'main.ph-main > div > hr.MuiDivider-root',
    '.col-12.text-center:has(> a.ph-overflow__read-more-toggle)',
    'a.ph-overflow__read-more-toggle',
  ]);

  // Div-based headings (emotion class names are build hashes, so this is
  // structural; current classes noted for reference):
  //   .jumbotron > [div eyebrow (css-1s4d6l5)], div title (css-1satxfw), div intro (css-ng6p0l)
  //     -> last text div = p (intro), the one before it = h2 (title), any earlier = p (eyebrow)
  //   .jumbotron ~ div text-only sub-heading "More Contact Information" (css-1fx295f) -> h3
  element.querySelectorAll('main.ph-main .jumbotron').forEach((jumbo) => {
    const divs = Array.from(jumbo.children);
    if (!divs.length || !divs.every(isTextDiv)) return;
    // Title = second-to-last div (or the only div); everything else is a paragraph.
    const titleIndex = Math.max(divs.length - 2, 0);
    divs.forEach((div, i) => trimText(retag(div, i === titleIndex ? 'h2' : 'p')));
    Array.from(jumbo.parentElement.children)
      .filter((sib) => sib !== jumbo && isTextDiv(sib)
        && (jumbo.compareDocumentPosition(sib) & 4 /* FOLLOWING */))
      .forEach((sib) => trimText(retag(sib, 'h3')));
  });
}

function supportBefore(element, payload) {
  const doc = element.ownerDocument;
  const url = pageUrl(payload);
  const origin = url && /^https?:$/.test(url.protocol) ? url.origin : HELP_ORIGIN;

  // Breadcrumb ("Home / Help & Support / Order Status") + "Provide Feedback"
  // (i.fas.fa-bullhorn) live in div.container-fluid > div.ph-header-main__breadcrumbs.
  // Body-level SPA / consent / tracking leftovers in the raw snapshot:
  //   <div hidden=""><!--$--></div>, <next-route-announcer>,
  //   <div id="transcend-consent-manager">, hidden <iframe height="0" width="0">,
  //   hidden display:none <div>s (Qualtrics ZN_ wrapper), MUI/emotion + FontAwesome <style> tags.
  WebImporter.DOMUtils.remove(element, [
    '.container-fluid:has(> .ph-header-main__breadcrumbs)',
    '.ph-header-main__breadcrumbs',
    'div[hidden]',
    'next-route-announcer',
    '#transcend-consent-manager',
    'iframe[width="0"][height="0"]',
    'div[style*="display: none"]',
    'style',
  ]);

  // Relative image paths (e.g. <img src="/assets/img/customer-order.jpg">,
  // /assets/img/ph-icon-cross-reference.png) -> absolute on the page's origin,
  // before parsers (columns-media) copy them into block cells.
  element.querySelectorAll('img[src^="/"]:not([src^="//"])').forEach((img) => {
    img.setAttribute('src', `${origin}${img.getAttribute('src')}`);
  });

  // Price Quote title band: <h1>Price Quote and Availability</h1>
  // <span style="display: none;">Price, Quote &amp; Availability</span>.
  // Drop the span when it repeats the H1, else keep it as a paragraph after the H1.
  element.querySelectorAll('.ph-header-main__title h1 ~ span').forEach((span) => {
    const h1 = span.parentElement.querySelector('h1');
    const text = span.textContent.trim();
    if (!text || (h1 && normalizeTitle(text) === normalizeTitle(h1.textContent))) {
      span.remove();
    } else {
      const p = retag(span, 'p');
      p.removeAttribute('style');
    }
  });
  // (span[style*="display: none"] is not matched by the div[style] removal above.)

  // Cross-reference search form (form.ph-form: Part Number input + Search button)
  // -> a bold link (EDS primary button) to the live search tool.
  element.querySelectorAll('form.ph-form').forEach((form) => {
    const { p, a } = makeLinkPara(doc, `${HELP_ORIGIN}/us/en/support/cross-reference`,
      'Search the Cross-Reference Tool', 'strong');
    a.setAttribute(KEEP_HREF_ATTR, 'true'); // keep pointing at the live tool, not the migrated page
    form.replaceWith(p);
  });

  // "Return to Help & Support" (three source markups inside .ph-content-nav__history):
  //   <a href="/us/en/support"><button class="MuiButton-root ...">   (general-help, cross-reference)
  //   <a href="/us/en/support"><span class="accent-button ...">      (ethics-integrity)
  //   <a class="accent-button ..." href="/us/en/support">            (hr-benefits)
  // -> <p><em><a href="/us/en/support">Return to Help &amp; Support</a></em></p> (secondary button).
  element.querySelectorAll([
    '.ph-content-nav__history a:has(> button.MuiButton-root)',
    '.ph-content-nav__history a:has(> span.accent-button)',
    '.ph-content-nav__history a.accent-button',
  ].join(', ')).forEach((link) => {
    const { p } = makeLinkPara(doc, '/us/en/support', 'Return to Help & Support', 'em');
    link.replaceWith(p);
  });

  // "Still Lost? / General Help":
  //   <a href="/us/en/support/general-help?brd=..."><span class="help"><h5>Still Lost?</h5><h3>General Help</h3></span></a>
  //   <a class="help" href="...general-help..."><h5>Still Lost? </h5><h3>General Help</h3></a>
  //   part-information: <a href="../general-help?..." class="help"><h5>Still Lost?</h5><h3>Still Lost?</h3></a>
  // -> <p>Still Lost?</p><p><a href="...general-help">General Help</a></p>
  // (href is resolved/cleaned by rewriteLinks in afterTransform).
  element.querySelectorAll([
    '.ph-content-nav__history a:has(> span.help)',
    '.ph-content-nav__history a.help',
  ].join(', ')).forEach((link) => {
    const intro = doc.createElement('p');
    intro.textContent = 'Still Lost?';
    const { p } = makeLinkPara(doc, link.getAttribute('href') || '/us/en/support/general-help', 'General Help');
    link.replaceWith(intro, p);
  });
}

function supportAfter(element) {
  // Exactly one H1: the title band (.ph-header-main__title h1). Every other h1
  // (.jumbotron question, .ph-content-section__info h1, ethics "Ethics Hotline"
  // h1.py-5, general-help topic h1) becomes h2.
  const titleH1 = element.querySelector('.ph-header-main__title h1');
  element.querySelectorAll('h1').forEach((h1) => {
    if (h1 !== titleH1) retag(h1, 'h2');
  });

  // Subtitles: <h3 class="ht"> (and the class-less .jumbotron > h3 on replacement)
  // are intro paragraphs, not headings.
  element.querySelectorAll('h3.ht, .jumbotron > h3').forEach((h3) => retag(h3, 'p'));

  // Leading/trailing spaces in titles (e.g. "<h1> Billing &amp; Shipping ...",
  // " Shop on the Website", " Find a Distributor ").
  element.querySelectorAll('h1, h2, h3, h4, h5, h6, .jumbotron > a').forEach(trimText);
}

// ---------------------------------------------------------------------------
// Product pages (ph.parker.com, e.g. /us/en/category/*). Everything below runs
// ONLY when isProductPage() is true (ph.parker.com host, or a template whose name
// starts with 'product'), so www.parker.com / help.parker.com pages are unaffected.
// Selectors verified in the rendered snapshot
// tools/importer/bd-snapshots/ph.parker.com/us/en/category/hose-piping-and-tubing.html.
// Site header/footer (#parker_h_f_header_root, #parker_h_f_footer_wrapper) are
// removed by the shared afterTransform list - no bare header/footer selectors.
// ---------------------------------------------------------------------------

const PH_ORIGIN = 'https://ph.parker.com';

function isProductPage(payload) {
  const url = pageUrl(payload);
  if (url && url.hostname === 'ph.parker.com') return true;
  const name = payload && payload.template && payload.template.name;
  return typeof name === 'string' && name.startsWith('product');
}

// Description metas carry literal markup ("<p>Parker hoses ...</p>") and og:url is
// broken ("https://ph.parker.comundefined"). createMetadata reads these from <head>.
function productMetadata(doc, payload) {
  doc.querySelectorAll([
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="og:description"]',
    'meta[name="twitter:description"]',
    'meta[property="twitter:description"]',
    'meta[itemprop="description"]',
  ].join(', ')).forEach((m) => {
    const content = m.getAttribute('content');
    if (content == null) return;
    const clean = content.replace(/<\/?p\b[^>]*>/gi, ' ').replace(/\s+/g, ' ').trim();
    if (clean !== content) m.setAttribute('content', clean);
  });
  // The head repeats og:description (once with <p>, once without); createMetadata
  // joins repeated metas ("text, text"), so drop exact duplicates after cleaning.
  const seen = new Set();
  doc.querySelectorAll('meta[name], meta[property], meta[itemprop]').forEach((m) => {
    const key = ['name', 'property', 'itemprop'].map((a) => m.getAttribute(a) || '').join('|');
    const id = `${key}=${m.getAttribute('content')}`;
    if (seen.has(id)) m.remove();
    else seen.add(id);
  });
  const page = pageUrl(payload);
  doc.querySelectorAll('meta[property="og:url"], meta[name="og:url"]').forEach((m) => {
    const content = m.getAttribute('content') || '';
    let ok = false;
    try {
      const u = new URL(content);
      ok = /^https?:$/.test(u.protocol) && !/undefined|null/i.test(content)
        && (!page || u.hostname === page.hostname);
    } catch (e) {
      ok = false;
    }
    if (!ok) m.remove();
  });
}

function productBefore(element, payload) {
  productMetadata(element.ownerDocument, payload);
  WebImporter.DOMUtils.remove(element, [
    // Breadcrumb ("Home / Products / ...") + "Provide Feedback" row
    '[class*="__marginProductListPrint"]',
    // Left column: category nav, faceted filters, "Help us improve our filters",
    // "Get your Parker account Today!" register box
    '.MuiGrid-item:has(#category-left-block)',
    '#category-left-block',
    // SPA shells / loaders / hidden debug payloads
    '#modal-root',
    '#globalLoader',
    // hidden (visibility:hidden; height:0) div holding ~270KB of raw API JSON
    '.phCommerceContent > div[style*="visibility: hidden"]',
    'pre.custom-headers',
    'next-route-announcer',
    '#transcend-consent-manager',
    'div[hidden]',
    'style',
    // zero-size / hidden iframes and tracking pixels
    'iframe[width="0"]',
    'iframe[height="0"]',
    'iframe[style*="display: none"]',
    'img[width="1"][height="1"]',
    'img[src*="eloqua.com"]',
    'img[src*="en25.com"]',
    'img[src*="clarity.ms"]',
    'img[src*="googleadservices.com"]',
    'img[src*="doubleclick.net"]',
    'img[src*="google.com/pagead"]',
    'img[src*="googleads.g.doubleclick"]',
    'img[src*="qualtrics.com"]',
    'iframe[src*="eloqua.com"]',
    'iframe[src*="doubleclick.net"]',
    'iframe[src*="googletagmanager.com"]',
    'iframe[src*="qualtrics.com"]',
    // emptied Qualtrics wrapper (its div#ZN_ child is removed above)
    'body > div[style*="display: none"]',
  ]);
}

function productAfter(element) {
  // Tile-list title "Hose, Piping and Tubing Categories" is an h5 -> h2.
  element.querySelectorAll('h5#category-list-category-title, h5[data-testid="category-list-category-title"]')
    .forEach((h5) => retag(h5, 'h2'));
  // Leading/trailing spaces in headings (e.g. "<h1> Hose, ...").
  element.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(trimText);
}

// ---------------------------------------------------------------------------
// Products LANDING page only (https://ph.parker.com/us/en/category, template
// product-landing). Gated by isProductLandingPage(), so the 19 category pages
// (/us/en/category/*) and every other template are unaffected.
// Selectors verified in tools/importer/bd-snapshots/ph.parker.com/us/en/category.html.
// ---------------------------------------------------------------------------

const PRODUCT_LANDING_PATH = '/us/en/category';

function isProductLandingPage(payload) {
  const url = pageUrl(payload);
  if (url) return url.hostname === 'ph.parker.com' && url.pathname.replace(/\/+$/, '') === PRODUCT_LANDING_PATH;
  return !!(payload && payload.template && payload.template.name === 'product-landing');
}

function productLandingBefore(element) {
  // Belt-and-braces with productBefore(): left column (Products Categories list,
  // Filter by facets, "Help us improve our filters", register card) and the
  // breadcrumb + "Provide Feedback" row, by their stable ids.
  WebImporter.DOMUtils.remove(element, [
    '#non-mobile-category-left-column',
    '#non-mobile-category-breadcrumb',
  ]);
}

function productLandingAfter(element) {
  const doc = element.ownerDocument;
  // Second H1 "All Product Categories" (h1#category-products-title) -> h2.
  element.querySelectorAll('h1#category-products-title, h1[data-testid="category-products-title"]')
    .forEach((h1) => retag(h1, 'h2'));
  // Category headers: div#category-products-category-{n}-header > a#...-link (a plain
  // link, not a heading) -> <h3><a href>Name</a></h3>, so the outline is
  // H1 Products > H2 All Product Categories > H3 category. The href is kept as-is
  // (rewriteLinks maps it to the migrated /us/en/category/<slug> path); the text is
  // never slugified (e.g. "Regulators, Monitoring, ..." -> regulators-monitors-...).
  element.querySelectorAll('[id^="category-products-category-"][id$="-header"]').forEach((header) => {
    const link = header.querySelector('a[href]');
    const text = (link || header).textContent.replace(/\s+/g, ' ').trim();
    if (!text) {
      header.remove();
      return;
    }
    const h3 = doc.createElement('h3');
    if (link) {
      const a = doc.createElement('a');
      a.setAttribute('href', link.getAttribute('href'));
      a.textContent = text;
      h3.append(a);
    } else {
      h3.textContent = text;
    }
    header.replaceWith(h3);
  });
}

// ---------------------------------------------------------------------------
// PTS page only (https://www.parker.com/us/en/industries/digital/pts.html,
// template pts; an alias of /us/en/additional-information/asset-intelligence/
// asset-management.html). Gated by isPtsPage(), so every other page is unaffected.
// Selectors verified in
// tools/importer/bd-snapshots/www.parker.com/us/en/industries/digital/pts.html.html.
// ---------------------------------------------------------------------------

const PTS_PATHS = new Set([
  '/us/en/industries/digital/pts.html',
  '/us/en/additional-information/asset-intelligence/asset-management.html',
]);

function isPtsPage(payload) {
  const url = pageUrl(payload);
  if (url) return url.hostname === 'www.parker.com' && PTS_PATHS.has(url.pathname);
  return !!(payload && payload.template && payload.template.name === 'pts');
}

function ptsBefore(element) {
  // The page model has 3 dam/components/scene7/interactivemedia + 2 dynamicmedia
  // components at the top of the content grid with no asset: they render nothing
  // (absent from the BD snapshot) or an empty viewer shell on a live render.
  // Drop the viewer shells, then any content-grid column left without authorable
  // content. Safe here: every pts section selector is class/:has() based (no
  // positional selector that removal could shift).
  WebImporter.DOMUtils.remove(element, [
    '.s7dm-dynamic-media',
    '.s7dm-interactive-media',
    '.interactivemedia',
    '.dynamicmedia',
    '[data-asset-type="interactivemedia"]',
    // Slider/video chrome: play-button overlays (data: SVG <img>), slick arrows and dots
    '.play-arrow-icon-container',
    '.parker-carousel .slick-arrow',
    '.parker-carousel .slick-dots',
  ]);

  // Image-box pictures (sliders, gold/tagging bands) carry a bare <img src> plus
  // ?im=Resize=(w,h) <source> variants. The Bright Data snapshot stored the widest
  // variant (last <source>, "min-width: 1400px"); when it also stored a second
  // variant the offline image map cannot resolve the bare src by file name
  // (ambiguous) and the image would stay on the bot-protected origin. Point the
  // <img> at that last <source> URL, which the map resolves exactly.
  const fileOf = (u) => {
    const path = u.split('?')[0];
    return path.substring(path.lastIndexOf('/') + 1);
  };
  element.querySelectorAll('.image-box-container picture > img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src.includes('?')) return;
    const sources = img.parentElement.querySelectorAll(':scope > source[srcset]');
    const last = sources[sources.length - 1];
    const candidate = last ? last.getAttribute('srcset').trim() : '';
    // single-URL srcset only (no width/density descriptors); the URL itself may
    // contain a comma, e.g. ?im=Resize=(960,540)
    if (!candidate || /\s/.test(candidate)) return;
    if (fileOf(candidate) !== fileOf(src)) return; // same asset only
    img.setAttribute('src', candidate.startsWith('/') ? `${SOURCE_ORIGIN}${candidate}` : candidate);
  });

  const title = element.querySelector('.cmp-title');
  const grid = title && title.closest('.aem-Grid');
  if (grid) {
    [...grid.children].forEach((col) => {
      if (col.classList.contains('aem-GridColumn') && isEmptyColumn(col)) col.remove();
    });
  }
}

function ptsAfter(element) {
  // Image-box paragraphs that start with a "<br>" spacer
  // (Tagging band: "<p><br>\nPTS employs proven hardware ...").
  element.querySelectorAll('.image-box-container__description p').forEach((p) => {
    let first = p.firstChild;
    while (first && ((first.nodeType === 3 && !first.textContent.replace(/\u00a0/g, ' ').trim())
      || (first.nodeType === 1 && first.tagName === 'BR'))) {
      first.remove();
      first = p.firstChild;
    }
  });
}

// ---------------------------------------------------------------------------
// Blog pages (blog.parker.com, template names starting with 'blog'). Everything
// below runs ONLY when isBlogPage() is true, so www/help/ph.parker.com templates
// are unaffected. Selectors verified in migration-work/cleaned.html (blog home)
// and tools/importer/bd-snapshots/blog.parker.com/us/en/home.html.html.
// Already handled by the shared rules: Qualtrics div#ZN_2rDBq8r3Zv6zWTP
// (div[id^="ZN_"]), the GTM <noscript>, the hidden tracking <iframe height="0"
// width="0"> and the empty body-level <iframe> (bare 'iframe'), tracking pixels
// (none present on the blog home), and the emptied header/footer grid columns.
// ---------------------------------------------------------------------------

const BLOG_ORIGIN = 'https://blog.parker.com';
// Source blog home -> migrated path (template blog-home urlPattern).
const BLOG_PATH_MAP = new Map([
  ['/us/en/home', '/us/en/blog'],
]);

function isBlogPage(payload) {
  const url = pageUrl(payload);
  if (url && url.hostname === 'blog.parker.com') return true;
  const name = payload && payload.template && payload.template.name;
  return typeof name === 'string' && name.startsWith('blog');
}

// Source blog page -> page title on the migrated site.
const BLOG_TITLE_MAP = new Map([
  ['/us/en/home', 'Blog'],
]);

function blogBefore(element, payload) {
  // Listing UI that is not authorable content (inside / next to the recent-posts
  // grid, removed before the cards-blog parser runs):
  //   div.blog-show-more > button.blog-post-show-more-btn "Load More" (pagination
  //     control, no href) and its MuiGrid wrapper inside .cmp-blog-recent-blogs
  //   button#scroll-to-top.scroll-to-top (floating "Scroll to Top" button)
  // Not positional: section selectors (.aem-container:has(...), #spa-root > div > ...)
  // are unaffected by these removals.
  WebImporter.DOMUtils.remove(element, [
    '.cmp-blog-recent-blogs .MuiGrid-root:has(> .blog-show-more)',
    '.blog-show-more',
    'button#scroll-to-top',
  ]);

  // The blog home's source title is "Home", which clashes with the www homepage;
  // createMetadata reads <title>, so set it (and og:title) before it runs.
  const doc = element.ownerDocument;
  const page = pageUrl(payload);
  const sourcePath = page ? page.pathname.replace(/\.html$/, '').replace(/\/$/, '') : '';
  const title = BLOG_TITLE_MAP.get(sourcePath);
  if (title) {
    let titleEl = doc.querySelector('title');
    if (!titleEl) {
      titleEl = doc.createElement('title');
      doc.head.append(titleEl);
    }
    titleEl.textContent = title;
    doc.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach((meta) => {
      meta.setAttribute('content', title);
    });
  }

  // The blog's og:image is the bare origin ("https://blog.parker.com"), which
  // createMetadata would turn into a broken Image row.
  element.ownerDocument.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach((meta) => {
    try {
      if (new URL(meta.content).pathname.replace(/\/$/, '') === '') meta.remove();
    } catch (e) {
      meta.remove();
    }
  });
}

function blogAfter(element, payload, article) {
  // Blog site chrome:
  //   header#header.pb-header-main -> logo, secondary/primary nav, mobile sidenav
  //   div#pb-footer.pb-footer      -> copyright, "ENGINEERING Your Success", footer menu
  // Their now-empty .aem-GridColumn wrappers are removed by the shared
  // empty-column sweep that runs after this.
  WebImporter.DOMUtils.remove(element, [
    'header#header.pb-header-main',
    '#pb-footer',
  ]);

  // Relative blog links (e.g. /us/en/emg_cho/....html, "Read Blog" buttons) must
  // resolve against blog.parker.com; rewriteLinks() would otherwise resolve them
  // against www.parker.com. Absolute blog.parker.com URLs are left alone by
  // rewriteLinks() (blog origin is not in SOURCE_ORIGINS), except migrated blog
  // pages which become site-relative.
  const page = pageUrl(payload);
  const base = page && page.hostname === 'blog.parker.com' ? page : new URL(`${BLOG_ORIGIN}/`);
  element.querySelectorAll('a[href]').forEach((a) => {
    const href = (a.getAttribute('href') || '').trim();
    const isBlogAbsolute = /^https?:\/\/blog\.parker\.com(\/|$)/i.test(href);
    const isOtherScheme = /^[a-z][a-z0-9+.-]*:/i.test(href); // mailto:, tel:, other hosts
    if (!href || href.startsWith('#') || (isOtherScheme && !isBlogAbsolute)) return;
    let url;
    try { url = new URL(href, base); } catch (e) { return; }
    if (url.origin !== BLOG_ORIGIN) return;
    const path = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    const migrated = BLOG_PATH_MAP.get(path);
    // Query indexes (search-blog's link) are served by this site, not the blog.
    if (/\.json$/.test(url.pathname)) {
      a.setAttribute('href', url.pathname);
      a.setAttribute(KEEP_HREF_ATTR, '');
      return;
    }
    // Blog home aliases + the 12 migrated articles become site-relative
    // /us/en/blog[/<slug>] (kept as-is by rewriteLinks()), on the blog home's
    // "Read Blog" cards as well as inside articles.
    const articleTarget = !migrated ? blogArticleLinkTarget(path) : null;
    if (articleTarget) {
      a.setAttribute('href', `${articleTarget}${url.hash}`);
      a.setAttribute(KEEP_HREF_ATTR, '');
      return;
    }
    a.setAttribute('href', migrated ? `${migrated}${url.hash}` : url.href);
  });
}

function blogTrailingSections(element) {
  // Empty trailing sections: the blog-home template's rc2/rc3 entries are empty
  // SPA wrapper divs, so the section transformer's <hr> before them would leave
  // empty sections at the end of the page. The section transformer inserts its
  // breaks in beforeTransform and this cleanup's afterTransform runs before the
  // section transformer's afterTransform, so drop every <hr> that has no
  // authorable content after it. (Styled-section marker <hr>s are never trailing:
  // their section content follows them.)
  const hrs = [...element.querySelectorAll('hr')].reverse();
  for (const hr of hrs) {
    const range = element.ownerDocument.createRange();
    range.setStartAfter(hr);
    range.setEndAfter(element.lastChild || element);
    const rest = range.cloneContents();
    // Injected Qualtrics <style> text is not content.
    rest.querySelectorAll('style, script, noscript, link').forEach((el) => el.remove());
    const hasContent = rest.textContent.trim() !== '' || !!rest.querySelector(MEDIA_SELECTOR);
    if (hasContent) break;
    hr.remove();
  }
}

// ---------------------------------------------------------------------------
// Blog ARTICLE pages (template blog-article: blog.parker.com/us/en/<emg_cho|msg_grp>/<slug>.html,
// imported to /us/en/blog/<slug>). Gated by isBlogArticlePage(), so blog-home and
// every non-blog template are unaffected. Selectors verified in
// migration-work/cleaned.html (emg_cho/comparing-silver-plated-...) and the BD
// snapshots tools/importer/bd-snapshots/blog.parker.com/us/en/{emg_cho,msg_grp}/*.html.html
// (msg_grp: helping-oems-find-right-hydraulic-cylinder-solution,
// why-documentation-and-end-user-insight-matter-in-hydraulic-design).
// Already handled by the shared/blog rules: header#header.pb-header-main,
// nav.cmp-breadcrumb (+ its grid column), hidden tracking iframe, Qualtrics
// div#ZN_*, button#scroll-to-top. The article snapshots have no footer markup
// (no #pb-footer / footer element), so no footer selector is added here.
//
// Metadata hand-off: Author and Publication Date are written to <head> as
// <meta name="author"> / <meta name="publication-date">. WebImporter.rules.createMetadata
// (Blocks.getMetadata) only reads title, description, og:* and twitter:*, so the
// blog-article import script must add those two rows itself (see report).
// ---------------------------------------------------------------------------

// Source article paths (lowercased, no .html) -> migrated to /us/en/blog/<slug>.
const BLOG_ARTICLE_PATHS = new Set([
  '/us/en/emg_cho/comparing-silver-plated-and-nickel--plated-aluminum-emi-shielding-particles',
  '/us/en/emg_cho/emi-shielding-and-thermal-management-for-robotics',
  '/us/en/emg_cho/emi-shielding-and-thermal-solutions-for-electric-transportation',
  '/us/en/emg_cho/emi-shielding-within-medical-device-applications',
  '/us/en/emg_cho/essential-protection-for-high-performance-drone-systems',
  '/us/en/emg_cho/how-do-thermal-interface-materials-support-leo-small-satellite-electronics',
  '/us/en/emg_cho/radar-across-every-domain',
  '/us/en/emg_cho/space-payload-emi-shielding',
  '/us/en/emg_cho/thermal-management-for-optical-transceivers',
  '/us/en/msg_grp/how-parker-chelsea-helps-oems-fleets-improve-pto-performance',
  '/us/en/msg_grp/helping-oems-find-right-hydraulic-cylinder-solution',
  '/us/en/msg_grp/why-documentation-and-end-user-insight-matter-in-hydraulic-design',
]);
// Blog home aliases seen on article pages (breadcrumb "Home" ->
// /content/parker-blog/us/en.html) -> migrated blog home.
const BLOG_HOME_ALIASES = new Set([
  '/', '/us/en', '/us/en/home', '/content/parker-blog/us/en', '/content/parker-blog/us/en/home',
]);
const BLOG_MIGRATED_HOME = '/us/en/blog';
const BLOG_SITE_SUFFIX = /\s*[|–—-]\s*Parker(\s+(Hannifin|US|Blog))*\s*$/i;

function isBlogArticlePage(element, payload) {
  const name = payload && payload.template && payload.template.name;
  if (name === 'blog-article') return true;
  if (name && name.startsWith('blog')) return false; // blog-home etc.
  return !!element.querySelector('.parker-blog-custom-container');
}

// Same rule as WebImporter.FileUtils.sanitizeFilename (the import script's
// sanitizePath), so links match the imported page path
// ("nickel--plated" -> "nickel-plated", "How-Parker-..." -> "how-parker-...").
function sanitizeSlug(slug) {
  if (typeof WebImporter !== 'undefined' && WebImporter.FileUtils && WebImporter.FileUtils.sanitizeFilename) {
    return WebImporter.FileUtils.sanitizeFilename(slug);
  }
  let s = slug;
  try { s = decodeURIComponent(slug); } catch (e) { /* keep raw */ }
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Blog path (no .html, no trailing slash) -> migrated path, or null.
function blogArticleLinkTarget(path) {
  const p = path.replace(/^\/content\/parker-blog(?=\/)/, '').toLowerCase();
  if (BLOG_HOME_ALIASES.has(path) || BLOG_HOME_ALIASES.has(p)) return BLOG_MIGRATED_HOME;
  if (!BLOG_ARTICLE_PATHS.has(p)) return null;
  return `${BLOG_MIGRATED_HOME}/${sanitizeSlug(path.split('/').pop())}`;
}

const nbspTrim = (s) => (s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

function removeEmptyParagraphs(root, skipTables) {
  root.querySelectorAll('p').forEach((p) => {
    if (skipTables && p.closest('table')) return;
    if (nbspTrim(p.textContent) === '' && !p.querySelector(MEDIA_SELECTOR)) p.remove();
  });
}

function setHeadMeta(doc, attr, key, content) {
  let meta = doc.head.querySelector(`meta[${attr}="${key}"]`);
  if (!meta) {
    meta = doc.createElement('meta');
    meta.setAttribute(attr, key);
    doc.head.append(meta);
  }
  meta.setAttribute('content', content);
}

function blogArticleBefore(element, payload) {
  const doc = element.ownerDocument;

  // --- Capture per-article facts before the sidebar is removed ---
  //   .cmp-blog-author .cmp-blog-author-name -> " Ben Nudelman, Global Market Manager, ..."
  //   .cmp-blog-date-social-media > .social-media (span "Date ") > a[href="#"] "September 24, 2026"
  const author = nbspTrim((element.querySelector('.cmp-blog-author .cmp-blog-author-name') || {}).textContent);
  // Match on the box text, not the <span>: the importer's html2md preprocessing
  // unwraps spans before the transformers run ("Date <br><a>...").
  const dateBox = [...element.querySelectorAll('.cmp-blog-date-social-media .social-media')]
    .find((box) => /^date\b/i.test(nbspTrim(box.textContent)));
  const date = dateBox ? nbspTrim((dateBox.querySelector('a') || {}).textContent) : '';

  // --- Remove non-authored-per-page chrome ---
  //   left sidebar: .parker-blog-custom-container > .parker-blog-custom-container-child (1st)
  //     holding .cmp-blog-date-social-media (date + social handles + hr) and
  //     .cmp-blog-category-list ("All Categories" list)
  //   recent posts strip: .cmp-blog-recent-blogs.detail-page (cards, separators, pagination)
  // Not positional: the blog-article section selectors (:has(> .cmp-title),
  // :has(> .cmp-blog-author)) and the columns-media instance selector are unaffected.
  WebImporter.DOMUtils.remove(element, [
    '.parker-blog-custom-container > .parker-blog-custom-container-child:has(.cmp-blog-date-social-media)',
    '.parker-blog-custom-container > .parker-blog-custom-container-child:has(.cmp-blog-category-list)',
    '.cmp-blog-date-social-media',
    '.cmp-blog-category-list',
    '.aem-GridColumn:has(> .cmp-blog-recent-blogs)',
    '.cmp-blog-recent-blogs',
  ]);

  // Empty / &nbsp;-only spacer paragraphs in the body (text components and the
  // two-up rows' descriptions, e.g. <p>&nbsp;</p> between quote and attribution).
  element.querySelectorAll('.parker-blog-custom-container').forEach((c) => removeEmptyParagraphs(c, false));

  // --- Head metadata read by WebImporter.rules.createMetadata ---
  const body = element.querySelector('.parker-blog-custom-container') || element;
  const titleEl = doc.querySelector('title');
  const heading = element.querySelector('.cmp-title .cmp-title__text');
  const title = nbspTrim(titleEl && titleEl.textContent).replace(BLOG_SITE_SUFFIX, '')
    || nbspTrim(heading && heading.textContent);
  if (title) {
    if (titleEl) titleEl.textContent = title;
    else {
      const t = doc.createElement('title');
      t.textContent = title;
      doc.head.append(t);
    }
    // og:title is a name= meta on this site (ignored by createMetadata) - keep all in sync.
    doc.querySelectorAll('meta[property="og:title"], meta[name="og:title"], meta[name="twitter:title"], meta[property="twitter:title"]')
      .forEach((m) => m.setAttribute('content', title));
  }

  // Description: meta description, else the first body paragraph's text.
  const descMeta = doc.head.querySelector('meta[name="description"]');
  let description = nbspTrim(descMeta && descMeta.getAttribute('content'));
  if (!description) {
    const firstP = [...body.querySelectorAll('[id$="_right_container_text"] p')]
      .find((p) => nbspTrim(p.textContent));
    description = firstP ? nbspTrim(firstP.textContent) : '';
  }
  if (description) {
    setHeadMeta(doc, 'name', 'description', description);
    // Keep og/twitter descriptions identical so createMetadata emits one Description row.
    doc.querySelectorAll('meta[property="og:description"], meta[name="og:description"], meta[name="twitter:description"], meta[property="twitter:description"]')
      .forEach((m) => m.setAttribute('content', description));
  }

  // Image: first body image (blogBefore() already removed the bare-origin og:image).
  const firstImg = [...body.querySelectorAll('img[src]')]
    .find((img) => !/^data:/i.test(img.getAttribute('src')));
  if (firstImg) {
    const page = pageUrl(payload);
    const base = page && page.hostname === 'blog.parker.com' ? page : new URL(`${BLOG_ORIGIN}/`);
    try {
      setHeadMeta(doc, 'property', 'og:image', new URL(firstImg.getAttribute('src'), base).href);
    } catch (e) { /* unparsable src: leave Image empty */ }
  }

  // Author / Publication Date for the import script (not read by createMetadata).
  if (author) setHeadMeta(doc, 'name', 'author', author);
  if (date) setHeadMeta(doc, 'name', 'publication-date', date);
}

function blogArticleAfter(element) {
  const doc = element.ownerDocument;

  // Title band: <div class="cmp-title"><h3 class="cmp-title__text"><a href="#"
  // class="cmp-title__link">Title</a></h3> -> <h1>Title</h1> (dead link dropped).
  element.querySelectorAll('.cmp-title .cmp-title__text').forEach((h, i) => {
    const text = nbspTrim(h.textContent);
    if (!text) {
      h.remove();
      return;
    }
    const heading = doc.createElement(i === 0 ? 'h1' : 'h2');
    heading.textContent = text;
    h.replaceWith(heading);
  });

  // Byline: .cmp-blog-author = decorative data:-SVG icon + p.cmp-blog-author-label
  // "Contributed By" + h5.cmp-blog-author-name -> <p>Contributed By<br>Name, Title</p>.
  element.querySelectorAll('.cmp-blog-author').forEach((byline) => {
    const label = nbspTrim((byline.querySelector('.cmp-blog-author-label') || {}).textContent) || 'Contributed By';
    const name = nbspTrim((byline.querySelector('.cmp-blog-author-name') || {}).textContent);
    if (!name) {
      byline.remove();
      return;
    }
    const p = doc.createElement('p');
    p.append(label, doc.createElement('br'), name);
    byline.replaceWith(p);
  });

  const containers = element.querySelectorAll('.parker-blog-custom-container');
  containers.forEach((container) => {
    // Subheadings: Chomerics bodies use <h2>, hydraulics (msg_grp) bodies use
    // <h5><b>Text</b></h5>. Rank the levels used in the body (outside block
    // tables): shallowest -> h2, any deeper level -> h3 (under the page H1).
    const headings = [...container.querySelectorAll('h1, h2, h3, h4, h5, h6')]
      .filter((h) => !h.closest('table'));
    const levels = [...new Set(headings.map((h) => Number(h.tagName[1])))].sort((a, b) => a - b);
    headings.forEach((h) => {
      const text = nbspTrim(h.textContent);
      if (!text && !h.querySelector(MEDIA_SELECTOR)) {
        h.remove();
        return;
      }
      const target = levels.indexOf(Number(h.tagName[1])) === 0 ? 'h2' : 'h3';
      const out = h.tagName.toLowerCase() === target ? h : retag(h, target);
      // <h5><b>Text</b></h5>: the bold wrapper is the heading style, not emphasis.
      const only = out.children.length === 1 ? out.children[0] : null;
      if (only && /^(B|STRONG)$/.test(only.tagName) && nbspTrim(only.textContent) === text) {
        only.replaceWith(...only.childNodes);
      }
      trimText(out);
    });

    // Inline images (.cmp-image): <a class="cmp-image__link"> has no href -> unwrap;
    // drop the empty <span class="cmp-image__title">.
    container.querySelectorAll('.cmp-image a.cmp-image__link:not([href])').forEach((a) => a.replaceWith(...a.childNodes));
    container.querySelectorAll('.cmp-image .cmp-image__title').forEach((s) => {
      if (!nbspTrim(s.textContent)) s.remove();
    });

    // Spacer paragraphs left outside the block tables (parser output untouched).
    removeEmptyParagraphs(container, true);
  });

  // No skipped heading levels across the page (incl. columns-media row titles,
  // which are H3 and can precede the first body H2, e.g. space-payload).
  let prev = 0;
  element.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    const level = Number(h.tagName[1]);
    const max = prev + 1;
    prev = level > max ? max : level;
    if (level > max) retag(h, `h${max}`);
  });
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
  // Help & Support (help.parker.com): landing, the 23 support-topic pages,
  // and the master-directory global offices page.
  '/us/en/support',
  '/us/en/support/billing-shipping',
  '/us/en/support/cad-files',
  '/us/en/support/catalog-part-manuals',
  '/us/en/support/cbc-report',
  '/us/en/support/certificates-compliance',
  '/us/en/support/contact-information',
  '/us/en/support/cross-reference',
  '/us/en/support/ethics-integrity',
  '/us/en/support/find-a-part/18605',
  '/us/en/support/general-help',
  '/us/en/support/hr-benefits',
  '/us/en/support/installation-maintenance',
  '/us/en/support/investors',
  '/us/en/support/optimization',
  '/us/en/support/order-status',
  '/us/en/support/part-configuration/configurator-help',
  '/us/en/support/part-information/18605',
  '/us/en/support/place-an-order',
  '/us/en/support/price-quote',
  '/us/en/support/repairs',
  '/us/en/support/replacement',
  '/us/en/support/software',
  '/us/en/support/training-tutorials',
  '/us/en/support/master-directory/global-offices',
  // Products (ph.parker.com): category landing (template product-landing), the 19
  // category pages (template product-category) and the PTS page (template pts).
  // Matching is exact-path (Set lookup), so L3 /us/en/category/<cat>/<sub> pages
  // and /us/en/series/* tile targets stay absolute ph.parker.com URLs.
  '/us/en/category',
  '/us/en/category/adhesives-coatings-and-encapsulants',
  '/us/en/category/aerospace-systems-and-technologies',
  '/us/en/category/air-preparation-frl-and-dryers',
  '/us/en/category/bioprocessing-and-medical-technologies',
  '/us/en/category/cylinders-and-actuators',
  '/us/en/category/emi-shielding',
  '/us/en/category/filters-collectors-separators-purifiers',
  '/us/en/category/fittings-and-quick-couplings',
  '/us/en/category/gas-generators',
  '/us/en/category/hose-piping-and-tubing',
  '/us/en/category/motors-drives-and-controllers',
  '/us/en/category/mounting-and-vibration-control',
  '/us/en/category/power-take-offs-and-drive-systems',
  '/us/en/category/pumps',
  '/us/en/category/refrigeration-and-air-conditioning',
  '/us/en/category/regulators-monitors-sensors-and-flow-control',
  '/us/en/category/seals-and-o-rings',
  '/us/en/category/thermal-and-power-management',
  '/us/en/category/valves',
  '/us/en/industries/digital/pts',
]);
const SOURCE_ORIGIN = 'https://www.parker.com';
// Hosts whose pages are being migrated into this site.
const SOURCE_ORIGINS = new Set([SOURCE_ORIGIN, HELP_ORIGIN, PH_ORIGIN]);
// Tracking query params dropped from links to migrated pages
// (help pages append ?brd=<topic>&app=hs|undefined to every internal link).
const TRACKING_PARAM = /^(brd|app|utm_.*)$/i;

function cleanSearch(url) {
  const params = new URLSearchParams(url.search);
  [...params.keys()].forEach((k) => { if (TRACKING_PARAM.test(k)) params.delete(k); });
  const s = params.toString();
  return s ? `?${s}` : '';
}

function rewriteLinks(element, payload) {
  // Resolve relative links against the page's own URL/origin
  // (help.parker.com for help pages), falling back to www.parker.com.
  const page = pageUrl(payload);
  const base = page && SOURCE_ORIGINS.has(page.origin) ? page : new URL(`${SOURCE_ORIGIN}/`);
  element.querySelectorAll('a[href]').forEach((a) => {
    if (a.hasAttribute(KEEP_HREF_ATTR)) {
      a.removeAttribute(KEEP_HREF_ATTR);
      return;
    }
    const href = a.getAttribute('href');
    const isAbsolute = /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//');
    const isRelative = !isAbsolute && !href.startsWith('#') && href.trim() !== '';
    let url;
    try {
      if (isRelative) url = new URL(href, base);
      else if (/^https?:\/\//i.test(href)) url = new URL(href);
      else return; // mailto:, tel:, anchors, protocol-relative
    } catch (e) {
      return;
    }
    if (!SOURCE_ORIGINS.has(url.origin)) return; // other hosts
    const path = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    if (MIGRATED_PATHS.has(path)) {
      a.setAttribute('href', `${path}${cleanSearch(url)}${url.hash}`);
    } else if (isRelative && path !== '/') {
      // Not migrated: point back to the page's own origin. Root-relative hrefs
      // are appended verbatim (unchanged behaviour for www.parker.com pages).
      a.setAttribute('href', href.startsWith('/') ? `${url.origin}${href}` : url.href);
    } else if (isRelative && base.origin !== SOURCE_ORIGIN) {
      a.setAttribute('href', url.href); // "/" on help.parker.com -> help home
    }
  });
}
