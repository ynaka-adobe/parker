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

  // tools/importer/import-master-directory.js
  var import_master_directory_exports = {};
  __export(import_master_directory_exports, {
    default: () => import_master_directory_default
  });

  // tools/importer/parsers/embed-app.js
  function parse(element, { document: document2 }) {
    const launchLink = element.matches(".excat-md-app") ? element.querySelector("a[href]") : null;
    if (launchLink) {
      const cells2 = [[launchLink]];
      const block2 = WebImporter.Blocks.createBlock(document2, { name: "embed-app (launch)", cells: cells2 });
      element.replaceWith(block2);
      return;
    }
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

  // tools/importer/import-master-directory.js
  var parsers = {
    "embed-app": parse
  };
  var PAGE_TEMPLATE = {
    "name": "master-directory",
    "description": "Help & Support Master Directory (Global Sales Offices): live, data-driven directory app; imported as title band + embed-app (launch) block linking to the live directory",
    "urls": [
      "https://help.parker.com/us/en/support/master-directory/global-offices"
    ],
    "blocks": [
      {
        "name": "embed-app",
        "instances": [
          ".excat-md-app"
        ]
      }
    ],
    "sections": [
      {
        "id": "title-bar",
        "name": "Page title band",
        "selector": [
          ".main-wrapper > .container-fluid:has(> .ph-header-main__title)",
          ".ph-header-main__title"
        ],
        "style": "grey",
        "blocks": [],
        "defaultContent": [
          ".ph-header-main__title h1"
        ]
      },
      {
        "id": "directory",
        "name": "directory",
        "selector": [
          "main.ph-main"
        ],
        "style": null,
        "blocks": [
          "embed-app"
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
  var import_master_directory_default = {
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
  return __toCommonJS(import_master_directory_exports);
})();
