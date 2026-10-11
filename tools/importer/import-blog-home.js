/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsBlogParser from './parsers/cards-blog.js';
import searchBlogParser from './parsers/search-blog.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/parker-cleanup.js';
import sectionsTransformer from './transformers/parker-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-blog': cardsBlogParser,
  'search-blog': searchBlogParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (template "blog-home")
const PAGE_TEMPLATE = {
  "name": "blog-home",
  "description": "Parker blog homepage (blog.parker.com), imported to /us/en/blog",
  "urls": [
    "https://blog.parker.com/us/en/home.html"
  ],
  "blocks": [
    {
      "name": "search-blog",
      "instances": [
        ".cmp-parker-blog-search"
      ]
    },
    {
      "name": "cards-blog",
      "instances": [
        ".cmp-blog-recent-blogs"
      ]
    }
  ],
  "sections": [
    {
      "id": "rc1",
      "name": "Blog landing (search + recent posts grid)",
      "selector": [
        ".aem-container:has(.cmp-blog-recent-blogs)"
      ],
      "style": "light-grey",
      "blocks": [
        "search-blog",
        "cards-blog"
      ],
      "defaultContent": []
    },
    {
      "id": "rc2",
      "name": "Empty wrapper",
      "selector": [
        "#spa-root > div > div:nth-of-type(1) > div:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "rc3",
      "name": "Empty wrapper",
      "selector": [
        "#spa-root > div > div:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    }
  ]
};

// TARGET PATHS - blog.parker.com/us/en/home would collide with the www.parker.com
// homepage (/us/en/home), so the blog home is imported to /us/en/blog instead.
const PATH_OVERRIDES = {
  '/us/en/home': '/us/en/blog',
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
    const targetPath = PATH_OVERRIDES[rawPath] || rawPath;
    const path = WebImporter.FileUtils.sanitizePath(targetPath === '' ? '/index' : targetPath);

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
