/**
 * Tab Management Service
 * Quản lý tabs và content extraction cho extension
 */

/**
 * Service quản lý tabs và content script injection
 */
export class QuanLyTab {
  constructor() {
    // No storage needed for basic tab operations
  }

  /**
   * Extract content from current tab
   */
  async trichXuatNoiDung(tabId: number) {
    try {
      console.log('🔄 Starting content extraction for tab:', tabId);
      
      // Get tab info
      const tab = await chrome.tabs.get(tabId);
      console.log('📄 Tab info:', { url: tab.url, title: tab.title });
      
      if (!tab.url || tab.url.startsWith('chrome://')) {
        throw new Error('Cannot extract content from this page');
      }

      // Inject content script if needed
      await this.injectContentScriptIfNeeded(tabId);

      console.log('🎯 Executing content extraction script...');
      
      // Extract content using scripting API
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: this.extractPageContent
      });

      console.log('📊 Script execution results:', results);

      if (!results || results.length === 0 || !results[0].result) {
        throw new Error('Failed to extract content');
      }

      const extractedData = results[0].result;
      console.log('✅ Content extracted successfully:', extractedData);
      
      return {
        title: extractedData.title || tab.title || 'Untitled',
        url: tab.url,
        content: extractedData.content || '',
        extractedAt: new Date().toISOString(),
        domain: new URL(tab.url).hostname
      };
    } catch (error) {
      console.error('❌ Content extraction failed:', error);
      throw error;
    }
  }

  /**
   * Function to inject into page for content extraction
   */
  private extractPageContent() {
    try {
      console.log('🎯 Starting content extraction in page context...');
      
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style, noscript');
      scripts.forEach(el => el.remove());

      // Get title
      const title = document.title || 
                   document.querySelector('h1')?.textContent ||
                   'Untitled';

      console.log('📝 Page title:', title);

      // Get main content
      let content = '';
      
      // Try to find main content areas
      const contentSelectors = [
        'main',
        'article',
        '[role="main"]',
        '.content',
        '.post-content',
        '.entry-content',
        '.article-content',
        '#content',
        '.main-content'
      ];

      let mainElement = null;
      for (const selector of contentSelectors) {
        mainElement = document.querySelector(selector);
        if (mainElement) {
          console.log('📍 Found main content with selector:', selector);
          break;
        }
      }

      // If no main content area found, use body
      if (!mainElement) {
        console.log('📍 Using document.body as fallback');
        mainElement = document.body;
      }

      // Extract text content
      if (mainElement) {
        // Remove unwanted elements
        const unwantedSelectors = [
          'nav', 'header', 'footer', 'aside',
          '.navigation', '.navbar', '.menu',
          '.sidebar', '.widget', '.ad',
          '.advertisement', '.comments',
          '.social-share', '.related-posts'
        ];

        unwantedSelectors.forEach(selector => {
          const elements = mainElement!.querySelectorAll(selector);
          elements.forEach(el => el.remove());
        });

        // Get clean text
        content = mainElement.textContent || (mainElement as HTMLElement).innerText || '';
        
        // Clean up whitespace
        content = content
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n')
          .trim();
          
        console.log('📄 Extracted content length:', content.length);
      }

      // Get meta description as fallback
      if (!content) {
        const metaDesc = document.querySelector('meta[name="description"]');
        content = metaDesc?.getAttribute('content') || 'No content could be extracted';
        console.log('📝 Using meta description as fallback');
      }

      const result = {
        title: title.trim(),
        content: content.substring(0, 5000), // Limit content length
        url: window.location.href,
        extractedAt: new Date().toISOString()
      };

      console.log('✅ Content extraction completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Content extraction error in page context:', error);
      // Return minimal data even if extraction fails
      return {
        title: document.title || 'Error',
        content: 'Content extraction failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        url: window.location.href,
        extractedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Inject content script if needed
   */
  private async injectContentScriptIfNeeded(tabId: number) {
    try {
      // Check if content script is already injected
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => window.hasOwnProperty('contentScriptInjected')
      });

      const isInjected = results[0]?.result;

      if (!isInjected) {
        // Mark as injected (we don't need external content script file)
        await chrome.scripting.executeScript({
          target: { tabId },
          func: () => { (window as any).contentScriptInjected = true; }
        });
      }
    } catch (error) {
      console.warn('Content script injection failed:', error);
      // Continue anyway - basic extraction might still work
    }
  }
}
