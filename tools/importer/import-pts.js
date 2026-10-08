/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsTeaserParser from './parsers/cards-teaser.js';
import cardsVideoParser from './parsers/cards-video.js';
import carouselMediaParser from './parsers/carousel-media.js';
import columnsMediaParser from './parsers/columns-media.js';
import heroBannerParser from './parsers/hero-banner.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/parker-cleanup.js';
import sectionsTransformer from './transformers/parker-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-teaser': cardsTeaserParser,
  'cards-video': cardsVideoParser,
  'carousel-media': carouselMediaParser,
  'columns-media': columnsMediaParser,
  'hero-banner': heroBannerParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (template "pts")
const PAGE_TEMPLATE = {
  "name": "pts",
  "description": "PTS / Asset Management page (www.parker.com/us/en/industries/digital/pts.html, an alias of /us/en/additional-information/asset-intelligence/asset-management): grey title band (H1), full-bleed hero with PTS 3.0 logo (hero-banner), PTS 3.0 Update slider on grey panels (carousel-media panel, 7 slides), gold text + video band (columns-media; MP4 from the page model), mobile-app FAQ slider (carousel-media, 12 slides), 8 feature icons (cards-teaser grid, icons), gold Get Started band (columns-media, source 1-cell table unwrapped), Tagging band (columns-media), grey Success Stories slider (cards-teaser), Videos (cards-video, 3 MP4 tiles from the page model), grey Resources (cards-teaser grid, buttons). All selectors are page-specific: the markets '.parker-carousel' cards-teaser selector would also catch the image/video sliders here. Breadcrumb is removed in cleanup and gets no section break; .slick-cloned slides are skipped.",
  "urls": [
    "https://www.parker.com/us/en/industries/digital/pts.html"
  ],
  "blocks": [
    {
      "name": "hero-banner",
      "instances": [
        ".left-to-right-gradient.aem-GridColumn"
      ]
    },
    {
      "name": "carousel-media",
      "instances": [
        ".parker-carousel:has(.slick-slide .image-box-container)"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        ".cmp-parker-yellow-theme.aem-GridColumn:has(> .image-box-container .img-container #thumnail-image)",
        ".cmp-parker-yellow-theme.aem-GridColumn:has(> .image-box-container table)",
        ".aem-GridColumn:not(.cmp-parker-yellow-theme):has(> .image-box-container .image-wrapper)"
      ]
    },
    {
      "name": "cards-teaser",
      "instances": [
        ".layout-col-4.aem-GridColumn:has(.cmp-titlelink_container)",
        ".grey-bg.aem-GridColumn .parker-carousel:has(.cmp-parker-card-container .card)",
        ".grey-bg.aem-GridColumn .layout-col-4:has(.cmp-parker-card-container .card)"
      ]
    },
    {
      "name": "cards-video",
      "instances": [
        ".parker-carousel:has(.cmp-watchnowvideo__parkerdivision)"
      ]
    }
  ],
  "sections": [
    {
      "id": "title-bar",
      "name": "Page title band (H1 Asset Management)",
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
      "id": "hero",
      "name": "PTS 3.0 hero (logo, heading, text)",
      "selector": [
        ".left-to-right-gradient.aem-GridColumn"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "pts-updates-carousel",
      "name": "PTS 3.0 Update slider (grey panels, 7 slides)",
      "selector": [
        ".aem-GridColumn:has(> .aem-container > div > .parker-carousel .slick-slide .grey-bg > .image-box-container)"
      ],
      "style": null,
      "blocks": [
        "carousel-media"
      ],
      "defaultContent": []
    },
    {
      "id": "simple-asset-management-tool",
      "name": "Gold text + video band",
      "selector": [
        ".cmp-parker-yellow-theme.aem-GridColumn:has(> .image-box-container .img-container #thumnail-image)"
      ],
      "style": "gold",
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "mobile-faq-carousel",
      "name": "Mobile app FAQ slider (12 slides)",
      "selector": [
        ".aem-GridColumn:has(> .aem-container > div > .parker-carousel .slick-slide .image-box-container):not(:has(.grey-bg > .image-box-container))"
      ],
      "style": null,
      "blocks": [
        "carousel-media"
      ],
      "defaultContent": []
    },
    {
      "id": "feature-icons",
      "name": "8 feature icons",
      "selector": [
        ".layout-col-4.aem-GridColumn:has(.cmp-titlelink_container)"
      ],
      "style": null,
      "blocks": [
        "cards-teaser"
      ],
      "defaultContent": []
    },
    {
      "id": "get-started",
      "name": "Gold Get Started band",
      "selector": [
        ".cmp-parker-yellow-theme.aem-GridColumn:has(> .image-box-container table)"
      ],
      "style": "gold",
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "tagging-parts",
      "name": "Tagging parts band (image left)",
      "selector": [
        ".aem-GridColumn:not(.cmp-parker-yellow-theme):has(> .image-box-container .image-wrapper)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "success-stories",
      "name": "Success Stories slider, grey",
      "selector": [
        ".grey-bg.aem-GridColumn:has(.parker-carousel .cmp-parker-card-container)"
      ],
      "style": "grey",
      "blocks": [
        "cards-teaser"
      ],
      "defaultContent": [
        ".title-description-container h2",
        ".title-description-container p"
      ]
    },
    {
      "id": "videos",
      "name": "Videos (3 MP4 tiles)",
      "selector": [
        ".cmp-parker-carousel__no-box.aem-GridColumn:has(.cmp-watchnowvideo__parkerdivision)"
      ],
      "style": null,
      "blocks": [
        "cards-video"
      ],
      "defaultContent": [
        ".slider-carousel-container > h2"
      ]
    },
    {
      "id": "resources",
      "name": "Resources cards, grey",
      "selector": [
        ".grey-bg.aem-GridColumn:has(.layout-col-4 .cmp-parker-card-container)"
      ],
      "style": "grey",
      "blocks": [
        "cards-teaser"
      ],
      "defaultContent": [
        ".title-description-container h2",
        ".title-description-container p"
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
