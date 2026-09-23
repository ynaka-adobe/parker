/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import bannerCtaParser from './parsers/banner-cta.js';
import cardsCategoryParser from './parsers/cards-category.js';
import cardsNewsParser from './parsers/cards-news.js';
import carouselHeroParser from './parsers/carousel-hero.js';
import columnsMediaParser from './parsers/columns-media.js';
import heroBannerParser from './parsers/hero-banner.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/parker-cleanup.js';
import sectionsTransformer from './transformers/parker-sections.js';

// PARSER REGISTRY
const parsers = {
  'banner-cta': bannerCtaParser,
  'cards-category': cardsCategoryParser,
  'cards-news': cardsNewsParser,
  'carousel-hero': carouselHeroParser,
  'columns-media': columnsMediaParser,
  'hero-banner': heroBannerParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Parker home page',
  urls: [
    'https://www.parker.com/us/en/home.html',
  ],
  blocks: [
    {
      name: 'hero-banner',
      instances: ['.left-to-right-gradient.aem-GridColumn'],
    },
    {
      name: 'columns-media',
      instances: ['.cmp-parker-blue-theme.cmp-parker-ibd-align-center', '.grey-bg.aem-GridColumn'],
    },
    {
      name: 'carousel-hero',
      instances: ['.cmp-carousel'],
    },
    {
      name: 'banner-cta',
      instances: ['.cmp-parker-gold-theme.cmp-parker-secondary-img-box-theme'],
    },
    {
      name: 'cards-category',
      instances: ['.parker-carousel'],
    },
    {
      name: 'cards-news',
      instances: ['.cmp-news-v2-component__container'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'hero',
      selector: ['.left-to-right-gradient.aem-GridColumn'],
      style: null,
      blocks: ['hero-banner'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'our-purpose',
      selector: ['.cmp-parker-blue-theme.cmp-parker-ibd-align-center'],
      style: 'sky-blue',
      blocks: ['columns-media'],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'trends-carousel',
      selector: ['.cmp-carousel'],
      style: null,
      blocks: ['carousel-hero'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'products-cta',
      selector: ['.cmp-parker-gold-theme.cmp-parker-secondary-img-box-theme'],
      style: 'gold',
      blocks: ['banner-cta'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'featured-categories-heading',
      selector: ['#spa-root > div > div > div.aem-container.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(1) > div.aem-container.aem-Grid.aem-Grid--12.aem-Grid--default--12 > div.aem-GridColumn.aem-GridColumn--default--12:nth-of-type(7)', 'div.aem-GridColumn:has(> .cmp-titlelink_container)'],
      style: null,
      blocks: [],
      defaultContent: ['h2'],
    },
    {
      id: 'section-6',
      name: 'featured-categories',
      selector: ['.parker-carousel'],
      style: null,
      blocks: ['cards-category'],
      defaultContent: [],
    },
    {
      id: 'section-7',
      name: 'about-parker',
      selector: ['.grey-bg.aem-GridColumn'],
      style: 'grey',
      blocks: ['columns-media'],
      defaultContent: [],
    },
    {
      id: 'section-8',
      name: 'featured-news',
      selector: ['.cmp-container_contentwrapper'],
      style: null,
      blocks: ['cards-news'],
      defaultContent: ['h2'],
    },
  ],
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
