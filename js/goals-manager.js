// Goals Manager page script (external)
// Provides initGoalsManagerPage() so the page loader can initialize this view

function getGoalsData() {
  const raw = localStorage.getItem('goalsData');
  if (raw) return JSON.parse(raw);

  // Migration: support older per-key storage (goals_nutrition, goals_fitness, goals_wellness)
  let nutrition = [];
  let fitness = [];
  let wellness = [];
  try {
    nutrition = JSON.parse(localStorage.getItem('goals_nutrition')) || JSON.parse(localStorage.getItem('goals-nutrition')) || [];
  } catch (e) { nutrition = [] }
  try {
    fitness = JSON.parse(localStorage.getItem('goals_fitness')) || JSON.parse(localStorage.getItem('goals-fitness')) || [];
  } catch (e) { fitness = [] }
  try {
    wellness = JSON.parse(localStorage.getItem('goals_wellness')) || JSON.parse(localStorage.getItem('goals-wellness')) || [];
  } catch (e) { wellness = [] }

  const migrated = { nutrition, fitness, wellness };
  localStorage.setItem('goalsData', JSON.stringify(migrated));
  return migrated;
}

function setGoalsData(goalsData) {
  localStorage.setItem('goalsData', JSON.stringify(goalsData));
}

function renderGoals(section) {
  const list = document.getElementById(section + 'GoalsList');
  if (!list) return;
  const goalsData = getGoalsData();
  const goals = goalsData[section] || [];
  list.innerHTML = '';

  goals.forEach((goal, idx) => {
    const li = document.createElement('li');
    li.className = 'd-flex align-items-center mb-2 goal-row';

    // Input (flex-grow) and actions (no-shrink) so actions stay on the right
    const inputId = `${section}-goal-${idx}`;
    li.innerHTML = `
      <input id="${inputId}" type="text" class="form-control shadow-sm flex-grow-1 me-3 goal-input" value="${escapeHtml(goal)}">
      <div class="goal-actions d-flex flex-shrink-0">
        <button class="btn btn-sm btn-light me-1" title="Edit" onclick="document.getElementById('${inputId}').focus();">
          <i class="bi bi-pencil text-warning"></i>
        </button>
        <button class="btn btn-sm btn-light" title="Delete" onclick="deleteGoal('${section}',${idx})">
          <i class="bi bi-trash text-danger"></i>
        </button>
      </div>
    `;

    list.appendChild(li);

    // wire up input change to save
    const inputEl = document.getElementById(inputId);
    inputEl.addEventListener('change', function() {
      saveGoal(section, idx, this.value);
    });
  });
}

function addGoal(section) {
  const goalsData = getGoalsData();
  goalsData[section] = goalsData[section] || [];
  goalsData[section].push('');
  setGoalsData(goalsData);
  renderGoals(section);
}

function saveGoal(section, idx, value) {
  const goalsData = getGoalsData();
  goalsData[section][idx] = value;
  setGoalsData(goalsData);
}

function deleteGoal(section, idx) {
  const goalsData = getGoalsData();
  goalsData[section].splice(idx, 1);
  setGoalsData(goalsData);
  renderGoals(section);
}

function loadGoals() {
  renderGoals('nutrition');
  renderGoals('fitness');
  renderGoals('wellness');
}

// safe escape for values placed into value="..."
function escapeHtml(str){
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Called by page loader when this page is loaded/initialized
async function initGoalsManagerPage() {
  // small delay to ensure DOM nodes injected
  await new Promise(r => setTimeout(r, 0));
  loadGoals();
  // adjust card heights to match viewport
  adjustCardHeights();
  window.addEventListener('resize', adjustCardHeights);
  // ensure no global overflow class remains
  document.body.classList.remove('cards-fullscreen');
}

// Expose functions for inline buttons (page markup uses onclick="addGoal('nutrition')")
window.addGoal = addGoal;
window.deleteGoal = deleteGoal;
window.saveGoal = saveGoal;
window.getGoalsData = getGoalsData;
window.setGoalsData = setGoalsData;
window.initGoalsManagerPage = initGoalsManagerPage;
// Adjusts goal cards to fill the available viewport height so they're all equal
function adjustCardHeights() {
  const container = document.querySelector('.container-fluid');
  if (!container) return;
  // Subtract header/topbar height to avoid overflowing the viewport
  const header = document.querySelector('header');
  const headerHeight = header ? header.offsetHeight : 0;
  // account for container vertical padding
  const cs = window.getComputedStyle(container);
  const containerPadTop = parseFloat(cs.paddingTop) || 0;
  const containerPadBottom = parseFloat(cs.paddingBottom) || 0;
  const extraGap = 24; // visual spacing
  // Determine available height by subtracting header and title heights to avoid overflow
  const top = container.getBoundingClientRect().top;
  const titleEl = container.querySelector('h4');
  let titleHeight = 0;
  if (titleEl) {
    const tc = window.getComputedStyle(titleEl);
    titleHeight = titleEl.getBoundingClientRect().height + (parseFloat(tc.marginTop) || 0) + (parseFloat(tc.marginBottom) || 0);
  }
  let available = window.innerHeight - headerHeight - titleHeight - extraGap;
  if (available < 200) available = 200;
  const cards = container.querySelectorAll('.card');
  cards.forEach(card => {
    // set min-height so cards expand to at least the viewport area but allow page scrolling
    card.style.minHeight = available + 'px';
    card.style.overflow = 'visible';
    const body = card.querySelector('.card-body');
    if (body) {
      body.style.maxHeight = 'none';
      body.style.overflow = 'visible';
    }
  });
}
