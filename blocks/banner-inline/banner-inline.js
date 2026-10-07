export default function decorate(block) {
  // Inline promo strip: heading (+ optional text) on one side, CTA button(s) on the other.
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const text = document.createElement('div');
  text.className = 'banner-inline-text';
  const actions = document.createElement('div');
  actions.className = 'banner-inline-actions';

  cells.forEach((cell) => {
    [...cell.children].forEach((el) => {
      const isButton = el.classList.contains('button-container')
        || (el.tagName === 'P' && el.children.length === 1 && el.firstElementChild.tagName === 'A'
          && el.textContent.trim() === el.firstElementChild.textContent.trim());
      if (isButton) {
        el.classList.add('button-container');
        el.querySelector('a')?.classList.add('button');
        actions.append(el);
      } else {
        text.append(el);
      }
    });
  });

  const body = document.createElement('div');
  body.className = 'banner-inline-body';
  if (text.children.length) body.append(text);
  if (actions.children.length) body.append(actions);

  block.textContent = '';
  block.append(body);
}
