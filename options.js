// Focus Lock - Options Page Script
// Handles the settings page interface and keyword management

class OptionsManager {
  constructor() {
    this.defaultSettings = {
      enabled: true,
      lockDuration: 5,
      studyKeywords: {
        academic: ["study", "academic", "university", "college", "school", "syllabus", "curriculum"],
        study: ["lecture", "assignment", "homework", "tutorial", "notes", "textbook", "exam"],
        learning: ["research", "learning", "education", "workshop", "tutorial", "knowledge"],
        course: ["course", "project", "lab", "exam", "lecture", "seminar"]
      }
    };
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.bindEvents();
    this.renderKeywords();
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['enabled', 'lockDuration', 'studyKeywords'], (result) => {
        // Set UI values
        const enabled = result.enabled !== false;
        this.setToggleState('enabled-toggle', enabled);
        document.getElementById('lock-duration').value = result.lockDuration || 5;
        
        // Load keywords with fallback to default structure
        this.studyKeywords = result.studyKeywords || this.defaultSettings.studyKeywords;
        
        // Handle legacy format (array) and convert to new format (object)
        if (Array.isArray(this.studyKeywords)) {
          this.studyKeywords = this.convertLegacyKeywords(this.studyKeywords);
        }
        
        resolve();
      });
    });
  }

  convertLegacyKeywords(keywordArray) {
    // Convert old array format to new categorized format
    const converted = {
      academic: [],
      study: [],
      learning: [],
      course: []
    };
    
    keywordArray.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      if (['academic', 'university', 'college', 'school', 'syllabus', 'curriculum'].includes(lowerKeyword)) {
        converted.academic.push(keyword);
      } else if (['lecture', 'assignment', 'homework', 'tutorial', 'notes', 'textbook', 'exam'].includes(lowerKeyword)) {
        converted.study.push(keyword);
      } else if (['research', 'learning', 'education', 'workshop', 'knowledge'].includes(lowerKeyword)) {
        converted.learning.push(keyword);
      } else if (['course', 'project', 'lab', 'seminar'].includes(lowerKeyword)) {
        converted.course.push(keyword);
      } else {
        // Default to study category for unknown keywords
        converted.study.push(keyword);
      }
    });
    
    return converted;
  }

  bindEvents() {
    // Toggle events
    document.getElementById('enabled-toggle').addEventListener('click', () => {
      this.toggleExtension();
    });
    
    // Save and restore buttons
    document.getElementById('save-settings').addEventListener('click', () => {
      this.saveSettings();
    });
    
    document.getElementById('restore-defaults').addEventListener('click', () => {
      this.restoreDefaults();
    });
    
    // Auto-save when duration changes
    document.getElementById('lock-duration').addEventListener('change', () => {
      this.saveSettings();
    });
    
    // Enter key support for keyword inputs
    ['academic-input', 'study-input', 'learning-input', 'course-input'].forEach(inputId => {
      document.getElementById(inputId).addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const category = inputId.replace('-input', '');
          this.addKeyword(category);
        }
      });
    });
  }

  setToggleState(toggleId, active) {
    const toggle = document.getElementById(toggleId);
    if (active) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
  }

  toggleExtension() {
    const toggle = document.getElementById('enabled-toggle');
    const isActive = toggle.classList.contains('active');
    this.setToggleState('enabled-toggle', !isActive);
    this.saveSettings();
  }

  renderKeywords() {
    const categories = ['academic', 'study', 'learning', 'course'];
    
    categories.forEach(category => {
      const container = document.getElementById(`${category}-keywords`);
      container.innerHTML = '';
      
      if (this.studyKeywords[category]) {
        this.studyKeywords[category].forEach(keyword => {
          const tag = this.createKeywordTag(category, keyword);
          container.appendChild(tag);
        });
      }
    });
  }

  createKeywordTag(category, keyword) {
    const tag = document.createElement('div');
    tag.className = 'keyword-tag';
    tag.innerHTML = `
      ${keyword}
      <span class="remove" onclick="optionsManager.removeKeyword('${category}', '${keyword}')">×</span>
    `;
    return tag;
  }

  addKeyword(category) {
    const input = document.getElementById(`${category}-input`);
    const keyword = input.value.trim().toLowerCase();
    
    if (keyword && keyword.length > 0) {
      if (!this.studyKeywords[category]) {
        this.studyKeywords[category] = [];
      }
      
      if (!this.studyKeywords[category].includes(keyword)) {
        this.studyKeywords[category].push(keyword);
        this.renderKeywords();
        input.value = '';
        this.showStatus(`Added "${keyword}" to ${category} keywords`, 'success');
      } else {
        this.showStatus(`"${keyword}" already exists in ${category} keywords`, 'error');
      }
    }
  }

  removeKeyword(category, keyword) {
    if (this.studyKeywords[category]) {
      const index = this.studyKeywords[category].indexOf(keyword);
      if (index > -1) {
        this.studyKeywords[category].splice(index, 1);
        this.renderKeywords();
        this.showStatus(`Removed "${keyword}" from ${category} keywords`, 'info');
      }
    }
  }

  async saveSettings() {
    try {
      const enabled = document.getElementById('enabled-toggle').classList.contains('active');
      const lockDuration = parseInt(document.getElementById('lock-duration').value);
      
      // Validate duration
      if (lockDuration < 1 || lockDuration > 60) {
        this.showStatus('Duration must be between 1 and 60 minutes', 'error');
        return;
      }
      
      // Validate keywords
      const totalKeywords = Object.values(this.studyKeywords).flat().length;
      if (totalKeywords === 0) {
        this.showStatus('Please add at least one study keyword', 'error');
        return;
      }
      
      // Save to storage
      await chrome.storage.local.set({
        enabled,
        lockDuration,
        studyKeywords: this.studyKeywords
      });
      
      this.showStatus('Settings saved successfully!', 'success');
      
      // Notify content script of settings change
      this.notifyContentScript();
      
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showStatus('Error saving settings', 'error');
    }
  }

  async restoreDefaults() {
    try {
      this.studyKeywords = JSON.parse(JSON.stringify(this.defaultSettings.studyKeywords));
      await chrome.storage.local.set(this.defaultSettings);
      await this.loadSettings();
      this.renderKeywords();
      this.showStatus('Default settings restored!', 'success');
      this.notifyContentScript();
    } catch (error) {
      console.error('Error restoring defaults:', error);
      this.showStatus('Error restoring defaults', 'error');
    }
  }

  notifyContentScript() {
    // Send message to all tabs to reload settings
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: 'settingsUpdated' }).catch(() => {
          // Ignore errors for tabs that don't have content script loaded
        });
      });
    });
  }

  showStatus(message, type = 'info') {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      statusElement.textContent = '';
      statusElement.className = 'status-message';
    }, 4000);
  }
}

// Global functions for HTML onclick handlers
function addKeyword(category) {
  optionsManager.addKeyword(category);
}

function addSuggestedKeyword(category, keyword) {
  if (!optionsManager.studyKeywords[category]) {
    optionsManager.studyKeywords[category] = [];
  }
  
  if (!optionsManager.studyKeywords[category].includes(keyword)) {
    optionsManager.studyKeywords[category].push(keyword);
    optionsManager.renderKeywords();
    optionsManager.showStatus(`Added "${keyword}" to ${category} keywords`, 'success');
  } else {
    optionsManager.showStatus(`"${keyword}" already exists in ${category} keywords`, 'error');
  }
}

// Initialize options manager when DOM is ready
let optionsManager;
document.addEventListener('DOMContentLoaded', () => {
  optionsManager = new OptionsManager();
});
