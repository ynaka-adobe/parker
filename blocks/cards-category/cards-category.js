import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-category-card-image';
      else div.className = 'cards-category-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';

  // grid option: plain wrapping grid, no slider arrows
  if (block.classList.contains('grid')) {
    ul.querySelectorAll('li').forEach((li) => {
      if (li.querySelector('.cards-category-card-body a[href]')) li.classList.add('cards-category-linked');
    });
    block.append(ul);
    return;
  }

  // horizontal slider: scroll the track one page at a time with prev/next arrows
  const navButton = (dir, label) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `cards-category-nav cards-category-${dir}`;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', () => {
      ul.scrollBy({ left: (dir === 'next' ? 1 : -1) * ul.clientWidth, behavior: 'smooth' });
    });
    return button;
  };
  const prev = navButton('prev', 'Previous categories');
  const next = navButton('next', 'Next categories');
  const updateNav = () => {
    prev.disabled = ul.scrollLeft <= 1;
    next.disabled = ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 1;
  };
  ul.addEventListener('scroll', updateNav, { passive: true });
  new ResizeObserver(updateNav).observe(ul);

  block.append(prev, ul, next);
}
