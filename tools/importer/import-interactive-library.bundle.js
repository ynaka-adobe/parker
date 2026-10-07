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

  // tools/importer/import-interactive-library.js
  var import_interactive_library_exports = {};
  __export(import_interactive_library_exports, {
    default: () => import_interactive_library_default
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
  function parse2(element, { document: document2 }) {
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

  // tools/importer/parsers/embed-app.js
  function parse3(element, { document: document2 }) {
    const iframe = element.querySelector(".parker-embed-wrapper iframe[src], iframe[src]");
    const src = iframe ? iframe.getAttribute("src") : "";
    if (!src) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const link = document2.createElement("a");
    link.href = src;
    link.textContent = src;
    const cells = [[link]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "embed-app", cells });
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

  // tools/importer/import-interactive-library.js
  var parsers = {
    "banner-cta": parse,
    "cards-teaser": parse2,
    "embed-app": parse3
  };
  var PAGE_TEMPLATE = {
    "name": "interactive-library",
    "description": 'Interactive Library pages (/us/en/markets/interactive-library/*): grey title band (H1), charcoal text-only intro band (H2 + 3 paragraphs, default content), grey band holding the full-width embedded external app (embed-app: one cell with the iframe src link https://parkerworld.parker.com/; the expand button, inline <style> and &nbsp; spacer text components in the same grid column are dropped), gold "Why Parker" CTA band (banner-cta; source class cmp-parker-yellow-theme, not cmp-parker-gold-theme), and an unstyled "Learn More about our Markets" H2 + 7-tile slider (plain cards-teaser, NOT the grid option; skip .slick-cloned slides). Breadcrumb and the empty grid column after the embed are removed by cleanup and get no section. Sections use the positional strategy (template not in THEME_SECTION_TEMPLATES).',
    "urls": [
      "https://www.parker.com/us/en/markets/interactive-library/parker-world.html"
    ],
    "blocks": [
      {
        "name": "embed-app",
        "instances": [
          ".aem-GridColumn:has(> .aem-container > div > .parker-embed-wrapper)"
        ]
      },
      {
        "name": "banner-cta",
        "instances": [
          ".cmp-parker-yellow-theme.aem-GridColumn:has(> .image-box-container)"
        ]
      },
      {
        "name": "cards-teaser",
        "instances": [
          ".parker-carousel"
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
        "id": "intro",
        "name": "Real Solutions Across Real Markets intro band, charcoal (text only)",
        "selector": [
          ".cmp-parker-charcoal-theme.aem-GridColumn:has(> .image-box-container)"
        ],
        "style": "charcoal",
        "blocks": [],
        "defaultContent": [
          ".cmp-parker-charcoal-theme .image-box-container__title",
          ".cmp-parker-charcoal-theme .image-box-container__description p"
        ]
      },
      {
        "id": "parker-world-app",
        "name": "Parker World interactive app embed, grey",
        "selector": [
          ".aem-GridColumn:has(> .aem-container > div > .parker-embed-wrapper)"
        ],
        "style": "grey",
        "blocks": [
          "embed-app"
        ],
        "defaultContent": []
      },
      {
        "id": "why-parker",
        "name": "Why Parker CTA band, gold",
        "selector": [
          ".cmp-parker-yellow-theme.aem-GridColumn:has(> .image-box-container)"
        ],
        "style": "gold",
        "blocks": [
          "banner-cta"
        ],
        "defaultContent": []
      },
      {
        "id": "markets-tiles",
        "name": "Learn More about our Markets heading + 7-tile slider",
        "selector": [
          ".aem-GridColumn:has(> .aem-container > div > .parker-carousel)"
        ],
        "style": null,
        "blocks": [
          "cards-teaser"
        ],
        "defaultContent": [
          ".slider-carousel-container > h2"
        ]
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
  var import_interactive_library_default = {
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
  return __toCommonJS(import_interactive_library_exports);
})();
