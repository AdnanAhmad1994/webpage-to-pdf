/**
 * Options Page Controller
 */

let settings = null;

// DOM Elements
const elements = {
  // General tab
  qualitySelect: document.getElementById('qualitySelect'),
  fullPageCheck: document.getElementById('fullPageCheck'),
  infiniteScrollCheck: document.getElementById('infiniteScrollCheck'),
  waitImagesCheck: document.getElementById('waitImagesCheck'),
  removeToolbarCheck: document.getElementById('removeToolbarCheck'),
  preserveLinksCheck: document.getElementById('preserveLinksCheck'),
  darkModeCheck: document.getElementById('darkModeCheck'),
  compressionCheck: document.getElementById('compressionCheck'),
  fileNamePattern: document.getElementById('fileNamePattern'),

  // Advanced tab
  formatSelect: document.getElementById('formatSelect'),
  orientationSelect: document.getElementById('orientationSelect'),
  dpiSelect: document.getElementById('dpiSelect'),

  // Buttons
  resetBtn: document.getElementById('resetBtn'),
  exportDiagnosticsBtn: document.getElementById('exportDiagnosticsBtn'),
  supportBtn: document.getElementById('supportBtn'),

  // Status
  saveStatus: document.getElementById('saveStatus'),
  saveIndicator: document.getElementById('saveIndicator'),

  // Navigation
  navItems: document.querySelectorAll('.nav-item'),
  tabPanels: document.querySelectorAll('.tab-panel')
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  attachEventListeners();
  handleWelcome();
});

/**
 * Load settings from storage
 */
async function loadSettings() {
  const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
  settings = response.settings;

  // Apply to UI
  elements.qualitySelect.value = settings.quality;
  elements.fullPageCheck.checked = settings.captureFullPage;
  elements.infiniteScrollCheck.checked = settings.infiniteScroll;
  elements.waitImagesCheck.checked = settings.waitForImages;
  elements.removeToolbarCheck.checked = settings.removeToolbar;
  elements.preserveLinksCheck.checked = settings.preserveLinks;
  elements.darkModeCheck.checked = settings.darkMode;
  elements.compressionCheck.checked = settings.compression;
  elements.fileNamePattern.value = settings.fileNamePattern;
  elements.formatSelect.value = settings.format;
  elements.orientationSelect.value = settings.orientation;
  elements.dpiSelect.value = settings.dpi.toString();
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  // Tab navigation
  elements.navItems.forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });

  // Settings changes
  const settingsInputs = [
    elements.qualitySelect,
    elements.fullPageCheck,
    elements.infiniteScrollCheck,
    elements.waitImagesCheck,
    elements.removeToolbarCheck,
    elements.preserveLinksCheck,
    elements.darkModeCheck,
    elements.compressionCheck,
    elements.fileNamePattern,
    elements.formatSelect,
    elements.orientationSelect,
    elements.dpiSelect
  ];

  settingsInputs.forEach(input => {
    if (input) {
      input.addEventListener('change', saveSettings);
      if (input.type === 'text') {
        input.addEventListener('input', debounce(saveSettings, 500));
      }
    }
  });

  // Buttons
  elements.resetBtn.addEventListener('click', resetToDefaults);
  elements.exportDiagnosticsBtn.addEventListener('click', exportDiagnostics);
  elements.supportBtn.addEventListener('click', openSupport);

  // Expand/collapse details
  document.querySelectorAll('details').forEach(details => {
    details.addEventListener('toggle', () => {
      if (details.open) {
        details.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
}

/**
 * Switch tab
 */
function switchTab(tabName) {
  // Update nav
  elements.navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabName);
  });

  // Update content
  elements.tabPanels.forEach(panel => {
    panel.classList.toggle('active', panel.dataset.tab === tabName);
  });

  // Update URL
  const url = new URL(window.location);
  url.searchParams.set('tab', tabName);
  window.history.pushState({}, '', url);
}

/**
 * Save settings
 */
async function saveSettings() {
  // Update settings object
  settings.quality = elements.qualitySelect.value;
  settings.captureFullPage = elements.fullPageCheck.checked;
  settings.infiniteScroll = elements.infiniteScrollCheck.checked;
  settings.waitForImages = elements.waitImagesCheck.checked;
  settings.removeToolbar = elements.removeToolbarCheck.checked;
  settings.preserveLinks = elements.preserveLinksCheck.checked;
  settings.darkMode = elements.darkModeCheck.checked;
  settings.compression = elements.compressionCheck.checked;
  settings.fileNamePattern = elements.fileNamePattern.value;
  settings.format = elements.formatSelect.value;
  settings.orientation = elements.orientationSelect.value;
  settings.dpi = parseInt(elements.dpiSelect.value);

  // Save to storage
  await chrome.runtime.sendMessage({
    action: 'saveSettings',
    settings
  });

  // Show saved indicator
  showSaveIndicator();
}

/**
 * Show save indicator
 */
function showSaveIndicator() {
  if (elements.saveIndicator) {
    elements.saveIndicator.classList.remove('hidden');
    setTimeout(() => {
      elements.saveIndicator.classList.add('hidden');
    }, 2000);
  }
}

/**
 * Reset to defaults
 */
async function resetToDefaults() {
  if (!confirm('Reset all settings to defaults? This cannot be undone.')) {
    return;
  }

  const defaults = {
    quality: 'high',
    darkMode: false,
    preserveLinks: true,
    captureFullPage: true,
    fileNamePattern: '{title}_{date}',
    dpi: 2,
    format: 'a4',
    orientation: 'portrait',
    compression: true,
    waitForImages: true,
    infiniteScroll: true,
    removeToolbar: true
  };

  settings = defaults;

  await chrome.runtime.sendMessage({
    action: 'saveSettings',
    settings: defaults
  });

  // Reload settings
  await loadSettings();

  alert('Settings reset to defaults!');
}

/**
 * Export diagnostics
 */
async function exportDiagnostics() {
  const report = await chrome.runtime.sendMessage({ action: 'getDiagnostics' });

  // Add system info
  const fullReport = {
    ...report,
    system: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      settings: settings
    }
  };

  // Create download
  const blob = new Blob([JSON.stringify(fullReport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pdf-pro-diagnostics-${new Date().toISOString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Open support
 */
function openSupport() {
  const subject = encodeURIComponent('PDF Pro Support Request');
  const body = encodeURIComponent(`
Please describe your issue:

---
Version: 2.0.0
Browser: ${navigator.userAgent}
  `);

  // Open GitHub issues or support page
  window.open('https://github.com/yourusername/pdf-pro/issues', '_blank');
}

/**
 * Handle welcome screen
 */
function handleWelcome() {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('welcome') === 'true') {
    // Show welcome message
    const welcome = document.createElement('div');
    welcome.className = 'welcome-banner';
    welcome.innerHTML = `
      <h2>Welcome to Webpage to PDF Pro!</h2>
      <p>Thank you for installing. Start converting webpages to professional PDFs instantly.</p>
      <button id="closeWelcome">Get Started</button>
    `;

    document.querySelector('.main-content').prepend(welcome);

    document.getElementById('closeWelcome').addEventListener('click', () => {
      welcome.remove();
      switchTab('help');
    });
  }

  // Handle tab from URL
  const tab = urlParams.get('tab');
  if (tab) {
    switchTab(tab);
  }
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
