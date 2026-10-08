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

  // import-support-landing.js
  var import_support_landing_exports = {};
  __export(import_support_landing_exports, {
    default: () => import_support_landing_default
  });

  // parsers/cards-contact.js
  var NBSP = /\u00a0/g;
  var clean = (s) => s.replace(NBSP, " ").replace(/\s+/g, " ").trim();
  var PHONE_RE = /^\+?[\d][\d\s().-]{6,}$/;
  function tidyPara(p) {
    p.querySelectorAll("span").forEach((s) => s.replaceWith(...s.childNodes));
    p.removeAttribute("class");
    p.querySelectorAll("a").forEach((a) => {
      a.removeAttribute("class");
      a.removeAttribute("target");
    });
    const walker = p.ownerDocument.createTreeWalker(
      p,
      4
      /* SHOW_TEXT */
    );
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach((t) => {
      t.textContent = t.textContent.replace(NBSP, " ").replace(/ {2,}/g, " ");
    });
    const isJunk = (n) => n && (n.nodeType === 3 && !n.textContent.trim() || n.nodeName === "BR");
    while (isJunk(p.lastChild)) p.lastChild.remove();
    while (isJunk(p.firstChild)) p.firstChild.remove();
    if (p.firstChild && p.firstChild.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^\s+/, "");
    if (p.lastChild && p.lastChild.nodeType === 3) p.lastChild.textContent = p.lastChild.textContent.replace(/\s+$/, "");
    return p;
  }
  function phonePara(document2, phoneEl) {
    const p = document2.createElement("p");
    const existing = phoneEl.querySelector('a[href^="tel:"]');
    if (existing) {
      existing.removeAttribute("class");
      p.append(existing);
      return p;
    }
    const text = clean(phoneEl.textContent);
    const a = document2.createElement("a");
    a.setAttribute("href", `tel:${text.replace(/[^\d+-]/g, "")}`);
    a.textContent = text;
    p.append(a);
    return p;
  }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  function isLandingContactGrid(element) {
    return element.matches(".MuiGrid-container") && !!element.querySelector('a[href^="tel:"]') && !element.querySelector("h2.hhr");
  }
  function linkPara(document2, href, text) {
    const p = document2.createElement("p");
    const a = document2.createElement("a");
    a.setAttribute("href", href);
    a.textContent = text;
    p.append(a);
    return p;
  }
  function parseLandingContactGrid(element, document2) {
    const cells = [];
    Array.from(element.children).filter((c) => c.matches(".MuiGrid-root")).forEach((item) => {
      const card = item.querySelector(":scope > div") || item;
      const regionEl = card.querySelector(":scope > div");
      const region = regionEl ? clean(regionEl.textContent) : "";
      let phone = null;
      let email = null;
      Array.from(card.querySelectorAll(":scope > a")).forEach((a) => {
        const text = clean(a.textContent);
        const href = (a.getAttribute("href") || "").trim();
        if (!text && !href) return;
        if (!email && (/^mailto:/i.test(href) || !href && EMAIL_RE.test(text))) {
          email = linkPara(document2, href || `mailto:${text}`, text || href.replace(/^mailto:/i, ""));
        } else if (!phone && (/^tel:/i.test(href) || !href && PHONE_RE.test(text))) {
          phone = linkPara(document2, href || `tel:${text.replace(/[^\d+-]/g, "")}`, text || href.replace(/^tel:/i, ""));
        }
      });
      if (!phone || !email) {
        const rest = clean(Array.from(card.childNodes).filter((n) => n !== regionEl && !(n.nodeType === 1 && n.matches("a[href]"))).map((n) => ` ${n.textContent} `).join(" "));
        const emailMatch = rest.match(/[^\s@]+@[^\s@]+\.[a-z]{2,}/i);
        if (!email && emailMatch) email = linkPara(document2, `mailto:${emailMatch[0]}`, emailMatch[0]);
        const phoneMatch = rest.replace(emailMatch ? emailMatch[0] : "", " ").match(/\+?\d[\d\s().-]{5,}\d/);
        if (!phone && phoneMatch) {
          const text = phoneMatch[0].trim();
          phone = linkPara(document2, `tel:${text.replace(/[^\d+-]/g, "")}`, text);
        }
      }
      if (!region && !phone && !email) return;
      const h3 = document2.createElement("h3");
      h3.textContent = region;
      cells.push([h3, phone || "", email || ""]);
    });
    return cells;
  }
  function parse(element, { document: document2 }) {
    if (isLandingContactGrid(element)) {
      const landingCells = parseLandingContactGrid(element, document2);
      if (landingCells.length === 0) {
        element.replaceWith(...element.childNodes);
        return;
      }
      element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "cards-contact (grid)", cells: landingCells }));
      return;
    }
    const groupHeadings = Array.from(element.querySelectorAll(":scope > h2.hhr"));
    const firstGroup = groupHeadings[0];
    const leading = Array.from(element.querySelectorAll(":scope > h1, :scope > h2:not(.hhr)")).filter((h) => !firstGroup || h.compareDocumentPosition(firstGroup) & 4).filter((h) => clean(h.textContent));
    const cells = [];
    groupHeadings.forEach((heading) => {
      const title = clean(heading.textContent);
      if (!title) return;
      const h3 = document2.createElement("h3");
      h3.textContent = title;
      const cols = [];
      let sib = heading.nextElementSibling;
      while (sib && !sib.matches("h2.hhr")) {
        if (sib.matches(".ph-content-section__info__cols, .row")) cols.push(...Array.from(sib.children));
        else cols.push(sib);
        sib = sib.nextElementSibling;
      }
      let phone = null;
      const details = [];
      cols.forEach((col) => {
        const phoneEl = col.matches("h2, h3") ? col : col.querySelector(":scope > h2, :scope > h3");
        if (!phone && phoneEl && PHONE_RE.test(clean(phoneEl.textContent))) {
          phone = phonePara(document2, phoneEl);
          return;
        }
        const paras = col.matches("p") ? [col] : Array.from(col.querySelectorAll("p"));
        if (paras.length) {
          paras.forEach((p) => {
            if (clean(p.textContent) || p.querySelector("a")) details.push(tidyPara(p));
          });
        } else if (clean(col.textContent) || col.querySelector("a")) {
          const p = document2.createElement("p");
          p.append(...col.childNodes);
          details.push(tidyPara(p));
        }
      });
      cells.push([h3, phone || "", details.length ? details : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-contact", cells });
    leading.forEach((h) => {
      const h2 = document2.createElement("h2");
      h2.textContent = clean(h.textContent);
      element.before(h2);
    });
    element.replaceWith(block);
  }

  // parsers/cards-news.js
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
  function parse2(element, { document: document2 }) {
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

  // parsers/cards-teaser.js
  var HELP_CARD = "a.ph-card-basic__link";
  var HELP_DESC_CLASS = "ph-card-basic__desc";
  try {
    if (typeof document !== "undefined" && document.querySelectorAll) {
      document.querySelectorAll(`${HELP_CARD} > span`).forEach((s) => s.classList.add(HELP_DESC_CLASS));
    }
  } catch (e) {
  }
  function isHelpCards(element) {
    return element.matches(HELP_CARD) || !!element.querySelector(HELP_CARD);
  }
  var cleanText = (s) => s.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  function parseHelpCards(element, document2) {
    const links = element.matches(HELP_CARD) ? [element] : Array.from(element.querySelectorAll(HELP_CARD));
    const cells = [];
    links.forEach((link) => {
      const descEl = link.querySelector(":scope > span");
      const title = cleanText(Array.from(link.childNodes).filter((n) => n !== descEl).map((n) => n.textContent).join(" "));
      const desc = descEl ? cleanText(descEl.textContent) : "";
      if (!title && !desc) return;
      const href = link.getAttribute("href");
      const h3 = document2.createElement("h3");
      if (href) {
        const a = document2.createElement("a");
        a.setAttribute("href", href);
        a.textContent = title || desc;
        h3.append(a);
      } else {
        h3.textContent = title || desc;
      }
      const cell = [h3];
      if (desc && title) {
        const p = document2.createElement("p");
        p.textContent = desc;
        cell.push(p);
      }
      cells.push([cell]);
    });
    return cells;
  }
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
  var LANDING_GRID = ".MuiGrid-container";
  var gridItems = (grid) => Array.from(grid.children).filter((c) => c.matches(".MuiGrid-root"));
  function isLandingTileGrid(element) {
    return element.matches(LANDING_GRID) && !!element.closest("section.tile_container") && gridItems(element).some((item) => item.querySelector(":scope > div > a[href]"));
  }
  function isLandingButtonCards(element) {
    return element.matches(LANDING_GRID) && !element.closest("section.tile_container") && gridItems(element).some((item) => item.querySelector(":scope > div > a.MuiLink-root[href]"));
  }
  function parseLandingTiles(element, document2) {
    const cells = [];
    gridItems(element).forEach((item) => {
      const link = item.querySelector(":scope > div > a[href]");
      if (!link) return;
      const title = cleanText(link.textContent);
      if (!title) return;
      const h3 = document2.createElement("h3");
      const a = document2.createElement("a");
      a.setAttribute("href", link.getAttribute("href"));
      a.textContent = title;
      h3.append(a);
      cells.push([[h3]]);
    });
    return cells;
  }
  function parseLandingButtonCards(element, document2) {
    const cells = [];
    gridItems(element).forEach((item) => {
      const card = item.querySelector(":scope > div");
      if (!card) return;
      const cta = card.querySelector(":scope > a.MuiLink-root[href]");
      const texts = Array.from(card.querySelectorAll(":scope > div")).map((d) => cleanText(d.textContent)).filter(Boolean);
      const [title, ...descs] = texts;
      if (!title && !cta) return;
      const cell = [];
      if (title) {
        const h3 = document2.createElement("h3");
        h3.textContent = title;
        cell.push(h3);
      }
      descs.forEach((d) => {
        const p = document2.createElement("p");
        p.textContent = d;
        cell.push(p);
      });
      if (cta && cleanText(cta.textContent)) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        const a = document2.createElement("a");
        a.setAttribute("href", cta.getAttribute("href"));
        a.textContent = cleanText(cta.textContent);
        strong.append(a);
        p.append(strong);
        cell.push(p);
      }
      cells.push([cell]);
    });
    return cells;
  }
  var PTS_PAGES = [
    "/us/en/industries/digital/pts.html",
    "/us/en/additional-information/asset-intelligence/asset-management.html"
  ];
  function pagePath(url, params) {
    const raw = params && params.originalURL || url || "";
    try {
      return new URL(raw).pathname;
    } catch (e) {
      return "";
    }
  }
  var TITLELINK = ".cmp-titlelink_container";
  function isIconFeatures(element) {
    return !!element.querySelector(TITLELINK) && !element.querySelector(".card") && !element.matches(".parker-carousel") && !element.querySelector(".parker-carousel");
  }
  function parseIconFeatures(element, document2) {
    const cells = [];
    Array.from(element.querySelectorAll(TITLELINK)).forEach((item) => {
      const icon = item.querySelector("img.cmp-titlelink_icons, img");
      const titleEl = item.querySelector(".cmp-titlelink_title, h1, h2, h3, h4, h5, h6");
      const title = titleEl ? cleanText(titleEl.textContent) : "";
      const scope = item.parentElement && item.parentElement.closest(".aem-container") || item.parentElement;
      const descs = scope ? Array.from(scope.querySelectorAll("p")).filter((p) => !item.contains(p) && cleanText(p.textContent)) : [];
      if (!icon && !title && descs.length === 0) return;
      const textCell = [];
      if (title) {
        const h3 = document2.createElement("h3");
        h3.textContent = title;
        textCell.push(h3);
      }
      descs.forEach((p) => {
        p.removeAttribute("style");
        textCell.push(p);
      });
      cells.push([icon || "", textCell.length ? textCell : ""]);
    });
    return cells;
  }
  function parse3(element, { document: document2, url, params }) {
    if (isIconFeatures(element)) {
      const iconCells = parseIconFeatures(element, document2);
      if (iconCells.length === 0) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const block2 = WebImporter.Blocks.createBlock(document2, { name: "cards-teaser (grid, icons)", cells: iconCells });
      element.replaceWith(block2);
      return;
    }
    if (!isHelpCards(element) && (isLandingTileGrid(element) || isLandingButtonCards(element))) {
      const tiles = isLandingTileGrid(element);
      const landingCells = tiles ? parseLandingTiles(element, document2) : parseLandingButtonCards(element, document2);
      if (landingCells.length === 0) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const name = tiles ? "cards-teaser (grid, text)" : "cards-teaser (text, buttons)";
      element.replaceWith(WebImporter.Blocks.createBlock(document2, { name, cells: landingCells }));
      return;
    }
    if (isHelpCards(element)) {
      const helpCells = parseHelpCards(element, document2);
      if (helpCells.length === 0) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const block2 = WebImporter.Blocks.createBlock(document2, { name: "cards-teaser (grid, text)", cells: helpCells });
      element.replaceWith(block2);
      return;
    }
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
    const gridName = PTS_PAGES.includes(pagePath(url, params)) ? "cards-teaser (grid, buttons)" : "cards-teaser (grid)";
    const block = grid ? WebImporter.Blocks.createBlock(document2, { name: gridName, cells }) : WebImporter.Blocks.createBlock(document2, { name: "cards-teaser", cells });
    if (sectionHeading) element.before(sectionHeading);
    element.replaceWith(block);
  }

  // transformers/parker-cleanup.js
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
  function retag2(el, tagName) {
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
      divs.forEach((div, i) => trimText(retag2(div, i === titleIndex ? "h2" : "p")));
      Array.from(jumbo.parentElement.children).filter((sib) => sib !== jumbo && isTextDiv(sib) && jumbo.compareDocumentPosition(sib) & 4).forEach((sib) => trimText(retag2(sib, "h3")));
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
        const p = retag2(span, "p");
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
      if (h1 !== titleH1) retag2(h1, "h2");
    });
    element.querySelectorAll("h3.ht, .jumbotron > h3").forEach((h3) => retag2(h3, "p"));
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
      const clean2 = content.replace(/<\/?p\b[^>]*>/gi, " ").replace(/\s+/g, " ").trim();
      if (clean2 !== content) m.setAttribute("content", clean2);
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
    element.querySelectorAll('h5#category-list-category-title, h5[data-testid="category-list-category-title"]').forEach((h5) => retag2(h5, "h2"));
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
    element.querySelectorAll('h1#category-products-title, h1[data-testid="category-products-title"]').forEach((h1) => retag2(h1, "h2"));
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

  // transformers/parker-sections.js
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

  // import-support-landing.js
  var parsers = {
    "cards-contact": parse,
    "cards-news": parse2,
    "cards-teaser": parse3
  };
  var PAGE_TEMPLATE = {
    "name": "support-landing",
    "representativeUrl": "https://help.parker.com/us/en/support",
    "description": "Help & Support landing page: topic tiles, contact cards, more-help links, search tools",
    "blocks": [
      {
        "name": "cards-teaser",
        "instances": [
          "main.ph-main > section.tile_container .MuiGrid-container",
          "main.ph-main .MuiGrid-container:has(a.MuiLink-root)"
        ]
      },
      {
        "name": "cards-contact",
        "instances": [
          'main.ph-main .MuiGrid-container:has(a[href^="tel:"])'
        ]
      },
      {
        "name": "cards-news",
        "instances": [
          "main.ph-main .ph-content-section ul:has(> li > a)"
        ]
      }
    ],
    "urlPattern": "/us/en/support",
    "urls": [
      "https://help.parker.com/us/en/support"
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
        "id": "help-topics",
        "name": "What can we help you with? - topic tiles",
        "selector": [
          "main.ph-main > section.ph-content-section.tile_container",
          "main.ph-main > section.tile_container"
        ],
        "style": null,
        "blocks": [
          "cards-teaser"
        ],
        "defaultContent": [
          "main.ph-main > section.tile_container .jumbotron > div:nth-child(1)",
          "main.ph-main > section.tile_container .jumbotron > div:nth-child(2)",
          "main.ph-main > section.tile_container .jumbotron > div:nth-child(3)"
        ]
      },
      {
        "id": "contact-information",
        "name": "Contact Information - contact tiles and More Contact Information cards",
        "selector": [
          'main.ph-main > div:has(a[href^="tel:"])',
          "main.ph-main > div:nth-of-type(1)"
        ],
        "style": null,
        "blocks": [
          "cards-contact",
          "cards-teaser"
        ],
        "defaultContent": [
          'main.ph-main > div:has(a[href^="tel:"]) .jumbotron > div:nth-child(1)',
          'main.ph-main > div:has(a[href^="tel:"]) .jumbotron > div:nth-child(2)',
          'main.ph-main > div:has(a[href^="tel:"]) .col-12 > div.css-1fx295f'
        ]
      },
      {
        "id": "more-help",
        "name": "More Help - category link list",
        "selector": [
          'main.ph-main > div:has(a[href*="/support/certificates-compliance"])',
          "main.ph-main > div:nth-of-type(2)"
        ],
        "style": null,
        "blocks": [
          "cards-news"
        ],
        "defaultContent": [
          "main.ph-main > div:nth-of-type(2) .jumbotron > div:nth-child(1)",
          "main.ph-main > div:nth-of-type(2) .jumbotron > div:nth-child(2)"
        ]
      },
      {
        "id": "part-documents",
        "name": "Part Documents | Advanced Search",
        "selector": [
          "main.ph-main > div:has(.parts-doc-search)",
          "main.ph-main > div:nth-of-type(3)"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".parts-doc-search .jumbotron > div:nth-child(1)",
          ".parts-doc-search .jumbotron > div:nth-child(2)",
          ".parts-doc-search .col-md-5 > ul",
          ".parts-doc-search form.ph-form"
        ]
      },
      {
        "id": "cross-reference",
        "name": "Cross Reference",
        "selector": [
          "main.ph-main > div:nth-of-type(4)",
          "main.ph-main > div:last-of-type"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          "main.ph-main > div:last-of-type .jumbotron > div:nth-child(1)",
          "main.ph-main > div:last-of-type .jumbotron > div:nth-child(2)",
          "main.ph-main > div:last-of-type form.ph-form"
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
  var import_support_landing_default = {
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
  return __toCommonJS(import_support_landing_exports);
})();
