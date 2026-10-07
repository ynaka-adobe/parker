export default function decorate(block) {
  // Row 1: background picture. Row 2: eyebrow, heading, text, CTA -> white boxed card.
  const picture = block.querySelector('picture');
  const media = document.createElement('div');
  media.className = 'hero-card-media';
  if (picture) {
    const wrapper = picture.parentElement;
    media.append(picture);
    if (wrapper && wrapper.tagName === 'P' && !wrapper.textContent.trim() && !wrapper.children.length) {
      wrapper.remove();
    }
  }

  const card = document.createElement('div');
  card.className = 'hero-card-card';
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    while (cell.firstChild) card.append(cell.firstChild);
  });

  // a short paragraph directly before the heading is the eyebrow ("Featured White Paper")
  const heading = card.querySelector(':scope > :is(h1, h2, h3, h4, h5, h6)');
  const eyebrow = heading?.previousElementSibling;
  if (eyebrow && eyebrow.tagName === 'P' && !eyebrow.querySelector('a, picture')) {
    eyebrow.classList.add('hero-card-eyebrow');
  }

  block.textContent = '';
  if (picture) block.append(media);
  if (card.textContent.trim() || card.children.length) block.append(card);
}
