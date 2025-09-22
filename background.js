// Focus Lock - Background Script
// Handles extension lifecycle and storage management

chrome.runtime.onInstalled.addListener(() => {
  // Set default settings on installation
  chrome.storage.local.set({
    enabled: true,
    lockDuration: 5, // minutes
    studyKeywords: {
      academic: ["study", "academic", "university", "college", "school", "syllabus", "curriculum"],
      study: ["lecture", "assignment", "homework", "tutorial", "notes", "textbook", "exam"],
      learning: ["research", "learning", "education", "workshop", "tutorial", "knowledge"],
      course: ["course", "project", "lab", "exam", "lecture", "seminar"]
    }
  });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This is handled by the popup, but we keep this for potential future use
  console.log('Focus Lock icon clicked');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.local.get(['enabled', 'lockDuration', 'studyKeywords'], (result) => {
      sendResponse({
        enabled: result.enabled || true,
        lockDuration: result.lockDuration || 5,
        studyKeywords: result.studyKeywords || []
      });
    });
    return true; // Keep message channel open for async response
  }
});

// Handle tab updates to inject content script on navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Content script will auto-inject due to manifest configuration
    console.log('Tab updated:', tab.url);
  }
});
