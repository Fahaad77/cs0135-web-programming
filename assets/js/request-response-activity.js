const correctOrder = [
  'User enters a URL.',
  'Browser sends an HTTP request.',
  'Server finds or generates the resource.',
  'Browser receives an HTML response.',
  'Browser parses HTML and builds the DOM.',
];

const hintText = 'Start with the action the user controls. The browser then asks the server for a resource before it can display anything.';
const explanation = 'A browser does not already have the page. The user gives it a URL, the browser requests the resource, the server responds, and then the browser parses the HTML into the DOM.';
const list = document.querySelector('[data-sort-list]');
const feedback = document.querySelector('[data-feedback]');
const attemptsLabel = document.querySelector('[data-attempts]');
const live = document.querySelector('[data-live-region]');
const reveal = document.querySelector('[data-reveal-answer]');
let draggedItem = null;
let attempts = Number(sessionStorage.getItem('week01RequestAttempts') || 0);

function shuffledItems() {
  const items = [...correctOrder];
  do {
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
  } while (items.every((item, index) => item === correctOrder[index]));
  return items.map((text) => ({ text }));
}

function announce(message) {
  live.textContent = message;
}

function currentItems() {
  return Array.from(list.querySelectorAll('.sort-item'));
}

function render(items) {
  list.innerHTML = items.map((item) => `
    <li class="sort-item" draggable="true">
      <span class="item-text">${item.text}</span>
      <div class="item-controls" aria-label="Move ${item.text}">
        <button class="small-button" type="button" data-move="up">Move Up</button>
        <button class="small-button" type="button" data-move="down">Move Down</button>
      </div>
    </li>
  `).join('');
  attachItemEvents();
}

function attachItemEvents() {
  currentItems().forEach((item) => {
    item.addEventListener('dragstart', () => {
      draggedItem = item;
      item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      draggedItem = null;
    });
    item.addEventListener('dragover', (event) => {
      event.preventDefault();
      if (!draggedItem || draggedItem === item) return;
      const rect = item.getBoundingClientRect();
      const after = event.clientY > rect.top + rect.height / 2;
      list.insertBefore(draggedItem, after ? item.nextSibling : item);
    });
    item.querySelectorAll('[data-move]').forEach((button) => {
      button.addEventListener('click', () => moveItem(item, button.dataset.move));
    });
  });
}

function moveItem(item, direction) {
  if (direction === 'up' && item.previousElementSibling) {
    list.insertBefore(item, item.previousElementSibling);
    item.querySelector('[data-move="up"]').focus();
    announce('Item moved up.');
  }
  if (direction === 'down' && item.nextElementSibling) {
    list.insertBefore(item.nextElementSibling, item);
    item.querySelector('[data-move="down"]').focus();
    announce('Item moved down.');
  }
}

function checkAnswer() {
  attempts += 1;
  sessionStorage.setItem('week01RequestAttempts', String(attempts));
  attemptsLabel.textContent = String(attempts);
  const items = currentItems();
  let correct = 0;
  items.forEach((item, index) => {
    const isCorrect = item.querySelector('.item-text').textContent === correctOrder[index];
    item.classList.toggle('correct', isCorrect);
    item.classList.toggle('reconsider', !isCorrect);
    if (isCorrect) correct += 1;
  });
  if (correct === correctOrder.length) {
    feedback.className = 'feedback success';
    feedback.innerHTML = `<strong>Correct.</strong> ${explanation}`;
    reveal.hidden = false;
    announce('Correct order.');
    return;
  }
  feedback.className = 'feedback warn';
  feedback.innerHTML = `<strong>${correct} of ${correctOrder.length} positions are correct.</strong> Review the items marked for reconsideration and try again.`;
  if (attempts >= 3) {
    reveal.hidden = false;
    feedback.innerHTML += ' You can now reveal the complete answer if you need it.';
  }
  announce(`${correct} positions correct. Try again.`);
}

function resetActivity() {
  sessionStorage.removeItem('week01RequestAttempts');
  attempts = 0;
  attemptsLabel.textContent = '0';
  feedback.className = 'feedback';
  feedback.textContent = 'Move the steps into the best order, then check your answer.';
  reveal.hidden = true;
  render(shuffledItems());
  announce('Activity reset.');
}

document.querySelector('[data-check]').addEventListener('click', checkAnswer);
document.querySelector('[data-reset]').addEventListener('click', resetActivity);
document.querySelector('[data-hint]').addEventListener('click', () => {
  feedback.className = 'feedback';
  feedback.textContent = hintText;
  announce('Hint shown.');
});

reveal.addEventListener('toggle', () => {
  if (reveal.open) announce('Complete answer revealed.');
});

attemptsLabel.textContent = String(attempts);
render(shuffledItems());
