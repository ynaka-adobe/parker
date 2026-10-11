/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsMediaParser from './parsers/columns-media.js';
import tableParser from './parsers/table.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/parker-cleanup.js';
import sectionsTransformer from './transformers/parker-sections.js';

// PARSER REGISTRY
const parsers = {
  'columns-media': columnsMediaParser,
  table: tableParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (template "blog-home")
const PAGE_TEMPLATE = {
  "name": "blog-article",
  "description": "Parker blog article pages (blog.parker.com/us/en/<division>/<slug>.html), imported to /us/en/blog/<slug>",
  "urls": [
    "https://blog.parker.com/us/en/emg_cho/comparing-silver-plated-and-nickel--plated-aluminum-emi-shielding-particles.html",
    "https://blog.parker.com/us/en/emg_cho/emi-shielding-and-thermal-management-for-robotics.html",
    "https://blog.parker.com/us/en/emg_cho/emi-shielding-and-thermal-solutions-for-electric-transportation.html",
    "https://blog.parker.com/us/en/emg_cho/emi-shielding-within-medical-device-applications.html",
    "https://blog.parker.com/us/en/emg_cho/essential-protection-for-high-performance-drone-systems.html",
    "https://blog.parker.com/us/en/emg_cho/how-do-thermal-interface-materials-support-leo-small-satellite-electronics.html",
    "https://blog.parker.com/us/en/emg_cho/radar-across-every-domain.html",
    "https://blog.parker.com/us/en/emg_cho/space-payload-emi-shielding.html",
    "https://blog.parker.com/us/en/emg_cho/thermal-management-for-optical-transceivers.html",
    "https://blog.parker.com/us/en/msg_grp/How-Parker-Chelsea-Helps-OEMs-Fleets-Improve-PTO-Performance.html",
    "https://blog.parker.com/us/en/msg_grp/helping-oems-find-right-hydraulic-cylinder-solution.html",
    "https://blog.parker.com/us/en/msg_grp/why-documentation-and-end-user-insight-matter-in-hydraulic-design.html"
  ],
  "blocks": [
    {
      "name": "columns-media",
      "instances": [
        ".parker-blog-custom-container .aem-GridColumn:has(> .image-box-container)"
      ]
    },
    {
      "name": "table",
      "instances": [
        ".parker-blog-custom-container table"
      ]
    }
  ],
  "sections": [
    {
      "id": "title",
      "name": "Article title band",
      "selector": [
        ".aem-GridColumn:has(> .cmp-title)"
      ],
      "style": "grey",
      "blocks": [],
      "defaultContent": [
        ".cmp-title .cmp-title__text"
      ]
    },
    {
      "id": "article",
      "name": "Byline + article body",
      "selector": [
        ".aem-GridColumn:has(> .cmp-blog-author)"
      ],
      "style": null,
      "blocks": [
        "columns-media",
        "table"
      ],
      "defaultContent": [
        ".cmp-blog-author",
        "[id$=\"_right_container_text\"]",
        ".cmp-image"
      ]
    }
  ]
};

// TARGET PATHS - articles live under the migrated blog home:
// blog.parker.com/us/en/<division>/<slug>.html -> /us/en/blog/<slug>

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
    // Metadata: createMetadata only reads title/description/og/twitter; add
    // Author + Publication Date captured by parker-cleanup into <head>.
    const meta = WebImporter.Blocks.getMetadata(document);
    const headMeta = (n) => (document.head.querySelector(`meta[name="${n}"]`) || {}).content;
    if (headMeta('author')) meta.Author = headMeta('author');
    if (headMeta('publication-date')) meta['Publication Date'] = headMeta('publication-date');
    // body.blog-article scopes the article layout styles (styles/styles.css)
    meta.Template = 'blog-article';
    if (Object.keys(meta).length) main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path; map root URL to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const targetPath = `/us/en/blog/${rawPath.split('/').pop()}`;
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
