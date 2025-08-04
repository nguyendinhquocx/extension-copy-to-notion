/**
 * Service Worker Chính - Main Background Service
 * Điều khiển trung tâm cho extension với Manifest V3
 */

import { xuLyTinNhan } from './xu-ly-tin-nhan';

/**
 * Service Worker chính quản lý lifecycle và coordination
 */
class ServiceWorkerChinh {
  private da_khoi_tao = false;

  constructor() {
    this.khoiTao();
  }

  /**
   * Khởi tạo service worker
   */
  async khoiTao() {
    if (this.da_khoi_tao) return;

    try {
      console.log('🚀 Initializing service worker...');

      // Setup message listener
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        // Handle async messages properly
        (async () => {
          try {
            const response = await xuLyTinNhan.xuLyMessage(request, sender, () => {});
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
        this.xuLyOnInstalled(details);
      });

      chrome.runtime.onStartup.addListener(() => {
        console.log('🔄 Extension started');
      });

      // Setup tab events for content script injection
      chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
          // Tab loaded, ready for content script if needed
          console.log('✅ Tab loaded:', tab.url);
        }
      });

      this.da_khoi_tao = true;
      console.log('✅ Service worker initialized successfully');

    } catch (error) {
      console.error('❌ Service worker initialization failed:', error);
    }
  }

  /**
   * Handle extension installation/update
   */
  private async xuLyOnInstalled(details: chrome.runtime.InstalledDetails) {
    try {
      if (details.reason === 'install') {
        console.log('🎉 First time installation');
        // Could open welcome page or setup wizard
      } else if (details.reason === 'update') {
        console.log('🔄 Extension updated to version:', chrome.runtime.getManifest().version);
      }
    } catch (error) {
      console.error('❌ OnInstalled handler error:', error);
    }
  }
}

// Initialize service worker
new ServiceWorkerChinh();

// Export for testing
export { ServiceWorkerChinh };
