import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * cards-video — row of video tiles: 16:9 thumbnail with a play icon, caption below.
 * Authoring: one row per video: [thumbnail picture] | [H3 caption, link to the MP4 or video page].
 * .mp4 links play in a modal <dialog> with a native <video>; other links open in a new tab.
 */

const isMp4 = (url) => /\.mp4$/i.test(url.pathname);

function toUrl(href) {
  try {
    const url = new URL(href, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

function getDialog(block) {
  let dialog = block.querySelector('dialog.cards-video-dialog');
  if (dialog) return dialog;

  dialog = document.createElement('dialog');
  dialog.className = 'cards-video-dialog';

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'cards-video-close';
  close.setAttribute('aria-label', 'Close video');

  const video = document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'none';

  dialog.append(close, video);
  close.addEventListener('click', () => dialog.close());
  // click on the backdrop (outside the video) closes
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
    dialog.opener?.focus();
    dialog.opener = null;
  });

  block.append(dialog);
  return dialog;
}

function openVideo(block, url, label, opener) {
  const dialog = getDialog(block);
  const video = dialog.querySelector('video');
  dialog.setAttribute('aria-label', label);
  video.setAttribute('aria-label', label);
  video.src = url.href;
  dialog.opener = opener;
  dialog.showModal();
  dialog.querySelector('.cards-video-close').focus();
  video.play().catch(() => { /* autoplay blocked: controls remain available */ });
}

function buildTrigger(block, url, label) {
  let trigger;
  if (isMp4(url)) {
    trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.addEventListener('click', () => openVideo(block, url, label, trigger));
  } else {
    trigger = document.createElement('a');
    trigger.href = url.href;
    trigger.target = '_blank';
    trigger.rel = 'noopener';
  }
  trigger.className = 'cards-video-trigger';
  trigger.setAttribute('aria-label', `Play video: ${label}`);
  return trigger;
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-video-card-image';
      else div.className = 'cards-video-card-body';
    });

    const body = li.querySelector('.cards-video-card-body');
    const link = body?.querySelector('a[href]');
    const url = link ? toUrl(link.getAttribute('href')) : null;
    const heading = body?.querySelector('h1, h2, h3, h4, h5, h6');
    const label = (heading || link || li).textContent.trim() || 'Video';

    if (url) {
      // the link only carries the video URL: drop it (and its now-empty paragraph)
      const holder = link.closest('p');
      if (holder && holder.textContent.trim() === link.textContent.trim()) holder.remove();
      else link.remove();

      li.classList.add('cards-video-card-playable');
      const trigger = buildTrigger(block, url, label);
      const imageCell = li.querySelector('.cards-video-card-image');
      if (imageCell) imageCell.append(trigger);
      else li.prepend(trigger);
      // the caption is a click target too (one tab stop: the trigger)
      body.addEventListener('click', (e) => {
        if (!e.target.closest('a, button')) trigger.click();
      });
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
