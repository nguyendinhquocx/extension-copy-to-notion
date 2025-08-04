/**
 * Simple Content Extractor for Testing
 * Minimal extraction function để debug issue
 */

export class SimpleContentExtractor {
  
  static async testExtraction(tabId: number) {
    try {
      console.log('🧪 Simple extraction test starting...');
      
      // Test 1: Basic script injection
      const basicTest = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          return {
            success: true,
            url: window.location.href,
            title: document.title,
            hasBody: !!document.body,
            bodyLength: document.body?.textContent?.length || 0
          };
        }
      });
      
      console.log('🧪 Basic test result:', basicTest);
      
      // Test 2: Simple content extraction
      const contentTest = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          try {
            const title = document.title || 'No title';
            const content = document.body?.textContent?.substring(0, 1000) || 'No content';
            
            return {
              title,
              content,
              contentLength: content.length,
              extracted: true
            };
          } catch (error) {
            return {
              error: error instanceof Error ? error.message : 'Unknown error',
              extracted: false
            };
          }
        }
      });
      
      console.log('🧪 Content test result:', contentTest);
      
      return {
        basicTest: basicTest[0]?.result,
        contentTest: contentTest[0]?.result
      };
      
    } catch (error) {
      console.error('🧪 Simple extraction test failed:', error);
      throw error;
    }
  }
  
  static async extractWithFallback(tabId: number) {
    try {
      console.log('🔄 Extraction with fallback starting...');
      
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          // Simple, reliable extraction
          const result = {
            title: document.title || 'Untitled',
            content: '',
            url: window.location.href,
            extractedAt: new Date().toISOString(),
            method: 'unknown'
          };
          
          // Try different extraction methods
          
          // Method 1: Main/Article
          const main = document.querySelector('main') || document.querySelector('article');
          if (main && main.textContent && main.textContent.length > 100) {
            result.content = main.textContent.substring(0, 2000);
            result.method = 'main-article';
            return result;
          }
          
          // Method 2: Body with basic filtering
          if (document.body && document.body.textContent) {
            let content = document.body.textContent;
            // Basic cleanup
            content = content.replace(/\s+/g, ' ').trim();
            result.content = content.substring(0, 2000);
            result.method = 'body-filtered';
            return result;
          }
          
          // Method 3: Meta description fallback
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            result.content = metaDesc.getAttribute('content') || 'No content found';
            result.method = 'meta-description';
            return result;
          }
          
          // Method 4: Last resort
          result.content = 'Could not extract content';
          result.method = 'fallback';
          return result;
        }
      });
      
      console.log('🔄 Fallback extraction results:', results);
      
      if (!results || results.length === 0 || !results[0].result) {
        throw new Error('Fallback extraction failed');
      }
      
      return results[0].result;
      
    } catch (error) {
      console.error('🔄 Fallback extraction failed:', error);
      throw error;
    }
  }
}
