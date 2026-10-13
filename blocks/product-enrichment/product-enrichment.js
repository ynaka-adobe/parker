/**
 * Product Enrichment Block
 * Auto-injected on product detail pages (see buildProductEnrichmentBlock in
 * scripts/scripts.js). The Edge Commerce Product Pipeline only server-renders
 * a minimal h1/picture/description for a product; this block fetches the
 * product's own `.json` endpoint and augments the page with any additional
 * `custom` data stored on the product record:
 *   - a full HTML product description
 *   - a technical specifications table
 *   - related documents (videos, literature, etc.), grouped by category
 *
 * Pages without `custom` data (or where the fetch fails) are left untouched.
 */

function buildFullDescriptionSection(fullDescriptionHtml) {
  const section = document.createElement('div');
  section.className = 'product-enrichment-description';

  const heading = document.createElement('h2');
  heading.textContent = 'Full Product Description';

  const body = document.createElement('div');
  body.className = 'product-enrichment-description-body';
  // Trusted first-party HTML from the product record (same origin as the page).
  body.innerHTML = fullDescriptionHtml;

  section.append(heading, body);
  return section;
}

function buildSpecificationsSection(specs) {
  const section = document.createElement('div');
  section.className = 'product-enrichment-specs';

  const heading = document.createElement('h2');
  heading.textContent = 'Technical Specifications';

  const table = document.createElement('table');
  const tbody = document.createElement('tbody');

  specs.forEach((entry) => {
    const [key] = Object.keys(entry);
    if (!key) return;
    const row = document.createElement('tr');

    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = key;

    const td = document.createElement('td');
    td.textContent = entry[key];

    row.append(th, td);
    tbody.append(row);
  });

  table.append(tbody);
  section.append(heading, table);
  return section;
}

function buildDocumentLink(doc) {
  const isVideo = doc['document-type'] === 'Video';

  const li = document.createElement('li');
  li.className = `product-enrichment-documents-item ${isVideo ? 'is-video' : 'is-file'}`;

  const link = document.createElement('a');
  link.href = doc['document-url'];
  link.target = '_blank';
  link.rel = 'noopener';

  const badge = document.createElement('span');
  badge.className = 'product-enrichment-documents-badge';
  badge.textContent = isVideo ? 'Video' : 'Document';

  const label = document.createElement('span');
  label.className = 'product-enrichment-documents-label';
  label.textContent = doc['document-title'];

  link.append(badge, label);
  li.append(link);
  return li;
}

function buildDocumentsSection(relatedDocuments) {
  const section = document.createElement('div');
  section.className = 'product-enrichment-documents';

  const heading = document.createElement('h2');
  heading.textContent = 'Related Documents';
  section.append(heading);

  Object.keys(relatedDocuments).forEach((category) => {
    const docs = relatedDocuments[category];
    if (!Array.isArray(docs) || docs.length === 0) return;

    const categoryHeading = document.createElement('h3');
    categoryHeading.textContent = category;

    const list = document.createElement('ul');
    list.className = 'product-enrichment-documents-list';
    docs.forEach((doc) => list.append(buildDocumentLink(doc)));

    section.append(categoryHeading, list);
  });

  return section;
}

export default async function decorate(block) {
  const section = block.closest('.section');
  block.textContent = '';

  let data;
  try {
    const resp = await fetch(`${window.location.pathname}.json`);
    if (!resp.ok) throw new Error(`Product data request failed: ${resp.status}`);
    data = await resp.json();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Product Enrichment block: could not load product data', err);
    if (section) section.remove();
    return;
  }

  const { custom } = data;
  if (!custom) {
    // Nothing to add for this product — leave the default pipeline rendering as-is.
    if (section) section.remove();
    return;
  }

  if (custom.fullDescription) {
    block.append(buildFullDescriptionSection(custom.fullDescription));
  }

  if (Array.isArray(custom.technicalSpecifications) && custom.technicalSpecifications.length) {
    block.append(buildSpecificationsSection(custom.technicalSpecifications));
  }

  if (custom.relatedDocuments && Object.keys(custom.relatedDocuments).length) {
    block.append(buildDocumentsSection(custom.relatedDocuments));
  }

  if (!block.children.length && section) section.remove();
}
