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
  function parse3(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(".cmp-news-v2-component__list"));
    const cells = [];
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
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-news", cells });
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
  function parse5(element, { document: document2 }) {
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
    const cells = [];
    cells.push([textCell, mediaCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-media", cells });
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
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        ".parker-comchatskill",
        "#db-sync",
        "#embeddedMessagingSiteContextFrame"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "#parker_h_f_header_root",
        "#parker_h_f_footer_wrapper",
        "#h1tagheader",
        "nav#parker_h_f_sub_item",
        "iframe",
        "script"
      ]);
    }
  }

  // tools/importer/transformers/parker-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
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
