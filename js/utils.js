// Shared utility functions and data management

// --- localStorage Helpers ---
class LocalStorageManager {
  static getFoods() {
    return JSON.parse(localStorage.getItem('foods')) || [
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
      { id: 12, name: "Oats", size: "50g dry", calories: 190, protein: "7g", carbs: "32g", fats: "4g", group: "carb", selected: false }
    ];
  }

  static saveFoods(foods) {
    localStorage.setItem('foods', JSON.stringify(foods));
  }

  static getMeals() {
    return JSON.parse(localStorage.getItem('meals')) || {
      1: [], 2: [], 3: []
    };
  }

  static saveMeals(meals) {
    localStorage.setItem('meals', JSON.stringify(meals));
  }

  static getGoals() {
    return JSON.parse(localStorage.getItem('goals')) || {
      calories: 2500,
      protein: 180,
      carbs: 250,
      fats: 80
    };
  }

  static saveGoals(goals) {
    localStorage.setItem('goals', JSON.stringify(goals));
  }

  static getNutritionFilter() {
    return localStorage.getItem('nutritionFilter') || 'all';
  }

  static saveNutritionFilter(filter) {
    localStorage.setItem('nutritionFilter', filter);
  }
}

// --- Data Migration Helpers ---
class DataMigrator {
  static migrateFoodsData(foodsArray) {
    let migrated = false;
    foodsArray.forEach(food => {
      if (!food.group) {
        food.group = 'mixed'; // Default to mixed if no group is set
        migrated = true;
      }
    });
    
    if (migrated) {
      LocalStorageManager.saveFoods(foodsArray);
    }
    
    return foodsArray;
  }
}

// --- Formatting Utilities ---
class Formatter {
  static parseNumeric(value) {
    if (typeof value === 'string') {
      return parseFloat(value.replace(/[^\d.]/g, '')) || 0;
    }
    return parseFloat(value) || 0;
  }

  static formatMacro(value) {
    return `${value}g`;
  }

  static formatCalories(value) {
    return value.toLocaleString();
  }

  static capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// --- Calculation Utilities ---
class Calculator {
  static calculateMealTotals(mealFoods) {
    return mealFoods.reduce((totals, food) => {
      totals.calories += food.calories;
      totals.protein += Formatter.parseNumeric(food.protein);
      totals.carbs += Formatter.parseNumeric(food.carbs);
      totals.fats += Formatter.parseNumeric(food.fats);
      return totals;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }

  static calculateDailyTotals(mealsData) {
    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    
    Object.values(mealsData).forEach(meal => {
      if (Array.isArray(meal)) {
        const mealTotals = this.calculateMealTotals(meal);
        totals.calories += mealTotals.calories;
        totals.protein += mealTotals.protein;
        totals.carbs += mealTotals.carbs;
        totals.fats += mealTotals.fats;
      }
    });
    
    return totals;
  }

  static calculateProgress(actual, goal) {
    return Math.min((actual / goal) * 100, 100);
  }
}

// --- UI Utilities ---
class UIHelpers {
  static showToast(message, duration = 2000) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent);
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  static generateId(array) {
    return Math.max(...array.map(item => item.id || 0)) + 1 || 1;
  }

  static clearElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = '';
    }
  }

  static toggleClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.toggle(className);
    }
  }
}

// --- Event Bus for Module Communication ---
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

// Global event bus instance
const eventBus = new EventBus();

// --- Global Data State ---
class AppState {
  constructor() {
    this.foods = DataMigrator.migrateFoodsData(LocalStorageManager.getFoods());
    this.meals = LocalStorageManager.getMeals();
    this.goals = LocalStorageManager.getGoals();
    this.currentPage = 'goals';
  }

  updateFoods(foods) {
    this.foods = foods;
    LocalStorageManager.saveFoods(foods);
    eventBus.emit('foods-updated', foods);
  }

  updateMeals(meals) {
    this.meals = meals;
    LocalStorageManager.saveMeals(meals);
    eventBus.emit('meals-updated', meals);
  }

  updateGoals(goals) {
    this.goals = goals;
    LocalStorageManager.saveGoals(goals);
    eventBus.emit('goals-updated', goals);
  }

  setCurrentPage(page) {
    this.currentPage = page;
    eventBus.emit('page-changed', page);
  }
}

// Global app state instance
const appState = new AppState();

// --- Global Modal Manager ---
class ModalManager {
  static currentContext = '';
  static currentEditId = null;
  static currentDeleteId = null;
  
  static setContext(context) {
    this.currentContext = context;
  }
  
  static setupEventListeners() {
    // Save edit button
    const saveEditBtn = document.getElementById('saveEditFood');
    if (saveEditBtn) {
      saveEditBtn.removeEventListener('click', this.handleSaveEdit);
      saveEditBtn.addEventListener('click', this.handleSaveEdit.bind(this));
    }
    
    // Confirm delete button  
    const confirmDeleteBtn = document.getElementById('confirmDeleteFood');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.removeEventListener('click', this.handleConfirmDelete);
      confirmDeleteBtn.addEventListener('click', this.handleConfirmDelete.bind(this));
    }
  }
  
  static openEditModal(foodId) {
    const foods = LocalStorageManager.getFoods();
    const food = foods.find(f => f.id === parseInt(foodId));
    
    if (!food) return;
    
    this.currentEditId = food.id;
    
    // Prefill modal fields
    document.getElementById('editFoodName').value = food.name;
    document.getElementById('editFoodSize').value = food.size || '';
    document.getElementById('editCalories').value = food.calories;
    document.getElementById('editProtein').value = food.protein.replace('g', '');
    document.getElementById('editCarbs').value = food.carbs.replace('g', '');
    document.getElementById('editFats').value = food.fats.replace('g', '');
    document.getElementById('editFoodGroup').value = food.group || 'mixed';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editFoodModal'));
    modal.show();
  }
  
  static openDeleteModal(foodId) {
    const foods = LocalStorageManager.getFoods();
    const food = foods.find(f => f.id === parseInt(foodId));
    
    if (!food) return;
    
    this.currentDeleteId = food.id;
    document.getElementById('deleteFoodName').textContent = food.name;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('deleteFoodModal'));
    modal.show();
  }
  
  static handleSaveEdit() {
    const foods = LocalStorageManager.getFoods();
    const idx = foods.findIndex(f => f.id === this.currentEditId);
    
    if (idx === -1) return;
    
    // Update food data
    foods[idx] = {
      ...foods[idx],
      name: document.getElementById('editFoodName').value,
      size: document.getElementById('editFoodSize').value,
      calories: parseInt(document.getElementById('editCalories').value) || 0,
      protein: document.getElementById('editProtein').value + 'g',
      carbs: document.getElementById('editCarbs').value + 'g',
      fats: document.getElementById('editFats').value + 'g',
      group: document.getElementById('editFoodGroup').value
    };
    
    // Save to localStorage
    LocalStorageManager.saveFoods(foods);
    
    // Emit update event
    eventBus.emit('foodsUpdated');
    
    // Context-specific refresh
    if (this.currentContext === 'nutrition') {
      if (window.renderNutritionFoodsList) {
        window.renderNutritionFoodsList();
      }
    } else if (this.currentContext === 'foods') {
      if (window.renderFoodsTable) {
        window.renderFoodsTable();
      }
    }
    
    // Hide modal
    bootstrap.Modal.getInstance(document.getElementById('editFoodModal')).hide();
  }
  
  static handleConfirmDelete() {
    let foods = LocalStorageManager.getFoods();
    foods = foods.filter(f => f.id !== this.currentDeleteId);
    
    // Save to localStorage
    LocalStorageManager.saveFoods(foods);
    
    // Emit update event
    eventBus.emit('foodsUpdated');
    
    // Context-specific refresh
    if (this.currentContext === 'nutrition') {
      if (window.renderNutritionFoodsList) {
        window.renderNutritionFoodsList();
      }
    } else if (this.currentContext === 'foods') {
      if (window.renderFoodsTable) {
        window.renderFoodsTable();
      }
    }
    
    // Hide modal
    bootstrap.Modal.getInstance(document.getElementById('deleteFoodModal')).hide();
  }
}

// Export for modules
window.LocalStorageManager = LocalStorageManager;
window.DataMigrator = DataMigrator;
window.Formatter = Formatter;
window.Calculator = Calculator;
window.UIHelpers = UIHelpers;
window.EventBus = EventBus;
window.eventBus = eventBus;
window.AppState = AppState;
window.appState = appState;
window.ModalManager = ModalManager;
