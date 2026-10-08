/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsCategoryParser from './parsers/cards-category.js';
import columnsMediaParser from './parsers/columns-media.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/parker-cleanup.js';
import sectionsTransformer from './transformers/parker-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-category': cardsCategoryParser,
  'columns-media': columnsMediaParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "product-category",
  "representativeUrl": "https://ph.parker.com/us/en/category/hose-piping-and-tubing",
  "description": "Product category landing pages (ph.parker.com/us/en/category/*): category intro + subcategory tiles; left category nav + faceted filters",
  "blocks": [
    {
      "name": "columns-media",
      "instances": [
        "#category-list-details-description-container",
        "[data-testid=\"category-list-details-description-container\"]"
      ]
    },
    {
      "name": "cards-category",
      "instances": [
        "#category-list-category-items",
        "ul[data-testid=\"category-list-category-items\"]"
      ]
    }
  ],
  "urlPattern": "/us/en/category/*",
  "urls": [
    "https://ph.parker.com/us/en/category/adhesives-coatings-and-encapsulants",
    "https://ph.parker.com/us/en/category/aerospace-systems-and-technologies",
    "https://ph.parker.com/us/en/category/air-preparation-frl-and-dryers",
    "https://ph.parker.com/us/en/category/bioprocessing-and-medical-technologies",
    "https://ph.parker.com/us/en/category/cylinders-and-actuators",
    "https://ph.parker.com/us/en/category/emi-shielding",
    "https://ph.parker.com/us/en/category/filters-collectors-separators-purifiers",
    "https://ph.parker.com/us/en/category/fittings-and-quick-couplings",
    "https://ph.parker.com/us/en/category/gas-generators",
    "https://ph.parker.com/us/en/category/hose-piping-and-tubing",
    "https://ph.parker.com/us/en/category/motors-drives-and-controllers",
    "https://ph.parker.com/us/en/category/mounting-and-vibration-control",
    "https://ph.parker.com/us/en/category/power-take-offs-and-drive-systems",
    "https://ph.parker.com/us/en/category/pumps",
    "https://ph.parker.com/us/en/category/refrigeration-and-air-conditioning",
    "https://ph.parker.com/us/en/category/regulators-monitors-sensors-and-flow-control",
    "https://ph.parker.com/us/en/category/seals-and-o-rings",
    "https://ph.parker.com/us/en/category/thermal-and-power-management",
    "https://ph.parker.com/us/en/category/valves"
  ],
  "sections": [
    {
      "id": "category-main",
      "name": "Category intro (H1 + image/paragraph) and subcategory tiles",
      "selector": [
        "div.product-module__NxU_wa__gridSpacingLeft",
        "[class*=\"__gridSpacingLeft\"]",
        "div:has(> #category-list-details-root)"
      ],
      "style": null,
      "blocks": [
        "columns-media",
        "cards-category"
      ],
      "defaultContent": [
        "#category-list-details-title",
        "#category-list-category-title"
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
