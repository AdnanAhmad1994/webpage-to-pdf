/**
 * Background Service Worker - PDF Generation Orchestrator
 * Handles PDF conversion requests, manages state, and coordinates content scripts
 */

// Configuration defaults
const DEFAULT_SETTINGS = {
  quality: 'high', // 'low', 'medium', 'high', 'ultra'
  darkMode: false,
  preserveLinks: true,
  captureFullPage: true,
  fileNamePattern: '{title}_{date}',
  dpi: 2, // 1x, 2x, 3x
  format: 'a4',
  orientation: 'portrait',
  compression: true,
  waitForImages: true,
  infiniteScroll: true,
  removeToolbar: true
};

// Error tracking and diagnostics
class DiagnosticLogger {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
  }

  log(type, message, context = {}) {
    const entry = {
      type,
      message,
      context,
      timestamp: new Date().toISOString(),
      url: context.url || 'unknown'
    };

    this.errors.push(entry);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (type === 'error') {
      console.error('[PDF Pro Error]', message, context);
    } else {
      console.log('[PDF Pro]', message, context);
    }
  }

  async getReport() {
    return {
      errors: this.errors,
      timestamp: new Date().toISOString(),
      version: chrome.runtime.getManifest().version
    };
  }
}

const logger = new DiagnosticLogger();

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
    logger.log('info', 'Extension installed', { version: chrome.runtime.getManifest().version });

    // Open welcome page
    chrome.tabs.create({ url: 'options.html?welcome=true' });
  } else if (details.reason === 'update') {
    logger.log('info', 'Extension updated', {
      previousVersion: details.previousVersion,
      currentVersion: chrome.runtime.getManifest().version
    });
  }
});

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startPdfGeneration') {
    // Get active tab since sender.tab is undefined when message comes from popup
    chrome.tabs.query({ active: true, currentWindow: true })
      .then(([tab]) => {
        if (!tab) {
          throw new Error('No active tab found');
        }
        return handlePdfGeneration(request.settings, tab);
      })
      .then(result => sendResponse({ success: true, result }))
      .catch(error => {
        logger.log('error', 'PDF generation failed', { error: error.message, stack: error.stack });
        sendResponse({ success: false, error: error.message });
      });
    return true; // Async response
  }

  if (request.action === 'getSettings') {
    chrome.storage.sync.get('settings', (data) => {
      sendResponse({ settings: data.settings || DEFAULT_SETTINGS });
    });
    return true;
  }

  if (request.action === 'saveSettings') {
    chrome.storage.sync.set({ settings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'getDiagnostics') {
    logger.getReport().then(report => sendResponse(report));
    return true;
  }
});

/**
 * Main PDF generation orchestration
 */
async function handlePdfGeneration(settings, tab) {
  if (!tab || !tab.id) {
    throw new Error('No active tab found. Please try again.');
  }

  // Validate URL is convertible
  const invalidPrefixes = ['chrome://', 'chrome-extension://', 'edge://', 'about:', 'data:'];
  if (!tab.url || invalidPrefixes.some(prefix => tab.url.startsWith(prefix))) {
    throw new Error('Cannot convert system pages. Please navigate to a regular webpage.');
  }

  logger.log('info', 'Starting PDF generation', {
    tabId: tab.id,
    url: tab.url,
    title: tab.title
  });

  try {
    // Step 1: Inject content script if not already present
    await ensureContentScriptLoaded(tab.id);

    // Step 2: Prepare page for capture
    const prepResult = await chrome.tabs.sendMessage(tab.id, {
      action: 'preparePage',
      settings
    });

    if (!prepResult.success) {
      throw new Error('Page preparation failed: ' + prepResult.error);
    }

    logger.log('info', 'Page prepared', {
      contentHeight: prepResult.contentHeight,
      imagesLoaded: prepResult.imagesLoaded
    });

    // Step 3: Trigger native print (opens browser print dialog)
    const captureResult = await chrome.tabs.sendMessage(tab.id, {
      action: 'capturePage',
      settings
    });

    if (!captureResult.success) {
      throw new Error('Page capture failed: ' + captureResult.error);
    }

    // Step 4: Cleanup
    await chrome.tabs.sendMessage(tab.id, {
      action: 'cleanup'
    });

    logger.log('info', 'Native print triggered', {
      method: captureResult.data?.method || 'native-print'
    });

    // Return success - the browser's print dialog handles saving
    return {
      filename: 'Print dialog opened',
      size: 0,
      method: 'native-print',
      message: 'Save as PDF from the print dialog (Destination: Save as PDF)'
    };

  } catch (error) {
    logger.log('error', 'PDF generation failed', {
      error: error.message,
      stack: error.stack,
      tabId: tab.id,
      url: tab.url
    });
    throw error;
  }
}

/**
 * Ensure content script is loaded and ready
 */
async function ensureContentScriptLoaded(tabId) {
  try {
    // Try to ping the content script
    await chrome.tabs.sendMessage(tabId, { action: 'ping' });
  } catch (error) {
    // Content script not loaded, inject it
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * Generate PDF from captured page data
 */
async function generatePdfFromCapture(captureData, settings, metadata) {
  // This will be handled by content script using jsPDF
  // For now, return the blob from capture
  return captureData.pdfBlob;
}

/**
 * Download PDF without triggering page refresh
 */
async function downloadPdf(pdfBlob, filename) {
  // Convert blob to data URL
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      const dataUrl = reader.result;

      chrome.downloads.download({
        url: dataUrl,
        filename: filename,
        saveAs: false,
        conflictAction: 'uniquify'
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          logger.log('info', 'Download initiated', { downloadId, filename });
          resolve(downloadId);
        }
      });
    };

    reader.onerror = () => reject(new Error('Failed to read PDF blob'));
    reader.readAsDataURL(pdfBlob);
  });
}

/**
 * Generate smart filename from page title
 */
function generateFilename(pageTitle, pattern) {
  // Clean title
  let title = pageTitle
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 50) // Limit length
    .trim();

  if (!title) {
    title = 'webpage';
  }

  // Get date components
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  const timestamp = now.getTime();

  // Replace pattern variables
  let filename = pattern
    .replace('{title}', title)
    .replace('{date}', date)
    .replace('{time}', time)
    .replace('{timestamp}', timestamp);

  // Ensure .pdf extension
  if (!filename.endsWith('.pdf')) {
    filename += '.pdf';
  }

  return filename;
}

// Handle extension icon click when popup is not available
chrome.action.onClicked.addListener(async (tab) => {
  // This will trigger the popup, but we keep this as fallback
  logger.log('info', 'Extension icon clicked', { tabId: tab.id });
});

// Monitor download completion
chrome.downloads.onChanged.addListener((delta) => {
  if (delta.state && delta.state.current === 'complete') {
    logger.log('info', 'Download completed', { downloadId: delta.id });
  }

  if (delta.error) {
    logger.log('error', 'Download failed', {
      downloadId: delta.id,
      error: delta.error.current
    });
  }
});

logger.log('info', 'Background service worker initialized');
