/* eslint-disable */
/* global WebImporter */
// Import script for template "support-landing" (https://help.parker.com/us/en/support).
// Same structure/transformers as import-support-topic.js.

// PARSER IMPORTS
import cardsContactParser from './parsers/cards-contact.js';
import cardsNewsParser from './parsers/cards-news.js';
import cardsTeaserParser from './parsers/cards-teaser.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/parker-cleanup.js';
import sectionsTransformer from './transformers/parker-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-contact': cardsContactParser,
  'cards-news': cardsNewsParser,
  'cards-teaser': cardsTeaserParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
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
        "main.ph-main .MuiGrid-container:has(a[href^=\"tel:\"])"
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
        "main.ph-main > div:has(a[href^=\"tel:\"])",
        "main.ph-main > div:nth-of-type(1)"
      ],
      "style": null,
      "blocks": [
        "cards-contact",
        "cards-teaser"
      ],
      "defaultContent": [
        "main.ph-main > div:has(a[href^=\"tel:\"]) .jumbotron > div:nth-child(1)",
        "main.ph-main > div:has(a[href^=\"tel:\"]) .jumbotron > div:nth-child(2)",
        "main.ph-main > div:has(a[href^=\"tel:\"]) .col-12 > div.css-1fx295f"
      ]
    },
    {
      "id": "more-help",
      "name": "More Help - category link list",
      "selector": [
        "main.ph-main > div:has(a[href*=\"/support/certificates-compliance\"])",
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

// TRANSFORMER REGISTRY - cleanup runs first, section transformer after
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector for "${blockDef.name}": ${selector}`);
        return;
      }
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return; // avoid double-mapping the same element
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path; map root URL to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
