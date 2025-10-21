// Goals page functionality

// Goals data structure
let goalsData = JSON.parse(localStorage.getItem('goalsData')) || {
  nutrition: ["Eat 200g protein daily", "Stay under 2500 calories"],
  fitness: ["Train 5x per week", "Increase strength by 10%"],
  wellness: ["Sleep 8 hours", "Meditate 10 min daily"]
};

// Save goals to localStorage
function saveGoals() {
  localStorage.setItem('goalsData', JSON.stringify(goalsData));
}

// Load and render all goals
function loadGoals() {
  renderGoals('nutrition');
  renderGoals('fitness');
  renderGoals('wellness');
}

// Render goals for a specific category
function renderGoals(category) {
  const listElement = document.getElementById(`${category}GoalsList`);
  if (!listElement) return;

  listElement.innerHTML = '';

  if (goalsData[category].length === 0) {
    listElement.innerHTML = '<li class="empty-state">No goals yet. Click "Add Goal" to get started!</li>';
    return;
  }

  goalsData[category].forEach((goal, index) => {
    const li = document.createElement('li');
      // If the ul has class 'display-only' or the page container is marked display-only-goals, render plain text only (no actions)
      const pageDisplayOnly = document.querySelector('.display-only-goals') !== null;
      if (listElement.classList.contains('display-only') || pageDisplayOnly) {
      li.textContent = goal;
      li.className = 'mb-2';
      listElement.appendChild(li);
    } else {
      li.className = 'goal-item';
      li.innerHTML = `
        <span class="goal-text">${escapeHtml(goal)}</span>
        <div class="goal-actions">
          <button class="btn btn-sm btn-light edit-goal-btn" data-category="${category}" data-index="${index}" title="Edit">
            <i class="bi bi-pencil text-warning"></i>
          </button>
          <button class="btn btn-sm btn-light delete-goal-btn" data-category="${category}" data-index="${index}" title="Delete">
            <i class="bi bi-trash text-danger"></i>
          </button>
        </div>
      `;
      listElement.appendChild(li);
    }
  });

  // Add event listeners for edit and delete buttons
  listElement.querySelectorAll('.edit-goal-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      const index = parseInt(this.getAttribute('data-index'));
      editGoal(category, index);
    });
  });

  listElement.querySelectorAll('.delete-goal-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      const index = parseInt(this.getAttribute('data-index'));
      deleteGoal(category, index);
    });
  });
}

// Add new goal
function addGoal(category) {
  const listElement = document.getElementById(`${category}GoalsList`);
  
  // Remove empty state if exists
  const emptyState = listElement.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }

  // Create new goal item with input
  const li = document.createElement('li');
  li.className = 'goal-item';
  li.innerHTML = `
    <input type="text" class="goal-input" placeholder="Enter your goal..." />
    <div class="goal-actions">
      <button class="btn btn-sm btn-success save-new-btn" title="Save">
        <i class="bi bi-check-lg"></i>
      </button>
      <button class="btn btn-sm btn-secondary cancel-new-btn" title="Cancel">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  `;
  listElement.appendChild(li);

  // Focus on input
  const input = li.querySelector('.goal-input');
  input.focus();

  // Add event listeners
  const saveBtn = li.querySelector('.save-new-btn');
  const cancelBtn = li.querySelector('.cancel-new-btn');

  saveBtn.addEventListener('click', () => saveNewGoal(saveBtn, category));
  cancelBtn.addEventListener('click', () => cancelNewGoal(cancelBtn));

  // Handle Enter key
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveNewGoal(saveBtn, category);
    }
  });

  // Handle Escape key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cancelNewGoal(cancelBtn);
    }
  });
}

// Save new goal
function saveNewGoal(button, category) {
  const li = button.closest('.goal-item');
  const input = li.querySelector('.goal-input');
  const goalText = input.value.trim();

  if (goalText === '') {
    li.remove();
    if (goalsData[category].length === 0) {
      renderGoals(category);
    }
    return;
  }

  goalsData[category].push(goalText);
  saveGoals();
  renderGoals(category);
}

// Cancel new goal
function cancelNewGoal(button) {
  const li = button.closest('.goal-item');
  const category = li.closest('ul').id.replace('GoalsList', '');
  li.remove();
  
  if (goalsData[category].length === 0) {
    renderGoals(category);
  }
}

// Edit goal
function editGoal(category, index) {
  const listElement = document.getElementById(`${category}GoalsList`);
  const li = listElement.children[index];
  const currentText = goalsData[category][index];

  li.innerHTML = `
    <input type="text" class="goal-input" value="${escapeHtml(currentText)}" />
    <div class="goal-actions">
      <button class="btn btn-sm btn-success save-edit-btn" title="Save">
        <i class="bi bi-check-lg"></i>
      </button>
      <button class="btn btn-sm btn-secondary cancel-edit-btn" title="Cancel">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  `;

  const input = li.querySelector('.goal-input');
  input.focus();
  input.select();

  const saveBtn = li.querySelector('.save-edit-btn');
  const cancelBtn = li.querySelector('.cancel-edit-btn');

  saveBtn.addEventListener('click', () => saveEditGoal(saveBtn, category, index));
  cancelBtn.addEventListener('click', () => cancelEditGoal(cancelBtn, category, index));

  // Handle Enter key
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveEditGoal(saveBtn, category, index);
    }
  });

  // Handle Escape key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cancelEditGoal(cancelBtn, category, index);
    }
  });

  // Handle blur (clicking outside)
  input.addEventListener('blur', () => {
    setTimeout(() => {
      if (document.activeElement !== input) {
        saveEditGoal(saveBtn, category, index);
      }
    }, 200);
  });
}

// Save edited goal
function saveEditGoal(button, category, index) {
  const li = button.closest('.goal-item');
  const input = li.querySelector('.goal-input');
  const goalText = input.value.trim();

  if (goalText === '') {
    // If empty, delete the goal
    deleteGoal(category, index);
    return;
  }

  goalsData[category][index] = goalText;
  saveGoals();
  renderGoals(category);
}

// Cancel edit goal
function cancelEditGoal(button, category, index) {
  renderGoals(category);
}

// Delete goal
function deleteGoal(category, index) {
  const listElement = document.getElementById(`${category}GoalsList`);
  const li = listElement.children[index];

  // Add fade-out animation
  li.classList.add('fade-out');

  // Wait for animation to complete
  setTimeout(() => {
    goalsData[category].splice(index, 1);
    saveGoals();
    renderGoals(category);
  }, 300);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize goals page
function initGoalsPage() {
  loadGoals();
  
  // Setup add goal button event listeners
  document.querySelectorAll('button[data-category]').forEach(button => {
    button.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      addGoal(category);
    });
  });
  // adjust card heights to match viewport
  adjustCardHeights();
  window.addEventListener('resize', adjustCardHeights);
  // ensure no global overflow class remains
  document.body.classList.remove('cards-fullscreen');
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGoalsPage);
} else {
  initGoalsPage();
}

// Adjust cards to fill the viewport height for consistent sizing
function adjustCardHeights() {
  const container = document.querySelector('.container-fluid');
  if (!container) return;
  const header = document.querySelector('header');
  const headerHeight = header ? header.offsetHeight : 0;
  const cs = window.getComputedStyle(container);
  const containerPadTop = parseFloat(cs.paddingTop) || 0;
  const containerPadBottom = parseFloat(cs.paddingBottom) || 0;
  const extraGap = 24;
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
    card.style.minHeight = available + 'px';
    card.style.overflow = 'visible';
    const body = card.querySelector('.card-body');
    if (body) {
      body.style.maxHeight = 'none';
      body.style.overflow = 'visible';
    }
  });
}
