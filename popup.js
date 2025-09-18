// Focus Lock - Popup Script
// Handles the popup interface and settings management

class PopupManager {
  constructor() {
    this.defaultSettings = {
      enabled: true,
      lockDuration: 5,
      studyKeywords: [
        "study", "lecture", "assignment", "homework", "tutorial", 
        "course", "project", "notes", "exam", "lab", "syllabus",
        "research", "academic", "learning", "education", "university",
        "college", "school", "textbook", "curriculum", "workshop"
      ]
    };
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.bindEvents();
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['enabled', 'lockDuration', 'studyKeywords'], (result) => {
        // Set UI values
        document.getElementById('enabled-toggle').checked = result.enabled !== false;
        document.getElementById('lock-duration').value = result.lockDuration || 5;
        document.getElementById('study-keywords').value = (result.studyKeywords || this.defaultSettings.studyKeywords).join(', ');
        resolve();
      });
    });
  }

  bindEvents() {
    document.getElementById('save-settings').addEventListener('click', () => {
      this.saveSettings();
    });
    
    document.getElementById('restore-defaults').addEventListener('click', () => {
      this.restoreDefaults();
    });
    
    // Auto-save when toggle changes
    document.getElementById('enabled-toggle').addEventListener('change', () => {
      this.saveSettings();
    });
    
    // Auto-save when duration changes
    document.getElementById('lock-duration').addEventListener('change', () => {
      this.saveSettings();
    });
  }

  async saveSettings() {
    try {
      const enabled = document.getElementById('enabled-toggle').checked;
      const lockDuration = parseInt(document.getElementById('lock-duration').value);
      const keywordsText = document.getElementById('study-keywords').value.trim();
      
      // Parse keywords
      const studyKeywords = keywordsText
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);
      
      // Validate duration
      if (lockDuration < 1 || lockDuration > 60) {
        this.showStatus('Duration must be between 1 and 60 minutes', 'error');
        return;
      }
      
      // Validate keywords
      if (studyKeywords.length === 0) {
        this.showStatus('Please enter at least one study keyword', 'error');
        return;
      }
      
      // Save to storage
      await chrome.storage.local.set({
        enabled,
        lockDuration,
        studyKeywords
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
      await chrome.storage.local.set(this.defaultSettings);
      await this.loadSettings();
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
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      statusElement.textContent = '';
      statusElement.className = 'status-message';
    }, 3000);
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
