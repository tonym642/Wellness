// Foods Table Management Module

// Initialize foods table functionality
function initFoodsPage() {
  // Set modal context
  ModalManager.setContext('foods');
  ModalManager.setupEventListeners();
  
  // Initialize table rendering
  renderFoodsTable();
  
  // Setup event listeners
  setupFoodsEventListeners();
  setupFilterButtons();
}

// Foods data management
let foodsArray = JSON.parse(localStorage.getItem('foods')) || [
  { id: 1, name: "Chicken Breast", size: "200g", calories: 330, protein: "62g", carbs: "0g", fats: "7g", group: "protein", selected: false },
  { id: 2, name: "Salmon", size: "180g", calories: 367, protein: "56g", carbs: "0g", fats: "14g", group: "protein", selected: false },
  { id: 3, name: "Brown Rice", size: "150g cooked", calories: 216, protein: "5g", carbs: "45g", fats: "2g", group: "carb", selected: false },
  { id: 4, name: "Sweet Potato", size: "200g baked", calories: 172, protein: "4g", carbs: "39g", fats: "0g", group: "carb", selected: false },
  { id: 5, name: "Avocado", size: "100g", calories: 160, protein: "2g", carbs: "9g", fats: "15g", group: "fat", selected: false },
  { id: 6, name: "Greek Yogurt", size: "200g plain", calories: 130, protein: "20g", carbs: "9g", fats: "0g", group: "protein", selected: false },
  { id: 7, name: "Almonds", size: "30g (24 nuts)", calories: 174, protein: "6g", carbs: "6g", fats: "15g", group: "mixed", selected: false },
  { id: 8, name: "Broccoli", size: "100g steamed", calories: 34, protein: "3g", carbs: "7g", fats: "0g", group: "carb", selected: false },
  { id: 9, name: "Banana", size: "120g medium", calories: 107, protein: "1g", carbs: "27g", fats: "0g", group: "carb", selected: false },
  { id: 10, name: "Spinach", size: "50g fresh", calories: 12, protein: "1g", carbs: "2g", fats: "0g", group: "carb", selected: false },
  { id: 11, name: "Eggs", size: "2 large", calories: 140, protein: "12g", carbs: "1g", fats: "10g", group: "mixed", selected: false },
  { id: 12, name: "Oats", size: "50g dry", calories: 190, protein: "7g", carbs: "32g", fats: "4g", group: "carb", selected: false },
  { id: 13, name: "Water", size: "250ml", calories: 0, protein: "0g", carbs: "0g", fats: "0g", group: "drinks", selected: false },
  { id: 14, name: "Coffee", size: "240ml", calories: 2, protein: "0g", carbs: "0g", fats: "0g", group: "drinks", selected: false },
  { id: 15, name: "Orange Juice", size: "250ml", calories: 110, protein: "2g", carbs: "26g", fats: "0g", group: "drinks", selected: false }
];

// Migrate existing foods to add group field if missing
let migrated = false;
foodsArray.forEach(food => {
  if (!food.group) {
    food.group = 'mixed'; // Default to mixed if no group is set
    migrated = true;
  }
});

// Save migrated data
if (migrated) {
  saveFoods();
}

let nextId = Math.max(...foodsArray.map(f => f.id)) + 1 || 1;
let editingId = null;
let currentFilter = 'all'; // Track current filter

// Save to localStorage
function saveFoods() {
  localStorage.setItem('foods', JSON.stringify(foodsArray));
  
  // Notify other modules that foods data changed
  if (window.eventBus) {
    eventBus.emit('foodsUpdated', { foods: foodsArray });
  }
}

// Render foods table
function renderFoodsTable() {
  const tableBody = document.getElementById('foodsTableBody');
  if (!tableBody) return;
  
  // Clear existing content
  tableBody.innerHTML = '';

  // Filter foods based on current filter
  const filteredFoods = currentFilter === 'all' 
    ? foodsArray 
    : foodsArray.filter(food => food.group === currentFilter);

  filteredFoods.forEach(food => {
    const row = document.createElement('div');
    row.className = 'food-row';
    row.dataset.foodId = food.id;

    if (editingId === food.id) {
      row.className += ' editing';
      row.innerHTML = `
        <input type="checkbox" class="food-checkbox" ${food.selected ? 'checked' : ''} onchange="toggleFoodSelection(${food.id})">
        <input type="text" class="edit-input" value="${food.name}" id="edit-name-${food.id}">
        <input type="text" class="edit-input" value="${food.size}" id="edit-size-${food.id}">
        <input type="number" class="edit-input" value="${food.calories}" id="edit-calories-${food.id}">
        <input type="text" class="edit-input" value="${food.protein}" id="edit-protein-${food.id}">
        <input type="text" class="edit-input" value="${food.carbs}" id="edit-carbs-${food.id}">
        <input type="text" class="edit-input" value="${food.fats}" id="edit-fats-${food.id}">
        <select class="edit-input" id="edit-group-${food.id}">
          <option value="protein" ${food.group === 'protein' ? 'selected' : ''}>Protein</option>
          <option value="carb" ${food.group === 'carb' ? 'selected' : ''}>Carb</option>
          <option value="fat" ${food.group === 'fat' ? 'selected' : ''}>Fat</option>
          <option value="mixed" ${food.group === 'mixed' ? 'selected' : ''}>Mixed</option>
          <option value="drinks" ${food.group === 'drinks' ? 'selected' : ''}>Drinks</option>
        </select>
        <div class="action-buttons">
          <button class="btn btn-light btn-sm action-btn" onclick="saveEdit(${food.id})" title="Save Changes">
            <i class="bi bi-check-lg text-success fs-6"></i>
          </button>
          <button class="btn btn-light btn-sm action-btn" onclick="cancelEdit()" title="Cancel Edit">
            <i class="bi bi-x-lg text-secondary fs-6"></i>
          </button>
        </div>
      `;
    } else {
  const groupDisplayNames = { protein: 'Protein', carb: 'Carb', fat: 'Fat', mixed: 'Mixed', drinks: 'Drinks' };
      row.innerHTML = `
        <input type="checkbox" class="food-checkbox" ${food.selected ? 'checked' : ''} onchange="toggleFoodSelection(${food.id})">
        <div class="food-name">${food.name}</div>
        <div class="food-size">${food.size}</div>
        <div class="macro-value">${food.calories}</div>
        <div class="macro-value">${food.protein}</div>
        <div class="macro-value">${food.carbs}</div>
        <div class="macro-value">${food.fats}</div>
        <div class="group-badge group-${food.group || 'mixed'}">${groupDisplayNames[food.group] || 'Mixed'}</div>
        <div class="action-buttons">
          <button class="btn btn-light btn-sm action-btn edit-btn" onclick="ModalManager.openEditModal(${food.id})" title="Edit Food">
            <i class="bi bi-pencil-square text-warning fs-6"></i>
          </button>
          <button class="btn btn-light btn-sm action-btn delete-btn" onclick="ModalManager.openDeleteModal(${food.id})" title="Delete Food">
            <i class="bi bi-trash3 text-danger fs-6"></i>
          </button>
        </div>
      `;
    }

    tableBody.appendChild(row);
  });
}

// Toggle food selection
function toggleFoodSelection(id) {
  const food = foodsArray.find(f => f.id === id);
  if (food) {
    food.selected = !food.selected;
    saveFoods();
  }
}

// Setup event listeners for foods page
function setupFoodsEventListeners() {
  // Add Food Form Logic
  const addFoodBtn = document.getElementById('addFoodBtn');
  const addFoodForm = document.getElementById('addFoodForm');
  const saveFoodBtn = document.getElementById('saveFoodBtn');
  const cancelFoodBtn = document.getElementById('cancelFoodBtn');

  if (addFoodBtn && saveFoodBtn && cancelFoodBtn) {
    // Cancel button closes modal and clears form
    cancelFoodBtn.addEventListener('click', () => {
      clearForm();
    });

    saveFoodBtn.addEventListener('click', () => {
      const name = document.getElementById('newFoodName').value.trim();
      const size = document.getElementById('newFoodSize').value.trim();
      const calories = parseInt(document.getElementById('newFoodCalories').value) || 0;
      const protein = document.getElementById('newFoodProtein').value.trim();
      const carbs = document.getElementById('newFoodCarbs').value.trim();
      const fats = document.getElementById('newFoodFats').value.trim();
      const group = document.getElementById('newFoodGroup').value;

      if (name && size && calories >= 0 && protein && carbs && fats && group) {
        const newFood = {
          id: nextId++,
          name,
          size,
          calories,
          protein,
          carbs,
          fats,
          group,
          selected: false
        };
        
        foodsArray.push(newFood);
        saveFoods();
        renderFoodsTable();
        
        // Close modal using Bootstrap
        const modal = bootstrap.Modal.getInstance(document.getElementById('addFoodModal'));
        if (modal) {
          modal.hide();
        }
        
        clearForm();
      } else {
        alert('Please fill in all required fields');
      }
    });
  }

  // Search Functionality
  const foodSearch = document.getElementById("foodSearch");
  if (foodSearch) {
    foodSearch.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const foodRows = document.querySelectorAll(".food-row");
      
      foodRows.forEach(row => {
        const foodName = row.querySelector(".food-name");
        if (foodName) {
          const name = foodName.textContent.toLowerCase();
          if (name.includes(searchTerm)) {
            row.style.display = "grid";
          } else {
            row.style.display = "none";
          }
        }
      });
    });
  }
}

function clearForm() {
  document.getElementById('newFoodName').value = '';
  document.getElementById('newFoodSize').value = '';
  document.getElementById('newFoodCalories').value = '';
  document.getElementById('newFoodProtein').value = '';
  document.getElementById('newFoodCarbs').value = '';
  document.getElementById('newFoodFats').value = '';
  document.getElementById('newFoodGroup').value = '';
}

// Edit Food Functions
function editFood(id) {
  editingId = id;
  renderFoodsTable();
}

function saveEdit(id) {
  const food = foodsArray.find(f => f.id === id);
  if (food) {
    const name = document.getElementById(`edit-name-${id}`).value.trim();
    const size = document.getElementById(`edit-size-${id}`).value.trim();
    const calories = parseInt(document.getElementById(`edit-calories-${id}`).value) || 0;
    const protein = document.getElementById(`edit-protein-${id}`).value.trim();
    const carbs = document.getElementById(`edit-carbs-${id}`).value.trim();
    const fats = document.getElementById(`edit-fats-${id}`).value.trim();
    const group = document.getElementById(`edit-group-${id}`).value;

    if (name && size && calories >= 0 && protein && carbs && fats && group) {
      food.name = name;
      food.size = size;
      food.calories = calories;
      food.protein = protein;
      food.carbs = carbs;
      food.fats = fats;
      food.group = group;
      
      saveFoods();
      editingId = null;
      renderFoodsTable();
    } else {
      alert('Please fill in all fields with valid data.');
    }
  }
}

function cancelEdit() {
  editingId = null;
  renderFoodsTable();
}

// Delete Food Function
function deleteFood(id) {
  if (confirm('Are you sure you want to delete this food item?')) {
    foodsArray = foodsArray.filter(f => f.id !== id);
    saveFoods();
    renderFoodsTable();
  }
}

// Make functions global for inline onclick handlers
window.toggleFoodSelection = toggleFoodSelection;
window.editFood = editFood;
window.saveEdit = saveEdit;
window.cancelEdit = cancelEdit;
window.deleteFood = deleteFood;

// Setup filter buttons
function setupFilterButtons() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(b => b.classList.remove('active'));
      
      // Add active class to clicked button
      btn.classList.add('active');
      
      // Update current filter
      currentFilter = btn.dataset.group;
      
      // Re-render table with filter
      renderFoodsTable();
    });
  });
}

// API functions for other modules
window.getFoodsArray = () => foodsArray;
window.getSelectedFoods = () => foodsArray.filter(food => food.selected);

// Export for module loading system
window.initFoodsPage = initFoodsPage;