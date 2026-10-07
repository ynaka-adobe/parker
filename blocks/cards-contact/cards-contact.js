import { moveInstrumentation } from '../../scripts/scripts.js';

const isBlank = (el) => !el || (!el.textContent.replace(/\u00a0/g, ' ').trim() && !el.querySelector('img, picture'));
const isPhoneCell = (cell) => !!cell.querySelector('a[href^="tel:"]')
  || /^[\s+()\d.-]{7,}$/.test(cell.textContent.replace(/\u00a0/g, ' ').trim());

export default function decorate(block) {
  // contact directory: one row per contact group -> [heading] | [phone, optional] | [details]
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    const cells = [...row.children];
    const heading = cells.shift();
    let phone = null;
    let details = null;
    if (cells.length >= 2) {
      [phone, details] = cells;
      // tolerate extra cells by folding them into the details column
      cells.slice(2).forEach((extra) => details.append(...extra.childNodes));
    } else if (cells.length === 1) {
      if (isPhoneCell(cells[0])) [phone] = cells;
      else [details] = cells;
    }

    if (heading) {
      heading.className = 'cards-contact-heading';
      li.append(heading);
    }
    if (phone && !isBlank(phone)) {
      phone.className = 'cards-contact-phone';
      li.append(phone);
    } else {
      li.classList.add('cards-contact-no-phone');
    }
    if (details && !isBlank(details)) {
      details.className = 'cards-contact-details';
      li.append(details);
    }
    ul.append(li);
  });

  // phone numbers, emails and URLs are plain links, not pill buttons
  ul.querySelectorAll('a.button').forEach((a) => {
    a.classList.remove('button', 'primary', 'secondary');
    a.closest('.button-container')?.classList.remove('button-container');
  });

  block.textContent = '';
  block.append(ul);
}
