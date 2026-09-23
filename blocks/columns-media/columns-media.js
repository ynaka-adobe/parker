export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-media-${cols.length}-cols`);

  // Identify media (image-only) columns vs. text columns so CSS can order/style them.
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is the only content in this column -> it is the media column
          picWrapper.classList.add('columns-media-img-col');
        }
      } else {
        col.classList.add('columns-media-text-col');
      }
    });
  });
}
