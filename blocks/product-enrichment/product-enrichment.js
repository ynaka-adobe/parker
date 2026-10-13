/**
 * Product Enrichment Block
 * Auto-injected on product detail pages (see buildProductEnrichmentBlock in
 * scripts/scripts.js). The Edge Commerce Product Pipeline only server-renders
 * a minimal h1/picture/description for a product, in a single stacked column.
 *
 * This block restructures that minimal markup into the real Parker PDP
 * layout (breadcrumb, image gallery, product info, a sidebar) and augments
 * the page with any additional `custom` data stored on the product record:
 *   - a "Products" table listing a Series page's SKU variants, linking to
 *     each SKU's own nested product page
 *   - a full HTML product description
 *   - a technical specifications table
 *   - related documents (videos, literature, etc.), grouped by category
 *
 * Parker's catalog models two related PDP types sharing this same
 * `/us/en/products/*` routing and JSON shape: a "Series" page (e.g.
 * `/us/en/products/ultra-dry-gas-generator`, `custom.parts` lists its SKU
 * variants) and a "Product"/SKU page nested one level below it (e.g.
 * `/us/en/products/ultra-dry-gas-generator/uda-300`, identified by
 * `custom.seriesPath` linking back up). Series pages get the default
 * filter/account sidebar; SKU pages get a distributor/division-contact
 * sidebar, a deeper breadcrumb, a "Part #:" line, and a "View Series Page"
 * link instead.
 *
 * The layout restructuring always runs on a product page. The `custom`-data
 * sections (and the divider above them) only appear once the product's own
 * `.json` endpoint has been fetched and contains `custom` data; pages
 * without it (or where the fetch fails) still get the restructured layout,
 * just without the extra sections.
 */

/**
 * Decodes HTML entities (e.g. "&deg;") that arrive as literal text in the
 * pipeline's server-rendered description, using the browser's own HTML
 * parser rather than a hand-rolled entity table.
 * @param {string} str
 * @returns {string}
 */
function decodeHtmlEntities(str) {
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
}

/**
 * Finds the pipeline-rendered h1, picture and short description, detaches
 * them from their original sections (which are then removed), so they can
 * be re-inserted into the new PDP layout.
 * @param {Element} main
 * @param {Element} block The product-enrichment block itself (left alone)
 */
function extractPipelineContent(main, block) {
  const ownSection = block.closest('.section');
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  const heroSection = h1 ? h1.closest('.section') : null;

  let shortDescriptionEl = null;
  let descriptionSection = null;
  [...main.querySelectorAll(':scope > .section')]
    .filter((section) => section !== ownSection && section !== heroSection)
    .some((section) => {
      const p = section.querySelector('p');
      if (p && !p.querySelector('picture') && p.textContent.trim()) {
        shortDescriptionEl = p;
        descriptionSection = section;
        return true;
      }
      return false;
    });

  if (picture) picture.remove();
  if (h1) h1.remove();
  if (shortDescriptionEl) shortDescriptionEl.remove();
  if (heroSection) heroSection.remove();
  if (descriptionSection) descriptionSection.remove();

  return { h1, picture, shortDescriptionEl };
}

/**
 * (Re)renders a breadcrumb nav's crumb items from a flat list of labels, the
 * last of which is marked as the current page. Shared by the default
 * (Series-page) breadcrumb and the deeper SKU-page breadcrumb, which both
 * use the same static leading categories.
 * @param {Element} nav
 * @param {Array<string>} crumbs
 */
function renderBreadcrumbCrumbs(nav, crumbs) {
  nav.textContent = '';
  const list = crumbs.filter(Boolean);
  list.forEach((crumb, i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'product-pdp-breadcrumb-sep';
      sep.textContent = '/';
      nav.append(sep);
    }
    const item = document.createElement('span');
    item.className = 'product-pdp-breadcrumb-item';
    if (i === list.length - 1) item.classList.add('is-current');
    item.textContent = crumb;
    nav.append(item);
  });
}

function buildBreadcrumb(productName) {
  const nav = document.createElement('nav');
  nav.className = 'product-pdp-breadcrumb';
  nav.setAttribute('aria-label', 'Breadcrumb');

  // Real category data isn't available on the client; these middle crumbs
  // are static placeholders in the style of the production Parker PDP.
  renderBreadcrumbCrumbs(nav, ['Home', 'Products', 'Gas Generators', 'CO2 Free Gas Generators', productName]);

  return nav;
}

/**
 * (Re)renders the thumbnail strip for a gallery from a list of
 * `{ url }` image records, defaulting to the single pipeline-rendered image
 * when no richer image list is available yet.
 * @param {Element} gallery
 * @param {Array} images
 */
function renderGalleryThumbs(gallery, images) {
  const thumbs = gallery.querySelector('.product-pdp-gallery-thumbs');
  const mainImg = gallery.querySelector('.product-pdp-gallery-main img');
  const list = Array.isArray(images) && images.length
    ? images
    : [mainImg && { url: mainImg.src }].filter(Boolean);

  thumbs.textContent = '';
  list.forEach((imageData, i) => {
    const li = document.createElement('li');
    const thumbButton = document.createElement('button');
    thumbButton.type = 'button';
    thumbButton.className = 'product-pdp-gallery-thumb';
    if (i === 0) thumbButton.classList.add('is-active');

    const img = document.createElement('img');
    img.src = imageData.url;
    img.alt = '';
    img.loading = 'lazy';
    thumbButton.append(img);

    thumbButton.addEventListener('click', () => {
      if (mainImg) mainImg.src = imageData.url;
      thumbs.querySelectorAll('.product-pdp-gallery-thumb').forEach((btn) => btn.classList.remove('is-active'));
      thumbButton.classList.add('is-active');
    });

    li.append(thumbButton);
    thumbs.append(li);
  });
}

function buildGallery(picture) {
  const gallery = document.createElement('div');
  gallery.className = 'product-pdp-gallery';

  const main = document.createElement('div');
  main.className = 'product-pdp-gallery-main';
  if (picture) main.append(picture);

  const thumbs = document.createElement('ul');
  thumbs.className = 'product-pdp-gallery-thumbs';

  gallery.append(main, thumbs);
  renderGalleryThumbs(gallery, null);
  return gallery;
}

function buildInfoColumn(h1, shortDescriptionEl) {
  const info = document.createElement('div');
  info.className = 'product-pdp-info';

  if (h1) info.append(h1);

  const whereToBuy = document.createElement('a');
  whereToBuy.href = '#';
  whereToBuy.className = 'button secondary product-pdp-where-to-buy';
  whereToBuy.textContent = 'Where to Buy';
  info.append(whereToBuy);

  if (shortDescriptionEl) {
    shortDescriptionEl.textContent = decodeHtmlEntities(shortDescriptionEl.textContent);
    shortDescriptionEl.classList.add('product-pdp-short-description');
    info.append(shortDescriptionEl);
  }

  return info;
}

/**
 * A Parker "Series" PDP can list one or more SKU variants below the main
 * product info. Each row links to that SKU's own nested product page
 * (e.g. `/us/en/products/ultra-dry-gas-generator/uda-300`), derived from the
 * current series page path plus the part number.
 * @param {string} seriesName
 * @param {number} numberOfSkus
 * @param {Array<{partNumber: string, productURL: string}>} parts
 */
function buildPartsSection(seriesName, numberOfSkus, parts) {
  const section = document.createElement('div');
  section.className = 'product-enrichment-parts';

  const header = document.createElement('button');
  header.type = 'button';
  header.className = 'product-enrichment-parts-header';
  header.setAttribute('aria-expanded', 'true');

  const title = document.createElement('span');
  title.textContent = seriesName ? `Products — ${seriesName}` : 'Products';

  const toggle = document.createElement('span');
  toggle.className = 'product-enrichment-parts-toggle';
  toggle.setAttribute('aria-hidden', 'true');
  toggle.textContent = '▾';

  header.append(title, toggle);

  const body = document.createElement('div');
  body.className = 'product-enrichment-parts-body';

  const total = numberOfSkus ?? parts.length;
  const count = document.createElement('p');
  count.className = 'product-enrichment-parts-count';
  count.textContent = `Showing 1 to ${parts.length} of ${total} entries`;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  const th = document.createElement('th');
  th.textContent = 'Part Number';
  headRow.append(th);
  thead.append(headRow);

  const basePath = window.location.pathname.replace(/\/$/, '');
  const tbody = document.createElement('tbody');
  parts.forEach((part) => {
    const row = document.createElement('tr');
    const cell = document.createElement('td');

    const link = document.createElement('a');
    link.href = part.partNumber ? `${basePath}/${part.partNumber.toLowerCase()}` : (part.productURL || '#');
    link.textContent = part.partNumber;

    cell.append(link);
    row.append(cell);
    tbody.append(row);
  });

  table.append(thead, tbody);
  body.append(count, table);
  section.append(header, body);

  header.addEventListener('click', () => {
    const expanded = header.getAttribute('aria-expanded') === 'true';
    header.setAttribute('aria-expanded', String(!expanded));
    section.classList.toggle('is-collapsed', expanded);
  });

  return section;
}

/**
 * SKU (Product) page sidebar: a "Find a Distributor" panel (Where to Buy +
 * a static Add to Workspace button) replacing the Series page's
 * filter/account sidebar.
 * @param {string} whereToBuyUrl
 */
function buildDistributorPanel(whereToBuyUrl) {
  const panel = document.createElement('div');
  panel.className = 'product-pdp-distributor';

  const heading = document.createElement('h3');
  heading.textContent = 'Find a Distributor';

  const whereToBuy = document.createElement('a');
  whereToBuy.href = whereToBuyUrl || '#';
  whereToBuy.target = '_blank';
  whereToBuy.rel = 'noopener';
  whereToBuy.className = 'button product-pdp-where-to-buy-pill';
  whereToBuy.textContent = 'Where to Buy';

  const addToWorkspace = document.createElement('a');
  addToWorkspace.href = '#';
  addToWorkspace.className = 'button product-pdp-add-to-workspace';
  addToWorkspace.textContent = 'Add to Workspace';

  panel.append(heading, whereToBuy, addToWorkspace);
  return panel;
}

/**
 * SKU (Product) page sidebar card showing the owning division's contact
 * details.
 * @param {object} divisionContact
 */
function buildDivisionContactCard(divisionContact) {
  if (!divisionContact) return null;
  const card = document.createElement('div');
  card.className = 'product-pdp-division-card';

  const heading = document.createElement('h3');
  heading.textContent = divisionContact.divisionName || '';
  card.append(heading);

  const address = document.createElement('p');
  address.className = 'product-pdp-division-address';
  if (divisionContact.address1) address.append(document.createTextNode(divisionContact.address1));
  const cityStateZip = [
    [divisionContact.city, divisionContact.state].filter(Boolean).join(', '),
    divisionContact.zipCode,
  ].filter(Boolean).join(' ');
  if (cityStateZip) {
    if (address.childNodes.length) address.append(document.createElement('br'));
    address.append(document.createTextNode(cityStateZip));
  }
  if (address.childNodes.length) card.append(address);

  if (divisionContact.phone) {
    const phone = document.createElement('p');
    const phoneLink = document.createElement('a');
    phoneLink.href = `tel:${divisionContact.phone.replace(/[^\d+]/g, '')}`;
    phoneLink.textContent = divisionContact.phone;
    phone.append(phoneLink);
    card.append(phone);
  }

  return card;
}

/**
 * Applies the SKU (Product) page-specific differences on top of the shared
 * layout: a deeper breadcrumb ending in the bold part number, a "Part #:"
 * line under the H1, a "View Series Page" link near the gallery, and a
 * distributor/division-contact sidebar in place of the Series page's
 * filter/account sidebar.
 * @param {Element} layout
 * @param {object} custom
 */
function applySkuPageEnhancements(layout, custom) {
  const sidebar = layout.querySelector('.product-pdp-sidebar');
  const infoColumn = layout.querySelector('.product-pdp-info');
  const breadcrumbNav = layout.querySelector('.product-pdp-breadcrumb');
  const gallery = layout.querySelector('.product-pdp-gallery');
  const h1 = infoColumn.querySelector('h1');

  const seriesLabel = custom.seriesName ? custom.seriesName.replace(/\s*Series\s*$/i, '') : '';
  renderBreadcrumbCrumbs(breadcrumbNav, [
    'Home', 'Products', 'Gas Generators', 'CO2 Free Gas Generators', seriesLabel, custom.partNumber,
  ]);

  if (custom.partNumber && h1) {
    const partLine = document.createElement('p');
    partLine.className = 'product-pdp-part-number';
    partLine.textContent = `Part #: ${custom.partNumber}`;
    h1.insertAdjacentElement('afterend', partLine);
  }

  if (custom.seriesPath) {
    const viewSeries = document.createElement('a');
    viewSeries.className = 'product-pdp-view-series';
    viewSeries.href = custom.seriesPath;
    viewSeries.textContent = 'View Series Page';
    gallery.append(viewSeries);
  }

  sidebar.textContent = '';
  sidebar.append(buildDistributorPanel(custom.whereToBuyUrl));
  const divisionCard = buildDivisionContactCard(custom.divisionContact);
  if (divisionCard) sidebar.append(divisionCard);
}

function buildFilterPanel() {
  const panel = document.createElement('div');
  panel.className = 'product-pdp-filter';

  const header = document.createElement('div');
  header.className = 'product-pdp-filter-header';
  header.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M1 2.5h14L9.5 9v4.5l-3-1.5V9z" fill="currentColor"/></svg>';
  const label = document.createElement('span');
  label.textContent = 'Filter by';
  header.append(label);

  const body = document.createElement('div');
  body.className = 'product-pdp-filter-body';
  const empty = document.createElement('p');
  empty.textContent = 'No filters selected';
  const helpLink = document.createElement('a');
  helpLink.href = '#';
  helpLink.textContent = 'Help us improve our filters';
  body.append(empty, helpLink);

  panel.append(header, body);
  return panel;
}

function buildAccountCard() {
  const card = document.createElement('div');
  card.className = 'product-pdp-account-card';

  const heading = document.createElement('h3');
  heading.textContent = 'Get your Parker account Today!';

  const body = document.createElement('p');
  body.textContent = 'Create an account to save your favorite products, track orders, and access exclusive pricing.';

  const cta = document.createElement('a');
  cta.href = '#';
  cta.className = 'button secondary';
  cta.textContent = 'Register now';

  card.append(heading, body, cta);
  return card;
}

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

function buildMainColumn(h1, picture, shortDescriptionEl) {
  const column = document.createElement('div');
  column.className = 'product-pdp-main';

  const overview = document.createElement('div');
  overview.className = 'product-pdp-overview';
  overview.append(buildGallery(picture), buildInfoColumn(h1, shortDescriptionEl));

  const sectionsContainer = document.createElement('div');
  sectionsContainer.className = 'product-enrichment-sections';

  column.append(buildBreadcrumb(h1 ? h1.textContent : ''), overview, sectionsContainer);
  return column;
}

function buildPdpLayout(h1, picture, shortDescriptionEl) {
  const layout = document.createElement('div');
  layout.className = 'product-pdp-layout';

  const sidebar = document.createElement('aside');
  sidebar.className = 'product-pdp-sidebar';
  sidebar.append(buildFilterPanel(), buildAccountCard());

  layout.append(sidebar, buildMainColumn(h1, picture, shortDescriptionEl));
  return layout;
}

export default async function decorate(block) {
  const main = document.querySelector('main');
  block.textContent = '';

  const { h1, picture, shortDescriptionEl } = extractPipelineContent(main, block);
  const layout = buildPdpLayout(h1, picture, shortDescriptionEl);
  block.append(layout);

  const sectionsContainer = layout.querySelector('.product-enrichment-sections');
  const gallery = layout.querySelector('.product-pdp-gallery');
  const infoColumn = layout.querySelector('.product-pdp-info');

  let data;
  try {
    const resp = await fetch(`${window.location.pathname}.json`);
    if (!resp.ok) throw new Error(`Product data request failed: ${resp.status}`);
    data = await resp.json();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Product Enrichment block: could not load product data', err);
    return;
  }

  // Progressive enhancement: the pipeline only server-renders one image, but
  // the full record may list several — refresh the gallery if so.
  if (Array.isArray(data.images) && data.images.length > 1) {
    renderGalleryThumbs(gallery, data.images);
  }

  const { custom } = data;
  if (!custom) return;

  // A record with `seriesPath` is a SKU (Product) page nested one level
  // below its Series page; a record with `parts` is the Series page itself
  // listing its SKU variants. Both share the same routing and JSON shape.
  if (custom.seriesPath) {
    applySkuPageEnhancements(layout, custom);
  } else if (Array.isArray(custom.parts) && custom.parts.length) {
    infoColumn.append(buildPartsSection(custom.seriesName, custom.numberOfSKUs, custom.parts));
  }

  if (custom.fullDescription) {
    sectionsContainer.append(buildFullDescriptionSection(custom.fullDescription));
  }

  if (Array.isArray(custom.technicalSpecifications) && custom.technicalSpecifications.length) {
    sectionsContainer.append(buildSpecificationsSection(custom.technicalSpecifications));
  }

  if (custom.relatedDocuments && Object.keys(custom.relatedDocuments).length) {
    sectionsContainer.append(buildDocumentsSection(custom.relatedDocuments));
  }
}
