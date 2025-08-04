/**
 * Service Worker Chính - Main Background Service
 * Điều khiển trung tâm cho extension với Manifest V3
 */

import { xuLyTinNhan } from './xu-ly-tin-nhan';

console.log('🚀 Service worker script loading...');

// Global initialization flag
let isInitialized = false;

// Initialize function
async function initializeServiceWorker() {
  if (isInitialized) {
    console.log('⚠️ Service worker already initialized, skipping...');
    return;
  }

  try {
    console.log('🔄 Initializing service worker...');
    
    // Initialize storage first
    await xuLyTinNhan.khoiTaoStorage();
    console.log('✅ Storage initialized');

    isInitialized = true;
    console.log('✅ Service worker initialization complete');
  } catch (error) {
    console.error('❌ Service worker initialization failed:', error);
    throw error;
  }
}

// Setup message listener immediately (synchronous)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Message received:', request.action, request);
  
  // Handle async messages properly
  (async () => {
    try {
      // Ensure initialization before processing messages
      if (!isInitialized) {
        console.log('⏳ Service worker not initialized, initializing now...');
        await initializeServiceWorker();
      }

      const response = await xuLyTinNhan.xuLyMessage(request, sender, () => {});
      console.log('✅ Message response:', response);
      sendResponse(response);
    } catch (error) {
      console.error('❌ Message handling error:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })();
  
  // Return true to indicate async response
  return true;
});

// Setup extension lifecycle events
chrome.runtime.onInstalled.addListener((details) => {
  console.log('📦 Extension installed/updated:', details.reason);
  // Initialize on install
  initializeServiceWorker().catch(console.error);
});

chrome.runtime.onStartup.addListener(() => {
  console.log('🔄 Extension startup');
  // Initialize on startup
  initializeServiceWorker().catch(console.error);
});

// Initialize immediately when script loads
initializeServiceWorker().catch(error => {
  console.error('❌ Failed to initialize service worker on load:', error);
});

console.log('✅ Service worker script loaded successfully');
