/**
 * Service Worker Chính - Main Background Service
 * Điều khiển trung tâm cho extension với Manifest V3
 */

import { xuLyTinNhan } from './xu-ly-tin-nhan';

console.log('🚀 Service worker script loading...');

// Initialize message listener immediately
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

// Setup extension lifecycle events
chrome.runtime.onInstalled.addListener((details) => {
  console.log('📦 Extension installed/updated:', details.reason);
});

chrome.runtime.onStartup.addListener(() => {
  console.log('🔄 Extension startup');
});

console.log('✅ Service worker initialized successfully');
