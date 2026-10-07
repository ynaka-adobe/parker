import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // one row per teaser card: [picture] | [heading, description, "Learn More" link]
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-teaser-card-image';
      else div.className = 'cards-teaser-card-body';
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  // teaser links are plain text links, not pill buttons
  ul.querySelectorAll('.cards-teaser-card-body a.button').forEach((a) => {
    a.classList.remove('button', 'primary', 'secondary');
    const container = a.closest('.button-container');
    if (container) {
      container.classList.remove('button-container');
      container.classList.add('cards-teaser-card-link');
    }
  });

  block.textContent = '';
  block.append(ul);
}
