// 🧪 Step 06 Demo & Testing Script
// Run this in Browser DevTools Console to test Step 06 functionality

console.log('🚀 Starting Step 06: Rich Content Processing & Notion Integration Demo');

// Test 1: Check Extension Availability
function testExtensionAvailable() {
  console.log('\n📱 Test 1: Extension Availability');
  
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log('✅ Chrome extension API available');
    console.log('Extension ID:', chrome.runtime.id);
    return true;
  } else {
    console.log('❌ Chrome extension API not available');
    return false;
  }
}

// Test 2: Content Analysis Demo
function testContentAnalysis() {
  console.log('\n🔍 Test 2: Content Analysis Demo');
  
  // Simulate rich content analysis
  const pageContent = {
    headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
    paragraphs: document.querySelectorAll('p').length,
    codeBlocks: document.querySelectorAll('pre, code, .code-block').length,
    quotes: document.querySelectorAll('blockquote, .quote').length,
    lists: document.querySelectorAll('ul, ol').length,
    images: document.querySelectorAll('img').length,
    links: document.querySelectorAll('a').length
  };
  
  console.log('📊 Content Analysis Results:');
  console.table(pageContent);
  
  // Calculate quality score (simple algorithm)
  const qualityScore = Math.min(10, 
    (pageContent.headings * 1.5) +
    (pageContent.paragraphs * 0.3) +
    (pageContent.codeBlocks * 2) +
    (pageContent.quotes * 1.5) +
    (pageContent.lists * 1) +
    (pageContent.images * 0.5) +
    (pageContent.links * 0.2)
  );
  
  console.log(`🎯 Content Quality Score: ${qualityScore.toFixed(1)}/10`);
  
  return pageContent;
}

// Test 3: Rich Content Block Processing
function testRichContentProcessing() {
  console.log('\n🎨 Test 3: Rich Content Block Processing');
  
  const richBlocks = [];
  
  // Process headings
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading, index) => {
    richBlocks.push({
      id: `heading_${index}`,
      loai: 'heading',
      cap_do: parseInt(heading.tagName.charAt(1)),
      noi_dung: heading.textContent.trim(),
      vi_tri: index
    });
  });
  
  // Process code blocks
  document.querySelectorAll('.code-block').forEach((code, index) => {
    richBlocks.push({
      id: `code_${index}`,
      loai: 'code',
      ngon_ngu: 'javascript', // Detect from content
      noi_dung: code.textContent.trim(),
      vi_tri: richBlocks.length
    });
  });
  
  // Process quotes
  document.querySelectorAll('.quote').forEach((quote, index) => {
    richBlocks.push({
      id: `quote_${index}`,
      loai: 'quote',
      noi_dung: quote.textContent.trim(),
      vi_tri: richBlocks.length
    });
  });
  
  console.log(`📦 Processed ${richBlocks.length} rich content blocks:`);
  richBlocks.forEach(block => {
    console.log(`  ${block.loai}: ${block.noi_dung.substring(0, 50)}...`);
  });
  
  return richBlocks;
}

// Test 4: Notion Data Structure Preparation
function testNotionDataPreparation(richBlocks) {
  console.log('\n📝 Test 4: Notion Data Structure Preparation');
  
  const notionBlocks = richBlocks.map(block => {
    switch (block.loai) {
      case 'heading':
        return {
          object: 'block',
          type: `heading_${block.cap_do}`,
          [`heading_${block.cap_do}`]: {
            rich_text: [{
              type: 'text',
              text: { content: block.noi_dung }
            }]
          }
        };
        
      case 'code':
        return {
          object: 'block',
          type: 'code',
          code: {
            language: block.ngon_ngu || 'javascript',
            rich_text: [{
              type: 'text',
              text: { content: block.noi_dung }
            }]
          }
        };
        
      case 'quote':
        return {
          object: 'block',
          type: 'quote',
          quote: {
            rich_text: [{
              type: 'text',
              text: { content: block.noi_dung }
            }]
          }
        };
        
      default:
        return {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: { content: block.noi_dung }
            }]
          }
        };
    }
  });
  
  console.log(`🎯 Prepared ${notionBlocks.length} Notion blocks`);
  console.log('Sample Notion block structure:');
  console.log(JSON.stringify(notionBlocks[0], null, 2));
  
  return notionBlocks;
}

// Test 5: Extension Communication Test
function testExtensionCommunication() {
  console.log('\n💬 Test 5: Extension Communication');
  
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    // Test ping to background service
    chrome.runtime.sendMessage({
      action: 'PING',
      timestamp: Date.now()
    }, response => {
      if (chrome.runtime.lastError) {
        console.log('❌ Communication error:', chrome.runtime.lastError.message);
      } else {
        console.log('✅ Extension communication successful:', response);
      }
    });
    
    // Test Step 06 specific message
    chrome.runtime.sendMessage({
      action: 'TEST_STEP_06',
      data: { test: true }
    }, response => {
      if (chrome.runtime.lastError) {
        console.log('⚠️  Step 06 message not handled yet');
      } else {
        console.log('✅ Step 06 communication:', response);
      }
    });
  } else {
    console.log('❌ Cannot test communication - Extension API not available');
  }
}

// Test 6: Performance Measurement
function testPerformance() {
  console.log('\n⚡ Test 6: Performance Measurement');
  
  // Content analysis performance
  console.time('content-analysis');
  const content = testContentAnalysis();
  console.timeEnd('content-analysis');
  
  // Rich content processing performance
  console.time('rich-processing');
  const richBlocks = testRichContentProcessing();
  console.timeEnd('rich-processing');
  
  // Notion preparation performance
  console.time('notion-preparation');
  testNotionDataPreparation(richBlocks);
  console.timeEnd('notion-preparation');
  
  // Memory usage
  if (performance.memory) {
    console.log('💾 Memory Usage:');
    console.log(`  Used: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Total: ${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Limit: ${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
  }
}

// Main Demo Function
function runStep06Demo() {
  console.log('🎬 STARTING STEP 06 COMPREHENSIVE DEMO');
  console.log('=====================================');
  
  // Run all tests
  const extensionAvailable = testExtensionAvailable();
  const content = testContentAnalysis();
  const richBlocks = testRichContentProcessing();
  const notionBlocks = testNotionDataPreparation(richBlocks);
  
  if (extensionAvailable) {
    testExtensionCommunication();
  }
  
  testPerformance();
  
  // Summary
  console.log('\n🎉 STEP 06 DEMO COMPLETED');
  console.log('========================');
  console.log(`✅ Content Analysis: ${richBlocks.length} blocks processed`);
  console.log(`✅ Notion Preparation: ${notionBlocks.length} blocks ready`);
  console.log(`✅ Extension Communication: ${extensionAvailable ? 'Available' : 'Not Available'}`);
  
  return {
    content,
    richBlocks,
    notionBlocks,
    extensionAvailable
  };
}

// Auto-run demo after page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runStep06Demo);
} else {
  runStep06Demo();
}

// Export for manual testing
window.step06Demo = {
  runDemo: runStep06Demo,
  testContentAnalysis,
  testRichContentProcessing,
  testNotionDataPreparation,
  testExtensionCommunication,
  testPerformance
};

console.log('\n💡 Manual Testing Available:');
console.log('Run individual tests with: window.step06Demo.testContentAnalysis()');
console.log('Full demo: window.step06Demo.runDemo()');
