/**
 * Debug Extension Commands
 * Các command debug để test extension functionality
 */

// Paste vào popup console để debug
export const debugCommands = {
  
  // Test basic message passing
  async testMessagePassing() {
    console.log('🧪 Testing message passing...');
    
    try {
      const response = await chrome.runtime.sendMessage({ action: 'PING' });
      console.log('✅ PING response:', response);
      return response;
    } catch (error) {
      console.error('❌ Message passing failed:', error);
      throw error;
    }
  },
  
  // Test content extraction
  async testContentExtraction() {
    console.log('🧪 Testing content extraction...');
    
    try {
      // Get current tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]) {
        throw new Error('No active tab found');
      }
      
      const tabId = tabs[0].id!;
      console.log('📄 Testing on tab:', tabId, tabs[0].url);
      
      // Test extraction
      const response = await chrome.runtime.sendMessage({
        action: 'TRICH_XUAT_DU_LIEU',
        tabId: tabId
      });
      
      console.log('✅ Extraction response:', response);
      return response;
    } catch (error) {
      console.error('❌ Content extraction test failed:', error);
      throw error;
    }
  },
  
  // Test simple script injection
  async testScriptInjection() {
    console.log('🧪 Testing script injection...');
    
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]) {
        throw new Error('No active tab found');
      }
      
      const result = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id! },
        func: () => {
          return {
            url: window.location.href,
            title: document.title,
            bodyTextLength: document.body?.textContent?.length || 0,
            timestamp: new Date().toISOString()
          };
        }
      });
      
      console.log('✅ Script injection result:', result);
      return result[0]?.result;
    } catch (error) {
      console.error('❌ Script injection test failed:', error);
      throw error;
    }
  },
  
  // Test extension info
  async testExtensionInfo() {
    console.log('🧪 Testing extension info...');
    
    try {
      const response = await chrome.runtime.sendMessage({ action: 'GET_EXTENSION_INFO' });
      console.log('✅ Extension info:', response);
      return response;
    } catch (error) {
      console.error('❌ Extension info test failed:', error);
      throw error;
    }
  },
  
  // Run all tests
  async runAllTests() {
    console.log('🧪 Running all debug tests...');
    
    const results: Record<string, any> = {};
    
    try {
      results.messagePassing = await this.testMessagePassing();
    } catch (error) {
      results.messagePassing = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    try {
      results.scriptInjection = await this.testScriptInjection();
    } catch (error) {
      results.scriptInjection = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    try {
      results.extensionInfo = await this.testExtensionInfo();
    } catch (error) {
      results.extensionInfo = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    try {
      results.contentExtraction = await this.testContentExtraction();
    } catch (error) {
      results.contentExtraction = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    console.log('🧪 All test results:', results);
    return results;
  }
};

// Make available globally in popup console
if (typeof window !== 'undefined') {
  (window as any).debugExtension = debugCommands;
}
