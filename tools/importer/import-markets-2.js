/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsTeaserParser from './parsers/cards-teaser.js';
import carouselHeroParser from './parsers/carousel-hero.js';
import columnsMediaParser from './parsers/columns-media.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/parker-cleanup.js';
import sectionsTransformer from './transformers/parker-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-teaser': cardsTeaserParser,
  'carousel-hero': carouselHeroParser,
  'columns-media': columnsMediaParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "markets-2",
  "description": "Markets landing page (/us/en/markets.html): grey title band (H1), 8-slide full-bleed hero carousel (carousel-hero, one row per .cmp-carousel__item), gold Parker World text+photo band (columns-media full-bleed), grey \"Key Trends\" heading band + intro paragraph + 4 trend tiles, grey \"Key Markets\" heading band + intro paragraph + 6 market tiles, grey \"Additional Markets\" heading band + 2 market tiles (all tile groups = cards-teaser with OPTION \"grid\": emit \"cards-teaser (grid)\" for every cards-teaser instance on this template), charcoal \"Browse Parker Products Through Our Interactives\" band (columns-media, default/inset look). columns-media OPTION \"full-bleed\": add it ONLY for the gold Parker World band (grid column .cmp-parker-yellow-theme, matched by the first columns-media instance selector); the charcoal interactives band (.cmp-parker-charcoal-theme.cmp-parker-secondary-img-box-theme) has an inset tablet image and must stay plain \"columns-media\" here, unlike the markets template where cmp-parker-secondary-img-box-theme implies full-bleed. The Additional Markets heading and its tiles share one grid column: the heading is the grey section, the inner .layout-col-4 tile row starts a new unstyled section. Dropped by cleanup: hidden mobile-only teaser (.aem-GridColumn--default--hide) and the empty spacer text column; neither gets a section. Card headings are h4 in source (author as h3); hidden .card-details published dates are not authored.",
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
