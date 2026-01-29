/**
 * Popup UI Controller
 */

let currentSettings = null;

// DOM Elements
const elements = {
  convertBtn: document.getElementById('convertBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  retryBtn: document.getElementById('retryBtn'),
  helpLink: document.getElementById('helpLink'),
  diagnosticsLink: document.getElementById('diagnosticsLink'),

  // Toggles
  darkModeToggle: document.getElementById('darkModeToggle'),
  fullPageToggle: document.getElementById('fullPageToggle'),
  preserveLinksToggle: document.getElementById('preserveLinksToggle'),

  qualitySelect: document.getElementById('qualitySelect'),

  // Status containers
  statusContainer: document.getElementById('statusContainer'),
  statusText: document.getElementById('statusText'),
  statusDetails: document.getElementById('statusDetails'),
  progressFill: document.getElementById('progressFill'),
  quickActions: document.getElementById('quickActions'),
  successMessage: document.getElementById('successMessage'),
  successDetails: document.getElementById('successDetails'),
  errorMessage: document.getElementById('errorMessage'),
  errorText: document.getElementById('errorText')
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  attachEventListeners();
});

/**
 * Load settings from storage
 */
async function loadSettings() {
  const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
  currentSettings = response.settings;

  // Apply settings to UI
  elements.darkModeToggle.checked = currentSettings.darkMode;
  elements.fullPageToggle.checked = currentSettings.captureFullPage;
  elements.preserveLinksToggle.checked = currentSettings.preserveLinks;
  elements.qualitySelect.value = currentSettings.quality;
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  elements.convertBtn.addEventListener('click', startConversion);
  elements.retryBtn.addEventListener('click', startConversion);
  elements.settingsBtn.addEventListener('click', openSettings);
  elements.helpLink.addEventListener('click', openHelp);
  elements.diagnosticsLink.addEventListener('click', showDiagnostics);



  // Settings changes
  elements.darkModeToggle.addEventListener('change', updateSettings);
  elements.fullPageToggle.addEventListener('change', updateSettings);
  elements.preserveLinksToggle.addEventListener('change', updateSettings);
  elements.qualitySelect.addEventListener('change', updateSettings);

  // Keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !elements.convertBtn.disabled) {
      startConversion();
    }
  });
}

/**
 * Update settings when toggles change
 */
async function updateSettings() {
  currentSettings.darkMode = elements.darkModeToggle.checked;
  currentSettings.captureFullPage = elements.fullPageToggle.checked;
  currentSettings.preserveLinks = elements.preserveLinksToggle.checked;
  currentSettings.quality = elements.qualitySelect.value;

  // Update DPI based on quality
  const qualityMap = { medium: 2, high: 3, ultra: 4 };
  currentSettings.dpi = qualityMap[currentSettings.quality];

  await chrome.runtime.sendMessage({
    action: 'saveSettings',
    settings: currentSettings
  });
}

/**
 * Start PDF conversion
 */
async function startConversion() {
  try {
    // Hide messages
    hideAllMessages();

    // Show status
    showStatus('Preparing page...', 10);
    elements.convertBtn.disabled = true;

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) {
      throw new Error('No active tab found');
    }

    // Check if URL is valid
    if (!isValidUrl(tab.url)) {
      throw new Error('Cannot convert system pages (chrome://, chrome-extension://, etc.)');
    }

    // Update progress
    showStatus('Processing...', 30);

    // Start conversion in background
    const response = await chrome.runtime.sendMessage({
      action: 'startPdfGeneration',
      settings: currentSettings
    });

    if (!response.success) {
      throw new Error(response.error);
    }

    // Success!
    showStatus('Finalizing...', 90);

    setTimeout(() => {
      showSuccess(response.result);
    }, 500);

  } catch (error) {
    console.error('Conversion failed:', error);
    showError(error.message);
  } finally {
    elements.convertBtn.disabled = false;
  }
}

/**
 * Show status with progress
 */
function showStatus(message, progress) {
  elements.statusContainer.classList.remove('hidden');
  elements.quickActions.classList.add('hidden');
  elements.statusText.textContent = message;
  elements.progressFill.style.width = progress + '%';
}

/**
 * Show success message
 */
function showSuccess(result) {
  hideAllMessages();
  elements.successMessage.classList.remove('hidden');

  // Handle native print result (no file size available)
  if (result.method === 'native-print') {
    elements.successDetails.textContent = 'Select "Save as PDF" in the print dialog';
  } else if (result.filename && result.size) {
    elements.successDetails.textContent = `File: ${result.filename} - Size: ${formatBytes(result.size)}`;
  } else {
    elements.successDetails.textContent = 'Print dialog opened';
  }

  // Auto-hide after 4 seconds
  setTimeout(() => {
    elements.successMessage.classList.add('hidden');
    elements.quickActions.classList.remove('hidden');
  }, 4000);
}

/**
 * Show error message
 */
function showError(message) {
  hideAllMessages();
  elements.errorMessage.classList.remove('hidden');
  elements.errorText.textContent = message;
}

/**
 * Hide all message containers
 */
function hideAllMessages() {
  elements.statusContainer.classList.add('hidden');
  elements.successMessage.classList.add('hidden');
  elements.errorMessage.classList.add('hidden');
  elements.quickActions.classList.remove('hidden');
}

/**
 * Check if URL is valid for conversion
 */
function isValidUrl(url) {
  if (!url) return false;
  const invalidPrefixes = ['chrome://', 'chrome-extension://', 'edge://', 'about:', 'data:'];
  return !invalidPrefixes.some(prefix => url.startsWith(prefix));
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Open settings page
 */
function openSettings() {
  chrome.runtime.openOptionsPage();
}

/**
 * Open help page
 */
function openHelp(e) {
  e.preventDefault();
  chrome.tabs.create({ url: 'options.html?tab=help' });
}

/**
 * Show diagnostics
 */
async function showDiagnostics(e) {
  e.preventDefault();
  const report = await chrome.runtime.sendMessage({ action: 'getDiagnostics' });

  // Create diagnostics popup
  const modal = document.createElement('div');
  modal.className = 'diagnostics-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Diagnostics Report</h2>
      <pre>${JSON.stringify(report, null, 2)}</pre>
      <button id="closeModal">Close</button>
      <button id="copyReport">Copy to Clipboard</button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('closeModal').addEventListener('click', () => {
    modal.remove();
  });

  document.getElementById('copyReport').addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    alert('Report copied to clipboard!');
  });
}
