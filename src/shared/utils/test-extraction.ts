/**
 * Test Content Extraction
 * Standalone test file để debug content extraction
 */

// Run trong browser console để test extraction manually
function testContentExtractionManual() {
  console.log('🧪 Testing content extraction manually...');
  
  try {
    // Get basic page info
    const pageInfo = {
      url: window.location.href,
      title: document.title,
      readyState: document.readyState,
      hasBody: !!document.body,
      bodyText: document.body?.textContent?.length || 0
    };
    
    console.log('📄 Page info:', pageInfo);
    
    // Test content selectors
    const selectors = [
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
    
    console.log('🔍 Testing content selectors:');
    const selectorResults: Record<string, any> = {};
    
    selectors.forEach(selector => {
      const element = document.querySelector(selector);
      const textLength = element?.textContent?.trim().length || 0;
      selectorResults[selector] = {
        found: !!element,
        textLength: textLength,
        preview: textLength > 0 && element?.textContent ? element.textContent.substring(0, 100) + '...' : null
      };
      console.log(`  ${selector}: ${textLength} chars`);
    });
    
    // Test body content
    const bodyContent = document.body?.textContent || '';
    console.log('📄 Body content length:', bodyContent.length);
    console.log('📄 Body preview:', bodyContent.substring(0, 200));
    
    // Test meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    const metaContent = metaDesc?.getAttribute('content') || '';
    console.log('📝 Meta description:', metaContent);
    
    return {
      pageInfo,
      selectorResults,
      bodyContentLength: bodyContent.length,
      metaDescription: metaContent,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
}

// Export cho extension
if (typeof window !== 'undefined') {
  (window as any).testContentExtractionManual = testContentExtractionManual;
}

export { testContentExtractionManual };
