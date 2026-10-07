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

  // tools/importer/import-markets-2.js
  var import_markets_2_exports = {};
  __export(import_markets_2_exports, {
    default: () => import_markets_2_default
  });

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
  function parse(element, { document: document2 }) {
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

  // tools/importer/parsers/carousel-hero.js
  function parse2(element, { document: document2 }) {
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
  function parse3(element, { document: document2, url, params }) {
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
      rewriteLinks(element);
    }
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
    "/us/en/markets/transportation"
  ]);
  var SOURCE_ORIGIN = "https://www.parker.com";
  function rewriteLinks(element) {
    element.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      let url;
      if (href.startsWith("/") && !href.startsWith("//")) url = new URL(href, SOURCE_ORIGIN);
      else if (href.startsWith(`${SOURCE_ORIGIN}/`)) url = new URL(href);
      else return;
      const path = url.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";
      if (MIGRATED_PATHS.has(path)) {
        a.setAttribute("href", `${path}${url.search}${url.hash}`);
      } else if (href.startsWith("/") && path !== "/") {
        a.setAttribute("href", `${SOURCE_ORIGIN}${href}`);
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

  // tools/importer/import-markets-2.js
  var parsers = {
    "cards-teaser": parse,
    "carousel-hero": parse2,
    "columns-media": parse3
  };
  var PAGE_TEMPLATE = {
    "name": "markets-2",
    "description": 'Markets landing page (/us/en/markets.html): grey title band (H1), 8-slide full-bleed hero carousel (carousel-hero, one row per .cmp-carousel__item), gold Parker World text+photo band (columns-media full-bleed), grey "Key Trends" heading band + intro paragraph + 4 trend tiles, grey "Key Markets" heading band + intro paragraph + 6 market tiles, grey "Additional Markets" heading band + 2 market tiles (all tile groups = cards-teaser with OPTION "grid": emit "cards-teaser (grid)" for every cards-teaser instance on this template), charcoal "Browse Parker Products Through Our Interactives" band (columns-media, default/inset look). columns-media OPTION "full-bleed": add it ONLY for the gold Parker World band (grid column .cmp-parker-yellow-theme, matched by the first columns-media instance selector); the charcoal interactives band (.cmp-parker-charcoal-theme.cmp-parker-secondary-img-box-theme) has an inset tablet image and must stay plain "columns-media" here, unlike the markets template where cmp-parker-secondary-img-box-theme implies full-bleed. The Additional Markets heading and its tiles share one grid column: the heading is the grey section, the inner .layout-col-4 tile row starts a new unstyled section. Dropped by cleanup: hidden mobile-only teaser (.aem-GridColumn--default--hide) and the empty spacer text column; neither gets a section. Card headings are h4 in source (author as h3); hidden .card-details published dates are not authored.',
    "urls": [
      "https://www.parker.com/us/en/markets.html"
    ],
    "blocks": [
      {
        "name": "carousel-hero",
        "instances": [
          ".cmp-carousel"
        ]
      },
      {
        "name": "columns-media",
        "instances": [
          ".cmp-parker-yellow-theme.aem-GridColumn:has(> .image-box-container .image-wrapper)",
          ".cmp-parker-charcoal-theme.aem-GridColumn:has(> .image-box-container .image-wrapper)"
        ]
      },
      {
        "name": "cards-teaser",
        "instances": [
          ".layout-col-4:has(.cmp-parker-card-container .card)"
        ]
      }
    ],
    "sections": [
      {
        "id": "title-bar",
        "name": "Page title band",
        "selector": [
          ".aem-GridColumn:has(> .cmp-title h1)"
        ],
        "style": "grey",
        "blocks": [],
        "defaultContent": [
          ".cmp-title h1"
        ]
      },
      {
        "id": "hero-carousel",
        "name": "Hero carousel (8 slides)",
        "selector": [
          ".aem-GridColumn:has(> .cmp-carousel)"
        ],
        "style": null,
        "blocks": [
          "carousel-hero"
        ],
        "defaultContent": []
      },
      {
        "id": "parker-world",
        "name": "Parker World band, gold (columns-media full-bleed)",
        "selector": [
          ".cmp-parker-yellow-theme.aem-GridColumn"
        ],
        "style": "gold",
        "blocks": [
          "columns-media"
        ],
        "defaultContent": []
      },
      {
        "id": "key-trends-title",
        "name": "Key Trends heading band",
        "selector": [
          ".aem-GridColumn:has(> .cmp-title h2)"
        ],
        "style": "grey",
        "blocks": [],
        "defaultContent": [
          ".cmp-title h2"
        ]
      },
      {
        "id": "key-trends",
        "name": "Key Trends intro + 4 trend tiles (cards-teaser grid)",
        "selector": [
          ".aem-GridColumn:has(> .title-description-container)"
        ],
        "style": null,
        "blocks": [
          "cards-teaser"
        ],
        "defaultContent": [
          ".title-description-container p"
        ]
      },
      {
        "id": "key-markets-title",
        "name": "Key Markets heading band",
        "selector": [
          ".layout-col-4.aem-GridColumn ~ .aem-GridColumn:has(> .cmp-title h2)"
        ],
        "style": "grey",
        "blocks": [],
        "defaultContent": [
          ".cmp-title h2"
        ]
      },
      {
        "id": "key-markets",
        "name": "Key Markets intro + 6 market tiles (cards-teaser grid)",
        "selector": [
          ".layout-col-4.aem-GridColumn ~ .aem-GridColumn:has(> .title-description-container)"
        ],
        "style": null,
        "blocks": [
          "cards-teaser"
        ],
        "defaultContent": [
          ".title-description-container p"
        ]
      },
      {
        "id": "additional-markets-title",
        "name": "Additional Markets heading band",
        "selector": [
          ".aem-GridColumn:has(> .aem-container:not(.aem-Grid) > div > .cmp-title)"
        ],
        "style": "grey",
        "blocks": [],
        "defaultContent": [
          ".cmp-title h2"
        ]
      },
      {
        "id": "additional-markets",
        "name": "Additional Markets 2 tiles (cards-teaser grid)",
        "selector": [
          ".aem-container:not(.aem-Grid) > .layout-col-4:has(.cmp-parker-card-container .card)"
        ],
        "style": null,
        "blocks": [
          "cards-teaser"
        ],
        "defaultContent": []
      },
      {
        "id": "browse-interactives",
        "name": "Browse interactives band, charcoal (columns-media)",
        "selector": [
          ".cmp-parker-charcoal-theme.aem-GridColumn"
        ],
        "style": "charcoal",
        "blocks": [
          "columns-media"
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
  var import_markets_2_default = {
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
  return __toCommonJS(import_markets_2_exports);
})();
