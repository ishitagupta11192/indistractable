// Focus Lock - Popup Script
// Handles the simplified popup interface for quick toggling

class PopupManager {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.bindEvents();
    this.updateDisplay();
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['enabled', 'lockDuration', 'studyKeywords'], (result) => {
        this.settings = {
          enabled: result.enabled !== false,
          lockDuration: result.lockDuration || 5,
          studyKeywords: result.studyKeywords || {}
        };
        resolve();
      });
    });
  }

  bindEvents() {
    // Toggle extension on/off
    document.getElementById('enabled-toggle').addEventListener('click', () => {
      this.toggleExtension();
    });
    
    // Open settings page
    document.getElementById('open-settings').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
    
    // View stats (placeholder for future feature)
    document.getElementById('view-stats').addEventListener('click', () => {
      this.showStats();
    });
  }

  async toggleExtension() {
    try {
      this.settings.enabled = !this.settings.enabled;
      
      // Save to storage
      await chrome.storage.local.set({
        enabled: this.settings.enabled
      });
      
      // Update display
      this.updateDisplay();
      
      // Notify content script of settings change
      this.notifyContentScript();
      
    } catch (error) {
      console.error('Error toggling extension:', error);
    }
  }

  updateDisplay() {
    const toggle = document.getElementById('enabled-toggle');
    const statusIndicator = document.getElementById('status-indicator');
    const currentStatus = document.getElementById('current-status');
    const lockDurationDisplay = document.getElementById('lock-duration-display');
    const keywordCount = document.getElementById('keyword-count');
    
    // Update toggle state
    if (this.settings.enabled) {
      toggle.classList.add('active');
      statusIndicator.textContent = 'Extension Enabled';
      statusIndicator.className = 'status-indicator status-enabled';
      currentStatus.textContent = 'Active';
    } else {
      toggle.classList.remove('active');
      statusIndicator.textContent = 'Extension Disabled';
      statusIndicator.className = 'status-indicator status-disabled';
      currentStatus.textContent = 'Inactive';
    }
    
    // Update stats
    lockDurationDisplay.textContent = `${this.settings.lockDuration} minutes`;
    
    // Count total keywords
    let totalKeywords = 0;
    if (this.settings.studyKeywords && typeof this.settings.studyKeywords === 'object') {
      totalKeywords = Object.values(this.settings.studyKeywords).flat().length;
    } else if (Array.isArray(this.settings.studyKeywords)) {
      totalKeywords = this.settings.studyKeywords.length;
    }
    keywordCount.textContent = totalKeywords;
  }

  showStats() {
    // Placeholder for future stats feature
    alert('Stats feature coming soon! 📊\n\nThis will show:\n• Time spent studying\n• Websites blocked\n• Focus sessions completed');
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
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
