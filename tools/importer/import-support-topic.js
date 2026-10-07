/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsContactParser from './parsers/cards-contact.js';
import cardsNewsParser from './parsers/cards-news.js';
import cardsTeaserParser from './parsers/cards-teaser.js';
import columnsContactParser from './parsers/columns-contact.js';
import columnsMediaParser from './parsers/columns-media.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/parker-cleanup.js';
import sectionsTransformer from './transformers/parker-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-contact': cardsContactParser,
  'cards-news': cardsNewsParser,
  'cards-teaser': cardsTeaserParser,
  'columns-contact': columnsContactParser,
  'columns-media': columnsMediaParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "support-topic",
  "description": "Help & Support topic (decision-tree) pages: title band, question heading + intro, option cards, optional image+text, category link lists, contact listings, Still Lost / General Help link",
  "urls": [
    "https://help.parker.com/us/en/support/billing-shipping",
    "https://help.parker.com/us/en/support/cad-files",
    "https://help.parker.com/us/en/support/catalog-part-manuals",
    "https://help.parker.com/us/en/support/cbc-report",
    "https://help.parker.com/us/en/support/certificates-compliance",
    "https://help.parker.com/us/en/support/contact-information",
    "https://help.parker.com/us/en/support/cross-reference",
    "https://help.parker.com/us/en/support/ethics-integrity",
    "https://help.parker.com/us/en/support/find-a-part/18605",
    "https://help.parker.com/us/en/support/general-help",
    "https://help.parker.com/us/en/support/hr-benefits",
    "https://help.parker.com/us/en/support/installation-maintenance",
    "https://help.parker.com/us/en/support/investors",
    "https://help.parker.com/us/en/support/optimization",
    "https://help.parker.com/us/en/support/order-status",
    "https://help.parker.com/us/en/support/part-configuration/configurator-help",
    "https://help.parker.com/us/en/support/part-information/18605",
    "https://help.parker.com/us/en/support/place-an-order",
    "https://help.parker.com/us/en/support/price-quote",
    "https://help.parker.com/us/en/support/repairs",
    "https://help.parker.com/us/en/support/replacement",
    "https://help.parker.com/us/en/support/software",
    "https://help.parker.com/us/en/support/training-tutorials"
  ],
  "blocks": [
    {
      "name": "cards-teaser",
      "instances": [
        ".MuiGrid-container:has(.ph-card-basic__link):not(.MuiGrid-container .MuiGrid-container)",
        ".ph-grid-2:has(.ph-card-basic__link)",
        ".jumbotron > a.ph-card-basic__link",
        ".jumbotron + div > a.ph-card-basic__link"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        ".row.rowValign"
      ]
    },
    {
      "name": "cards-news",
      "instances": [
        "ul.ph-grid-3"
      ]
    },
    {
      "name": "cards-contact",
      "instances": [
        ".ph-content-section__info:has(> h2.hhr)"
      ]
    },
    {
      "name": "columns-contact",
      "instances": [
        ".row:has(> .ph-content-section__topic + .ph-content-section__info)"
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
      "id": "topic-content",
      "name": "Question heading + intro, option cards, image+text, category list or contact content",
      "selector": [
        "main.ph-main"
      ],
      "style": null,
      "blocks": [
        "cards-teaser",
        "columns-media",
        "cards-news",
        "cards-contact",
        "columns-contact"
      ],
      "defaultContent": [
        ".jumbotron > h1",
        ".jumbotron > h2",
        ".jumbotron > h3",
        ".jumbotron > p",
        ".ph-content-section__info > h1",
        "main.ph-main h1.py-5",
        "main.ph-main .text-center > a[href^=\"mailto:\"]",
        "main.ph-main h4",
        ".help-container .text-center > img",
        "form.ph-form"
      ]
    },
    {
      "id": "help-nav",
      "name": "Return to Help & Support button / Still Lost - General Help link",
      "selector": [
        "main.ph-main > section.ph-content-section:has(.ph-content-nav__history)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".ph-content-nav__history a[href=\"/us/en/support\"]",
        ".ph-content-nav__history a[href*=\"general-help\"] h5",
        ".ph-content-nav__history a[href*=\"general-help\"] h3"
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
