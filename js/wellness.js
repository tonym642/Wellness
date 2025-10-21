// Wellness Page Management

function initWellnessPage() {
  setupHabitTracker();
  setupMoodSelector();
  setupMetricSliders();
  loadWellnessData();
}

// Wellness data structure
let wellnessData = JSON.parse(localStorage.getItem('wellnessData')) || {
  habits: [
    { id: 1, name: 'Morning Meditation', completed: true },
    { id: 2, name: 'Drink 8 Glasses of Water', completed: true },
    { id: 3, name: 'Evening Reading', completed: false },
    { id: 4, name: 'Gratitude Journal', completed: false },
    { id: 5, name: 'Take Vitamins', completed: true },
    { id: 6, name: 'Stretch/Yoga', completed: false }
  ],
  mood: 'great',
  energy: 7,
  metrics: {
    sleep: 8.0,
    meditation: 15,
    water: 6,
    reading: 30
  }
};

// Save wellness data to localStorage
function saveWellnessData() {
  localStorage.setItem('wellnessData', JSON.stringify(wellnessData));
}

// Load and display wellness data
function loadWellnessData() {
  updateHabitsDisplay();
  updateMoodDisplay();
  updateMetricDisplays();
}

// Setup all metric sliders
function setupMetricSliders() {
  // Sleep slider
  const sleepSlider = document.getElementById('sleepSlider');
  const sleepValue = document.getElementById('sleepValue');
  if (sleepSlider && sleepValue) {
    updateSliderBackground(sleepSlider, '#0d6efd');
    sleepSlider.addEventListener('input', function() {
      sleepValue.textContent = this.value;
      wellnessData.metrics.sleep = parseFloat(this.value);
      updateSliderBackground(this, '#0d6efd');
      saveWellnessData();
    });
  }

  // Meditation slider
  const meditationSlider = document.getElementById('meditationSlider');
  const meditationValue = document.getElementById('meditationValue');
  if (meditationSlider && meditationValue) {
    updateSliderBackground(meditationSlider, '#198754');
    meditationSlider.addEventListener('input', function() {
      meditationValue.textContent = this.value;
      wellnessData.metrics.meditation = parseInt(this.value);
      updateSliderBackground(this, '#198754');
      saveWellnessData();
    });
  }

  // Water slider
  const waterSlider = document.getElementById('waterSlider');
  const waterValue = document.getElementById('waterValue');
  if (waterSlider && waterValue) {
    updateSliderBackground(waterSlider, '#0dcaf0');
    waterSlider.addEventListener('input', function() {
      waterValue.textContent = this.value;
      wellnessData.metrics.water = parseInt(this.value);
      updateSliderBackground(this, '#0dcaf0');
      saveWellnessData();
    });
  }

  // Reading slider
  const readingSlider = document.getElementById('readingSlider');
  const readingValue = document.getElementById('readingValue');
  if (readingSlider && readingValue) {
    updateSliderBackground(readingSlider, '#ffc107');
    readingSlider.addEventListener('input', function() {
      readingValue.textContent = this.value;
      wellnessData.metrics.reading = parseInt(this.value);
      updateSliderBackground(this, '#ffc107');
      saveWellnessData();
    });
  }

  // Energy slider
  const energySlider = document.getElementById('energySlider');
  const energyValue = document.getElementById('energyValue');
  if (energySlider && energyValue) {
    energySlider.addEventListener('input', function() {
      energyValue.textContent = this.value;
      wellnessData.energy = parseInt(this.value);
      saveWellnessData();
    });
  }
}

// Update slider background color based on value
function updateSliderBackground(slider, color) {
  const value = slider.value;
  const min = slider.min || 0;
  const max = slider.max || 100;
  const percentage = ((value - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${percentage}%, #e9ecef ${percentage}%, #e9ecef 100%)`;
}

// Update all metric displays
function updateMetricDisplays() {
  // Update sleep
  const sleepSlider = document.getElementById('sleepSlider');
  const sleepValue = document.getElementById('sleepValue');
  if (sleepSlider && sleepValue) {
    sleepSlider.value = wellnessData.metrics.sleep;
    sleepValue.textContent = wellnessData.metrics.sleep;
    updateSliderBackground(sleepSlider, '#0d6efd');
  }

  // Update meditation
  const meditationSlider = document.getElementById('meditationSlider');
  const meditationValue = document.getElementById('meditationValue');
  if (meditationSlider && meditationValue) {
    meditationSlider.value = wellnessData.metrics.meditation;
    meditationValue.textContent = wellnessData.metrics.meditation;
    updateSliderBackground(meditationSlider, '#198754');
  }

  // Update water
  const waterSlider = document.getElementById('waterSlider');
  const waterValue = document.getElementById('waterValue');
  if (waterSlider && waterValue) {
    waterSlider.value = wellnessData.metrics.water;
    waterValue.textContent = wellnessData.metrics.water;
    updateSliderBackground(waterSlider, '#0dcaf0');
  }

  // Update reading
  const readingSlider = document.getElementById('readingSlider');
  const readingValue = document.getElementById('readingValue');
  if (readingSlider && readingValue) {
    readingSlider.value = wellnessData.metrics.reading;
    readingValue.textContent = wellnessData.metrics.reading;
    updateSliderBackground(readingSlider, '#ffc107');
  }

  // Update energy
  const energySlider = document.getElementById('energySlider');
  const energyValue = document.getElementById('energyValue');
  if (energySlider && energyValue) {
    energySlider.value = wellnessData.energy;
    energyValue.textContent = wellnessData.energy;
  }
}

// Setup Habit Tracker
function setupHabitTracker() {
  const habitItems = document.querySelectorAll('.habit-item');
  
  habitItems.forEach((item, index) => {
    item.style.cursor = 'pointer';
    
    item.addEventListener('click', function() {
      const habit = wellnessData.habits[index];
      if (habit) {
        habit.completed = !habit.completed;
        saveWellnessData();
        updateHabitItem(this, habit);
      }
    });
  });
}

// Update individual habit item display
function updateHabitItem(element, habit) {
  const icon = element.querySelector('i');
  const badge = element.querySelector('.badge');
  
  if (habit.completed) {
    icon.className = 'bi bi-check-circle-fill text-success fs-4 me-3';
    badge.className = 'badge bg-success';
    badge.textContent = 'Done';
  } else {
    icon.className = 'bi bi-circle text-secondary fs-4 me-3';
    badge.className = 'badge bg-secondary';
    badge.textContent = 'Pending';
  }
}

// Update all habits display
function updateHabitsDisplay() {
  const habitItems = document.querySelectorAll('.habit-item');
  
  habitItems.forEach((item, index) => {
    const habit = wellnessData.habits[index];
    if (habit) {
      updateHabitItem(item, habit);
    }
  });
}

// Setup Mood Selector
function setupMoodSelector() {
  const moodButtons = document.querySelectorAll('.mood-btn');
  
  moodButtons.forEach((btn, index) => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      moodButtons.forEach(b => b.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Save mood
      const moods = ['great', 'good', 'okay', 'low', 'stressed'];
      wellnessData.mood = moods[index];
      saveWellnessData();
    });
  });
}

// Update mood display
function updateMoodDisplay() {
  const moodButtons = document.querySelectorAll('.mood-btn');
  const moods = ['great', 'good', 'okay', 'low', 'stressed'];
  const moodIndex = moods.indexOf(wellnessData.mood);
  
  if (moodIndex !== -1 && moodButtons[moodIndex]) {
    moodButtons.forEach(b => b.classList.remove('active'));
    moodButtons[moodIndex].classList.add('active');
  }
}

// Make functions available globally
window.initWellnessPage = initWellnessPage;
