export default function decorate(block) {
  // Text-only promotional CTA strip: eyebrow, heading, paragraph, CTA.
  // Flatten the single-cell content into the block body and mark the link as a button.
  const bodyCell = block.querySelector(':scope > div > div');

  if (bodyCell) {
    bodyCell.classList.add('banner-cta-body');
    bodyCell.querySelectorAll('a').forEach((a) => a.classList.add('button'));
  }
}
