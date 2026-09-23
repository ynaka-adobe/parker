export default function decorate(block) {
  /* text-only news list: each row becomes a list item with a linked title and a meta line */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      div.className = 'cards-news-card-body';
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
