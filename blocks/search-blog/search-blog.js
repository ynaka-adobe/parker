import {
  createOptimizedPicture,
  decorateIcons,
  fetchPlaceholders,
} from '../../scripts/aem.js';

/* no authorable options yet; any extra classes on the block are ignored */
const MIN_CHARS = 3;
const DEFAULT_SOURCE = '/us/en/query-index.json';

function findNextHeading(el) {
  let preceedingEl = el.parentElement.previousElement || el.parentElement.parentElement;
  let h = 'H2';
  while (preceedingEl) {
    const lastHeading = [...preceedingEl.querySelectorAll('h1, h2, h3, h4, h5, h6')].pop();
    if (lastHeading) {
      const level = parseInt(lastHeading.nodeName[1], 10);
      h = level < 6 ? `H${level + 1}` : 'H6';
      preceedingEl = false;
    } else {
      preceedingEl = preceedingEl.previousElement || preceedingEl.parentElement;
    }
  }
  return h;
}

function highlightTextElements(terms, elements) {
  elements.forEach((element) => {
    if (!element || !element.textContent) return;
    const { textContent } = element;
    const matches = [];
    terms.forEach((term) => {
      let offset = textContent.toLowerCase().indexOf(term);
      while (offset >= 0) {
        matches.push({ offset, term: textContent.substring(offset, offset + term.length) });
        offset = textContent.toLowerCase().indexOf(term, offset + term.length);
      }
    });
    if (!matches.length) return;

    matches.sort((a, b) => a.offset - b.offset);
    let currentIndex = 0;
    const fragment = document.createDocumentFragment();
    matches.forEach(({ offset, term }) => {
      if (offset < currentIndex) return;
      const before = textContent.substring(currentIndex, offset);
      if (before) fragment.append(document.createTextNode(before));
      const mark = document.createElement('mark');
      mark.textContent = term;
      fragment.append(mark);
      currentIndex = offset + term.length;
    });
    const after = textContent.substring(currentIndex);
    if (after) fragment.append(document.createTextNode(after));
    element.replaceChildren(fragment);
  });
}

async function fetchData(source) {
  try {
    const response = await fetch(source);
    if (!response.ok) return [];
    const json = await response.json();
    return (json && json.data) || [];
  } catch (e) {
    return [];
  }
}

/* results are scoped by the authored blog query index; drop incomplete rows and the current page */
function isBlogArticle(result) {
  if (!result || !result.path || !result.title) return false;
  return result.path !== window.location.pathname;
}

function filterData(terms, data) {
  const inTitle = [];
  const inMeta = [];
  data.filter(isBlogArticle).forEach((result) => {
    const title = (result.title || '').toLowerCase();
    const meta = `${result.description || ''} ${result.path.split('/').pop()}`.toLowerCase();
    if (terms.every((t) => title.includes(t))) inTitle.push(result);
    else if (terms.every((t) => title.includes(t) || meta.includes(t))) inMeta.push(result);
  });
  return [...inTitle, ...inMeta];
}

function renderResult(result, terms, titleTag) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = result.path;
  if (result.image && !result.image.includes('default-meta-image')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'search-blog-result-image';
    wrapper.append(createOptimizedPicture(result.image, '', false, [{ width: '375' }]));
    a.append(wrapper);
  }
  const body = document.createElement('div');
  body.className = 'search-blog-result-body';
  const title = document.createElement(titleTag);
  title.className = 'search-blog-result-title';
  title.textContent = result.title;
  highlightTextElements(terms, [title]);
  body.append(title);
  if (result.description) {
    const p = document.createElement('p');
    p.textContent = result.description;
    highlightTextElements(terms, [p]);
    body.append(p);
  }
  a.append(body);
  li.append(a);
  return li;
}

function setMessage(block, text) {
  const msg = block.querySelector('.search-blog-message');
  msg.textContent = text || '';
  msg.hidden = !text;
}

function updateUrl(value) {
  if (!window.history.replaceState) return;
  const url = new URL(window.location.href);
  if (value) url.searchParams.set('q', value);
  else url.searchParams.delete('q');
  window.history.replaceState({}, '', url.toString());
}

async function runSearch(block, config) {
  const input = block.querySelector('.search-blog-input');
  const results = block.querySelector('.search-blog-results');
  const value = input.value.trim();
  updateUrl(value);
  results.replaceChildren();
  results.classList.remove('no-results');

  if (!value) {
    setMessage(block, '');
    return;
  }
  if (value.length < MIN_CHARS) {
    setMessage(block, config.placeholders.searchMinChars
      || `Please enter at least ${MIN_CHARS} characters.`);
    return;
  }
  setMessage(block, '');

  if (!config.data) config.data = await fetchData(config.source);
  const terms = value.toLowerCase().split(/\s+/).filter(Boolean);
  const found = filterData(terms, config.data);
  if (!found.length) {
    results.classList.add('no-results');
    const li = document.createElement('li');
    li.textContent = config.placeholders.searchNoResults || 'No results found.';
    results.append(li);
    return;
  }
  const headingTag = results.dataset.h;
  found.forEach((result) => results.append(renderResult(result, terms, headingTag)));
}

function buildForm(block, config) {
  const form = document.createElement('form');
  form.className = 'search-blog-box';
  form.setAttribute('role', 'search');

  const placeholder = config.placeholders.searchBlogPlaceholder
    || config.placeholders.searchPlaceholder
    || 'What can we help you find?';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.className = 'search-blog-input';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);
  input.autocomplete = 'off';

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'search-blog-submit';
  button.setAttribute('aria-label', config.placeholders.searchSubmit || 'Search');
  const icon = document.createElement('span');
  icon.className = 'icon icon-search';
  button.append(icon);

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => runSearch(block, config), 250);
  });
  input.addEventListener('keyup', (e) => {
    if (e.code === 'Escape') {
      input.value = '';
      runSearch(block, config);
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearTimeout(timer);
    runSearch(block, config);
  });

  /* bordered field (input + submit) sits inside the white panel; the message follows it */
  const field = document.createElement('div');
  field.className = 'search-blog-field';
  field.append(input, button);
  form.append(field);
  return form;
}

export default async function decorate(block) {
  const link = block.querySelector('a[href]');
  const source = link ? link.href : DEFAULT_SOURCE;
  const placeholders = await fetchPlaceholders().catch(() => ({}));
  const config = { source, placeholders: placeholders || {} };

  const message = document.createElement('p');
  message.className = 'search-blog-message';
  message.setAttribute('aria-live', 'polite');
  message.hidden = true;

  const results = document.createElement('ul');
  results.className = 'search-blog-results';
  results.dataset.h = findNextHeading(block);

  const form = buildForm(block, config);
  form.append(message);
  block.replaceChildren(form, results);
  decorateIcons(block);

  const q = new URL(window.location.href).searchParams.get('q');
  if (q) {
    block.querySelector('.search-blog-input').value = q;
    runSearch(block, config);
  }
}
