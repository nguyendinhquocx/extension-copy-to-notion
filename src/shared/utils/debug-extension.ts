/**
 * Extension Debug Helper
 * Giúp debug extension và kiểm tra tình trạng hoạt động
 */

// Debug function cho extension
function debugExtension() {
  console.log('🔍 Extension Debug Information:');
  console.log('Extension ID:', chrome.runtime.id);
  console.log('Manifest:', chrome.runtime.getManifest());
  
  // Test message passing
  chrome.runtime.sendMessage(
    { action: 'PING' },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Message failed:', chrome.runtime.lastError);
      } else {
        console.log('✅ Background script response:', response);
      }
    }
  );

  // Test content script injection
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id! },
        func: () => {
          console.log('✅ Content script injection test successful');
          return { 
            url: window.location.href,
            title: document.title,
            contentType: document.contentType 
          };
        }
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Content script injection failed:', chrome.runtime.lastError);
        } else {
          console.log('✅ Content script test results:', results);
        }
      });
    }
  });
}

// Export for use in popup or background
if (typeof window !== 'undefined') {
  (window as any).debugExtension = debugExtension;
}

export { debugExtension };
