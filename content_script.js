// Focus Lock - Content Script
// Main logic for detecting distracting sites and showing blocking overlay

class FocusLock {
  constructor() {
    this.settings = null;
    this.overlay = null;
    this.timer = null;
    this.isLocked = false;
    this.microTask = '';
    this.currentVideo = null;
    
    // Curated educational/relaxing YouTube videos
    this.videos = [
      { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up - Rick Astley' },
      { id: 'jNQXAC9IVRw', title: 'How to Learn Effectively - Study Tips' },
      { id: 'Z9RY3mZ2Zc8', title: 'Calming Nature Sounds - Forest Rain' },
      { id: 'mghhLqu31cQ', title: 'Pomodoro Technique Explained' },
      { id: 'videoseries?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr', title: 'Essence of Linear Algebra - 3Blue1Brown' },
      { id: 'PLZHQObOWTQDO9I9H8XcQ', title: 'Crash Course Physics Playlist' },
      { id: 'PLZHQObOWTQDP5MtkW1noq5nbdq2FrOFzV', title: 'Crash Course Biology Playlist' }
    ];
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    if (this.settings.enabled) {
      this.checkPageAndLock();
    }
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        this.settings = response;
        resolve();
      });
    });
  }

  checkPageAndLock() {
    const pageContent = this.getPageContent();
    const isStudyRelated = this.isStudyRelated(pageContent);
    
    if (!isStudyRelated) {
      this.showLockOverlay();
    }
  }

  getPageContent() {
    const title = document.title.toLowerCase();
    const bodyText = document.body.innerText.toLowerCase();
    const url = window.location.href.toLowerCase();
    
    return {
      title,
      bodyText: bodyText.substring(0, 1000), // Limit to first 1000 chars for performance
      url
    };
  }

  isStudyRelated(pageContent) {
    const { title, bodyText, url } = pageContent;
    
    // Handle both new categorized format and legacy array format
    let keywords = [];
    if (this.settings.studyKeywords && typeof this.settings.studyKeywords === 'object') {
      // New categorized format
      keywords = Object.values(this.settings.studyKeywords).flat().map(k => k.toLowerCase());
    } else if (Array.isArray(this.settings.studyKeywords)) {
      // Legacy array format
      keywords = this.settings.studyKeywords.map(k => k.toLowerCase());
    }
    
    // Check if any study keyword is found in title, body, or URL
    const foundKeywords = keywords.filter(keyword => 
      title.includes(keyword) || 
      bodyText.includes(keyword) || 
      url.includes(keyword)
    );
    
    return foundKeywords.length > 0;
  }

  showLockOverlay() {
    if (this.isLocked) return;
    
    this.isLocked = true;
    this.generateMicroTask();
    this.selectRandomVideo();
    this.createOverlay();
    this.startTimer();
  }

  generateMicroTask() {
    const tasks = [
      "Type this sentence exactly: 'I am focused and ready to study.'",
      "Type this sentence exactly: 'Learning is my priority right now.'",
      "Type this sentence exactly: 'I will stay focused on my goals.'",
      "Type this sentence exactly: 'Distractions will not control me.'",
      "Type this sentence exactly: 'I am committed to my education.'"
    ];
    
    this.microTask = tasks[Math.floor(Math.random() * tasks.length)];
  }

  selectRandomVideo() {
    this.currentVideo = this.videos[Math.floor(Math.random() * this.videos.length)];
  }

  createOverlay() {
    // Remove existing overlay if any
    const existingOverlay = document.getElementById('focus-lock-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.id = 'focus-lock-overlay';
    this.overlay.innerHTML = this.getOverlayHTML();
    
    // Add styles
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: white;
    `;

    // Add to page
    document.body.appendChild(this.overlay);
    
    // Bind events
    this.bindOverlayEvents();
  }

  getOverlayHTML() {
    return `
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 40px;
        max-width: 600px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
      ">
        <h1 style="
          font-size: 2.5em;
          margin: 0 0 20px 0;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        ">🔒 Focus Lock</h1>
        
        <div id="countdown" style="
          font-size: 3em;
          font-weight: bold;
          margin: 30px 0;
          color: #ffeb3b;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        ">${this.formatTime(this.settings.lockDuration * 60)}</div>
        
        <div style="margin: 30px 0;">
          <h3 style="margin: 0 0 15px 0; font-size: 1.2em;">Complete this task to unlock early:</h3>
          <p style="
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 10px;
            font-size: 1.1em;
            margin: 0 0 20px 0;
            border: 2px dashed rgba(255,255,255,0.3);
          ">${this.microTask}</p>
          
          <input type="text" id="task-input" placeholder="Type the sentence here..." style="
            width: 100%;
            padding: 15px;
            border: none;
            border-radius: 10px;
            font-size: 1.1em;
            background: rgba(255,255,255,0.9);
            color: #333;
            margin-bottom: 15px;
            box-sizing: border-box;
          ">
          
          <button id="submit-task" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 1.1em;
            cursor: pointer;
            font-weight: bold;
            transition: background 0.3s;
          ">Submit</button>
        </div>
        
        <div id="video-section" style="margin-top: 30px;">
          <h3 style="margin: 0 0 15px 0;">Optional: Watch this educational content</h3>
          <div style="
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            padding: 20px;
            border: 2px solid rgba(255,255,255,0.2);
          ">
            <h4 style="margin: 0 0 10px 0;">${this.currentVideo.title}</h4>
            <iframe 
              width="100%" 
              height="200" 
              src="https://www.youtube.com/embed/${this.currentVideo.id}" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
              style="border-radius: 10px;">
            </iframe>
          </div>
        </div>
        
        <div style="margin-top: 20px; font-size: 0.9em; opacity: 0.8;">
          Focus Lock is helping you stay productive! 💪
        </div>
      </div>
    `;
  }

  bindOverlayEvents() {
    const taskInput = document.getElementById('task-input');
    const submitButton = document.getElementById('submit-task');
    
    submitButton.addEventListener('click', () => {
      this.checkMicroTask();
    });
    
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.checkMicroTask();
      }
    });
    
    // Focus on input
    setTimeout(() => {
      taskInput.focus();
    }, 100);
  }

  checkMicroTask() {
    const taskInput = document.getElementById('task-input');
    const userInput = taskInput.value.trim();
    
    // Extract the required sentence from the micro task
    const requiredSentence = this.microTask.match(/Type this sentence exactly: '([^']+)'/)?.[1];
    
    if (userInput === requiredSentence) {
      this.unlockPage();
    } else {
      taskInput.style.border = '2px solid #f44336';
      taskInput.value = '';
      taskInput.placeholder = 'Incorrect! Try again...';
      setTimeout(() => {
        taskInput.style.border = 'none';
        taskInput.placeholder = 'Type the sentence here...';
      }, 2000);
    }
  }

  startTimer() {
    let timeLeft = this.settings.lockDuration * 60; // Convert to seconds
    
    this.timer = setInterval(() => {
      timeLeft--;
      const countdownElement = document.getElementById('countdown');
      if (countdownElement) {
        countdownElement.textContent = this.formatTime(timeLeft);
      }
      
      if (timeLeft <= 0) {
        this.unlockPage();
      }
    }, 1000);
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  unlockPage() {
    this.isLocked = false;
    
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    
    console.log('Focus Lock: Page unlocked!');
  }
}

// Initialize Focus Lock when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FocusLock();
  });
} else {
  new FocusLock();
}
