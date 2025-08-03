// Background Service Worker - Entry Point
// Đây là placeholder cho Step 04: Background Service Worker & Notion API Integration

console.log('[Copy To Notion] Background service worker đang khởi tạo...');

// Đăng ký basic extension lifecycle events
chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
  console.log('[Copy To Notion] Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // Khởi tạo lần đầu
    console.log('[Copy To Notion] Chào mừng đến với Copy To Notion!');
  }
});

// Export để sẵn sàng cho Step 04 implementation
export {};
