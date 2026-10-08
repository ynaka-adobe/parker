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
  "name": "product-landing",
  "representativeUrl": "https://ph.parker.com/us/en/category",
  "description": "Products landing (ph.parker.com/us/en/category): intro + all product categories with subcategory image tiles; left category nav + faceted filters",
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
        "ul[id^=\"category-products-category-\"][id$=\"-subcategories-list\"]",
        "ul[data-testid^=\"category-products-category-\"][data-testid$=\"-subcategories-list\"]"
      ]
    }
  ],
  "urlPattern": "/us/en/category",
  "urls": [
    "https://ph.parker.com/us/en/category"
  ],
  "sections": [
    {
      "id": "products-main",
      "name": "Products intro (H1 + image/paragraph), All Product Categories heading and 19 category groups (linked H3 + subcategory tiles)",
      "selector": [
        "#non-mobile-category-right-content",
        "[class*=\"__gridSpacingLeft\"]",
        "div:has(> #category-products-root)"
      ],
      "style": null,
      "blocks": [
        "columns-media",
        "cards-category"
      ],
      "defaultContent": [
        "#category-list-details-title",
        "#category-products-title",
        "[id^=\"category-products-category-\"][id$=\"-header\"]"
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

    // 4b. EDS allows at most 200 images per page and this page has ~226 tile
    // images, so each category group (h3 link + its cards-category grid) is its
    // own fragment document under /fragments/products/<category-slug>, and the
    // landing page references it with a Fragment block. The importer writes one
    // document per URL, so fragments are produced by importing the same URL with
    // ?fragment=<category-slug> (see urls-product-landing-fragments.txt).
    const wantFragment = new URL(params.originalURL).searchParams.get('fragment');
    let fragmentEl = null;
    [...main.querySelectorAll('h3')].forEach((h3) => {
      const link = h3.querySelector('a[href^="/us/en/category/"]');
      if (!link) return;
      const slug = link.getAttribute('href').replace(/[?#].*$/, '').split('/').pop();
      const group = document.createElement('div');
      // source nesting: div#category-products-category-N > [header div > h3] +
      // [subcategories container > ... > block table]
      let root = h3.parentElement;
      while (root && !/^category-products-category-\d+$/.test(root.id || '')) root = root.parentElement;
      const tables = root ? [...root.querySelectorAll('table')] : [];
      let next = tables.length ? null : h3.nextElementSibling;
      h3.before(WebImporter.Blocks.createBlock(document, {
        name: 'Fragment',
        cells: [[Object.assign(document.createElement('a'), {
          href: `/fragments/products/${slug}`,
          textContent: `/fragments/products/${slug}`,
        })]],
      }));
      group.append(h3, ...tables);
      // fallback (flat structure): move the following table(s) up to the next heading
      while (next && next.tagName !== 'H3' && next.tagName !== 'HR') {
        const following = next.nextElementSibling;
        if (next.tagName === 'TABLE') group.append(next);
        next = following;
      }
      if (slug === wantFragment) fragmentEl = group;
    });

    if (wantFragment) {
      if (!fragmentEl) throw new Error(`No category group for fragment "${wantFragment}"`);
      WebImporter.rules.adjustImageUrls(fragmentEl, url, params.originalURL);
      return [{
        element: fragmentEl,
        path: `/fragments/products/${wantFragment}`,
        report: { title: wantFragment, template: `${PAGE_TEMPLATE.name}-fragment` },
      }];
    }

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
