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

  // tools/importer/import-blog-home.js
  var import_blog_home_exports = {};
  __export(import_blog_home_exports, {
    default: () => import_blog_home_default
  });

  // tools/importer/parsers/cards-blog.js
  function parse(element, { document: document2 }) {
    let items = [...element.querySelectorAll("div.MuiCard-root.blog-post")];
    if (!items.length) items = [...element.querySelectorAll(".blog-post")];
    const text = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
    const cells = [];
    items.forEach((item) => {
      const authorWrap = item.querySelector(".blog-post-author");
      const spans = authorWrap ? [...authorWrap.querySelectorAll(":scope > span")] : [];
      let author = text(spans[0]);
      let date = text(spans[1]);
      if (!spans.length && authorWrap) {
        const meta = text(authorWrap);
        const m = meta.match(/^(.*?)\s*([A-Z][a-z]{2,8}\.? \d{1,2}, \d{4})$/);
        author = m ? m[1] : meta;
        date = m ? m[2] : "";
      }
      const titleEl = item.querySelector("h2.blog-post-title, .blog-post-title, h2, h3");
      const img = item.querySelector("img.blog-post-img, img");
      const descEl = item.querySelector("span.blog-post-description, .blog-post-description");
      const linkEl = item.querySelector("a.blog-post-read-btn, .blog-post-actions a, a[href]");
      const title = text(titleEl);
      if (!title && !linkEl) return;
      let imageCell = "";
      if (img) {
        const image = document2.createElement("img");
        image.src = img.getAttribute("src");
        image.alt = img.getAttribute("alt") || img.getAttribute("title") || title;
        imageCell = image;
      }
      const body = [];
      if (author || date) {
        const meta = document2.createElement("p");
        if (author) meta.append(author);
        if (author && date) meta.append(document2.createElement("br"));
        if (date) meta.append(date);
        body.push(meta);
      }
      if (title) {
        const h2 = document2.createElement("h2");
        h2.textContent = title;
        body.push(h2);
      }
      const desc = text(descEl);
      if (desc) {
        const p = document2.createElement("p");
        p.textContent = desc;
        body.push(p);
      }
      if (linkEl) {
        const a = document2.createElement("a");
        a.href = linkEl.getAttribute("href");
        a.textContent = text(linkEl) || "Read Blog";
        const p = document2.createElement("p");
        p.append(a);
        body.push(p);
      }
      cells.push([imageCell, body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-blog", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/search-blog.js
  var QUERY_INDEX = "/us/en/query-index.json";
  function parse2(element, { document: document2 }) {
    const field = element.querySelector("input.blog-search-input, .cmp-parker-blog-search-field input, input");
    if (!field) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const link = document2.createElement("a");
    link.href = QUERY_INDEX;
    link.textContent = QUERY_INDEX;
    const p = document2.createElement("p");
    p.append(link);
    const cells = [[p]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "search-blog", cells });
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
    const product = isProductPage(payload);
    if (product && hookName === H.before) productBefore(element, payload);
    if (product && hookName === H.before && isProductLandingPage(payload)) productLandingBefore(element);
    if (product && hookName === H.after && isProductLandingPage(payload)) productLandingAfter(element);
    if (product && hookName === H.after) productAfter(element);
    const pts = isPtsPage(payload);
    if (pts && hookName === H.before) ptsBefore(element);
    if (pts && hookName === H.after) ptsAfter(element);
    const blog = isBlogPage(payload);
    if (blog && hookName === H.before) blogBefore(element, payload);
    if (blog && hookName === H.after) blogAfter(element, payload);
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
      if (blog) blogTrailingSections(element);
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
  var PH_ORIGIN = "https://ph.parker.com";
  function isProductPage(payload) {
    const url = pageUrl(payload);
    if (url && url.hostname === "ph.parker.com") return true;
    const name = payload && payload.template && payload.template.name;
    return typeof name === "string" && name.startsWith("product");
  }
  function productMetadata(doc, payload) {
    doc.querySelectorAll([
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="og:description"]',
      'meta[name="twitter:description"]',
      'meta[property="twitter:description"]',
      'meta[itemprop="description"]'
    ].join(", ")).forEach((m) => {
      const content = m.getAttribute("content");
      if (content == null) return;
      const clean = content.replace(/<\/?p\b[^>]*>/gi, " ").replace(/\s+/g, " ").trim();
      if (clean !== content) m.setAttribute("content", clean);
    });
    const seen = /* @__PURE__ */ new Set();
    doc.querySelectorAll("meta[name], meta[property], meta[itemprop]").forEach((m) => {
      const key = ["name", "property", "itemprop"].map((a) => m.getAttribute(a) || "").join("|");
      const id = `${key}=${m.getAttribute("content")}`;
      if (seen.has(id)) m.remove();
      else seen.add(id);
    });
    const page = pageUrl(payload);
    doc.querySelectorAll('meta[property="og:url"], meta[name="og:url"]').forEach((m) => {
      const content = m.getAttribute("content") || "";
      let ok = false;
      try {
        const u = new URL(content);
        ok = /^https?:$/.test(u.protocol) && !/undefined|null/i.test(content) && (!page || u.hostname === page.hostname);
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
      ".MuiGrid-item:has(#category-left-block)",
      "#category-left-block",
      // SPA shells / loaders / hidden debug payloads
      "#modal-root",
      "#globalLoader",
      // hidden (visibility:hidden; height:0) div holding ~270KB of raw API JSON
      '.phCommerceContent > div[style*="visibility: hidden"]',
      "pre.custom-headers",
      "next-route-announcer",
      "#transcend-consent-manager",
      "div[hidden]",
      "style",
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
      'body > div[style*="display: none"]'
    ]);
  }
  function productAfter(element) {
    element.querySelectorAll('h5#category-list-category-title, h5[data-testid="category-list-category-title"]').forEach((h5) => retag(h5, "h2"));
    element.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach(trimText);
  }
  var PRODUCT_LANDING_PATH = "/us/en/category";
  function isProductLandingPage(payload) {
    const url = pageUrl(payload);
    if (url) return url.hostname === "ph.parker.com" && url.pathname.replace(/\/+$/, "") === PRODUCT_LANDING_PATH;
    return !!(payload && payload.template && payload.template.name === "product-landing");
  }
  function productLandingBefore(element) {
    WebImporter.DOMUtils.remove(element, [
      "#non-mobile-category-left-column",
      "#non-mobile-category-breadcrumb"
    ]);
  }
  function productLandingAfter(element) {
    const doc = element.ownerDocument;
    element.querySelectorAll('h1#category-products-title, h1[data-testid="category-products-title"]').forEach((h1) => retag(h1, "h2"));
    element.querySelectorAll('[id^="category-products-category-"][id$="-header"]').forEach((header) => {
      const link = header.querySelector("a[href]");
      const text = (link || header).textContent.replace(/\s+/g, " ").trim();
      if (!text) {
        header.remove();
        return;
      }
      const h3 = doc.createElement("h3");
      if (link) {
        const a = doc.createElement("a");
        a.setAttribute("href", link.getAttribute("href"));
        a.textContent = text;
        h3.append(a);
      } else {
        h3.textContent = text;
      }
      header.replaceWith(h3);
    });
  }
  var PTS_PATHS = /* @__PURE__ */ new Set([
    "/us/en/industries/digital/pts.html",
    "/us/en/additional-information/asset-intelligence/asset-management.html"
  ]);
  function isPtsPage(payload) {
    const url = pageUrl(payload);
    if (url) return url.hostname === "www.parker.com" && PTS_PATHS.has(url.pathname);
    return !!(payload && payload.template && payload.template.name === "pts");
  }
  function ptsBefore(element) {
    WebImporter.DOMUtils.remove(element, [
      ".s7dm-dynamic-media",
      ".s7dm-interactive-media",
      ".interactivemedia",
      ".dynamicmedia",
      '[data-asset-type="interactivemedia"]',
      // Slider/video chrome: play-button overlays (data: SVG <img>), slick arrows and dots
      ".play-arrow-icon-container",
      ".parker-carousel .slick-arrow",
      ".parker-carousel .slick-dots"
    ]);
    const fileOf = (u) => {
      const path = u.split("?")[0];
      return path.substring(path.lastIndexOf("/") + 1);
    };
    element.querySelectorAll(".image-box-container picture > img[src]").forEach((img) => {
      const src = img.getAttribute("src");
      if (src.includes("?")) return;
      const sources = img.parentElement.querySelectorAll(":scope > source[srcset]");
      const last = sources[sources.length - 1];
      const candidate = last ? last.getAttribute("srcset").trim() : "";
      if (!candidate || /\s/.test(candidate)) return;
      if (fileOf(candidate) !== fileOf(src)) return;
      img.setAttribute("src", candidate.startsWith("/") ? `${SOURCE_ORIGIN}${candidate}` : candidate);
    });
    const title = element.querySelector(".cmp-title");
    const grid = title && title.closest(".aem-Grid");
    if (grid) {
      [...grid.children].forEach((col) => {
        if (col.classList.contains("aem-GridColumn") && isEmptyColumn(col)) col.remove();
      });
    }
  }
  function ptsAfter(element) {
    element.querySelectorAll(".image-box-container__description p").forEach((p) => {
      let first = p.firstChild;
      while (first && (first.nodeType === 3 && !first.textContent.replace(/\u00a0/g, " ").trim() || first.nodeType === 1 && first.tagName === "BR")) {
        first.remove();
        first = p.firstChild;
      }
    });
  }
  var BLOG_ORIGIN = "https://blog.parker.com";
  var BLOG_PATH_MAP = /* @__PURE__ */ new Map([
    ["/us/en/home", "/us/en/blog"]
  ]);
  function isBlogPage(payload) {
    const url = pageUrl(payload);
    if (url && url.hostname === "blog.parker.com") return true;
    const name = payload && payload.template && payload.template.name;
    return typeof name === "string" && name.startsWith("blog");
  }
  var BLOG_TITLE_MAP = /* @__PURE__ */ new Map([
    ["/us/en/home", "Blog"]
  ]);
  function blogBefore(element, payload) {
    WebImporter.DOMUtils.remove(element, [
      ".cmp-blog-recent-blogs .MuiGrid-root:has(> .blog-show-more)",
      ".blog-show-more",
      "button#scroll-to-top"
    ]);
    const doc = element.ownerDocument;
    const page = pageUrl(payload);
    const sourcePath = page ? page.pathname.replace(/\.html$/, "").replace(/\/$/, "") : "";
    const title = BLOG_TITLE_MAP.get(sourcePath);
    if (title) {
      let titleEl = doc.querySelector("title");
      if (!titleEl) {
        titleEl = doc.createElement("title");
        doc.head.append(titleEl);
      }
      titleEl.textContent = title;
      doc.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach((meta) => {
        meta.setAttribute("content", title);
      });
    }
    element.ownerDocument.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach((meta) => {
      try {
        if (new URL(meta.content).pathname.replace(/\/$/, "") === "") meta.remove();
      } catch (e) {
        meta.remove();
      }
    });
  }
  function blogAfter(element, payload) {
    WebImporter.DOMUtils.remove(element, [
      "header#header.pb-header-main",
      "#pb-footer"
    ]);
    const page = pageUrl(payload);
    const base = page && page.hostname === "blog.parker.com" ? page : new URL(`${BLOG_ORIGIN}/`);
    element.querySelectorAll("a[href]").forEach((a) => {
      const href = (a.getAttribute("href") || "").trim();
      const isBlogAbsolute = /^https?:\/\/blog\.parker\.com(\/|$)/i.test(href);
      const isOtherScheme = /^[a-z][a-z0-9+.-]*:/i.test(href);
      if (!href || href.startsWith("#") || isOtherScheme && !isBlogAbsolute) return;
      let url;
      try {
        url = new URL(href, base);
      } catch (e) {
        return;
      }
      if (url.origin !== BLOG_ORIGIN) return;
      const path = url.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";
      const migrated = BLOG_PATH_MAP.get(path);
      if (/\.json$/.test(url.pathname)) {
        a.setAttribute("href", url.pathname);
        a.setAttribute(KEEP_HREF_ATTR, "");
        return;
      }
      a.setAttribute("href", migrated ? `${migrated}${url.hash}` : url.href);
    });
  }
  function blogTrailingSections(element) {
    const hrs = [...element.querySelectorAll("hr")].reverse();
    for (const hr of hrs) {
      const range = element.ownerDocument.createRange();
      range.setStartAfter(hr);
      range.setEndAfter(element.lastChild || element);
      const rest = range.cloneContents();
      rest.querySelectorAll("style, script, noscript, link").forEach((el) => el.remove());
      const hasContent = rest.textContent.trim() !== "" || !!rest.querySelector(MEDIA_SELECTOR);
      if (hasContent) break;
      hr.remove();
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
    "/us/en/support/master-directory/global-offices",
    // Products (ph.parker.com): category landing (template product-landing), the 19
    // category pages (template product-category) and the PTS page (template pts).
    // Matching is exact-path (Set lookup), so L3 /us/en/category/<cat>/<sub> pages
    // and /us/en/series/* tile targets stay absolute ph.parker.com URLs.
    "/us/en/category",
    "/us/en/category/adhesives-coatings-and-encapsulants",
    "/us/en/category/aerospace-systems-and-technologies",
    "/us/en/category/air-preparation-frl-and-dryers",
    "/us/en/category/bioprocessing-and-medical-technologies",
    "/us/en/category/cylinders-and-actuators",
    "/us/en/category/emi-shielding",
    "/us/en/category/filters-collectors-separators-purifiers",
    "/us/en/category/fittings-and-quick-couplings",
    "/us/en/category/gas-generators",
    "/us/en/category/hose-piping-and-tubing",
    "/us/en/category/motors-drives-and-controllers",
    "/us/en/category/mounting-and-vibration-control",
    "/us/en/category/power-take-offs-and-drive-systems",
    "/us/en/category/pumps",
    "/us/en/category/refrigeration-and-air-conditioning",
    "/us/en/category/regulators-monitors-sensors-and-flow-control",
    "/us/en/category/seals-and-o-rings",
    "/us/en/category/thermal-and-power-management",
    "/us/en/category/valves",
    "/us/en/industries/digital/pts"
  ]);
  var SOURCE_ORIGIN = "https://www.parker.com";
  var SOURCE_ORIGINS = /* @__PURE__ */ new Set([SOURCE_ORIGIN, HELP_ORIGIN, PH_ORIGIN]);
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

  // tools/importer/import-blog-home.js
  var parsers = {
    "cards-blog": parse,
    "search-blog": parse2
  };
  var PAGE_TEMPLATE = {
    "name": "blog-home",
    "description": "Parker blog homepage (blog.parker.com), imported to /us/en/blog",
    "urls": [
      "https://blog.parker.com/us/en/home.html"
    ],
    "blocks": [
      {
        "name": "search-blog",
        "instances": [
          ".cmp-parker-blog-search"
        ]
      },
      {
        "name": "cards-blog",
        "instances": [
          ".cmp-blog-recent-blogs"
        ]
      }
    ],
    "sections": [
      {
        "id": "rc1",
        "name": "Blog landing (search + recent posts grid)",
        "selector": [
          ".aem-container:has(.cmp-blog-recent-blogs)"
        ],
        "style": "light-grey",
        "blocks": [
          "search-blog",
          "cards-blog"
        ],
        "defaultContent": []
      },
      {
        "id": "rc2",
        "name": "Empty wrapper",
        "selector": [
          "#spa-root > div > div:nth-of-type(1) > div:nth-of-type(2)"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "rc3",
        "name": "Empty wrapper",
        "selector": [
          "#spa-root > div > div:nth-of-type(2)"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      }
    ]
  };
  var PATH_OVERRIDES = {
    "/us/en/home": "/us/en/blog"
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
  var import_blog_home_default = {
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
      const targetPath = PATH_OVERRIDES[rawPath] || rawPath;
      const path = WebImporter.FileUtils.sanitizePath(targetPath === "" ? "/index" : targetPath);
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
  return __toCommonJS(import_blog_home_exports);
})();
