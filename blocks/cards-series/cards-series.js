import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Series list: one row per series — thumbnail, linked title + description, product count.
 * Row cells: [image] [title link + description] [product count].
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    const [image, body, count] = [...row.children];
    if (image) image.className = 'cards-series-image';
    if (body) body.className = 'cards-series-body';
    if (count) count.className = 'cards-series-count';
    [image, body, count].filter(Boolean).forEach((cell) => li.append(cell));

    // the whole card navigates to the series link
    const link = body?.querySelector('a[href]');
    if (link) {
      link.classList.remove('button');
      link.parentElement.classList.remove('button-container');
      li.classList.add('cards-series-linked');
      li.addEventListener('click', (e) => {
        if (!e.target.closest('a')) link.click();
      });
    }
    ul.append(li);
  });
  // only optimize images served from this site; external (parker.com) assets are used as-is
  ul.querySelectorAll('picture > img').forEach((img) => {
    if (new URL(img.src, window.location.href).origin !== window.location.origin) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '300' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
