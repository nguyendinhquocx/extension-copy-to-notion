/**
 * Tab Management Service
 * Quản lý tabs và content extraction cho extension
 */

import { SimpleContentExtractor } from '../shared/utils/simple-extractor';

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
      
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        throw new Error('Cannot extract content from this page');
      }

      // Ensure content script is loaded
      await this.injectContentScriptIfNeeded(tabId);

      console.log('🎯 Executing content extraction script...');
      
      // Extract content using scripting API with better error handling
      let results;
      try {
        // Use a more robust approach with timeout
        results = await Promise.race([
          chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
              // Inline function để avoid method reference issues
              try {
                console.log('🎯 Starting content extraction in page context...');
                console.log('🌐 Current URL:', window.location.href);
                console.log('📄 Document readyState:', document.readyState);
                
                // Get title
                const title = document.title || 
                             document.querySelector('h1')?.textContent ||
                             'Untitled';

                console.log('📝 Page title:', title);

                // Get main content
                let content = '';
                let contentSource = 'unknown';
                
                // Strategy 1: Try semantic content selectors
                const contentSelectors = [
                  'main',
                  'article', 
                  '[role="main"]',
                  '.content',
                  '.post-content',
                  '.entry-content',
                  '.article-content',
                  '#content',
                  '.main-content',
                  '.page-content'
                ];

                let mainElement = null;
                for (const selector of contentSelectors) {
                  const element = document.querySelector(selector);
                  if (element && element.textContent && element.textContent.trim().length > 100) {
                    mainElement = element;
                    contentSource = selector;
                    console.log('📍 Found main content with selector:', selector);
                    break;
                  }
                }

                // Strategy 2: If no good semantic content, try body but filter out noise
                if (!mainElement || !mainElement.textContent || mainElement.textContent.trim().length < 50) {
                  console.log('📍 Using document.body with filtering');
                  mainElement = document.body;
                  contentSource = 'body-filtered';
                }

                // Extract text content with better formatting preserved
                if (mainElement) {
                  // Create a clone to avoid modifying original DOM
                  const clonedElement = mainElement.cloneNode(true) as Element;
                  
                  // Remove unwanted elements from clone
                  const unwantedSelectors = [
                    'script', 'style', 'noscript',
                    'nav', 'header', 'footer', 'aside',
                    '.navigation', '.navbar', '.menu',
                    '.sidebar', '.widget', '.ad', '.ads',
                    '.advertisement', '.comments', '.comment',
                    '.social-share', '.related-posts',
                    '.cookie-notice', '.newsletter'
                  ];

                  unwantedSelectors.forEach(selector => {
                    const elements = clonedElement.querySelectorAll(selector);
                    elements.forEach(el => el.remove());
                  });

                  // Function to extract formatted content preserving structure
                  const extractStructuredText = (element: Element): string => {
                    let result = '';
                    
                    // Process all child nodes
                    for (const node of Array.from(element.childNodes)) {
                      if (node.nodeType === Node.TEXT_NODE) {
                        // Text node - add content directly
                        result += node.textContent || '';
                      } 
                      else if (node.nodeType === Node.ELEMENT_NODE) {
                        const el = node as Element;
                        const tagName = el.tagName.toLowerCase();
                        
                        // Handle block elements with proper spacing
                        if (tagName === 'div' || tagName === 'p' || tagName === 'section' || 
                            tagName === 'article' || tagName === 'blockquote') {
                          result += '\n' + extractStructuredText(el) + '\n';
                        }
                        // Headers
                        else if (tagName.match(/^h[1-6]$/)) {
                          result += '\n\n' + extractStructuredText(el) + '\n\n';
                        }
                        // Lists
                        else if (tagName === 'li') {
                          result += '\n• ' + extractStructuredText(el);
                        }
                        else if (tagName === 'br') {
                          result += '\n';
                        }
                        // All other elements
                        else {
                          result += extractStructuredText(el);
                        }
                      }
                    }
                    return result;
                  };
                  
                  // Get structured text
                  content = extractStructuredText(clonedElement);
                  
                  // Preserve basic formatting but clean up excessive whitespace
                  content = content
                    .replace(/\s*\n\s*/g, '\n')   // Clean up whitespace around newlines
                    .replace(/\n{3,}/g, '\n\n')   // Max double newlines
                    .replace(/\t/g, '  ')         // Convert tabs to spaces
                    .replace(/^\s+|\s+$/g, '')    // Trim start and end
                    .trim();
                    
                  console.log('📄 Extracted content length:', content.length, 'from:', contentSource);
                }

                // Strategy 3: Fallback to meta description or basic page info
                if (!content || content.length < 20) {
                  console.log('📝 Content too short, trying fallbacks...');
                  
                  // Try meta description
                  const metaDesc = document.querySelector('meta[name="description"]');
                  const metaContent = metaDesc?.getAttribute('content') || '';
                  
                  // Try first paragraph
                  const firstParagraph = document.querySelector('p')?.textContent || '';
                  
                  // Try any text content
                  const bodyText = document.body?.textContent || '';
                  
                  // Choose best fallback
                  if (metaContent && metaContent.length > 20) {
                    content = metaContent;
                    contentSource = 'meta-description';
                  } else if (firstParagraph && firstParagraph.length > 20) {
                    content = firstParagraph.substring(0, 500);
                    contentSource = 'first-paragraph';
                  } else if (bodyText && bodyText.length > 20) {
                    content = bodyText.substring(0, 1000).trim();
                    contentSource = 'body-text';
                  } else {
                    content = 'Content could not be extracted from this page';
                    contentSource = 'error-fallback';
                  }
                  
                  console.log('📝 Using fallback content source:', contentSource);
                }

                // Ensure content is not too long
                if (content.length > 5000) {
                  content = content.substring(0, 5000) + '...';
                }

                const result = {
                  title: title.trim(),
                  content: content.trim(),
                  url: window.location.href,
                  extractedAt: new Date().toISOString(),
                  contentSource: contentSource,
                  pageInfo: {
                    readyState: document.readyState,
                    contentLength: content.length,
                    hasTitle: !!document.title,
                    hasBody: !!document.body
                  }
                };

                console.log('✅ Content extraction completed:', {
                  title: result.title,
                  contentLength: result.content.length,
                  contentSource: result.contentSource,
                  url: result.url
                });
                
                // Validate result before returning
                if (!result.title && !result.content) {
                  console.error('❌ Both title and content are empty!');
                  return {
                    title: 'Extraction Failed',
                    content: 'Could not extract any content from this page',
                    url: window.location.href,
                    extractedAt: new Date().toISOString(),
                    contentSource: 'error',
                    pageInfo: { error: 'No content found' }
                  };
                }
                
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
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Script execution timeout')), 10000)
          )
        ]) as chrome.scripting.InjectionResult<any>[];
      } catch (scriptError) {
        console.error('Script execution failed:', scriptError);
        throw new Error(`Script injection failed: ${scriptError instanceof Error ? scriptError.message : 'Unknown error'}`);
      }

      console.log('📊 Script execution results:', results);
      console.log('📊 Results type:', typeof results);
      console.log('📊 Results length:', results?.length);

      if (!results || results.length === 0) {
        throw new Error('No results from content extraction script');
      }

      const firstResult = results[0];
      console.log('📊 First result:', firstResult);
      console.log('📊 First result type:', typeof firstResult);
      console.log('📊 Has result property:', 'result' in firstResult);

      const result = firstResult.result;
      console.log('📊 Extracted result:', result);
      console.log('📊 Result type:', typeof result);

      if (!result) {
        throw new Error('Content extraction script returned null/undefined result');
      }

      // Additional validation
      if (typeof result !== 'object') {
        throw new Error(`Content extraction script returned invalid result type: ${typeof result}`);
      }

      if (!result.title && !result.content) {
        throw new Error('Content extraction script returned empty title and content');
      }

      console.log('✅ Content extracted successfully:', {
        title: result.title,
        contentLength: result.content?.length || 0,
        contentSource: result.contentSource || 'unknown'
      });
      
      return {
        title: result.title || tab.title || 'Untitled',
        url: tab.url,
        content: result.content || '',
        extractedAt: new Date().toISOString(),
        domain: new URL(tab.url).hostname
      };
    } catch (error) {
      console.error('❌ Content extraction failed:', error);
      
      // Try simple fallback extraction
      console.log('🔄 Trying fallback extraction...');
      try {
        const fallbackResult = await SimpleContentExtractor.extractWithFallback(tabId);
        console.log('✅ Fallback extraction succeeded:', fallbackResult);
        
        const tab = await chrome.tabs.get(tabId);
        return {
          title: fallbackResult.title || tab.title || 'Untitled',
          url: tab.url || '',
          content: fallbackResult.content || '',
          extractedAt: new Date().toISOString(),
          domain: tab.url ? new URL(tab.url).hostname : 'unknown',
          extractionMethod: fallbackResult.method || 'fallback'
        };
      } catch (fallbackError) {
        console.error('❌ Fallback extraction also failed:', fallbackError);
        // Return a more descriptive error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during content extraction';
        throw new Error(`Content extraction failed: ${errorMessage}`);
      }
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
