/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/banner-cta.js
  function parse(element, { document: document2 }) {
    const scope = element.querySelector(".image-box-container__opacity-overlay, .left-box") || element;
    const eyebrow = scope.querySelector(".cmp-parker-image-box-container__header-text, .image-box-container__header p");
    const heading = scope.querySelector(".image-box-container__title, h1, h2, h3");
    const description = scope.querySelector(".image-box-container__description");
    const ctaLinks = Array.from(scope.querySelectorAll(".btn-align a, a.btn"));
    if (!eyebrow && !heading && !description && ctaLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (eyebrow) contentCell.push(eyebrow);
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);
    const cells = [];
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "banner-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  function parse2(element, { document: document2 }) {
    const cards = Array.from(element.querySelectorAll(".card"));
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(".card-img-top, picture img, img");
      const body = card.querySelector(".card-body") || card;
      const title = body.querySelector(".card-title, h1, h2, h3, h4, h5, h6");
      const description = body.querySelector(".card-description");
      const ctaLinks = Array.from(card.querySelectorAll("a[href]"));
      const textCell = [];
      if (title) textCell.push(title);
      if (description && description.textContent.trim()) textCell.push(description);
      textCell.push(...ctaLinks);
      if (image || textCell.length > 0) {
        cells.push([image || "", textCell]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-category", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  var CATEGORY_BASE = "https://ph.parker.com/us/en/category";
  var CATEGORY_FALLBACK = CATEGORY_BASE;
  var PRODUCT_CATEGORIES = {
    "Adhesives, Coatings and Encapsulants": "adhesives-coatings-and-encapsulants",
    "Aerospace Systems and Technologies": "aerospace-systems-and-technologies",
    "Air Preparation (FRL) and Dryers": "air-preparation-frl-and-dryers",
    "Bioprocessing and Medical Technologies": "bioprocessing-and-medical-technologies",
    "Cylinders and Actuators": "cylinders-and-actuators",
    "EMI Shielding": "emi-shielding",
    "Filters, Collectors, Separators, Purifiers": "filters-collectors-separators-purifiers",
    "Fittings and Quick Couplings": "fittings-and-quick-couplings",
    "Gas Generators": "gas-generators",
    "Hose, Piping and Tubing": "hose-piping-and-tubing",
    "Motors, Drives and Controllers": "motors-drives-and-controllers",
    "Mounting and Vibration Control": "mounting-and-vibration-control",
    "Power Take Offs and Drive Systems": "power-take-offs-and-drive-systems",
    "Pumps": "pumps",
    "Refrigeration and Air Conditioning": "refrigeration-and-air-conditioning",
    "Regulators, Monitors, Sensors and Flow Control": "regulators-monitors-sensors-and-flow-control",
    "Seals and O-Rings": "seals-and-o-rings",
    "Thermal and Power Management": "thermal-and-power-management",
    "Valves": "valves"
  };
  var CATEGORY_ALIASES = {
    "Regulators, Monitoring, Sensors and Flow Control": "Regulators, Monitors, Sensors and Flow Control"
  };
  var normName = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
  var CATEGORY_BY_NORM = {};
  Object.keys(PRODUCT_CATEGORIES).forEach((name) => {
    CATEGORY_BY_NORM[normName(name)] = `${CATEGORY_BASE}/${PRODUCT_CATEGORIES[name]}`;
  });
  Object.keys(CATEGORY_ALIASES).forEach((alias) => {
    CATEGORY_BY_NORM[normName(alias)] = CATEGORY_BY_NORM[normName(CATEGORY_ALIASES[alias])];
  });
  var isHelpCategoryList = (element) => element.matches("ul.ph-grid-3") || !!element.querySelector("ul.ph-grid-3");
  function parseCategoryList(element, document2) {
    const lists = element.matches("ul.ph-grid-3") ? [element] : Array.from(element.querySelectorAll("ul.ph-grid-3"));
    const cells = [];
    lists.forEach((ul) => {
      Array.from(ul.querySelectorAll(":scope > li")).forEach((li) => {
        const name = li.textContent.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
        if (!name) return;
        const srcLink = li.querySelector("a[href]");
        const a = document2.createElement("a");
        a.setAttribute("href", srcLink ? srcLink.getAttribute("href") : CATEGORY_BY_NORM[normName(name)] || CATEGORY_FALLBACK);
        a.textContent = name;
        const p = document2.createElement("p");
        p.append(a);
        cells.push([p]);
      });
    });
    return cells;
  }
  var isBlank = (el) => !el || !el.textContent.replace(/\u00a0/g, " ").trim();
  function parseLinkList(element, document2) {
    const sectionHeading = Array.from(element.querySelectorAll("h2, h3")).find((h) => !isBlank(h));
    const itemParas = Array.from(element.querySelectorAll("p")).filter((p) => p.querySelector(":scope > a[href]"));
    const cells = [];
    itemParas.forEach((para) => {
      const link = para.querySelector(":scope > a[href]");
      if (!link || isBlank(link)) return;
      const label = Array.from(para.childNodes).filter((n) => n !== link && n.nodeName !== "BR").map((n) => n.textContent).join(" ").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
      const titleP = document2.createElement("p");
      titleP.append(link);
      const contentCell = [titleP];
      if (label) {
        const labelP = document2.createElement("p");
        labelP.textContent = label;
        contentCell.push(labelP);
      }
      cells.push([contentCell]);
    });
    return { sectionHeading, cells };
  }
  var isLandingLinkList = (element) => element.matches("ul:not(.ph-grid-3)") && !!element.querySelector(":scope > li > a[href]");
  function parseLandingLinkList(element, document2) {
    const cells = [];
    Array.from(element.querySelectorAll(":scope > li")).forEach((li) => {
      const link = li.querySelector(":scope > a[href]");
      if (!link) return;
      const text = link.textContent.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
      if (!text) return;
      const a = document2.createElement("a");
      a.setAttribute("href", link.getAttribute("href"));
      a.textContent = text;
      const p = document2.createElement("p");
      p.append(a);
      cells.push([p]);
    });
    return cells;
  }
  function parse3(element, { document: document2 }) {
    if (isLandingLinkList(element)) {
      const landingCells = parseLandingLinkList(element, document2);
      if (landingCells.length === 0) {
        element.replaceWith(...element.childNodes);
        return;
      }
      element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "cards-news (columns)", cells: landingCells }));
      return;
    }
    if (isHelpCategoryList(element)) {
      const helpCells = parseCategoryList(element, document2);
      if (helpCells.length === 0) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const block2 = WebImporter.Blocks.createBlock(document2, { name: "cards-news (columns)", cells: helpCells });
      element.replaceWith(block2);
      return;
    }
    const items = Array.from(element.querySelectorAll(".cmp-news-v2-component__list"));
    let cells = [];
    let sectionHeading = null;
    items.forEach((item) => {
      const titleLink = item.querySelector(".cmp-news-v2-component__list-title-link, .cmp-news-v2-component__list-title a, a[href]");
      const meta = item.querySelector(".cmp-news-v2-component__author");
      const contentCell = [];
      if (titleLink) contentCell.push(titleLink);
      if (meta) contentCell.push(meta);
      if (contentCell.length > 0) {
        cells.push([contentCell]);
      }
    });
    if (items.length === 0) {
      ({ sectionHeading, cells } = parseLinkList(element, document2));
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-news", cells });
    if (sectionHeading) element.before(sectionHeading);
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-hero.js
  function parse4(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    const cells = [];
    items.forEach((item) => {
      const image = item.querySelector(".cmp-teaser__image img, .cmp-image__image, picture img, img");
      const content = item.querySelector(".cmp-teaser__content");
      const contentCell = [];
      if (content) {
        const eyebrow = content.querySelector(".cmp-teaser__header-text");
        const heading = content.querySelector(".cmp-teaser__title h1, .cmp-teaser__title h2, .cmp-teaser__title-link, h1, h2, h3");
        const description = content.querySelector(".cmp-teaser__description");
        const ctaLinks = Array.from(content.querySelectorAll(".btn-align a, a.btn"));
        if (eyebrow) contentCell.push(eyebrow);
        if (heading) contentCell.push(heading);
        if (description) contentCell.push(description);
        contentCell.push(...ctaLinks);
      }
      if (image || contentCell.length > 0) {
        cells.push([image || "", contentCell]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  function bootstrapOrder(col) {
    let order = 0;
    Array.from(col.classList).forEach((c) => {
      const m = c.match(/^order-(?:(?:sm|md|lg|xl)-)?(first|last|\d+)$/);
      if (!m) return;
      if (m[1] === "first") order = -1;
      else if (m[1] === "last") order = 99;
      else order = parseInt(m[1], 10);
    });
    return order;
  }
  var isHelpMediaRow = (element) => !!element.querySelector(".ph-bg__img-block");
  function parseHelpMediaRow(element, document2) {
    const imgCol = element.querySelector(".ph-bg__img-block");
    const cols = Array.from(imgCol.parentElement.children).map((col, i) => ({ col, i, order: bootstrapOrder(col) })).sort((a, b) => a.order - b.order || a.i - b.i).map((c) => c.col);
    const row = [];
    let hasContent = false;
    cols.forEach((col) => {
      if (col === imgCol) {
        const img = col.querySelector("img");
        if (img) hasContent = true;
        row.push(img || "");
        return;
      }
      const textCell = [];
      let heading = col.querySelector("h1, h2, h3, h4");
      if (heading && heading.tagName === "H1") {
        const h2 = document2.createElement("h2");
        h2.append(...heading.childNodes);
        heading.replaceWith(h2);
        heading = h2;
      }
      if (heading) textCell.push(heading);
      Array.from(col.querySelectorAll("p")).forEach((p) => {
        if (p.textContent.replace(/\u00a0/g, " ").trim() || p.querySelector("img, a")) textCell.push(p);
      });
      if (textCell.length) {
        hasContent = true;
        row.push(textCell);
      }
    });
    return hasContent ? [row] : [];
  }
  function visualSide(el) {
    if (!el || !el.classList) return null;
    if (el.classList.contains("order-left")) return "left";
    if (el.classList.contains("order-right")) return "right";
    return null;
  }
  var FULL_BLEED_YELLOW_PAGES = ["/us/en/markets.html"];
  function pagePath(url, params) {
    const raw = params && params.originalURL || url || "";
    try {
      return new URL(raw).pathname;
    } catch (e) {
      return "";
    }
  }
  function parse5(element, { document: document2, url, params }) {
    if (isHelpMediaRow(element)) {
      const helpCells = parseHelpMediaRow(element, document2);
      if (helpCells.length === 0) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const block2 = WebImporter.Blocks.createBlock(document2, { name: "columns-media", cells: helpCells });
      element.replaceWith(block2);
      return;
    }
    const textBox = element.querySelector('.left-box, .image-box-container__opacity-overlay, [class*="left-box"]');
    const mediaBox = element.querySelector('.image-wrapper, .image-container, [class*="image-wrapper"]');
    const image = element.querySelector(".image-wrapper img, .image-container img, picture img, img");
    const textCell = [];
    if (textBox) {
      const eyebrow = textBox.querySelector(".cmp-parker-image-box-container__header-text");
      const heading = textBox.querySelector(".image-box-container__title, h1, h2, h3");
      const subtitle = textBox.querySelector(".image-box-container__subtitle");
      const description = textBox.querySelector(".image-box-container__description");
      const ctaLinks = Array.from(textBox.querySelectorAll(".btn-align a, a.btn"));
      if (eyebrow) textCell.push(eyebrow);
      if (heading) textCell.push(heading);
      if (subtitle) textCell.push(subtitle);
      if (description) textCell.push(description);
      textCell.push(...ctaLinks);
    }
    const mediaCell = [];
    if (image) {
      mediaCell.push(image);
    } else if (mediaBox) {
      mediaCell.push(mediaBox);
    }
    if (textCell.length === 0 && mediaCell.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let imageFirst = false;
    if (!element.classList.contains("cmp-parker-ibd-align-center")) {
      const textCol = textBox && textBox.closest(".left-box") || textBox;
      const mediaCol = element.querySelector(".image-wrapper") || mediaBox;
      const mediaSide = visualSide(mediaCol);
      const textSide = visualSide(textCol);
      if (mediaSide === "left" || mediaSide === null && textSide === "right") {
        imageFirst = true;
      }
    }
    const cells = [];
    cells.push(imageFirst ? [mediaCell, textCell] : [textCell, mediaCell]);
    const fullBleed = element.classList.contains("cmp-parker-secondary-img-box-theme") || element.classList.contains("cmp-parker-yellow-theme") && FULL_BLEED_YELLOW_PAGES.includes(pagePath(url, params));
    const block = fullBleed ? WebImporter.Blocks.createBlock(document2, { name: "columns-media (full-bleed)", cells }) : WebImporter.Blocks.createBlock(document2, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-banner.js
  function parse6(element, { document: document2 }) {
    const bgImage = element.querySelector(".cmp-teaser__image img, .cmp-image__image, picture img, img");
    const heading = element.querySelector('.cmp-teaser__title h1, .cmp-teaser__title h2, .cmp-teaser__title-link, [class*="hero-text"], h1, h2');
    const description = element.querySelector(".cmp-teaser__description, .cmp-teaser__header p");
    const ctaLinks = Array.from(element.querySelectorAll(".btn-align a, a.btn, .cmp-teaser__action-link"));
    if (!heading && !description && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) cells.push([bgImage]);
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/parker-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  var MEDIA_SELECTOR = "img, picture, video, iframe, svg, table";
  function isEmptyColumn(col) {
    return col.textContent.trim() === "" && !col.querySelector(MEDIA_SELECTOR);
  }
  function transform(hookName, element, payload) {
    const support = isSupportPage(payload);
    if (support && hookName === H.before && isSupportLandingPage(payload)) supportLandingBefore(element);
    if (support && hookName === H.before && isMasterDirectoryPage(payload)) masterDirectoryBefore(element, payload);
    if (support && hookName === H.before) supportBefore(element, payload);
    if (support && hookName === H.after) supportAfter(element);
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        ".parker-comchatskill",
        "#db-sync",
        "#embeddedMessagingSiteContextFrame"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#embedded-messaging",
        'div[id^="ZN_"]',
        // live-rendered pages keep the SPA's <noscript>"You need to enable JavaScript…"
        "noscript"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".aem-GridColumn--default--hide",
        "#db_lr_pixel_ad",
        'img[src*="rlcdn.com"]',
        'img[src*="/akam/"]',
        'img[src^="blob:"]',
        'img[width="0"][height="0"]'
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "#parker_h_f_header_root",
        "#parker_h_f_footer_wrapper",
        "#h1tagheader",
        "nav#parker_h_f_sub_item",
        ".aem-GridColumn:has(> nav.cmp-breadcrumb)",
        "nav.cmp-breadcrumb",
        "iframe",
        "script"
      ]);
      element.querySelectorAll('.cmp-title__text > a.cmp-title__link[href="#"]').forEach((a) => {
        a.replaceWith(...a.childNodes);
      });
      element.querySelectorAll(".image-box-container__description p").forEach((p) => {
        let last = p.lastChild;
        while (last && (last.nodeType === 3 && !last.textContent.replace(/ /g, " ").trim() || last.nodeType === 1 && last.tagName === "BR")) {
          last.remove();
          last = p.lastChild;
        }
      });
      const columns = [...element.querySelectorAll(".aem-Grid > .aem-GridColumn")].reverse();
      columns.forEach((col) => {
        if (isEmptyColumn(col)) col.remove();
      });
      rewriteLinks(element, payload);
    }
  }
  var HELP_ORIGIN = "https://help.parker.com";
  var KEEP_HREF_ATTR = "data-excat-keep-href";
  function pageUrl(payload) {
    const raw = payload && payload.params && payload.params.originalURL;
    if (!raw) return null;
    try {
      return new URL(raw);
    } catch (e) {
      return null;
    }
  }
  function isSupportPage(payload) {
    const url = pageUrl(payload);
    if (url && url.hostname === "help.parker.com") return true;
    const name = payload && payload.template && payload.template.name;
    return typeof name === "string" && name.startsWith("support");
  }
  function retag(el, tagName) {
    const doc = el.ownerDocument;
    const repl = doc.createElement(tagName);
    repl.append(...el.childNodes);
    el.replaceWith(repl);
    return repl;
  }
  function trimText(el) {
    const walker = el.ownerDocument.createTreeWalker(
      el,
      4
      /* SHOW_TEXT */
    );
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    const visible = texts.filter((t) => t.textContent.replace(/ /g, " ").trim());
    if (!visible.length) return;
    const first = visible[0];
    const last = visible[visible.length - 1];
    first.textContent = first.textContent.replace(/^[\s ]+/, "");
    last.textContent = last.textContent.replace(/[\s ]+$/, "");
  }
  function normalizeTitle(text) {
    return text.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
  }
  function makeLinkPara(doc, href, text, wrapTag) {
    const p = doc.createElement("p");
    const a = doc.createElement("a");
    a.setAttribute("href", href);
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
  var LANDING_PATH = "/us/en/support";
  var LANDING_TITLE = "Help & Support | Parker US";
  function isSupportLandingPage(payload) {
    const url = pageUrl(payload);
    if (url) return url.hostname === "help.parker.com" && url.pathname.replace(/\/+$/, "") === LANDING_PATH;
    return !!(payload && payload.template && payload.template.name === "support-landing");
  }
  var MASTER_DIRECTORY_PATH = "/us/en/support/master-directory/global-offices";
  function isMasterDirectoryPage(payload) {
    const url = pageUrl(payload);
    if (url) return url.hostname === "help.parker.com" && url.pathname.replace(/\/+$/, "") === MASTER_DIRECTORY_PATH;
    return !!(payload && payload.template && payload.template.name === "master-directory");
  }
  function masterDirectoryBefore(element, payload) {
    const doc = element.ownerDocument;
    const main = element.querySelector("main.ph-main");
    if (!main) return;
    const url = pageUrl(payload);
    const app = doc.createElement("div");
    app.className = "excat-md-app";
    const a = doc.createElement("a");
    a.setAttribute("href", url ? url.href.split("?")[0] : `${HELP_ORIGIN}${MASTER_DIRECTORY_PATH}`);
    a.setAttribute(KEEP_HREF_ATTR, "");
    a.textContent = "Master Directory";
    app.append(a);
    main.replaceChildren(app);
  }
  var isTextDiv = (el) => el.tagName === "DIV" && el.children.length === 0 && !!el.textContent.replace(/\u00a0/g, " ").trim();
  function supportLandingBefore(element) {
    const doc = element.ownerDocument;
    doc.title = LANDING_TITLE;
    doc.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach((m) => m.setAttribute("content", LANDING_TITLE));
    element.querySelectorAll(".parts-doc-search form.ph-form").forEach((form) => {
      const { p, a } = makeLinkPara(doc, `${HELP_ORIGIN}${LANDING_PATH}`, "Search Part Documents", "strong");
      a.setAttribute(KEEP_HREF_ATTR, "true");
      form.replaceWith(p);
    });
    WebImporter.DOMUtils.remove(element, [
      "main.ph-main > div > hr.MuiDivider-root",
      ".col-12.text-center:has(> a.ph-overflow__read-more-toggle)",
      "a.ph-overflow__read-more-toggle"
    ]);
    element.querySelectorAll("main.ph-main .jumbotron").forEach((jumbo) => {
      const divs = Array.from(jumbo.children);
      if (!divs.length || !divs.every(isTextDiv)) return;
      const titleIndex = Math.max(divs.length - 2, 0);
      divs.forEach((div, i) => trimText(retag(div, i === titleIndex ? "h2" : "p")));
      Array.from(jumbo.parentElement.children).filter((sib) => sib !== jumbo && isTextDiv(sib) && jumbo.compareDocumentPosition(sib) & 4).forEach((sib) => trimText(retag(sib, "h3")));
    });
  }
  function supportBefore(element, payload) {
    const doc = element.ownerDocument;
    const url = pageUrl(payload);
    const origin = url && /^https?:$/.test(url.protocol) ? url.origin : HELP_ORIGIN;
    WebImporter.DOMUtils.remove(element, [
      ".container-fluid:has(> .ph-header-main__breadcrumbs)",
      ".ph-header-main__breadcrumbs",
      "div[hidden]",
      "next-route-announcer",
      "#transcend-consent-manager",
      'iframe[width="0"][height="0"]',
      'div[style*="display: none"]',
      "style"
    ]);
    element.querySelectorAll('img[src^="/"]:not([src^="//"])').forEach((img) => {
      img.setAttribute("src", `${origin}${img.getAttribute("src")}`);
    });
    element.querySelectorAll(".ph-header-main__title h1 ~ span").forEach((span) => {
      const h1 = span.parentElement.querySelector("h1");
      const text = span.textContent.trim();
      if (!text || h1 && normalizeTitle(text) === normalizeTitle(h1.textContent)) {
        span.remove();
      } else {
        const p = retag(span, "p");
        p.removeAttribute("style");
      }
    });
    element.querySelectorAll("form.ph-form").forEach((form) => {
      const { p, a } = makeLinkPara(
        doc,
        `${HELP_ORIGIN}/us/en/support/cross-reference`,
        "Search the Cross-Reference Tool",
        "strong"
      );
      a.setAttribute(KEEP_HREF_ATTR, "true");
      form.replaceWith(p);
    });
    element.querySelectorAll([
      ".ph-content-nav__history a:has(> button.MuiButton-root)",
      ".ph-content-nav__history a:has(> span.accent-button)",
      ".ph-content-nav__history a.accent-button"
    ].join(", ")).forEach((link) => {
      const { p } = makeLinkPara(doc, "/us/en/support", "Return to Help & Support", "em");
      link.replaceWith(p);
    });
    element.querySelectorAll([
      ".ph-content-nav__history a:has(> span.help)",
      ".ph-content-nav__history a.help"
    ].join(", ")).forEach((link) => {
      const intro = doc.createElement("p");
      intro.textContent = "Still Lost?";
      const { p } = makeLinkPara(doc, link.getAttribute("href") || "/us/en/support/general-help", "General Help");
      link.replaceWith(intro, p);
    });
  }
  function supportAfter(element) {
    const titleH1 = element.querySelector(".ph-header-main__title h1");
    element.querySelectorAll("h1").forEach((h1) => {
      if (h1 !== titleH1) retag(h1, "h2");
    });
    element.querySelectorAll("h3.ht, .jumbotron > h3").forEach((h3) => retag(h3, "p"));
    element.querySelectorAll("h1, h2, h3, h4, h5, h6, .jumbotron > a").forEach(trimText);
  }
  var MIGRATED_PATHS = /* @__PURE__ */ new Set([
    "/us/en/home",
    "/us/en/markets",
    "/us/en/markets/aerospace-and-defense",
    "/us/en/markets/aerospace-industry-trends",
    "/us/en/markets/clean-tech-trends",
    "/us/en/markets/digitalization-trends",
    "/us/en/markets/electrification-trends",
    "/us/en/markets/electronics-and-semiconductors",
    "/us/en/markets/energy",
    "/us/en/markets/hvac-and-refrigeration",
    "/us/en/markets/in-plant-and-industrial-equipment",
    "/us/en/markets/interactive-library",
    "/us/en/markets/interactive-library/parker-world",
    "/us/en/markets/life-sciences",
    "/us/en/markets/off-highway",
    "/us/en/markets/transportation",
    // Help & Support (help.parker.com): landing, the 23 support-topic pages,
    // and the master-directory global offices page.
    "/us/en/support",
    "/us/en/support/billing-shipping",
    "/us/en/support/cad-files",
    "/us/en/support/catalog-part-manuals",
    "/us/en/support/cbc-report",
    "/us/en/support/certificates-compliance",
    "/us/en/support/contact-information",
    "/us/en/support/cross-reference",
    "/us/en/support/ethics-integrity",
    "/us/en/support/find-a-part/18605",
    "/us/en/support/general-help",
    "/us/en/support/hr-benefits",
    "/us/en/support/installation-maintenance",
    "/us/en/support/investors",
    "/us/en/support/optimization",
    "/us/en/support/order-status",
    "/us/en/support/part-configuration/configurator-help",
    "/us/en/support/part-information/18605",
    "/us/en/support/place-an-order",
    "/us/en/support/price-quote",
    "/us/en/support/repairs",
    "/us/en/support/replacement",
    "/us/en/support/software",
    "/us/en/support/training-tutorials",
    "/us/en/support/master-directory/global-offices"
  ]);
  var SOURCE_ORIGIN = "https://www.parker.com";
  var SOURCE_ORIGINS = /* @__PURE__ */ new Set([SOURCE_ORIGIN, HELP_ORIGIN]);
  var TRACKING_PARAM = /^(brd|app|utm_.*)$/i;
  function cleanSearch(url) {
    const params = new URLSearchParams(url.search);
    [...params.keys()].forEach((k) => {
      if (TRACKING_PARAM.test(k)) params.delete(k);
    });
    const s = params.toString();
    return s ? `?${s}` : "";
  }
  function rewriteLinks(element, payload) {
    const page = pageUrl(payload);
    const base = page && SOURCE_ORIGINS.has(page.origin) ? page : new URL(`${SOURCE_ORIGIN}/`);
    element.querySelectorAll("a[href]").forEach((a) => {
      if (a.hasAttribute(KEEP_HREF_ATTR)) {
        a.removeAttribute(KEEP_HREF_ATTR);
        return;
      }
      const href = a.getAttribute("href");
      const isAbsolute = /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//");
      const isRelative = !isAbsolute && !href.startsWith("#") && href.trim() !== "";
      let url;
      try {
        if (isRelative) url = new URL(href, base);
        else if (/^https?:\/\//i.test(href)) url = new URL(href);
        else return;
      } catch (e) {
        return;
      }
      if (!SOURCE_ORIGINS.has(url.origin)) return;
      const path = url.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";
      if (MIGRATED_PATHS.has(path)) {
        a.setAttribute("href", `${path}${cleanSearch(url)}${url.hash}`);
      } else if (isRelative && path !== "/") {
        a.setAttribute("href", href.startsWith("/") ? `${url.origin}${href}` : url.href);
      } else if (isRelative && base.origin !== SOURCE_ORIGIN) {
        a.setAttribute("href", url.href);
      }
    });
  }

  // tools/importer/transformers/parker-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  var THEME_SECTION_TEMPLATES = /* @__PURE__ */ new Set(["markets"]);
  var THEME_STYLE_ATTR = "data-excat-theme-style";
  var THEME_FIRST_ATTR = "data-excat-theme-first";
  var THEME_STYLES = [
    ["cmp-parker-purpose-blue-theme", "sky-blue"],
    ["cmp-parker-blue-theme", "sky-blue"],
    ["cmp-parker-gold-theme", "gold"],
    ["cmp-parker-charcoal-theme", "charcoal"],
    ["grey-bg", "grey"]
  ];
  var TITLE_BAND_STYLE = "grey";
  var MEDIA_SELECTOR2 = "img, picture, video, iframe, svg, table";
  function themeFromClassList(el) {
    for (const [cls, style] of THEME_STYLES) {
      if (el.classList.contains(cls)) return style;
    }
    return null;
  }
  function isEmpty(el) {
    return el.textContent.trim() === "" && !el.querySelector(MEDIA_SELECTOR2);
  }
  function columnStyle(col) {
    const own = themeFromClassList(col);
    if (own) return own;
    if (col.querySelector(":scope > .cmp-title")) return TITLE_BAND_STYLE;
    const container = col.querySelector(":scope > .aem-container");
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
  function findContentGrid(root) {
    const title = root.querySelector(".cmp-title");
    const fromTitle = title && title.closest(".aem-Grid");
    return fromTitle || root.querySelector(".aem-Grid > .aem-GridColumn > .aem-container.aem-Grid");
  }
  function contentColumns(grid) {
    return [...grid.children].filter((col) => col.classList.contains("aem-GridColumn") && !col.classList.contains("aem-GridColumn--default--hide") && !col.querySelector(":scope > nav.cmp-breadcrumb") && !isEmpty(col));
  }
  function themeBefore(element) {
    const grid = findContentGrid(element);
    if (!grid) return;
    const columns = contentColumns(grid);
    for (let i = columns.length - 1; i >= 0; i -= 1) {
      const style = columnStyle(columns[i]);
      if (i === 0 && !style) continue;
      const hr = document.createElement("hr");
      if (style) hr.setAttribute(THEME_STYLE_ATTR, style);
      if (i === 0) hr.setAttribute(THEME_FIRST_ATTR, "true");
      columns[i].before(hr);
    }
  }
  function themeAfter(element) {
    const markers = [...element.querySelectorAll(`hr[${THEME_STYLE_ATTR}]`)].reverse();
    markers.forEach((marker) => {
      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: "Section Metadata",
        cells: { style: marker.getAttribute(THEME_STYLE_ATTR) }
      });
      marker.after(metadataBlock);
      marker.removeAttribute(THEME_STYLE_ATTR);
      if (marker.hasAttribute(THEME_FIRST_ATTR)) marker.remove();
    });
  }
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const template = payload.template || {};
    const useThemeSections = THEME_SECTION_TEMPLATES.has(template.name);
    if (useThemeSections && hookName === "beforeTransform") themeBefore(element);
    if (useThemeSections && hookName === "afterTransform") themeAfter(element);
    const sections = useThemeSections ? [] : payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "banner-cta": parse,
    "cards-category": parse2,
    "cards-news": parse3,
    "carousel-hero": parse4,
    "columns-media": parse5,
    "hero-banner": parse6
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Parker home page",
    urls: [
      "https://www.parker.com/us/en/home.html"
    ],
    blocks: [
      {
        name: "hero-banner",
        instances: [".left-to-right-gradient.aem-GridColumn"]
      },
      {
        name: "columns-media",
        instances: [".cmp-parker-blue-theme.cmp-parker-ibd-align-center", ".grey-bg.aem-GridColumn"]
      },
      {
        name: "carousel-hero",
        instances: [".cmp-carousel"]
      },
      {
        name: "banner-cta",
        instances: [".cmp-parker-gold-theme.cmp-parker-secondary-img-box-theme"]
      },
      {
        name: "cards-category",
        instances: [".parker-carousel"]
      },
      {
        name: "cards-news",
        instances: [".cmp-news-v2-component__container"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "hero",
        selector: [".left-to-right-gradient.aem-GridColumn"],
        style: null,
        blocks: ["hero-banner"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "our-purpose",
        selector: [".cmp-parker-blue-theme.cmp-parker-ibd-align-center"],
        style: "sky-blue",
        blocks: ["columns-media"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "trends-carousel",
        selector: [".cmp-carousel"],
        style: null,
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "products-cta",
        selector: [".cmp-parker-gold-theme.cmp-parker-secondary-img-box-theme"],
        style: "gold",
        blocks: ["banner-cta"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "featured-categories-heading",
        selector: ["#spa-root > div > div > div.aem-container.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(1) > div.aem-container.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(7)", "div.aem-GridColumn:has(> .cmp-titlelink_container)"],
        style: null,
        blocks: [],
        defaultContent: ["h2"]
      },
      {
        id: "section-6",
        name: "featured-categories",
        selector: [".parker-carousel"],
        style: null,
        blocks: ["cards-category"],
        defaultContent: []
      },
      {
        id: "section-7",
        name: "about-parker",
        selector: [".grey-bg.aem-GridColumn"],
        style: "grey",
        blocks: ["columns-media"],
        defaultContent: []
      },
      {
        id: "section-8",
        name: "featured-news",
        selector: [".cmp-container_contentwrapper"],
        style: null,
        blocks: ["cards-news"],
        defaultContent: ["h2"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        let elements = [];
        try {
          elements = document2.querySelectorAll(selector);
        } catch (e) {
          console.warn(`Invalid selector for "${blockDef.name}": ${selector}`);
          return;
        }
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
