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

  // tools/importer/import-markets.js
  var import_markets_exports = {};
  __export(import_markets_exports, {
    default: () => import_markets_default
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

  // tools/importer/parsers/banner-inline.js
  function parse2(element, { document: document2 }) {
    const heading = element.querySelector(".image-box-container__title, h2, h3");
    const descParas = Array.from(element.querySelectorAll(".image-box-container__description")).flatMap((d) => {
      const ps = Array.from(d.querySelectorAll("p"));
      if (ps.length) return ps;
      return d.textContent.trim() ? [d] : [];
    }).filter((p) => p.textContent.replace(/\u00a0/g, " ").trim());
    const ctaLinks = Array.from(element.querySelectorAll(".btn-align a[href], a.btn[href]"));
    if (!heading && descParas.length === 0 && ctaLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    contentCell.push(...descParas);
    ctaLinks.forEach((a) => {
      const p = document2.createElement("p");
      p.append(a);
      contentCell.push(p);
    });
    const cells = [[contentCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "banner-inline", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
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
  function parse3(element, { document: document2 }) {
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

  // tools/importer/parsers/cards-teaser.js
  function isCardGrid(element) {
    if (element.matches(".parker-carousel") || element.closest(".parker-carousel") || element.querySelector(".parker-carousel")) return false;
    const isLayoutCol = Array.from(element.classList).some((c) => c.startsWith("layout-col-"));
    return isLayoutCol && !!element.querySelector(".cmp-parker-card-container .card");
  }
  function retag(document2, el, tagName) {
    if (!el || el.tagName.toLowerCase() === tagName) return el;
    const h = document2.createElement(tagName);
    Array.from(el.attributes).forEach((a) => h.setAttribute(a.name, a.value));
    h.append(...el.childNodes);
    el.replaceWith(h);
    return h;
  }
  function parse4(element, { document: document2 }) {
    const grid = isCardGrid(element);
    const sectionHeading = element.querySelector(".slider-carousel-container > h2, :scope > h2") || Array.from(element.querySelectorAll("h2")).find((h) => !h.closest(".card"));
    const cards = Array.from(element.querySelectorAll(".card")).filter((card) => !card.closest(".slick-cloned"));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    cards.forEach((card) => {
      const image = card.querySelector(".card-img-top, picture img, img");
      const body = card.querySelector(".card-body") || card;
      let title = body.querySelector(".card-title, h3, h2, h4");
      if (grid && title && /^H[1-6]$/.test(title.tagName)) title = retag(document2, title, "h3");
      const descRoot = body.querySelector(".card-description") || body;
      const descParas = Array.from(descRoot.querySelectorAll("p")).filter((p) => !p.closest(".card-details") && !p.closest(".btn-align")).filter((p) => p.textContent.replace(/\u00a0/g, " ").trim());
      const ctaLinks = Array.from(body.querySelectorAll(".btn-align a[href], a.btn[href]"));
      if (!grid) {
        const key = `${title ? title.textContent.trim() : ""}|${ctaLinks[0] ? ctaLinks[0].getAttribute("href") : ""}`;
        if (seen.has(key)) return;
        seen.add(key);
      }
      const textCell = [];
      if (title) textCell.push(title);
      textCell.push(...descParas);
      ctaLinks.forEach((a) => {
        const p = document2.createElement("p");
        p.append(a);
        textCell.push(p);
      });
      if (image || textCell.length > 0) {
        cells.push([image || "", textCell]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = grid ? WebImporter.Blocks.createBlock(document2, { name: "cards-teaser (grid)", cells }) : WebImporter.Blocks.createBlock(document2, { name: "cards-teaser", cells });
    if (sectionHeading) element.before(sectionHeading);
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
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

  // tools/importer/parsers/hero-card.js
  function parse7(element, { document: document2 }) {
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image__image, picture img, img");
    const eyebrow = element.querySelector(".cmp-teaser__header-text, .cmp-teaser__header p");
    const heading = element.querySelector(".cmp-teaser__title h2, .cmp-teaser__title h1, .cmp-teaser__title h3, .cmp-teaser__title-link, h2");
    const descRoot = element.querySelector(".cmp-teaser__description");
    const descParas = descRoot ? (descRoot.querySelectorAll("p").length ? Array.from(descRoot.querySelectorAll("p")) : [descRoot]).filter((p) => p.textContent.replace(/\u00a0/g, " ").trim()) : [];
    const ctaLinks = Array.from(element.querySelectorAll(".btn-align a[href], a.btn[href], .cmp-teaser__action-link[href]"));
    if (!image && !heading && descParas.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) cells.push([image]);
    const contentCell = [];
    if (eyebrow && eyebrow.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      contentCell.push(p);
    }
    if (heading) contentCell.push(heading);
    contentCell.push(...descParas);
    ctaLinks.forEach((a) => {
      const p = document2.createElement("p");
      p.append(a);
      contentCell.push(p);
    });
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-card", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/parker-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  var MEDIA_SELECTOR = "img, picture, video, iframe, svg, table";
  function isEmptyColumn(col) {
    return col.textContent.trim() === "" && !col.querySelector(MEDIA_SELECTOR);
  }
  function transform(hookName, element, payload) {
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
    }
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

  // tools/importer/import-markets.js
  var parsers = {
    "banner-cta": parse,
    "banner-inline": parse2,
    "cards-news": parse3,
    "cards-teaser": parse4,
    "columns-media": parse5,
    "hero-banner": parse6,
    "hero-card": parse7
  };
  var PAGE_TEMPLATE = {
    "name": "markets",
    "description": 'Market and trend pages (/us/en/markets/*): grey title band (H1), full-bleed hero, image+text bands (columns-media), submarket cards (cards-teaser), blue inline CTA strip (banner-inline), featured white-paper card over photo (hero-card), blog link list (cards-news), grey rich-text/FAQ default content, gold closing CTA (banner-cta). columns-media OPTION "full-bleed": add it when the matched source grid column has class cmp-parker-secondary-img-box-theme (matched by the first columns-media instance selector) - on the representative page that is the sky-blue Ebrake section (ebrake-video) and the charcoal Next-Generation Technologies section (next-gen-tech); all other columns-media instances (white browse-products, grey bands) use the default/inset look. Skipped sections (breadcrumb, empty-4-4-4, empty-container) carry no content: remove the breadcrumb in cleanup and do not emit a section break for them.',
    "urls": [
      "https://www.parker.com/us/en/markets/aerospace-and-defense.html",
      "https://www.parker.com/us/en/markets/aerospace-industry-trends.html",
      "https://www.parker.com/us/en/markets/clean-tech-trends.html",
      "https://www.parker.com/us/en/markets/digitalization-trends.html",
      "https://www.parker.com/us/en/markets/electrification-trends.html",
      "https://www.parker.com/us/en/markets/electronics-and-semiconductors.html",
      "https://www.parker.com/us/en/markets/energy.html",
      "https://www.parker.com/us/en/markets/hvac-and-refrigeration.html",
      "https://www.parker.com/us/en/markets/in-plant-and-industrial-equipment.html",
      "https://www.parker.com/us/en/markets/interactive-library.html",
      "https://www.parker.com/us/en/markets/life-sciences.html",
      "https://www.parker.com/us/en/markets/off-highway.html",
      "https://www.parker.com/us/en/markets/transportation.html"
    ],
    "blocks": [
      {
        "name": "hero-banner",
        "instances": [
          ".left-to-right-gradient.aem-GridColumn",
          ".cmp-parker-dark-opacity-50.aem-GridColumn",
          ".right-to-left-gradient.aem-GridColumn",
          ".aem-GridColumn:not(.cmp-parker-white-background):has(> .cq-dd-image)"
        ]
      },
      {
        "name": "columns-media",
        "instances": [
          ".cmp-parker-secondary-img-box-theme.aem-GridColumn:has(> .image-box-container .image-wrapper)",
          ".aem-GridColumn:has(> .image-box-container .image-wrapper)"
        ]
      },
      {
        "name": "cards-teaser",
        "instances": [
          ".parker-carousel",
          ".layout-col-4:has(.cmp-parker-card-container .card)",
          ".layout-col-4-4-4:has(.cmp-parker-card-container .card)",
          '[class*="layout-col-"]:has(> .aem-container > .cmp-parker-border > .cmp-parker-card-container .card)'
        ]
      },
      {
        "name": "banner-inline",
        "instances": [
          ".layout-col-8-4.aem-GridColumn:has(.image-box-container):not(:has(.image-wrapper))"
        ]
      },
      {
        "name": "hero-card",
        "instances": [
          ".cmp-parker-white-background.aem-GridColumn:has(> .cq-dd-image)"
        ]
      },
      {
        "name": "cards-news",
        "instances": [
          '.layout-col-6-6.cmp-container_contentwrapper.aem-GridColumn:has(a[href*="blog.parker.com"])'
        ]
      },
      {
        "name": "banner-cta",
        "instances": [
          ".cmp-parker-gold-theme.cmp-parker-secondary-img-box-theme.aem-GridColumn"
        ]
      }
    ],
    "sections": [
      {
        "id": "title-bar",
        "name": "Page title band",
        "selector": [
          ".aem-GridColumn:has(> .cmp-title)"
        ],
        "style": "grey",
        "blocks": [],
        "defaultContent": [
          ".cmp-title h1"
        ]
      },
      {
        "id": "breadcrumb",
        "name": "Breadcrumb (skipped - generated from page path, not authored)",
        "selector": [
          ".aem-GridColumn:has(> nav.cmp-breadcrumb)"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "hero",
        "name": "Market hero",
        "selector": [
          ".left-to-right-gradient.aem-GridColumn",
          ".cmp-parker-dark-opacity-50.aem-GridColumn",
          ".right-to-left-gradient.aem-GridColumn",
          ".aem-GridColumn:not(.cmp-parker-white-background):has(> .cq-dd-image)"
        ],
        "style": null,
        "blocks": [
          "hero-banner"
        ],
        "defaultContent": []
      },
      {
        "id": "browse-products",
        "name": "Interactive product browser promo",
        "selector": [
          ".aem-GridColumn--offset--default--0.aem-GridColumn--default--none:not(.cmp-parker-secondary-img-box-theme):has(> .image-box-container)"
        ],
        "style": null,
        "blocks": [
          "columns-media"
        ],
        "defaultContent": []
      },
      {
        "id": "innovations",
        "name": "Rich-text intro",
        "selector": [
          ".grey-bg.aem-GridColumn:has(> .aem-container > div > .title-description-container)",
          ".grey-bg.aem-GridColumn:not(.cmp-container_contentwrapper):has(> .aem-container)"
        ],
        "style": "grey",
        "blocks": [],
        "defaultContent": [
          ".title-description-container h2",
          ".title-description-container p",
          ".title-description-container ul"
        ]
      },
      {
        "id": "submarkets",
        "name": "Submarket tiles slider",
        "selector": [
          ".aem-GridColumn:has(> .aem-container > div > .parker-carousel)",
          ".aem-GridColumn:has(> .parker-carousel)"
        ],
        "style": null,
        "blocks": [
          "cards-teaser"
        ],
        "defaultContent": [
          ".slider-carousel-container > h2"
        ]
      },
      {
        "id": "empty-4-4-4",
        "name": "Empty 4-4-4 layout container (skipped)",
        "selector": [
          ".layout-col-4-4-4.cmp-container_contentwrapper.aem-GridColumn"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "ebrake-video",
        "name": "Image + text band, blue (columns-media full-bleed)",
        "selector": [
          ".cmp-parker-purpose-blue-theme.cmp-parker-secondary-img-box-theme.aem-GridColumn",
          ".cmp-parker-blue-theme.aem-GridColumn:has(> .image-box-container)"
        ],
        "style": "sky-blue",
        "blocks": [
          "columns-media"
        ],
        "defaultContent": []
      },
      {
        "id": "next-gen-video",
        "name": "Image + text band, grey (image left)",
        "selector": [
          ".grey-bg.aem-GridColumn:not(.cmp-parker-secondary-img-box-theme):has(> .image-box-container)"
        ],
        "style": "grey",
        "blocks": [
          "columns-media"
        ],
        "defaultContent": []
      },
      {
        "id": "next-gen-tech",
        "name": "Image + text band, charcoal (columns-media full-bleed)",
        "selector": [
          ".cmp-parker-charcoal-theme.cmp-parker-secondary-img-box-theme.aem-GridColumn"
        ],
        "style": "charcoal",
        "blocks": [
          "columns-media"
        ],
        "defaultContent": []
      },
      {
        "id": "electroflight",
        "name": "Image + text band, grey (second grey band)",
        "selector": [
          ".grey-bg.aem-GridColumn:not(.cmp-parker-secondary-img-box-theme):has(> .image-box-container) ~ .grey-bg.aem-GridColumn:not(.cmp-parker-secondary-img-box-theme):has(> .image-box-container)"
        ],
        "style": "grey",
        "blocks": [
          "columns-media"
        ],
        "defaultContent": []
      },
      {
        "id": "webinars",
        "name": "Inline CTA strip",
        "selector": [
          ".layout-col-8-4.aem-GridColumn"
        ],
        "style": "sky-blue",
        "blocks": [
          "banner-inline"
        ],
        "defaultContent": []
      },
      {
        "id": "featured-white-paper",
        "name": "Featured resource teaser",
        "selector": [
          ".cmp-parker-white-background.aem-GridColumn"
        ],
        "style": null,
        "blocks": [
          "hero-card"
        ],
        "defaultContent": []
      },
      {
        "id": "education",
        "name": "Blog link list",
        "selector": [
          '.layout-col-6-6.cmp-container_contentwrapper.aem-GridColumn:has(a[href*="blog.parker.com"])'
        ],
        "style": null,
        "blocks": [
          "cards-news"
        ],
        "defaultContent": [
          ".col-ml-mr:first-child h2"
        ]
      },
      {
        "id": "empty-container",
        "name": "Empty container (skipped)",
        "selector": [
          '.layout-col-6-6.cmp-container_contentwrapper.aem-GridColumn:has(a[href*="blog.parker.com"]) + .aem-GridColumn:not(.grey-bg):not(.cmp-parker-gold-theme)'
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "faqs",
        "name": "Static FAQ text",
        "selector": [
          ".grey-bg.cmp-container_contentwrapper.aem-GridColumn:has(> .aem-container > .grey-bg.col-ml-mr)",
          ".grey-bg.cmp-container_contentwrapper.aem-GridColumn:has(> .aem-container > .col-ml-mr)"
        ],
        "style": "grey",
        "blocks": [],
        "defaultContent": [
          ".col-ml-mr h2",
          ".col-ml-mr p"
        ]
      },
      {
        "id": "contact-cta",
        "name": "Closing CTA strip",
        "selector": [
          ".cmp-parker-gold-theme.cmp-parker-secondary-img-box-theme.aem-GridColumn"
        ],
        "style": "gold",
        "blocks": [
          "banner-cta"
        ],
        "defaultContent": []
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
  var import_markets_default = {
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
  return __toCommonJS(import_markets_exports);
})();
