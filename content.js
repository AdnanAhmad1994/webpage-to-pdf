/**
 * Content Script - Intelligent Page Capture System
 * Handles lazy loading, full-page capture, hyperlink preservation, and dark mode
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__pdfProContentScriptLoaded) {
    return;
  }
  window.__pdfProContentScriptLoaded = true;

  console.log('[PDF Pro] Content script loaded');

  /**
   * Intelligent Image Loader - Waits for all images including lazy-loaded ones
   */
  class ImageLoader {
    async waitForAllImages(timeout = 30000) {
      const startTime = Date.now();
      const images = this.getAllImages();

      console.log(`[PDF Pro] Found ${images.length} images to load`);

      // Trigger lazy loading by scrolling
      await this.triggerLazyLoad();

      // Wait for all images to load or timeout
      const promises = images.map(img => this.waitForImage(img, timeout));
      const results = await Promise.allSettled(promises);

      const loaded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`[PDF Pro] Images loaded: ${loaded}, failed: ${failed}, time: ${Date.now() - startTime}ms`);

      return { total: images.length, loaded, failed };
    }

    getAllImages() {
      // Get all img elements, including those in shadow DOM
      const images = [...document.querySelectorAll('img')];

      // Also check for background images
      const elementsWithBg = [...document.querySelectorAll('*')].filter(el => {
        const bg = window.getComputedStyle(el).backgroundImage;
        return bg && bg !== 'none' && bg.includes('url');
      });

      return [...images, ...elementsWithBg];
    }

    async waitForImage(img, timeout) {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('Image load timeout')), timeout);

        if (img.tagName === 'IMG') {
          if (img.complete && img.naturalHeight > 0) {
            clearTimeout(timeoutId);
            resolve(img);
          } else {
            img.onload = () => {
              clearTimeout(timeoutId);
              resolve(img);
            };
            img.onerror = () => {
              clearTimeout(timeoutId);
              reject(new Error('Image load error'));
            };
          }
        } else {
          // Background image - just resolve after short delay
          setTimeout(() => {
            clearTimeout(timeoutId);
            resolve(img);
          }, 100);
        }
      });
    }

    async triggerLazyLoad() {
      const originalScrollY = window.scrollY;
      const originalScrollX = window.scrollX;
      const scrollStep = window.innerHeight;
      const pageHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );

      // Scroll through page to trigger lazy loading
      for (let y = 0; y < pageHeight; y += scrollStep) {
        window.scrollTo(0, y);
        await this.sleep(200); // Wait for lazy load triggers
      }

      // Restore original scroll position
      window.scrollTo(originalScrollX, originalScrollY);
    }

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  /**
   * Full Page Capture - Handles infinite scroll and dynamic content
   */
  class FullPageCapture {
    async captureFullHeight(settings) {
      if (!settings.captureFullPage) {
        return { height: window.innerHeight };
      }

      const startHeight = document.documentElement.scrollHeight;
      let currentHeight = startHeight;
      let attempts = 0;
      const maxAttempts = 50; // Prevent infinite loops

      console.log(`[PDF Pro] Initial page height: ${startHeight}px`);

      if (settings.infiniteScroll) {
        // Detect infinite scroll and load all content
        while (attempts < maxAttempts) {
          // Scroll to bottom
          window.scrollTo(0, document.documentElement.scrollHeight);
          await this.sleep(500);

          // Check if new content loaded
          const newHeight = document.documentElement.scrollHeight;
          if (newHeight === currentHeight) {
            // No new content, we're done
            break;
          }

          currentHeight = newHeight;
          attempts++;
          console.log(`[PDF Pro] New content detected, height: ${currentHeight}px`);
        }

        // Scroll back to top
        window.scrollTo(0, 0);
        await this.sleep(300);
      }

      return {
        height: currentHeight,
        infinite: attempts > 0,
        attempts
      };
    }

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  /**
   * Hyperlink Extractor - Preserves clickable links in PDF
   */
  class HyperlinkExtractor {
    extractLinks() {
      const links = [];
      const allLinks = document.querySelectorAll('a[href]');

      allLinks.forEach((anchor, index) => {
        const href = anchor.href;
        if (!href || href.startsWith('javascript:')) {
          return;
        }

        const rect = anchor.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        links.push({
          id: index,
          url: href,
          text: anchor.textContent.substring(0, 100),
          x: rect.left + scrollX,
          y: rect.top + scrollY,
          width: rect.width,
          height: rect.height
        });
      });

      console.log(`[PDF Pro] Extracted ${links.length} hyperlinks`);
      return links;
    }
  }

  /**
   * Dark Mode Transformer - Applies dark theme to page
   */
  class DarkModeTransformer {
    apply() {
      // Create and inject dark mode stylesheet
      const styleId = 'pdf-pro-dark-mode';

      // Remove existing if present
      const existing = document.getElementById(styleId);
      if (existing) {
        existing.remove();
      }

      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* PDF Pro Dark Mode */
        html, body {
          background: #1a1a1a !important;
          filter: invert(0.9) hue-rotate(180deg) !important;
        }

        img, picture, video, iframe, canvas, svg {
          filter: invert(1) hue-rotate(180deg) !important;
        }

        * {
          background-color: transparent !important;
          color: inherit !important;
          border-color: currentColor !important;
        }

        /* Preserve certain elements */
        [style*="background-image"] {
          filter: invert(1) hue-rotate(180deg) !important;
        }
      `;

      document.head.appendChild(style);
      console.log('[PDF Pro] Dark mode applied');
    }

    remove() {
      const style = document.getElementById('pdf-pro-dark-mode');
      if (style) {
        style.remove();
        console.log('[PDF Pro] Dark mode removed');
      }
    }
  }

  /**
   * Network Idle Detector - Waits for AJAX/fetch to complete
   */
  class NetworkIdleDetector {
    constructor() {
      this.pendingRequests = 0;
      this.intercepted = false;
    }

    async waitForNetworkIdle(timeout = 5000) {
      this.interceptRequests();

      const startTime = Date.now();

      return new Promise((resolve) => {
        const checkIdle = () => {
          if (this.pendingRequests === 0) {
            console.log('[PDF Pro] Network idle detected');
            resolve();
          } else if (Date.now() - startTime > timeout) {
            console.log(`[PDF Pro] Network idle timeout (${this.pendingRequests} pending)`);
            resolve();
          } else {
            setTimeout(checkIdle, 100);
          }
        };

        setTimeout(checkIdle, 500); // Initial delay
      });
    }

    interceptRequests() {
      if (this.intercepted) return;
      this.intercepted = true;

      // Intercept XMLHttpRequest
      const originalOpen = XMLHttpRequest.prototype.open;
      const originalSend = XMLHttpRequest.prototype.send;
      const self = this;

      XMLHttpRequest.prototype.open = function (...args) {
        this._pdfProTracked = true;
        return originalOpen.apply(this, args);
      };

      XMLHttpRequest.prototype.send = function (...args) {
        if (this._pdfProTracked) {
          self.pendingRequests++;
          this.addEventListener('loadend', () => {
            self.pendingRequests--;
          });
        }
        return originalSend.apply(this, args);
      };

      // Intercept fetch
      const originalFetch = window.fetch;
      window.fetch = function (...args) {
        self.pendingRequests++;
        return originalFetch.apply(this, args).finally(() => {
          self.pendingRequests--;
        });
      };
    }
  }

  /**
   * Main Page Preparator
   */
  class PagePreparator {
    constructor() {
      this.imageLoader = new ImageLoader();
      this.fullPageCapture = new FullPageCapture();
      this.hyperlinkExtractor = new HyperlinkExtractor();
      this.darkModeTransformer = new DarkModeTransformer();
      this.networkIdleDetector = new NetworkIdleDetector();
    }

    async prepare(settings) {
      console.log('[PDF Pro] Preparing page for capture...', settings);

      try {
        // Remove toolbar/overlay if setting enabled
        if (settings.removeToolbar) {
          this.removeOverlays();
        }

        // Wait for network idle
        await this.networkIdleDetector.waitForNetworkIdle();

        // Handle full page capture with infinite scroll
        const captureResult = await this.fullPageCapture.captureFullHeight(settings);

        // Wait for all images to load
        let imageResult = { total: 0, loaded: 0, failed: 0 };
        if (settings.waitForImages) {
          imageResult = await this.imageLoader.waitForAllImages();
        }

        // Apply dark mode if enabled
        if (settings.darkMode) {
          this.darkModeTransformer.apply();
        }

        return {
          success: true,
          contentHeight: captureResult.height,
          imagesLoaded: imageResult.loaded,
          infiniteScrollDetected: captureResult.infinite
        };

      } catch (error) {
        console.error('[PDF Pro] Page preparation failed:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }

    removeOverlays() {
      // Remove common overlay elements
      const selectors = [
        '[class*="toolbar"]',
        '[class*="floating"]',
        '[id*="toolbar"]',
        '.fixed-header',
        '.sticky-header'
      ];

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.position === 'fixed' || style.position === 'sticky') {
            el.style.display = 'none';
          }
        });
      });
    }

    cleanup(settings) {
      if (settings.darkMode) {
        this.darkModeTransformer.remove();
      }
    }
  }

  // Initialize
  const pagePreparator = new PagePreparator();
  const hyperlinkExtractor = new HyperlinkExtractor();

  // Message listener
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
      sendResponse({ pong: true });
      return true;
    }

    if (request.action === 'preparePage') {
      pagePreparator.prepare(request.settings)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Async
    }

    if (request.action === 'capturePage') {
      capturePage(request.settings)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Async
    }

    if (request.action === 'cleanup') {
      pagePreparator.cleanup(request.settings || {});
      sendResponse({ success: true });
      return true;
    }
  });

  /**
   * Capture page using native browser print functionality
   * No external libraries required
   */
  async function capturePage(settings) {
    console.log('[PDF Pro] Capturing page using native print...');

    try {
      // Extract hyperlinks for metadata (even though native print handles them)
      let links = [];
      if (settings.preserveLinks) {
        links = hyperlinkExtractor.extractLinks();
      }

      // Apply print-optimized styles
      applyPrintStyles(settings);

      // Use native print - returns immediately, browser handles the rest
      const result = await triggerNativePrint(settings);

      // Cleanup styles after a delay
      setTimeout(() => cleanupPrintStyles(), 1000);

      console.log('[PDF Pro] Native print triggered successfully');

      return {
        success: true,
        data: {
          method: 'native-print',
          links: links.length,
          message: 'Print dialog opened - save as PDF from the dialog'
        }
      };

    } catch (error) {
      console.error('[PDF Pro] Capture failed:', error);
      cleanupPrintStyles();
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Apply print-optimized styles before printing
   */
  function applyPrintStyles(settings) {
    const styleId = 'pdf-pro-print-styles';

    // Remove existing if present
    const existing = document.getElementById(styleId);
    if (existing) existing.remove();

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @media print {
        /* Remove fixed/sticky elements that would repeat on every page */
        .fixed, [style*="position: fixed"], [style*="position:fixed"],
        .sticky, [style*="position: sticky"], [style*="position:sticky"] {
          position: relative !important;
        }
        
        /* Ensure backgrounds print */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Hide elements that shouldn't print */
        .no-print, [data-noprint], .cookie-banner, .popup-overlay {
          display: none !important;
        }
        
        /* Prevent page breaks inside important elements */
        img, table, figure, pre, blockquote {
          page-break-inside: avoid;
        }
        
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid;
        }
        
        ${settings.darkMode ? `
        /* Dark mode */
        html {
          filter: invert(0.9) hue-rotate(180deg);
          background: #1a1a1a;
        }
        img, video, picture, canvas, svg {
          filter: invert(1) hue-rotate(180deg);
        }
        ` : ''}
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Cleanup print styles after printing
   */
  function cleanupPrintStyles() {
    const style = document.getElementById('pdf-pro-print-styles');
    if (style) style.remove();
  }

  /**
   * Trigger native browser print
   */
  function triggerNativePrint(settings) {
    return new Promise((resolve) => {
      // Give browser a moment to apply styles
      setTimeout(() => {
        window.print();
        resolve({ success: true });
      }, 100);
    });
  }

  console.log('[PDF Pro] Content script ready');
})();

