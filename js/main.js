// Main application controller and page loader

class PageLoader {
  constructor() {
    this.currentPage = null;
    this.loadedScripts = new Set();
    this.pageModules = new Map();
    this.contentElement = document.getElementById('content');
    
    // Initialize navigation
    this.setupNavigation();
    
    // Load initial page
    this.loadPage('goals');
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = this.getPageFromNavId(link.id);
        this.loadPage(pageId);
      });
    });

    // Setup avatar dropdown
    this.setupAvatarDropdown();
  }

  setupAvatarDropdown() {
    const avatarBtn = document.getElementById('avatarBtn');
    const avatarDropdown = document.getElementById('avatarDropdown');
    const foodsTableBtn = document.getElementById('foodsTableBtn');
    const fitnessTableBtn = document.getElementById('fitnessTableBtn');

    if (avatarBtn && avatarDropdown) {
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        avatarDropdown.classList.toggle('show');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        avatarDropdown.classList.remove('show');
      });

      // Handle dropdown menu items
      if (foodsTableBtn) {
        foodsTableBtn.addEventListener('click', () => {
          this.loadPage('foods');
          avatarDropdown.classList.remove('show');
        });
      }

      if (fitnessTableBtn) {
        fitnessTableBtn.addEventListener('click', () => {
          this.loadPage('fitness-table');
          avatarDropdown.classList.remove('show');
        });
      }
    }
  }

  getPageFromNavId(navId) {
    const pageMap = {
      'nav-goals': 'goals',
      'nav-nutrition': 'nutrition', 
      'nav-fitness': 'fitness',
      'nav-wellness': 'wellness',
      'nav-foods': 'foods'
    };
    return pageMap[navId] || 'goals';
  }

  async loadPage(pageId) {
    if (this.currentPage === pageId) return;

    // Remove fullscreen card class so the document scrollbar is restored when navigating away
    document.body.classList.remove('cards-fullscreen');

    try {
      // Update navigation
      this.updateNavigation(pageId);
      
      // Show loading state
      this.showLoading();
      
      // Load page HTML
      const html = await this.fetchPageHTML(pageId);
      
      // Inject HTML into content area
      this.contentElement.innerHTML = html;
      
      // Load and initialize page-specific JavaScript
      await this.loadPageScript(pageId);
      
      // Update app state
      appState.setCurrentPage(pageId);
      this.currentPage = pageId;
      
      // Hide loading state
      this.hideLoading();
      
    } catch (error) {
      console.error(`Error loading page ${pageId}:`, error);
      this.showError(`Failed to load ${pageId} page`);
    }
  }

  async fetchPageHTML(pageId) {
    const response = await fetch(`pages/${pageId}.html`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${pageId}.html: ${response.statusText}`);
    }
    return response.text();
  }

  async loadPageScript(pageId) {
    const scriptPath = `js/${pageId}.js`;
    
    // Don't reload if already loaded
    if (this.loadedScripts.has(scriptPath)) {
      // Reinitialize if module has an init function
      await this.reinitializePageModule(pageId);
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = scriptPath;
      script.onload = async () => {
        this.loadedScripts.add(scriptPath);
        await this.initializePageModule(pageId);
        resolve();
      };
      script.onerror = () => {
        console.warn(`Optional script ${scriptPath} not found or failed to load`);
        resolve(); // Don't fail page load for missing scripts
      };
      document.head.appendChild(script);
    });
  }

  async initializePageModule(pageId) {
    // Look for page initialization functions
    const initFunctionName = `init${this.capitalize(pageId)}Page`;
    
    if (typeof window[initFunctionName] === 'function') {
      await window[initFunctionName](); // Handle async init functions
      this.pageModules.set(pageId, window[initFunctionName]);
    }
  }

  async reinitializePageModule(pageId) {
    const initFunction = this.pageModules.get(pageId);
    if (initFunction) {
      await initFunction(); // Handle async reinit
    }
  }

  updateNavigation(pageId) {
    // Update nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
    });

    const activeNavId = this.getNavIdFromPage(pageId);
    const activeLink = document.getElementById(activeNavId);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  getNavIdFromPage(pageId) {
    const navMap = {
      'goals': 'nav-goals',
      'nutrition': 'nav-nutrition',
      'fitness': 'nav-fitness', 
      'wellness': 'nav-wellness',
      'foods': 'nav-foods'
    };
    return navMap[pageId] || 'nav-goals';
  }

  showLoading() {
    this.contentElement.innerHTML = `
      <div class="loading-container" style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        font-size: 16px;
        color: #666;
      ">
        <i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i>
        Loading...
      </div>
    `;
  }

  hideLoading() {
    // Loading content is replaced by actual page content
  }

  showError(message) {
    this.contentElement.innerHTML = `
      <div class="error-container" style="
        padding: 40px;
        text-align: center;
        color: #dc3545;
      ">
        <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
        <h4>Error</h4>
        <p>${message}</p>
        <button onclick="location.reload()" style="
          background: var(--accent);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 16px;
        ">Reload Page</button>
      </div>
    `;
  }

  capitalize(str) {
    // Handle hyphenated strings by converting to camelCase
    return str.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize page loader
  window.pageLoader = new PageLoader();
  
  // Listen for global events
  eventBus.on('foods-updated', () => {
    // Refresh nutrition and foods pages if they're currently active
    const currentPage = window.pageLoader.currentPage;
    if (currentPage === 'nutrition' || currentPage === 'foods') {
      window.pageLoader.reinitializePageModule(currentPage);
    }
  });
  
  eventBus.on('meals-updated', () => {
    // Refresh nutrition page if active
    const currentPage = window.pageLoader.currentPage;
    if (currentPage === 'nutrition') {
      window.pageLoader.reinitializePageModule(currentPage);
    }
  });
});


// Expose pageLoader globally for debugging
window.PageLoader = PageLoader;

// --- Goals Manager Loader ---
function openGoalsManager() {
  if (window.pageLoader) {
    window.pageLoader.loadPage('goals-manager');
  }
}
