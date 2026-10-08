import { fetchPlaceholders } from '../../scripts/aem.js';

/*
 * carousel-media — split image + text slider, one slide visible at a time.
 * Authoring: one row per slide, 2 cells:
 *   [picture] | [eyebrow p, heading, text / list, optional CTA].
 * Options: 'panel' — the text side sits on a light-grey panel and the image fills its half.
 */

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-media');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  block.querySelectorAll('.carousel-media-slide').forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a, button').forEach((el) => {
      if (idx !== slideIndex) el.setAttribute('tabindex', '-1');
      else el.removeAttribute('tabindex');
    });
  });

  block.querySelectorAll('.carousel-media-slide-indicator').forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-media-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a, button').forEach((el) => el.removeAttribute('tabindex'));
  block.querySelector('.carousel-media-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  block.querySelectorAll('.carousel-media-slide-indicator button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const indicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(indicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || 0, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || 0, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-media-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-media-${carouselId}-slide-${slideIndex}`;
  slide.classList.add('carousel-media-slide');

  const cells = [...row.querySelectorAll(':scope > div')];
  cells.forEach((cell, idx) => {
    // the picture-only cell is the image; anything else is content
    // (tolerates swapped or missing cells)
    const isImage = cell.querySelector('picture') && !cell.textContent.trim();
    cell.classList.add(`carousel-media-slide-${isImage ? 'image' : 'content'}`);
    if (!isImage && idx === 0 && cells.length === 1) slide.classList.add('carousel-media-slide-text-only');
    slide.append(cell);
  });

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading?.id) slide.setAttribute('aria-labelledby', heading.id);

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.id = `carousel-media-${carouselId}`;
  const rows = [...block.querySelectorAll(':scope > div')];
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carouselLabel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-media-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-media-slides');

  let slideIndicators;
  if (!isSingleSlide) {
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-media-slide-indicators');
    nav.append(slideIndicators);
    block.append(nav);

    const navButtons = document.createElement('div');
    navButtons.classList.add('carousel-media-navigation-buttons');
    navButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;
    container.append(navButtons);
  }

  rows.forEach((row, idx) => {
    slidesWrapper.append(createSlide(row, idx, carouselId));

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-media-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) bindEvents(block);
}
