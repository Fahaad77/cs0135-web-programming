const slides = Array.from(document.querySelectorAll('.slide'));
const current = document.querySelector('[data-current-slide]');
const total = document.querySelector('[data-total-slides]');
const notesPanel = document.querySelector('[data-notes-panel]');
const notesContent = document.querySelector('[data-notes-content]');
let index = Number(new URLSearchParams(location.search).get('slide') || 1) - 1;

function show(nextIndex) {
  index = Math.max(0, Math.min(slides.length - 1, nextIndex));
  slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
  current.textContent = String(index + 1);
  total.textContent = String(slides.length);
  const note = slides[index].querySelector('.speaker-notes');
  notesContent.innerHTML = note ? note.innerHTML : '<p>No notes for this slide.</p>';
  history.replaceState(null, '', `?slide=${index + 1}`);
}

function toggleNotes() {
  notesPanel.hidden = !notesPanel.hidden;
}

document.querySelector('[data-next]').addEventListener('click', () => show(index + 1));
document.querySelector('[data-prev]').addEventListener('click', () => show(index - 1));
document.querySelector('[data-notes]').addEventListener('click', toggleNotes);

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') show(index + 1);
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') show(index - 1);
  if (event.key.toLowerCase() === 's') toggleNotes();
  if (event.key === 'Home') show(0);
  if (event.key === 'End') show(slides.length - 1);
});

show(index);
