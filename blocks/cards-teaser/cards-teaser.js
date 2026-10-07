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

  const hasButtons = block.classList.contains('buttons');

  if (hasButtons) {
    // buttons option: the CTA keeps its pill-button decoration; flag its container for CSS
    ul.querySelectorAll('.cards-teaser-card-body a.button').forEach((a) => {
      a.closest('.button-container')?.classList.add('cards-teaser-card-cta');
    });
  } else {
    // teaser links are plain text links, not pill buttons
    ul.querySelectorAll('.cards-teaser-card-body a.button').forEach((a) => {
      a.classList.remove('button', 'primary', 'secondary');
      const container = a.closest('.button-container');
      if (container) {
        container.classList.remove('button-container');
        container.classList.add('cards-teaser-card-link');
      }
    });
  }

  // text option only (not with buttons): whole card is clickable (stretched title link in CSS);
  // flag cards whose link leaves this site so CSS can show the external-link icon.
  if (block.classList.contains('text') && !hasButtons) {
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const link = li.querySelector('.cards-teaser-card-body a[href]');
      if (!link) return;
      li.classList.add('cards-teaser-card-linked');
      const external = link.target === '_blank'
        || (/^https?:$/.test(link.protocol) && link.hostname !== window.location.hostname);
      if (external) li.classList.add('cards-teaser-card-external');
    });
  }

  block.textContent = '';
  block.append(ul);
}
