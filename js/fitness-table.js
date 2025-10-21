// Fitness Table functionality
let exercisesData = [];
let filteredExercises = [];

// Initialize fitness table page
async function initFitnessTablePage() {
  console.log('Initializing Fitness Table Page');
  
  await loadExercisesData();
  setupTableFilters();
  
  // Use setTimeout to ensure DOM is fully rendered
  setTimeout(() => {
    setupAddExerciseForm();
    
    // Check if we need to edit a specific exercise (from fitness page)
    const editExerciseId = localStorage.getItem('editExerciseId');
    if (editExerciseId) {
      localStorage.removeItem('editExerciseId'); // Clear the flag
      setTimeout(() => {
        editExercise(editExerciseId);
      }, 500); // Wait a bit more for everything to load
    }
  }, 100);
  
  renderExerciseTable();
}

// Load exercises from JSON
async function loadExercisesData() {
  try {
    const response = await fetch('./data/exercises.json');
    if (response.ok) {
      const data = await response.json();
      exercisesData = data.exercises;
      
      // Also load custom exercises from localStorage
      loadCustomExercises();
      
      filteredExercises = [...exercisesData];
      console.log('Loaded exercises for table:', exercisesData.length);
    } else {
      console.error('Failed to load exercises.json');
    }
  } catch (error) {
    console.error('Error loading exercise data:', error);
  }
}

// Setup filter event listeners
function setupTableFilters() {
  const categoryFilter = document.getElementById('categoryFilter');
  const equipmentFilter = document.getElementById('equipmentFilter');
  const difficultyFilter = document.getElementById('difficultyFilter');

  if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilters);
  }
  
  if (equipmentFilter) {
    equipmentFilter.addEventListener('change', applyFilters);
  }
  
  if (difficultyFilter) {
    difficultyFilter.addEventListener('change', applyFilters);
  }
}

// Apply all filters
function applyFilters() {
  const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
  const equipmentFilter = document.getElementById('equipmentFilter')?.value || 'all';
  const difficultyFilter = document.getElementById('difficultyFilter')?.value || 'all';

  filteredExercises = exercisesData.filter(exercise => {
    const categoryMatch = categoryFilter === 'all' || exercise.category.toLowerCase() === categoryFilter;
    const equipmentMatch = equipmentFilter === 'all' || exercise.equipment.toLowerCase() === equipmentFilter;
    const difficultyMatch = difficultyFilter === 'all' || exercise.difficulty.toLowerCase() === difficultyFilter;
    
    return categoryMatch && equipmentMatch && difficultyMatch;
  });

  renderExerciseTable();
}

// Render the exercise table
function renderExerciseTable() {
  const tbody = document.getElementById('exerciseTableBody');
  if (!tbody) return;

  let html = '';

  filteredExercises.forEach(exercise => {
    html += `
      <tr class="exercise-row" data-exercise-id="${exercise.id}">
        <td class="exercise-name">
          <strong>${exercise.name}</strong>
        </td>
        <td>
          <span class="category-badge category-${exercise.category.toLowerCase()}">${exercise.category}</span>
        </td>
        <td>${exercise.equipment}</td>
        <td>${exercise.primary_muscle}</td>
        <td>
          ${exercise.sets} × ${exercise.reps || 'Time-based'}
        </td>
        <td>${Math.ceil(exercise.duration / 60)} min</td>
        <td>
          <span class="difficulty-badge difficulty-${exercise.difficulty.toLowerCase()}">${exercise.difficulty}</span>
        </td>
        <td class="action-buttons">
          <button class="btn btn-sm btn-info me-1" onclick="showExerciseDetails('${exercise.id}')" title="View Details">
            <i class="bi bi-info-circle"></i>
          </button>
          <button class="btn btn-sm btn-warning me-1" onclick="editExercise('${exercise.id}')" title="Edit Exercise">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteExercise('${exercise.id}')" title="Delete Exercise">
            <i class="bi bi-trash3"></i>
          </button>
        </td>
      </tr>
    `;
  });

  if (filteredExercises.length === 0) {
    html = `
      <tr>
        <td colspan="8" class="text-center py-4 text-muted">
          <i class="bi bi-search"></i>
          <p class="mb-0 mt-2">No exercises found matching your filters.</p>
        </td>
      </tr>
    `;
  }

  tbody.innerHTML = html;
}

// Show exercise details in modal
function showExerciseDetails(exerciseId) {
  const exercise = exercisesData.find(ex => ex.id === exerciseId);
  if (!exercise) return;

  const modalTitle = document.getElementById('exerciseModalTitle');
  const modalBody = document.getElementById('exerciseModalBody');
  const addBtn = document.getElementById('addToWorkoutBtn');

  if (modalTitle) {
    modalTitle.textContent = exercise.name;
  }

  if (modalBody) {
    modalBody.innerHTML = `
      <div class="exercise-details-content">
        <div class="row">
          <div class="col-md-6">
            <h6>Exercise Information</h6>
            <p><strong>Category:</strong> ${exercise.category}</p>
            <p><strong>Equipment:</strong> ${exercise.equipment}</p>
            <p><strong>Primary Muscle:</strong> ${exercise.primary_muscle}</p>
            <p><strong>Secondary Muscles:</strong> ${exercise.secondary_muscles.join(', ')}</p>
            <p><strong>Difficulty:</strong> ${exercise.difficulty}</p>
            <p><strong>Type:</strong> ${exercise.type}</p>
          </div>
          
          <div class="col-md-6">
            <h6>Training Parameters</h6>
            <p><strong>Sets:</strong> ${exercise.sets}</p>
            <p><strong>Reps:</strong> ${exercise.reps || 'Time-based'}</p>
            ${exercise.weight ? `<p><strong>Weight:</strong> ${exercise.weight} lbs</p>` : ''}
            <p><strong>Duration:</strong> ${exercise.duration} seconds</p>
            <p><strong>Rest Time:</strong> ${exercise.rest_time} seconds</p>
            <p><strong>Calories:</strong> ${exercise.calories_per_minute} per minute</p>
          </div>
        </div>
        
        <div class="mt-3">
          <h6>Instructions</h6>
          <p>${exercise.instructions}</p>
        </div>
        
        <div class="mt-3">
          <h6>Tips</h6>
          <p class="text-info">${exercise.tips}</p>
        </div>
        
        ${exercise.video_url ? `
          <div class="mt-3">
            <h6>Video Reference</h6>
            <a href="${exercise.video_url}" target="_blank" class="btn btn-outline-primary btn-sm">
              <i class="bi bi-play-circle"></i> Watch on YouTube
            </a>
          </div>
        ` : ''}
      </div>
    `;
  }

  if (addBtn) {
    addBtn.onclick = () => addExerciseToWorkout(exerciseId);
  }

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById('exerciseDetailsModal'));
  modal.show();
}

// Add exercise to workout (placeholder - could integrate with fitness page)
function addExerciseToWorkout(exerciseId) {
  const exercise = exercisesData.find(ex => ex.id === exerciseId);
  if (!exercise) return;

  // Call the main fitness page function to add to workout
  if (window.addExerciseToWorkout) {
    window.addExerciseToWorkout(exerciseId);
  }
  
  // Close modal if it's open
  const modal = bootstrap.Modal.getInstance(document.getElementById('exerciseDetailsModal'));
  if (modal) {
    modal.hide();
  }
}

// Setup add exercise form
function setupAddExerciseForm() {
  console.log('Setting up add exercise form...');
  const saveBtn = document.getElementById('saveExerciseBtn');
  if (saveBtn) {
    console.log('Save button found, attaching event listener');
    saveBtn.addEventListener('click', saveNewExercise);
  } else {
    console.error('Save button not found!');
  }
  
  // Setup edit exercise form
  const updateBtn = document.getElementById('updateExerciseBtn');
  if (updateBtn) {
    console.log('Update button found, attaching event listener');
    updateBtn.addEventListener('click', updateExercise);
  } else {
    console.error('Update button not found!');
  }
}

// Generate UUID for new exercise
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Save new exercise
function saveNewExercise() {
  console.log('Save button clicked');
  
  const form = document.getElementById('addExerciseForm');
  if (!form) {
    console.error('Form not found');
    return;
  }
  
  // Prevent default form submission if this is from a submit event
  event?.preventDefault();
  
  if (!form.checkValidity()) {
    console.log('Form validation failed');
    form.reportValidity();
    return;
  }

  console.log('Form is valid, processing...');

  // Get form values
  const name = document.getElementById('exerciseName').value.trim();
  const category = document.getElementById('exerciseCategory').value;
  const equipment = document.getElementById('exerciseEquipment').value;
  const difficulty = document.getElementById('exerciseDifficulty').value;
  const primaryMuscle = document.getElementById('exercisePrimaryMuscle').value.trim();
  const secondaryMuscles = document.getElementById('exerciseSecondaryMuscles').value
    .split(',').map(m => m.trim()).filter(m => m.length > 0);
  const sets = parseInt(document.getElementById('exerciseSets').value);
  const reps = document.getElementById('exerciseReps').value ? 
    parseInt(document.getElementById('exerciseReps').value) : null;
  const duration = parseInt(document.getElementById('exerciseDuration').value);
  const calories = parseInt(document.getElementById('exerciseCalories').value);
  const instructions = document.getElementById('exerciseInstructions').value.trim();
  const tips = document.getElementById('exerciseTips').value.trim();
  const videoUrl = document.getElementById('exerciseVideoUrl').value.trim();

  console.log('Form data collected:', { name, category, equipment, difficulty });

  // Validate required fields
  if (!name || !category || !equipment || !difficulty || !primaryMuscle) {
    console.error('Missing required fields');
    alert('Please fill in all required fields.');
    return;
  }

  // Create new exercise object
  const newExercise = {
    id: generateUUID(),
    name: name,
    category: category,
    equipment: equipment,
    primary_muscle: primaryMuscle,
    secondary_muscles: secondaryMuscles,
    sets: sets,
    reps: reps,
    weight: null,
    duration: duration,
    rest_time: 60, // Default rest time
    instructions: instructions,
    tips: tips || 'No specific tips provided.',
    image_url: '/images/exercises/custom.png',
    video_url: videoUrl || '',
    difficulty: difficulty,
    type: 'Strength',
    calories_per_minute: calories,
    created_by: 'User',
    is_active: true
  };

  console.log('New exercise created:', newExercise);

  // Add to exercises array
  exercisesData.push(newExercise);
  console.log('Exercise added to array. Total exercises:', exercisesData.length);
  
  // Save to localStorage for persistence
  saveCustomExercises();
  
  // Update filtered exercises and re-render
  applyFilters();
  
  // Clear form and close modal
  form.reset();
  const modalElement = document.getElementById('addExerciseModal');
  if (modalElement) {
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    } else {
      // If no instance exists, create one and hide it
      const newModal = new bootstrap.Modal(modalElement);
      newModal.hide();
    }
  }
  
  // Show success message
  showSuccessMessage(`"${name}" has been added to your exercise database!`);
}

// Global variable to store the exercise being edited
let currentEditingExercise = null;

// Edit exercise function
function editExercise(exerciseId) {
  console.log('Editing exercise:', exerciseId);
  
  // Find the exercise to edit
  const exercise = exercisesData.find(ex => ex.id === exerciseId);
  if (!exercise) {
    console.error('Exercise not found for editing');
    return;
  }
  
  currentEditingExercise = exercise;
  
  // Populate the edit form with current values
  document.getElementById('editExerciseName').value = exercise.name;
  document.getElementById('editExerciseCategory').value = exercise.category;
  document.getElementById('editExerciseEquipment').value = exercise.equipment;
  document.getElementById('editExerciseDifficulty').value = exercise.difficulty;
  document.getElementById('editExercisePrimaryMuscle').value = exercise.primary_muscle;
  document.getElementById('editExerciseSecondaryMuscles').value = exercise.secondary_muscles.join(', ');
  document.getElementById('editExerciseSets').value = exercise.sets;
  document.getElementById('editExerciseReps').value = exercise.reps || '';
  document.getElementById('editExerciseDuration').value = exercise.duration;
  document.getElementById('editExerciseCalories').value = exercise.calories_per_minute;
  document.getElementById('editExerciseInstructions').value = exercise.instructions;
  document.getElementById('editExerciseTips').value = exercise.tips || '';
  document.getElementById('editExerciseVideoUrl').value = exercise.video_url || '';
  
  // Show the edit modal
  const editModal = new bootstrap.Modal(document.getElementById('editExerciseModal'));
  editModal.show();
}

// Update exercise function
function updateExercise() {
  console.log('Update button clicked');
  
  if (!currentEditingExercise) {
    console.error('No exercise being edited');
    return;
  }
  
  const form = document.getElementById('editExerciseForm');
  if (!form) {
    console.error('Edit form not found');
    return;
  }
  
  // Prevent default form submission if this is from a submit event
  event?.preventDefault();
  
  if (!form.checkValidity()) {
    console.log('Form validation failed');
    form.reportValidity();
    return;
  }

  console.log('Form is valid, processing update...');

  // Get form values
  const name = document.getElementById('editExerciseName').value.trim();
  const category = document.getElementById('editExerciseCategory').value;
  const equipment = document.getElementById('editExerciseEquipment').value;
  const difficulty = document.getElementById('editExerciseDifficulty').value;
  const primaryMuscle = document.getElementById('editExercisePrimaryMuscle').value.trim();
  const secondaryMuscles = document.getElementById('editExerciseSecondaryMuscles').value
    .split(',').map(m => m.trim()).filter(m => m.length > 0);
  const sets = parseInt(document.getElementById('editExerciseSets').value);
  const reps = document.getElementById('editExerciseReps').value ? 
    parseInt(document.getElementById('editExerciseReps').value) : null;
  const duration = parseInt(document.getElementById('editExerciseDuration').value);
  const calories = parseInt(document.getElementById('editExerciseCalories').value);
  const instructions = document.getElementById('editExerciseInstructions').value.trim();
  const tips = document.getElementById('editExerciseTips').value.trim();
  const videoUrl = document.getElementById('editExerciseVideoUrl').value.trim();

  console.log('Form data collected:', { name, category, equipment, difficulty });

  // Validate required fields
  if (!name || !category || !equipment || !difficulty || !primaryMuscle) {
    console.error('Missing required fields');
    alert('Please fill in all required fields.');
    return;
  }

  // Find and update the exercise in the array
  const exerciseIndex = exercisesData.findIndex(ex => ex.id === currentEditingExercise.id);
  if (exerciseIndex === -1) {
    console.error('Exercise not found in array for update');
    return;
  }

  // Update the exercise object
  exercisesData[exerciseIndex] = {
    ...currentEditingExercise,
    name: name,
    category: category,
    equipment: equipment,
    primary_muscle: primaryMuscle,
    secondary_muscles: secondaryMuscles,
    sets: sets,
    reps: reps,
    duration: duration,
    instructions: instructions,
    tips: tips || 'No specific tips provided.',
    video_url: videoUrl || '',
    difficulty: difficulty,
    calories_per_minute: calories,
    created_by: 'User', // Mark as user-modified, even if it was originally a system exercise
    is_active: true
  };

  console.log('Exercise updated:', exercisesData[exerciseIndex]);
  
  // Save to localStorage for persistence
  saveCustomExercises();
  
  // Update filtered exercises and re-render
  applyFilters();
  
  // Clear form and close modal
  form.reset();
  currentEditingExercise = null;
  const modalElement = document.getElementById('editExerciseModal');
  if (modalElement) {
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    } else {
      // If no instance exists, create one and hide it
      const newModal = new bootstrap.Modal(modalElement);
      newModal.hide();
    }
  }
  
  // Show success message
  showSuccessMessage(`"${name}" has been updated successfully!`);
}

// Save custom exercises to localStorage
function saveCustomExercises() {
  console.log('Saving custom exercises to localStorage...');
  try {
    // Get only user-created exercises (not from JSON file)
    const customExercises = exercisesData.filter(ex => ex.created_by === 'User');
    console.log('Custom exercises to save:', customExercises.length);
    localStorage.setItem('custom-exercises', JSON.stringify(customExercises));
    console.log('Successfully saved to localStorage');
  } catch (error) {
    console.error('Error saving custom exercises:', error);
  }
}

// Load custom exercises from localStorage
function loadCustomExercises() {
  console.log('Loading custom exercises from localStorage...');
  const stored = localStorage.getItem('custom-exercises');
  if (stored) {
    try {
      const customExercises = JSON.parse(stored);
      exercisesData = [...exercisesData, ...customExercises];
      console.log('Loaded custom exercises:', customExercises.length);
    } catch (error) {
      console.error('Error parsing custom exercises:', error);
    }
  } else {
    console.log('No custom exercises found in localStorage');
  }
}

// Show success message
function showSuccessMessage(message) {
  // Create a temporary toast-like message
  const toast = document.createElement('div');
  toast.className = 'success-toast';
  toast.innerHTML = `
    <i class="bi bi-check-circle me-2"></i>
    ${message}
  `;
  
  // Add to page
  document.body.appendChild(toast);
  
  // Show with animation
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}

// Delete custom exercise
function deleteExercise(exerciseId) {
  const exercise = exercisesData.find(ex => ex.id === exerciseId);
  if (!exercise) return;
  
  // Warn about system exercises but allow deletion
  let confirmMessage = `Are you sure you want to delete "${exercise.name}"?`;
  if (exercise.created_by === 'System') {
    confirmMessage = `"${exercise.name}" is a system exercise. Deleting it will remove it from your current session, but it will return when you refresh the page.\n\nAre you sure you want to delete it?`;
  }
  
  if (confirm(confirmMessage)) {
    // Remove from array
    exercisesData = exercisesData.filter(ex => ex.id !== exerciseId);
    
    // Update localStorage (only affects custom exercises)
    saveCustomExercises();
    
    // Re-render table
    applyFilters();
    
    showSuccessMessage(`"${exercise.name}" has been deleted.`);
  }
}

// Export function for page initialization
window.initFitnessTablePage = initFitnessTablePage;