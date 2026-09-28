const slides = Array.from(document.querySelectorAll('.slide'));
const current = document.querySelector('[data-current-slide]');
const total = document.querySelector('[data-total-slides]');
const progress = document.querySelector('[data-progress-bar]');
const notesButton = document.querySelector('[data-notes]');
const notesPanel = document.querySelector('[data-notes-panel]');
const notesContent = document.querySelector('[data-notes-content]');
let index = Number(new URLSearchParams(location.search).get('slide') || 1) - 1;
let fragmentIndex = 0;

function fragmentsFor(slide) {
  return Array.from(slide.querySelectorAll('.fragment'));
}

function syncFragments() {
  fragmentsFor(slides[index]).forEach((fragment, i) => {
    fragment.classList.toggle('visible', i < fragmentIndex);
    fragment.setAttribute('aria-hidden', i < fragmentIndex ? 'false' : 'true');
  });
}

function updateNotes() {
  if (!notesContent) return;
  const note = slides[index].querySelector('.speaker-notes');
  notesContent.innerHTML = note ? note.innerHTML : '<p>No notes for this slide.</p>';
}

function show(nextIndex, options = {}) {
  index = Math.max(0, Math.min(slides.length - 1, nextIndex));
  if (!options.keepFragments) fragmentIndex = 0;
  slides.forEach((slide, i) => {
    const active = i === index;
    slide.classList.toggle('active', active);
    slide.setAttribute('aria-hidden', active ? 'false' : 'true');
  });
  if (current) current.textContent = String(index + 1);
  if (total) total.textContent = String(slides.length);
  if (progress) progress.style.width = `${((index + 1) / slides.length) * 100}%`;
  updateNotes();
  syncFragments();
  history.replaceState(null, '', `?slide=${index + 1}`);
}

function next() {
  const fragments = fragmentsFor(slides[index]);
  if (fragmentIndex < fragments.length) {
    fragmentIndex += 1;
    syncFragments();
    return;
  }
  show(index + 1);
}

function prev() {
  if (fragmentIndex > 0) {
    fragmentIndex -= 1;
    syncFragments();
    return;
  }
  show(index - 1);
}

function toggleNotes() {
  if (!notesPanel) return;
  notesPanel.hidden = !notesPanel.hidden;
  if (notesButton) notesButton.setAttribute('aria-expanded', String(!notesPanel.hidden));
}

const nextButton = document.querySelector('[data-next]');
const prevButton = document.querySelector('[data-prev]');
if (nextButton) nextButton.addEventListener('click', next);
if (prevButton) prevButton.addEventListener('click', prev);
if (notesButton) notesButton.addEventListener('click', toggleNotes);

document.addEventListener('keydown', (event) => {
  const tag = event.target && event.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
    event.preventDefault();
    next();
  }
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault();
    prev();
  }
  if (event.key.toLowerCase() === 's') toggleNotes();
  if (event.key === 'Home') show(0);
  if (event.key === 'End') show(slides.length - 1);
});

show(index);
