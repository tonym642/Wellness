// Nutrition page functionality

// Initialize nutrition page
function initNutritionPage() {
  console.log('Initializing Nutrition Page');
  
  // Set modal context
  ModalManager.setContext('nutrition');
  ModalManager.setupEventListeners();
  
  // Initialize data
  loadMealsData();
  loadGoalsData();
  
  // Setup UI
  setupNutritionFilter();
  setupMealTabs();
  setupGoalsEditor();
  setupToggleButtons();
  setupMealActions();
  setupDayNavigation();
  
  // Render initial content
  renderMeals();
  renderNutritionFoodsList();
  updateNutritionProgress();
  updateNutritionTotals();
}

// Number formatting helper
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Data management - now supports 7 days
let weekMealsData = JSON.parse(localStorage.getItem('weekMeals')) || {
  day1: { meal1: [], meal2: [], meal3: [] },
  day2: { meal1: [], meal2: [], meal3: [] },
  day3: { meal1: [], meal2: [], meal3: [] },
  day4: { meal1: [], meal2: [], meal3: [] },
  day5: { meal1: [], meal2: [], meal3: [] },
  day6: { meal1: [], meal2: [], meal3: [] },
  day7: { meal1: [], meal2: [], meal3: [] }
};

let currentDay = 1;
let mealsData = weekMealsData.day1;

let dailyGoals = JSON.parse(localStorage.getItem('goals')) || {
  calories: 2500,
  protein: 180,
  carbs: 250,
  fats: 70
};

let activeMeal = 1;
let lastAddedItem = null;
let currentGroupFilter = localStorage.getItem('nutritionFilter') || 'all';

function loadMealsData() {
  const stored = localStorage.getItem('weekMeals');
  if (stored) {
    weekMealsData = JSON.parse(stored);
    mealsData = weekMealsData[`day${currentDay}`];
  }
}

function loadGoalsData() {
  const stored = localStorage.getItem('goals');
  if (stored) {
    dailyGoals = JSON.parse(stored);
  }
}

// Save functions
function saveMeals() {
  weekMealsData[`day${currentDay}`] = mealsData;
  localStorage.setItem('weekMeals', JSON.stringify(weekMealsData));
  updateNutritionProgress();
  updateNutritionTotals();
}

function saveGoals() {
  localStorage.setItem('goals', JSON.stringify(dailyGoals));
  updateNutritionProgress();
  updateNutritionTotals();
}

// Meal management
function addFoodToMeal(foodId) {
  const food = LocalStorageManager.getFoods().find(f => f.id === foodId);
  if (!food) return;

  const mealKey = `meal${activeMeal}`;
  const mealItem = {
    id: food.id,
    name: food.name,
    size: food.size,
    calories: food.calories,
    protein: parseInt(food.protein) || 0,
    carbs: parseInt(food.carbs) || 0,
    fats: parseInt(food.fats) || 0
  };

  mealsData[mealKey] = mealsData[mealKey] || [];
  mealsData[mealKey].push(mealItem);
  
  lastAddedItem = { mealKey, item: mealItem };
  
  saveMeals();
  renderMeals();
  
  // Show undo button
  const undoBtn = document.getElementById('undoLastAdd');
  if (undoBtn) {
    undoBtn.style.display = 'inline-block';
  }
}

function removeFoodFromMeal(mealKey, foodId) {
  if (mealsData[mealKey]) {
    mealsData[mealKey] = mealsData[mealKey].filter(item => item.id !== foodId);
    saveMeals();
    renderMeals();
  }
}

function clearAllMeals() {
  if (confirm('Are you sure you want to clear all meals?')) {
    mealsData = { meal1: [], meal2: [], meal3: [] };
    saveMeals();
    renderMeals();
    
    // Hide undo button
    const undoBtn = document.getElementById('undoLastAdd');
    if (undoBtn) {
      undoBtn.style.display = 'none';
    }
  }
}

function undoLastAdd() {
  if (lastAddedItem) {
    const { mealKey, item } = lastAddedItem;
    if (mealsData[mealKey]) {
      const index = mealsData[mealKey].findIndex(mealItem => 
        mealItem.id === item.id && mealItem.name === item.name
      );
      if (index > -1) {
        mealsData[mealKey].splice(index, 1);
        saveMeals();
        renderMeals();
      }
    }
    
    lastAddedItem = null;
    const undoBtn = document.getElementById('undoLastAdd');
    if (undoBtn) {
      undoBtn.style.display = 'none';
    }
  }
}

function toggleMealCollapse(mealNumber) {
  const mealContent = document.getElementById(`mealContent${mealNumber}`);
  const isCurrentlyCollapsed = mealContent.style.display === 'none';
  
  // Toggle visibility
  mealContent.style.display = isCurrentlyCollapsed ? 'block' : 'none';
  
  // Save state to localStorage
  localStorage.setItem(`meal${mealNumber}Collapsed`, !isCurrentlyCollapsed);
  
  // Re-render to update the button icon
  renderMeals();
}

function setActiveMeal(mealNumber) {
  activeMeal = mealNumber;
  const activeMealName = document.getElementById('activeMealName');
  if (activeMealName) {
    activeMealName.textContent = `Meal ${activeMeal}`;
  }
  renderMeals(); // Re-render to update the checked radio button
}

// Rendering functions
function renderMeals() {
  const container = document.getElementById('mealsContainer');
  if (!container) return;

  let mealsHtml = '';
  
  for (let i = 1; i <= 3; i++) {
    const mealKey = `meal${i}`;
    const meal = mealsData[mealKey] || [];
    const mealTotals = calculateMealTotals(meal);
    const isCollapsed = localStorage.getItem(`meal${i}Collapsed`) === 'true';
    
    mealsHtml += `
      <div class="meal-card">
        <div class="meal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="radio" name="activeMeal" value="${i}" ${activeMeal === i ? 'checked' : ''} onchange="setActiveMeal(${i})" style="width: 16px; height: 16px; cursor: pointer;">
            <span>Meal ${i}</span>
          </div>
          <div class="meal-header-actions">
            <span class="meal-total-summary">${formatNumber(mealTotals.calories)} cal • ${formatNumber(mealTotals.protein)}g P • ${formatNumber(mealTotals.carbs)}g C • ${formatNumber(mealTotals.fats)}g F</span>
            <button class="btn btn-light btn-sm action-btn meal-toggle-btn" onclick="toggleMealCollapse(${i})" title="${isCollapsed ? 'Expand' : 'Collapse'} meal details">
              <i class="bi bi-chevron-${isCollapsed ? 'down' : 'up'} text-primary fs-6"></i>
            </button>
          </div>
        </div>
        
        <div class="meal-content" id="mealContent${i}" style="display: ${isCollapsed ? 'none' : 'block'}">
          <div class="nutrition-grid-header">
            <div>Food</div>
            <div>Cal</div>
            <div>P</div>
            <div>C</div>
            <div>F</div>
            <div></div>
          </div>
    `;

    if (meal.length === 0) {
      mealsHtml += '<div class="meal-empty">No foods added yet — select items from the left list.</div>';
    } else {
      meal.forEach(item => {
        mealsHtml += `
          <div class="meal-item">
            <div class="food-name">${item.name} (${item.size})</div>
            <div class="macro-value">${item.calories}</div>
            <div class="macro-value">${item.protein}g</div>
            <div class="macro-value">${item.carbs}g</div>
            <div class="macro-value">${item.fats}g</div>
            <button class="btn btn-light btn-sm action-btn delete-btn" onclick="removeFoodFromMeal('${mealKey}', ${item.id})" title="Remove from Meal">
              <i class="bi bi-trash3 text-danger fs-6"></i>
            </button>
          </div>
        `;
      });

      // Calculate meal totals
      mealsHtml += `
        <div class="meal-total">
          <div><strong>Meal ${i} Total</strong></div>
          <div><strong>${formatNumber(mealTotals.calories)}</strong></div>
          <div><strong>${formatNumber(mealTotals.protein)}g</strong></div>
          <div><strong>${formatNumber(mealTotals.carbs)}g</strong></div>
          <div><strong>${formatNumber(mealTotals.fats)}g</strong></div>
          <div></div>
        </div>
      `;
    }

    mealsHtml += '</div></div>'; // Close meal-content and meal-card
  }

  container.innerHTML = mealsHtml;
}

function renderNutritionFoodsList() {
  const container = document.getElementById('nutritionFoodsList');
  if (!container) return;

  const foodsArray = LocalStorageManager.getFoods();
  const filteredFoods = currentGroupFilter === 'all' 
    ? foodsArray 
    : foodsArray.filter(food => food.group === currentGroupFilter);

  if (currentGroupFilter === 'all') {
    // Show foods grouped by category
    const groupedFoods = {
      protein: filteredFoods.filter(food => food.group === 'protein'),
      carb: filteredFoods.filter(food => food.group === 'carb'),
      fat: filteredFoods.filter(food => food.group === 'fat'),
      mixed: filteredFoods.filter(food => food.group === 'mixed')
    };

    let html = '';
    const groupNames = { protein: 'Proteins', carb: 'Carbs', fat: 'Fats', mixed: 'Mixed' };

    Object.entries(groupedFoods).forEach(([groupKey, foods]) => {
      if (foods.length > 0) {
        html += `<div class="food-group-section">
          <h6 class="food-group-title">${groupNames[groupKey]}</h6>
          <div class="food-group-items">`;
        
        foods.forEach(food => {
          html += renderNutritionFoodItem(food);
        });
        
        html += `</div></div>`;
      }
    });

    container.innerHTML = html || '<div class="empty-state">No foods available.</div>';
  } else {
    // Show flat list for specific group
    let html = '';
    filteredFoods.forEach(food => {
      html += renderNutritionFoodItem(food);
    });
    container.innerHTML = html || '<div class="empty-state">No foods in this group.</div>';
  }
}

function renderNutritionFoodItem(food) {
  return `
    <div class="nutrition-food-item-grid" data-food-id="${food.id}">
      <div class="food-name-cell">${food.name} (${food.size})</div>
      <div class="food-macro-cell desktop-macro">${food.calories}</div>
      <div class="food-macro-cell desktop-macro">${food.protein}</div>
      <div class="food-macro-cell desktop-macro">${food.carbs}</div>
      <div class="food-macro-cell desktop-macro">${food.fats}</div>
      <div class="food-macro-row mobile-macro">
        <div class="food-macro-cell">${food.calories} cal</div>
        <div class="food-macro-cell">${food.protein} P</div>
        <div class="food-macro-cell">${food.carbs} C</div>
        <div class="food-macro-cell">${food.fats} F</div>
      </div>
      <div class="action-buttons">
        <button class="btn btn-success btn-sm action-btn add-btn" onclick="addFoodToMeal(${food.id})" title="Add to Meal">
          <i class="bi bi-plus-circle text-white fs-6"></i>
        </button>
        <button class="btn btn-light btn-sm action-btn edit-btn" onclick="ModalManager.openEditModal(${food.id})" title="Edit Food">
          <i class="bi bi-pencil-square text-warning fs-6"></i>
        </button>
        <button class="btn btn-light btn-sm action-btn delete-btn" onclick="ModalManager.openDeleteModal(${food.id})" title="Delete Food">
          <i class="bi bi-trash3 text-danger fs-6"></i>
        </button>
      </div>
    </div>`;
}

// Calculation functions
function calculateMealTotals(meal) {
  return meal.reduce((totals, item) => ({
    calories: totals.calories + (parseInt(item.calories) || 0),
    protein: totals.protein + (parseInt(item.protein) || 0),
    carbs: totals.carbs + (parseInt(item.carbs) || 0),
    fats: totals.fats + (parseInt(item.fats) || 0)
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
}

function calculateDailyTotals() {
  let dailyTotals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
  
  Object.values(mealsData).forEach(meal => {
    const mealTotals = calculateMealTotals(meal);
    dailyTotals.calories += mealTotals.calories;
    dailyTotals.protein += mealTotals.protein;
    dailyTotals.carbs += mealTotals.carbs;
    dailyTotals.fats += mealTotals.fats;
  });
  
  return dailyTotals;
}

// UI Updates
function updateNutritionProgress() {
  const totals = calculateDailyTotals();
  const progressText = document.getElementById('progressText');
  const progressFill = document.getElementById('progressFill');
  
  if (progressText && progressFill) {
    const percentage = Math.min(100, (totals.calories / dailyGoals.calories) * 100);
    progressText.textContent = `${formatNumber(totals.calories)} / ${formatNumber(dailyGoals.calories)} kcal (${Math.round(percentage)}%)`;
    progressFill.style.width = `${percentage}%`;
  }
}

function updateNutritionTotals() {
  const totals = calculateDailyTotals();
  
  // Update daily goals vs actual
  const actualCalories = document.getElementById('actualCalories');
  const actualProtein = document.getElementById('actualProtein');
  const actualCarbs = document.getElementById('actualCarbs');
  const actualFats = document.getElementById('actualFats');
  
  if (actualCalories) actualCalories.textContent = formatNumber(totals.calories);
  if (actualProtein) actualProtein.textContent = `${formatNumber(totals.protein)}g`;
  if (actualCarbs) actualCarbs.textContent = `${formatNumber(totals.carbs)}g`;
  if (actualFats) actualFats.textContent = `${formatNumber(totals.fats)}g`;
  
  // Update goal displays
  const goalCalories = document.getElementById('goalCalories');
  const goalProtein = document.getElementById('goalProtein');
  const goalCarbs = document.getElementById('goalCarbs');
  const goalFats = document.getElementById('goalFats');
  
  if (goalCalories) goalCalories.textContent = formatNumber(dailyGoals.calories);
  if (goalProtein) goalProtein.textContent = formatNumber(dailyGoals.protein);
  if (goalCarbs) goalCarbs.textContent = formatNumber(dailyGoals.carbs);
  if (goalFats) goalFats.textContent = formatNumber(dailyGoals.fats);
  
  // Update totals section
  const totalCalories = document.getElementById('totalCalories');
  const totalProtein = document.getElementById('totalProtein');
  const totalCarbs = document.getElementById('totalCarbs');
  const totalFats = document.getElementById('totalFats');
  
  if (totalCalories) totalCalories.textContent = formatNumber(totals.calories);
  if (totalProtein) totalProtein.textContent = `${formatNumber(totals.protein)}g`;
  if (totalCarbs) totalCarbs.textContent = `${formatNumber(totals.carbs)}g`;
  if (totalFats) totalFats.textContent = `${formatNumber(totals.fats)}g`;
  
  // Update percentages
  const proteinPct = document.getElementById('proteinPct');
  const carbsPct = document.getElementById('carbsPct');
  const fatsPct = document.getElementById('fatsPct');
  
  if (proteinPct) proteinPct.textContent = Math.round((totals.protein / dailyGoals.protein) * 100);
  if (carbsPct) carbsPct.textContent = Math.round((totals.carbs / dailyGoals.carbs) * 100);
  if (fatsPct) fatsPct.textContent = Math.round((totals.fats / dailyGoals.fats) * 100);
  
  // Update macro bars
  updateMacroBars(totals);
}

function updateMacroBars(totals) {
  const proteinBar = document.getElementById('proteinBar');
  const carbsBar = document.getElementById('carbsBar');
  const fatsBar = document.getElementById('fatsBar');
  
  if (proteinBar) {
    const proteinPct = Math.min(100, (totals.protein / dailyGoals.protein) * 100);
    proteinBar.style.width = `${proteinPct}%`;
  }
  
  if (carbsBar) {
    const carbsPct = Math.min(100, (totals.carbs / dailyGoals.carbs) * 100);
    carbsBar.style.width = `${carbsPct}%`;
  }
  
  if (fatsBar) {
    const fatsPct = Math.min(100, (totals.fats / dailyGoals.fats) * 100);
    fatsBar.style.width = `${fatsPct}%`;
  }
}

// UI Setup functions
function setupMealTabs() {
  const tabs = document.querySelectorAll('.meal-tab');
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active meal
      activeMeal = index + 1;
      
      // Update active meal indicator
      const activeMealName = document.getElementById('activeMealName');
      if (activeMealName) {
        activeMealName.textContent = `Meal ${activeMeal}`;
      }
    });
  });
}

function setupNutritionFilter() {
  // Desktop filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentGroupFilter = btn.dataset.group;
      localStorage.setItem('nutritionFilter', currentGroupFilter);
      renderNutritionFoodsList();
    });
  });
  
  // Mobile filter dropdown
  const dropdown = document.getElementById('groupFilterDropdown');
  if (dropdown) {
    dropdown.value = currentGroupFilter;
    dropdown.addEventListener('change', () => {
      currentGroupFilter = dropdown.value;
      localStorage.setItem('nutritionFilter', currentGroupFilter);
      renderNutritionFoodsList();
      
      // Update desktop buttons
      filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.group === currentGroupFilter);
      });
    });
  }
}

function setupGoalsEditor() {
  const editBtn = document.getElementById('editGoalsBtn');
  const saveBtn = document.getElementById('saveGoalsBtn');
  const cancelBtn = document.getElementById('cancelGoalsBtn');
  const viewMode = document.getElementById('goalsViewMode');
  const editMode = document.getElementById('goalsEditMode');
  
  if (editBtn && saveBtn && cancelBtn && viewMode && editMode) {
    editBtn.addEventListener('click', () => {
      viewMode.style.display = 'none';
      editMode.style.display = 'block';
      
      // Populate current values
      document.getElementById('editCalories').value = dailyGoals.calories;
      document.getElementById('editProtein').value = dailyGoals.protein;
      document.getElementById('editCarbs').value = dailyGoals.carbs;
      document.getElementById('editFats').value = dailyGoals.fats;
    });
    
    saveBtn.addEventListener('click', () => {
      dailyGoals.calories = parseInt(document.getElementById('editCalories').value) || 2500;
      dailyGoals.protein = parseInt(document.getElementById('editProtein').value) || 180;
      dailyGoals.carbs = parseInt(document.getElementById('editCarbs').value) || 250;
      dailyGoals.fats = parseInt(document.getElementById('editFats').value) || 70;
      
      saveGoals();
      
      viewMode.style.display = 'block';
      editMode.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
      viewMode.style.display = 'block';
      editMode.style.display = 'none';
    });
  }
}

function setupToggleButtons() {
  const toggleLeftTop = document.getElementById('toggleNutritionLeftTop');
  const showLeft = document.getElementById('showNutritionLeft');
  const leftSection = document.getElementById('nutritionLeft');
  
  if (toggleLeftTop && showLeft && leftSection) {
    toggleLeftTop.addEventListener('click', () => {
      leftSection.style.display = 'none';
      showLeft.style.display = 'block';
      toggleLeftTop.style.display = 'none';
    });
    
    showLeft.addEventListener('click', () => {
      leftSection.style.display = 'block';
      showLeft.style.display = 'none';
      toggleLeftTop.style.display = 'block';
    });
  }
}

// Event listeners for meal actions
function setupMealActions() {
  const clearBtn = document.getElementById('clearAllMeals');
  const undoBtn = document.getElementById('undoLastAdd');
  
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAllMeals);
  }
  
  if (undoBtn) {
    undoBtn.addEventListener('click', undoLastAdd);
  }
}

// Day navigation setup
function setupDayNavigation() {
  const dayButtons = document.querySelectorAll('.day-btn');
  
  dayButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const newDay = parseInt(btn.getAttribute('data-day'));
      switchDay(newDay);
    });
  });
}

function switchDay(dayNumber) {
  // Save current day's meals before switching
  weekMealsData[`day${currentDay}`] = mealsData;
  localStorage.setItem('weekMeals', JSON.stringify(weekMealsData));
  
  // Switch to new day
  currentDay = dayNumber;
  mealsData = weekMealsData[`day${currentDay}`];
  
  // Update UI
  document.querySelectorAll('.day-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`.day-btn[data-day="${dayNumber}"]`).classList.add('active');
  
  // Re-render with new day's data
  renderMeals();
  updateNutritionProgress();
  updateNutritionTotals();
}

// Make functions global for onclick handlers
window.addFoodToMeal = addFoodToMeal;
window.removeFoodFromMeal = removeFoodFromMeal;
window.clearAllMeals = clearAllMeals;
window.undoLastAdd = undoLastAdd;
window.toggleMealCollapse = toggleMealCollapse;

// Initialize when foods data changes
if (window.eventBus) {
  window.eventBus.on('foodsUpdated', () => {
    renderNutritionFoodsList();
  });
}

// Export main function
window.initNutritionPage = initNutritionPage;
