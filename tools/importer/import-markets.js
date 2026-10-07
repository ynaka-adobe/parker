/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import bannerCtaParser from './parsers/banner-cta.js';
import bannerInlineParser from './parsers/banner-inline.js';
import cardsNewsParser from './parsers/cards-news.js';
import cardsTeaserParser from './parsers/cards-teaser.js';
import columnsMediaParser from './parsers/columns-media.js';
import heroBannerParser from './parsers/hero-banner.js';
import heroCardParser from './parsers/hero-card.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/parker-cleanup.js';
import sectionsTransformer from './transformers/parker-sections.js';

// PARSER REGISTRY
const parsers = {
  'banner-cta': bannerCtaParser,
  'banner-inline': bannerInlineParser,
  'cards-news': cardsNewsParser,
  'cards-teaser': cardsTeaserParser,
  'columns-media': columnsMediaParser,
  'hero-banner': heroBannerParser,
  'hero-card': heroCardParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "markets",
  "description": "Market and trend pages (/us/en/markets/*): grey title band (H1), full-bleed hero, image+text bands (columns-media), submarket cards (cards-teaser), blue inline CTA strip (banner-inline), featured white-paper card over photo (hero-card), blog link list (cards-news), grey rich-text/FAQ default content, gold closing CTA (banner-cta). columns-media OPTION \"full-bleed\": add it when the matched source grid column has class cmp-parker-secondary-img-box-theme (matched by the first columns-media instance selector) - on the representative page that is the sky-blue Ebrake section (ebrake-video) and the charcoal Next-Generation Technologies section (next-gen-tech); all other columns-media instances (white browse-products, grey bands) use the default/inset look. Skipped sections (breadcrumb, empty-4-4-4, empty-container) carry no content: remove the breadcrumb in cleanup and do not emit a section break for them.",
  "urls": [
    "https://www.parker.com/us/en/markets/aerospace-and-defense.html",
    "https://www.parker.com/us/en/markets/aerospace-industry-trends.html",
    "https://www.parker.com/us/en/markets/clean-tech-trends.html",
    "https://www.parker.com/us/en/markets/digitalization-trends.html",
    "https://www.parker.com/us/en/markets/electrification-trends.html",
    "https://www.parker.com/us/en/markets/electronics-and-semiconductors.html",
    "https://www.parker.com/us/en/markets/energy.html",
    "https://www.parker.com/us/en/markets/hvac-and-refrigeration.html",
    "https://www.parker.com/us/en/markets/in-plant-and-industrial-equipment.html",
    "https://www.parker.com/us/en/markets/interactive-library.html",
    "https://www.parker.com/us/en/markets/life-sciences.html",
    "https://www.parker.com/us/en/markets/off-highway.html",
    "https://www.parker.com/us/en/markets/transportation.html"
  ],
  "blocks": [
    {
      "name": "hero-banner",
      "instances": [
        ".left-to-right-gradient.aem-GridColumn",
        ".cmp-parker-dark-opacity-50.aem-GridColumn",
        ".right-to-left-gradient.aem-GridColumn",
        ".aem-GridColumn:not(.cmp-parker-white-background):has(> .cq-dd-image)"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        ".cmp-parker-secondary-img-box-theme.aem-GridColumn:has(> .image-box-container .image-wrapper)",
        ".aem-GridColumn:has(> .image-box-container .image-wrapper)"
      ]
    },
    {
      "name": "cards-teaser",
      "instances": [
        ".parker-carousel",
        ".layout-col-4:has(.cmp-parker-card-container .card)",
        ".layout-col-4-4-4:has(.cmp-parker-card-container .card)",
        "[class*=\"layout-col-\"]:has(> .aem-container > .cmp-parker-border > .cmp-parker-card-container .card)"
      ]
    },
    {
      "name": "banner-inline",
      "instances": [
        ".layout-col-8-4.aem-GridColumn:has(.image-box-container):not(:has(.image-wrapper))"
      ]
    },
    {
      "name": "hero-card",
      "instances": [
        ".cmp-parker-white-background.aem-GridColumn:has(> .cq-dd-image)"
      ]
    },
    {
      "name": "cards-news",
      "instances": [
        ".layout-col-6-6.cmp-container_contentwrapper.aem-GridColumn:has(a[href*=\"blog.parker.com\"])"
      ]
    },
    {
      "name": "banner-cta",
      "instances": [
        ".cmp-parker-gold-theme.cmp-parker-secondary-img-box-theme.aem-GridColumn"
      ]
    }
  ],
  "sections": [
    {
      "id": "title-bar",
      "name": "Page title band",
      "selector": [
        ".aem-GridColumn:has(> .cmp-title)"
      ],
      "style": "grey",
      "blocks": [],
      "defaultContent": [
        ".cmp-title h1"
      ]
    },
    {
      "id": "breadcrumb",
      "name": "Breadcrumb (skipped - generated from page path, not authored)",
      "selector": [
        ".aem-GridColumn:has(> nav.cmp-breadcrumb)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "hero",
      "name": "Market hero",
      "selector": [
        ".left-to-right-gradient.aem-GridColumn",
        ".cmp-parker-dark-opacity-50.aem-GridColumn",
        ".right-to-left-gradient.aem-GridColumn",
        ".aem-GridColumn:not(.cmp-parker-white-background):has(> .cq-dd-image)"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "browse-products",
      "name": "Interactive product browser promo",
      "selector": [
        ".aem-GridColumn--offset--default--0.aem-GridColumn--default--none:not(.cmp-parker-secondary-img-box-theme):has(> .image-box-container)"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "innovations",
      "name": "Rich-text intro",
      "selector": [
        ".grey-bg.aem-GridColumn:has(> .aem-container > div > .title-description-container)",
        ".grey-bg.aem-GridColumn:not(.cmp-container_contentwrapper):has(> .aem-container)"
      ],
      "style": "grey",
      "blocks": [],
      "defaultContent": [
        ".title-description-container h2",
        ".title-description-container p",
        ".title-description-container ul"
      ]
    },
    {
      "id": "submarkets",
      "name": "Submarket tiles slider",
      "selector": [
        ".aem-GridColumn:has(> .aem-container > div > .parker-carousel)",
        ".aem-GridColumn:has(> .parker-carousel)"
      ],
      "style": null,
      "blocks": [
        "cards-teaser"
      ],
      "defaultContent": [
        ".slider-carousel-container > h2"
      ]
    },
    {
      "id": "empty-4-4-4",
      "name": "Empty 4-4-4 layout container (skipped)",
      "selector": [
        ".layout-col-4-4-4.cmp-container_contentwrapper.aem-GridColumn"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "ebrake-video",
      "name": "Image + text band, blue (columns-media full-bleed)",
      "selector": [
        ".cmp-parker-purpose-blue-theme.cmp-parker-secondary-img-box-theme.aem-GridColumn",
        ".cmp-parker-blue-theme.aem-GridColumn:has(> .image-box-container)"
      ],
      "style": "sky-blue",
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "next-gen-video",
      "name": "Image + text band, grey (image left)",
      "selector": [
        ".grey-bg.aem-GridColumn:not(.cmp-parker-secondary-img-box-theme):has(> .image-box-container)"
      ],
      "style": "grey",
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "next-gen-tech",
      "name": "Image + text band, charcoal (columns-media full-bleed)",
      "selector": [
        ".cmp-parker-charcoal-theme.cmp-parker-secondary-img-box-theme.aem-GridColumn"
      ],
      "style": "charcoal",
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "electroflight",
      "name": "Image + text band, grey (second grey band)",
      "selector": [
        ".grey-bg.aem-GridColumn:not(.cmp-parker-secondary-img-box-theme):has(> .image-box-container) ~ .grey-bg.aem-GridColumn:not(.cmp-parker-secondary-img-box-theme):has(> .image-box-container)"
      ],
      "style": "grey",
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "webinars",
      "name": "Inline CTA strip",
      "selector": [
        ".layout-col-8-4.aem-GridColumn"
      ],
      "style": "sky-blue",
      "blocks": [
        "banner-inline"
      ],
      "defaultContent": []
    },
    {
      "id": "featured-white-paper",
      "name": "Featured resource teaser",
      "selector": [
        ".cmp-parker-white-background.aem-GridColumn"
      ],
      "style": null,
      "blocks": [
        "hero-card"
      ],
      "defaultContent": []
    },
    {
      "id": "education",
      "name": "Blog link list",
      "selector": [
        ".layout-col-6-6.cmp-container_contentwrapper.aem-GridColumn:has(a[href*=\"blog.parker.com\"])"
      ],
      "style": null,
      "blocks": [
        "cards-news"
      ],
      "defaultContent": [
        ".col-ml-mr:first-child h2"
      ]
    },
    {
      "id": "empty-container",
      "name": "Empty container (skipped)",
      "selector": [
        ".layout-col-6-6.cmp-container_contentwrapper.aem-GridColumn:has(a[href*=\"blog.parker.com\"]) + .aem-GridColumn:not(.grey-bg):not(.cmp-parker-gold-theme)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "faqs",
      "name": "Static FAQ text",
      "selector": [
        ".grey-bg.cmp-container_contentwrapper.aem-GridColumn:has(> .aem-container > .grey-bg.col-ml-mr)",
        ".grey-bg.cmp-container_contentwrapper.aem-GridColumn:has(> .aem-container > .col-ml-mr)"
      ],
      "style": "grey",
      "blocks": [],
      "defaultContent": [
        ".col-ml-mr h2",
        ".col-ml-mr p"
      ]
    },
    {
      "id": "contact-cta",
      "name": "Closing CTA strip",
      "selector": [
        ".cmp-parker-gold-theme.cmp-parker-secondary-img-box-theme.aem-GridColumn"
      ],
      "style": "gold",
      "blocks": [
        "banner-cta"
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
