/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import bannerCtaParser from './parsers/banner-cta.js';
import cardsTeaserParser from './parsers/cards-teaser.js';
import embedAppParser from './parsers/embed-app.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/parker-cleanup.js';
import sectionsTransformer from './transformers/parker-sections.js';

// PARSER REGISTRY
const parsers = {
  'banner-cta': bannerCtaParser,
  'cards-teaser': cardsTeaserParser,
  'embed-app': embedAppParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "interactive-library",
  "description": "Interactive Library pages (/us/en/markets/interactive-library/*): grey title band (H1), charcoal text-only intro band (H2 + 3 paragraphs, default content), grey band holding the full-width embedded external app (embed-app: one cell with the iframe src link https://parkerworld.parker.com/; the expand button, inline <style> and &nbsp; spacer text components in the same grid column are dropped), gold \"Why Parker\" CTA band (banner-cta; source class cmp-parker-yellow-theme, not cmp-parker-gold-theme), and an unstyled \"Learn More about our Markets\" H2 + 7-tile slider (plain cards-teaser, NOT the grid option; skip .slick-cloned slides). Breadcrumb and the empty grid column after the embed are removed by cleanup and get no section. Sections use the positional strategy (template not in THEME_SECTION_TEMPLATES).",
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
