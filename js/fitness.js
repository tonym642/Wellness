// Fitness page functionality

// Initialize fitness page
async function initFitnessPage() {
  console.log('Initializing Fitness Page');
  
  // Initialize data
  console.log('Loading workout data...');
  loadWorkoutData();
  console.log('About to load exercise data...');
  await loadExerciseData(); // Wait for exercises to load
  console.log('Exercise data loaded, exercisesArray length:', exercisesArray.length);
  
  // Setup UI
  console.log('Setting up UI components...');
  setupExerciseFilter();
  setupDayTabs();
  setupToggleButtons();
  setupWorkoutActions();
  console.log('UI setup complete');
  
  // Render initial content
  console.log('About to render exercises...');
  renderExercises();
  console.log('About to render workouts...');
  renderWorkouts();
  console.log('Fitness page initialization complete');
}

// Data management
let workoutData = JSON.parse(localStorage.getItem('workouts')) || {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: []
};

// Global variables for debugging
let exercisesArray = [];
window.exercisesArray = exercisesArray; // Expose for debugging

let activeDay = 'monday';
window.activeDay = activeDay; // Expose for debugging
let lastAddedExercise = null;
let currentExerciseFilter = localStorage.getItem('fitnessFilter') || 'all';
window.currentExerciseFilter = currentExerciseFilter; // Expose for debugging

function loadWorkoutData() {
  const stored = localStorage.getItem('workouts');
  if (stored) {
    const parsedData = JSON.parse(stored);
    
    // Check if we need to migrate old A/B structure to new single workout structure
    const firstDay = Object.keys(parsedData)[0];
    if (firstDay && parsedData[firstDay] && typeof parsedData[firstDay] === 'object' && parsedData[firstDay].A) {
      // Old structure detected, migrate to new structure
      const migratedData = {};
      Object.keys(parsedData).forEach(day => {
        // Combine A and B workouts into single array, prioritize A workout
        migratedData[day] = parsedData[day].A || [];
        if (parsedData[day].B && parsedData[day].B.length > 0) {
          migratedData[day] = [...migratedData[day], ...parsedData[day].B];
        }
      });
      workoutData = migratedData;
      // Save migrated data
      localStorage.setItem('workouts', JSON.stringify(workoutData));
    } else {
      workoutData = parsedData;
    }
  }
}

async function loadExerciseData() {
  try {
    console.log('loadExerciseData: Starting to load exercises...');
    exercisesArray = []; // Reset the array
    
    // First try to load from JSON file
    console.log('loadExerciseData: Fetching ./data/exercises.json');
    try {
      const response = await fetch('./data/exercises.json');
      console.log('loadExerciseData: Response status:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('loadExerciseData: JSON data received:', data);
        console.log('loadExerciseData: Number of exercises in JSON:', data.exercises?.length);
        
        // Transform the JSON structure to match our current format
        const transformedExercises = data.exercises.map(exercise => ({
          id: exercise.id,
          name: exercise.name,
          group: exercise.category.toLowerCase(),
          equipment: exercise.equipment,
          description: exercise.instructions,
          sets: exercise.sets,
          reps: exercise.reps || `${exercise.sets}x`,
          duration: exercise.duration, // Keep in seconds for calculations
          difficulty: exercise.difficulty,
          type: exercise.type,
          primary_muscle: exercise.primary_muscle,
          secondary_muscles: exercise.secondary_muscles,
          tips: exercise.tips,
          calories_per_minute: exercise.calories_per_minute
        }));
        
        exercisesArray = transformedExercises;
        window.exercisesArray = exercisesArray; // Keep global reference updated
        console.log('Loaded exercises from JSON:', exercisesArray.length);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (fetchError) {
      console.warn('loadExerciseData: Could not load from JSON file:', fetchError.message);
      console.log('loadExerciseData: Using embedded fallback data...');
      
      // Embedded exercise data for when fetch fails
      exercisesArray = [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          name: "Push-ups",
          group: "chest",
          equipment: "Bodyweight",
          description: "Place hands slightly wider than shoulder-width apart, lower chest to floor, then push back up.",
          sets: 3,
          reps: "15",
          duration: 45,
          difficulty: "Beginner",
          type: "Strength",
          primary_muscle: "Pectorals",
          secondary_muscles: ["Triceps", "Deltoids"],
          tips: "Keep your body straight from head to heels, and avoid sagging hips.",
          calories_per_minute: 7
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          name: "Pull-ups",
          group: "back",
          equipment: "Pull-up Bar",
          description: "Hang from a pull-up bar with arms fully extended, then pull your body up until your chin clears the bar.",
          sets: 3,
          reps: "8",
          duration: 40,
          difficulty: "Intermediate",
          type: "Strength",
          primary_muscle: "Latissimus Dorsi",
          secondary_muscles: ["Biceps", "Rhomboids"],
          tips: "Engage your core and avoid swinging your body.",
          calories_per_minute: 8
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440003",
          name: "Squats",
          group: "legs",
          equipment: "Bodyweight",
          description: "Stand with feet shoulder-width apart, lower hips back and down, then return to standing.",
          sets: 3,
          reps: "20",
          duration: 50,
          difficulty: "Beginner",
          type: "Strength",
          primary_muscle: "Quadriceps",
          secondary_muscles: ["Glutes", "Hamstrings"],
          tips: "Keep your chest up and knees tracking over your toes.",
          calories_per_minute: 6
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440004",
          name: "Plank",
          group: "core",
          equipment: "Bodyweight",
          description: "Hold a straight-arm plank position, keeping your body in a straight line.",
          sets: 3,
          reps: "45 sec",
          duration: 45,
          difficulty: "Beginner",
          type: "Strength",
          primary_muscle: "Core",
          secondary_muscles: ["Shoulders", "Back"],
          tips: "Keep your hips level and engage your core muscles.",
          calories_per_minute: 4
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440005",
          name: "Shoulder Press",
          group: "shoulders",
          equipment: "Dumbbells",
          description: "Press dumbbells overhead from shoulder level to full arm extension.",
          sets: 3,
          reps: "12",
          duration: 40,
          difficulty: "Beginner",
          type: "Strength",
          primary_muscle: "Deltoids",
          secondary_muscles: ["Triceps", "Upper Chest"],
          tips: "Keep your core engaged and avoid arching your back.",
          calories_per_minute: 5
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440006",
          name: "Bicep Curls",
          group: "arms",
          equipment: "Dumbbells",
          description: "Curl dumbbells from arm extension to shoulder level, focusing on bicep contraction.",
          sets: 3,
          reps: "15",
          duration: 35,
          difficulty: "Beginner",
          type: "Strength",
          primary_muscle: "Biceps",
          secondary_muscles: ["Forearms"],
          tips: "Control the weight on both the up and down phases.",
          calories_per_minute: 4
        }
      ];
      window.exercisesArray = exercisesArray; // Keep global reference updated
      console.log('loadExerciseData: Embedded fallback exercises loaded:', exercisesArray.length);
    }
    
    // Load custom exercises from localStorage (saved by fitness table)
    const stored = localStorage.getItem('custom-exercises');
    if (stored) {
      const customExercises = JSON.parse(stored);
      // Transform custom exercises to match our format
      const transformedCustom = customExercises.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        group: exercise.category.toLowerCase(),
        equipment: exercise.equipment,
        description: exercise.instructions,
        sets: exercise.sets,
        reps: exercise.reps || `${exercise.sets}x`,
        duration: exercise.duration, // Keep in seconds for calculations
        difficulty: exercise.difficulty,
        type: exercise.type,
        primary_muscle: exercise.primary_muscle,
        secondary_muscles: exercise.secondary_muscles,
        tips: exercise.tips,
        calories_per_minute: exercise.calories_per_minute,
        isCustom: true // Mark as custom exercise
      }));
      
      exercisesArray = [...exercisesArray, ...transformedCustom];
      window.exercisesArray = exercisesArray; // Keep global reference updated
      console.log('Added custom exercises:', transformedCustom.length);
    }
    
    console.log('Total exercises loaded:', exercisesArray.length);
    
  } catch (error) {
    console.error('Error loading exercise data:', error);
  }
}

// Save functions
function saveWorkouts() {
  localStorage.setItem('workouts', JSON.stringify(workoutData));
}

// Function to reload exercises (called when returning from fitness table)
async function reloadExercises() {
  await loadExerciseData();
  renderExercises();
}

// Exercise management
function addExerciseToWorkout(exerciseId) {
  console.log('Adding exercise:', exerciseId, 'to day:', activeDay);
  
  const exercise = exercisesArray.find(e => e.id === exerciseId);
  if (!exercise) {
    console.log('Exercise not found:', exerciseId);
    return;
  }

  console.log('Found exercise:', exercise.name);

  // Ensure workoutData[activeDay] exists and is an array
  if (!workoutData[activeDay]) {
    workoutData[activeDay] = [];
  }

  const workoutItem = {
    id: exercise.id,
    name: exercise.name,
    group: exercise.group,
    equipment: exercise.equipment,
    sets: exercise.sets,
    reps: exercise.reps,
    duration: exercise.duration,
    completed: false
  };

  workoutData[activeDay].push(workoutItem);
  console.log('Exercise added. Current workout data:', workoutData[activeDay]);
  
  lastAddedExercise = { day: activeDay, item: workoutItem };
  
  saveWorkouts();
  renderWorkouts();
  
  // Show undo button
  const undoBtn = document.getElementById('undoLastExercise');
  if (undoBtn) {
    undoBtn.style.display = 'inline-block';
  }
}

function removeExerciseFromWorkout(day, exerciseId) {
  if (workoutData[day]) {
    workoutData[day] = workoutData[day].filter(item => item.id !== exerciseId);
    saveWorkouts();
    renderWorkouts();
  }
}

function clearCurrentWorkout() {
  if (confirm(`Are you sure you want to clear ${activeDay}'s workout?`)) {
    workoutData[activeDay] = [];
    saveWorkouts();
    renderWorkouts();
    
    // Hide undo button
    const undoBtn = document.getElementById('undoLastExercise');
    if (undoBtn) {
      undoBtn.style.display = 'none';
    }
  }
}

function undoLastExercise() {
  if (lastAddedExercise) {
    const { day, workout, item } = lastAddedExercise;
    if (workoutData[day] && workoutData[day][workout]) {
      const index = workoutData[day][workout].findIndex(workoutItem => 
        workoutItem.id === item.id && workoutItem.name === item.name
      );
      if (index > -1) {
        workoutData[day][workout].splice(index, 1);
        saveWorkouts();
        renderWorkouts();
      }
    }
    
    lastAddedExercise = null;
    const undoBtn = document.getElementById('undoLastExercise');
    if (undoBtn) {
      undoBtn.style.display = 'none';
    }
  }
}

function toggleExerciseCompletion(day, exerciseId) {
  const workoutList = workoutData[day];
  const exercise = workoutList.find(item => item.id === exerciseId);
  if (exercise) {
    exercise.completed = !exercise.completed;
    saveWorkouts();
    renderWorkouts();
  }
}

// Rendering functions
function renderExercises() {
  console.log('renderExercises: Starting to render exercises...');
  console.log('renderExercises: exercisesArray length:', exercisesArray.length);
  console.log('renderExercises: currentExerciseFilter:', currentExerciseFilter);
  
  const container = document.getElementById('fitnessExercisesList');
  console.log('renderExercises: container element found:', !!container);
  if (!container) return;

  const filteredExercises = currentExerciseFilter === 'all' 
    ? exercisesArray 
    : exercisesArray.filter(exercise => exercise.group === currentExerciseFilter);
    
  console.log('renderExercises: filteredExercises length:', filteredExercises.length);

  if (currentExerciseFilter === 'all') {
    // Show exercises grouped by muscle group
    const groupedExercises = {
      chest: filteredExercises.filter(exercise => exercise.group === 'chest'),
      back: filteredExercises.filter(exercise => exercise.group === 'back'),
      legs: filteredExercises.filter(exercise => exercise.group === 'legs'),
      shoulders: filteredExercises.filter(exercise => exercise.group === 'shoulders'),
      arms: filteredExercises.filter(exercise => exercise.group === 'arms'),
      core: filteredExercises.filter(exercise => exercise.group === 'core')
    };

    let html = '';
    const groupNames = { 
      chest: 'Chest', back: 'Back', legs: 'Legs', 
      shoulders: 'Shoulders', arms: 'Arms', core: 'Core' 
    };

    Object.entries(groupedExercises).forEach(([groupKey, exercises]) => {
      if (exercises.length > 0) {
        html += `<div class="exercise-group-section">
          <h6 class="exercise-group-title">${groupNames[groupKey]}</h6>
          <div class="exercise-group-items">
            <div class="exercise-headers">
              <div class="header-col header-name"><strong>Exercise</strong></div>
              <div class="header-col header-target"><strong>Target</strong></div>
              <div class="header-col header-sets"><strong>Sets × Reps</strong></div>
              <div class="header-col header-duration"><strong>Duration</strong></div>
              <div class="header-col header-difficulty"><strong>Difficulty</strong></div>
              <div class="header-col header-actions"><strong>Actions</strong></div>
            </div>`;
        
        exercises.forEach(exercise => {
          html += renderExerciseItem(exercise);
        });
        
        html += `</div></div>`;
      }
    });

    container.innerHTML = html || '<div class="empty-state">No exercises available.</div>';
  } else {
    // Show flat list for specific muscle group
    let html = `<div class="exercise-group-section">
      <div class="exercise-group-items">
        <div class="exercise-headers">
          <div class="header-col header-name"><strong>Exercise</strong></div>
          <div class="header-col header-target"><strong>Target</strong></div>
          <div class="header-col header-sets"><strong>Sets × Reps</strong></div>
          <div class="header-col header-duration"><strong>Duration</strong></div>
          <div class="header-col header-difficulty"><strong>Difficulty</strong></div>
          <div class="header-col header-actions"><strong>Actions</strong></div>
        </div>`;
    
    filteredExercises.forEach(exercise => {
      html += renderExerciseItem(exercise);
    });
    
    html += `</div></div>`;
    container.innerHTML = html || '<div class="empty-state">No exercises in this group.</div>';
  }
}

function renderExerciseItem(exercise) {
  return `
    <div class="fitness-exercise-item-row" data-exercise-id="${exercise.id}">
      <div class="exercise-col exercise-name">
        ${exercise.name}
        <div class="exercise-equipment">${exercise.equipment}</div>
      </div>
      <div class="exercise-col exercise-target">${exercise.primary_muscle}</div>
      <div class="exercise-col exercise-sets">${exercise.sets} × ${exercise.reps || 'Time'}</div>
      <div class="exercise-col exercise-duration">${Math.ceil(exercise.duration / 60)} min</div>
      <div class="exercise-col exercise-difficulty difficulty-${exercise.difficulty.toLowerCase()}">${exercise.difficulty}</div>
      <div class="exercise-col exercise-actions">
        <button class="btn btn-success btn-sm action-btn add-btn" onclick="addExerciseToWorkout('${exercise.id}')" title="Add to Workout">
          <i class="bi bi-plus-circle"></i>
        </button>
        <button class="btn btn-warning btn-sm action-btn edit-btn" onclick="editExerciseFromDatabase('${exercise.id}')" title="Edit Exercise">
          <i class="bi bi-pencil-square"></i>
        </button>
      </div>
    </div>`;
}

function renderWorkouts() {
  const container = document.getElementById('workoutsContainer');
  if (!container) return;

  let html = '';
  
  // Current day's workout (simplified - single workout per day)
  const exercises = workoutData[activeDay];
  
  html += `<div class="workout-section">`;
  
  if (exercises.length === 0) {
    html += `<div class="workout-empty">
      <i class="bi bi-calendar-plus"></i>
      <p>No exercises added yet</p>
      <small>Select exercises from the left to build your workout</small>
    </div>`;
  } else {
    // Add headers for workout items
    html += `<div class="workout-headers">
      <div class="workout-header-col workout-header-checkbox"></div>
      <div class="workout-header-col workout-header-name"><strong>Exercise</strong></div>
      <div class="workout-header-col workout-header-target"><strong>Target</strong></div>
      <div class="workout-header-col workout-header-sets"><strong>Sets × Reps</strong></div>
      <div class="workout-header-col workout-header-duration"><strong>Duration</strong></div>
      <div class="workout-header-col workout-header-difficulty"><strong>Difficulty</strong></div>
      <div class="workout-header-col workout-header-calories"><strong>Calories</strong></div>
      <div class="workout-header-col workout-header-actions"><strong>Actions</strong></div>
    </div>`;
    
    exercises.forEach((exercise, index) => {
      const completedClass = exercise.completed ? 'completed' : '';
      
      // Get additional exercise details from the main exercises array
      const fullExercise = exercisesArray.find(e => e.id === exercise.id);
      const difficulty = fullExercise ? fullExercise.difficulty : 'Unknown';
      const calories = fullExercise ? fullExercise.calories_per_minute : 0;
      const primaryMuscle = fullExercise ? fullExercise.primary_muscle : exercise.group;
      
      html += `
        <div class="workout-item-row ${completedClass}">
          <div class="workout-col workout-checkbox" onclick="toggleExerciseCompletion('${activeDay}', '${exercise.id}')">
            <i class="bi ${exercise.completed ? 'bi-check-square-fill' : 'bi-square'}"></i>
          </div>
          <div class="workout-col workout-name">
            ${exercise.name}
            <div class="workout-equipment">${exercise.equipment}</div>
          </div>
          <div class="workout-col workout-target">${primaryMuscle}</div>
          <div class="workout-col workout-sets">${exercise.sets} × ${exercise.reps || 'Time'}</div>
          <div class="workout-col workout-duration">${Math.ceil(exercise.duration / 60)} min</div>
          <div class="workout-col workout-difficulty difficulty-${difficulty.toLowerCase()}">${difficulty}</div>
          <div class="workout-col workout-calories">${calories} cal/min</div>
          <div class="workout-col workout-actions">
            <button class="btn btn-light btn-sm action-btn delete-btn" onclick="removeExerciseFromWorkout('${activeDay}', '${exercise.id}')" title="Remove from Workout">
              <i class="bi bi-trash3 text-danger"></i>
            </button>
          </div>
        </div>
      `;
    });

    // Calculate workout totals
    const totalTime = exercises.reduce((sum, ex) => sum + ex.duration, 0);
    const completedCount = exercises.filter(ex => ex.completed).length;
    
    html += `
      <div class="workout-summary">
        <div class="summary-stats">
          <div class="summary-stat">
            <span class="stat-label">Exercises:</span>
            <span class="stat-value">${completedCount}/${exercises.length}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Time:</span>
            <span class="stat-value">~${totalTime} min</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Progress:</span>
            <span class="stat-value">${Math.round((completedCount / exercises.length) * 100) || 0}%</span>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.round((completedCount / exercises.length) * 100) || 0}%"></div>
        </div>
      </div>
      
      <!-- Clear Button at Bottom -->
      <div class="workout-bottom-controls">
        <button class="btn-clear" onclick="clearCurrentWorkout()">Clear Current Workout</button>
        <button class="btn-undo" id="undoLastExercise" style="display:none;" onclick="undoLastExercise()">Undo Last Add</button>
      </div>
    `;
  }
  
  html += '</div>';

  container.innerHTML = html;
}

// UI Setup functions
function setupDayTabs() {
  console.log('setupDayTabs: Setting up day tab functionality...');
  const tabs = document.querySelectorAll('.day-tab');
  console.log('setupDayTabs: Found', tabs.length, 'day tabs');
  
  tabs.forEach((tab, index) => {
    console.log(`setupDayTabs: Setting up tab ${index}:`, tab.dataset.day);
    tab.addEventListener('click', () => {
      console.log('setupDayTabs: Tab clicked:', tab.dataset.day);
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active day
      activeDay = tab.dataset.day;
      window.activeDay = activeDay; // Keep global reference updated
      console.log('setupDayTabs: Active day updated to:', activeDay);
      
      // Re-render workouts for new day
      renderWorkouts();
    });
  });
}

// Workout tabs removed - single workout per day

function setupExerciseFilter() {
  // Desktop filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentExerciseFilter = btn.dataset.group;
      localStorage.setItem('fitnessFilter', currentExerciseFilter);
      renderExercises();
    });
  });
  
  // Mobile filter dropdown
  const dropdown = document.getElementById('exerciseFilterDropdown');
  if (dropdown) {
    dropdown.value = currentExerciseFilter;
    dropdown.addEventListener('change', () => {
      currentExerciseFilter = dropdown.value;
      localStorage.setItem('fitnessFilter', currentExerciseFilter);
      renderExercises();
      
      // Update desktop buttons
      filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.group === currentExerciseFilter);
      });
    });
  }
}

function setupToggleButtons() {
  const toggleBtn = document.getElementById('toggleExerciseList');
  const leftSection = document.getElementById('fitnessLeft');
  
  if (toggleBtn && leftSection) {
    toggleBtn.addEventListener('click', () => {
      if (leftSection.style.display === 'none') {
        // Show the exercise list
        leftSection.style.display = 'block';
        toggleBtn.textContent = 'Hide Exercise List';
      } else {
        // Hide the exercise list
        leftSection.style.display = 'none';
        toggleBtn.textContent = 'Show Exercise List';
      }
    });
  }
}

function setupWorkoutActions() {
  const clearBtn = document.getElementById('clearWorkout');
  const undoBtn = document.getElementById('undoLastExercise');
  
  if (clearBtn) {
    clearBtn.addEventListener('click', clearCurrentWorkout);
  }
  
  if (undoBtn) {
    undoBtn.addEventListener('click', undoLastExercise);
  }
}

// Function to edit exercise from database (redirects to fitness table)
function editExerciseFromDatabase(exerciseId) {
  console.log('Editing exercise from database:', exerciseId);
  
  // Store the exercise ID to edit in localStorage so the fitness table can pick it up
  localStorage.setItem('editExerciseId', exerciseId);
  
  // Navigate to fitness table page
  if (window.pageLoader) {
    window.pageLoader.loadPage('fitness-table');
  } else {
    // Fallback if pageLoader is not available
    window.location.href = 'pages/fitness-table.html';
  }
}

// Make functions global for onclick handlers
window.addExerciseToWorkout = addExerciseToWorkout;
window.removeExerciseFromWorkout = removeExerciseFromWorkout;
window.toggleExerciseCompletion = toggleExerciseCompletion;
window.clearCurrentWorkout = clearCurrentWorkout;
window.undoLastExercise = undoLastExercise;
window.editExerciseFromDatabase = editExerciseFromDatabase;

// Export main function
window.initFitnessPage = initFitnessPage;
