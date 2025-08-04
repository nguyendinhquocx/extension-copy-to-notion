/**
 * Service Worker Chính - Main Background Service
 * Điều khiển trung tâm cho extension với Manifest V3
 */

import { xuLyTinNhan } from './xu-ly-tin-nhan';

console.log('🚀 Service worker script loading...');

// Initialize storage and message listener immediately
(async () => {
  try {
    // Initialize storage first
    await xuLyTinNhan.khoiTaoStorage();
    console.log('✅ Storage initialized');

    // Setup message listener
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('📨 Message received:', request.action, request);
      
      // Handle async messages properly
      (async () => {
        try {
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

    console.log('✅ Message listener initialized');
  } catch (error) {
    console.error('❌ Service worker initialization failed:', error);
  }
})();

// Setup extension lifecycle events
chrome.runtime.onInstalled.addListener((details) => {
  console.log('📦 Extension installed/updated:', details.reason);
});

chrome.runtime.onStartup.addListener(() => {
  console.log('🔄 Extension startup');
});

console.log('✅ Service worker initialized successfully');
