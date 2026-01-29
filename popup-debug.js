/**
 * DEBUG VERSION - Popup Controller with Enhanced Logging
 */

console.log('[PDF Pro DEBUG] Popup script loaded');

// Test if chrome.tabs API is available
console.log('[PDF Pro DEBUG] chrome.tabs available:', typeof chrome !== 'undefined' && chrome.tabs !== undefined);

// Add immediate diagnostic on load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[PDF Pro DEBUG] DOM loaded');

  // Test tab query immediately
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('[PDF Pro DEBUG] Tab query result:', tabs);
    console.log('[PDF Pro DEBUG] Number of tabs found:', tabs.length);
    if (tabs.length > 0) {
      console.log('[PDF Pro DEBUG] Current tab URL:', tabs[0].url);
      console.log('[PDF Pro DEBUG] Current tab ID:', tabs[0].id);
      console.log('[PDF Pro DEBUG] Current tab title:', tabs[0].title);
    } else {
      console.error('[PDF Pro DEBUG] No tabs found!');
    }
  } catch (error) {
    console.error('[PDF Pro DEBUG] Tab query failed:', error);
  }

  // Test chrome.runtime
  console.log('[PDF Pro DEBUG] Extension ID:', chrome.runtime.id);

  // Add click handler to show detailed error
  const convertBtn = document.getElementById('convertBtn');
  if (convertBtn) {
    convertBtn.addEventListener('click', async () => {
      console.log('[PDF Pro DEBUG] Convert button clicked');

      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('[PDF Pro DEBUG] Tabs at click time:', tabs);

        if (!tabs || tabs.length === 0) {
          alert('DEBUG: No tabs found. Check console for details.');
        } else {
          console.log('[PDF Pro DEBUG] Tab found:', tabs[0]);
          alert(`DEBUG: Tab found!\nURL: ${tabs[0].url}\nTitle: ${tabs[0].title}`);
        }
      } catch (error) {
        console.error('[PDF Pro DEBUG] Error:', error);
        alert(`DEBUG Error: ${error.message}`);
      }
    });
  }
});
