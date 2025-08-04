/**
 * Advanced Web Clipper Function
 * Trích xuất toàn bộ nội dung trang web (bao gồm văn bản, hình ảnh, videos)
 * tương tự như Notion Web Clipper
 */

/**
 * Type định nghĩa cấu trúc nội dung trích xuất nâng cao
 */
interface EnhancedContent {
  title: string;
  url: string;
  content: string;
  html?: string;  // HTML content if available
  images?: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  videos?: Array<{
    url: string;
    type: string;
    thumbnail?: string;
  }>;
}

/**
 * Nâng cao: Gọi API tới content script để trích xuất DOM đầy đủ
 */
const extractFullPageContent = async (tabId: number): Promise<EnhancedContent> => {
  // Send message to inject script that extracts full DOM
  try {
    console.log('🔍 Extracting full page content with images and videos...');
    
    // Execute a script in the tab context that extracts everything
    const result = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // Inline function để extract full DOM
        const extractFullDom = () => {
          try {
            console.log('📋 Starting full DOM extraction with media...');
            
            // Get title
            const title = document.title || 
                          document.querySelector('h1')?.textContent ||
                          'Untitled Page';
                          
            // Find main content container
            const findMainContent = (): Element => {
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
              
              for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent && element.textContent.trim().length > 100) {
                  return element;
                }
              }
              return document.body;
            };
            
            const mainContent = findMainContent();
            
            // Extract images - get all images in main content or top level visible images
            const images = [];
            const imageElements = mainContent.querySelectorAll('img');
            
            for (const img of Array.from(imageElements)) {
              // Check if image is visible and has decent size
              const rect = img.getBoundingClientRect();
              const isVisible = rect.width > 50 && rect.height > 50 && 
                               window.getComputedStyle(img).display !== 'none';
              
              if (isVisible) {
                let imgUrl = img.src;
                
                // Fix relative URLs
                if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('data:')) {
                  if (imgUrl.startsWith('/')) {
                    const origin = window.location.origin;
                    imgUrl = origin + imgUrl;
                  } else {
                    const base = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
                    imgUrl = base + imgUrl;
                  }
                }
                
                images.push({
                  url: imgUrl,
                  alt: img.alt || '',
                  width: img.naturalWidth || rect.width,
                  height: img.naturalHeight || rect.height
                });
              }
            }
            
            // Extract videos - look for video elements and iframes (youtube, etc.)
            const videos = [];
            
            // HTML5 video elements
            const videoElements = mainContent.querySelectorAll('video');
            for (const video of Array.from(videoElements)) {
              const src = video.src || video.querySelector('source')?.src;
              if (src) {
                videos.push({
                  url: src,
                  type: 'video/mp4',
                  thumbnail: video.poster || ''
                });
              }
            }
            
            // YouTube and other embedded videos
            const iframes = mainContent.querySelectorAll('iframe');
            for (const iframe of Array.from(iframes)) {
              const src = iframe.src;
              if (src && (
                  src.includes('youtube.com') || 
                  src.includes('vimeo.com') || 
                  src.includes('dailymotion.com')
                )) {
                videos.push({
                  url: src,
                  type: 'iframe',
                  thumbnail: ''
                });
              }
            }
            
            // Create a clone of content to extract text and links properly
            const clonedContent = mainContent.cloneNode(true) as Element;
            
            // Remove unwanted elements from clone
            const unwantedSelectors = [
              'script', 'style', 'noscript', 'iframe',
              'nav:not(.content-nav)', 'header:not(.content-header)', 
              'footer:not(.content-footer)', 'aside',
              '.navigation', '.navbar', '.menu',
              '.sidebar', '.widget', '.ad', '.ads',
              '.advertisement', '.comments', '.cookie-notice'
            ];

            unwantedSelectors.forEach(selector => {
              const elements = clonedContent.querySelectorAll(selector);
              elements.forEach(el => el.remove());
            });
            
            // Convert the DOM to structured HTML with text formatting preserved
            const processNode = (node: Node): string => {
              if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent || '';
              }
              
              if (node.nodeType !== Node.ELEMENT_NODE) {
                return '';
              }
              
              const element = node as Element;
              const tag = element.tagName.toLowerCase();
              
              // Skip invisible elements
              const computedStyle = window.getComputedStyle(element);
              if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                return '';
              }
              
              // Process based on tag
              switch(tag) {
                case 'br':
                  return '\n';
                case 'p':
                  return '\n\n' + Array.from(element.childNodes).map(processNode).join('') + '\n\n';
                case 'h1':
                  return '\n\n# ' + Array.from(element.childNodes).map(processNode).join('') + '\n\n';
                case 'h2':
                  return '\n\n## ' + Array.from(element.childNodes).map(processNode).join('') + '\n\n';
                case 'h3':
                  return '\n\n### ' + Array.from(element.childNodes).map(processNode).join('') + '\n\n';
                case 'h4':
                  return '\n\n#### ' + Array.from(element.childNodes).map(processNode).join('') + '\n\n';
                case 'h5':
                  return '\n\n##### ' + Array.from(element.childNodes).map(processNode).join('') + '\n\n';
                case 'h6':
                  return '\n\n###### ' + Array.from(element.childNodes).map(processNode).join('') + '\n\n';
                case 'div':
                  return '\n' + Array.from(element.childNodes).map(processNode).join('') + '\n';
                case 'ul':
                  return '\n' + Array.from(element.childNodes).map(processNode).join('') + '\n';
                case 'ol':
                  // Track ordered list items properly
                  let index = 1;
                  return '\n' + Array.from(element.childNodes)
                    .filter(node => node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName.toLowerCase() === 'li')
                    .map(node => {
                      const content = processNode(node).replace(/^•\s+/, ''); // Remove bullet if present
                      return `${index++}. ${content}`;
                    })
                    .join('\n') + '\n';
                case 'li':
                  const parent = element.parentElement;
                  if (parent && parent.tagName.toLowerCase() === 'ol') {
                    // This will be handled by the ol case
                    return Array.from(element.childNodes).map(processNode).join('');
                  }
                  return '\n• ' + Array.from(element.childNodes).map(processNode).join('');
                case 'a':
                  const href = (element as HTMLAnchorElement).href;
                  const text = Array.from(element.childNodes).map(processNode).join('').trim();
                  return `[${text}](${href})`;
                case 'img':
                  const alt = (element as HTMLImageElement).alt;
                  const src = (element as HTMLImageElement).src;
                  return `![${alt || 'Image'}](${src})`;
                case 'strong':
                case 'b':
                  return '**' + Array.from(element.childNodes).map(processNode).join('') + '**';
                case 'em':
                case 'i':
                  return '_' + Array.from(element.childNodes).map(processNode).join('') + '_';
                case 'code':
                  return '`' + Array.from(element.childNodes).map(processNode).join('') + '`';
                case 'pre':
                  return '\n```\n' + Array.from(element.childNodes).map(processNode).join('') + '\n```\n';
                case 'blockquote':
                  return '\n> ' + Array.from(element.childNodes).map(processNode).join('').replace(/\n/g, '\n> ') + '\n';
                default:
                  return Array.from(element.childNodes).map(processNode).join('');
              }
            };
            
            // Get full text with formatting preserved
            const extractedText = processNode(clonedContent);
            
            // Clean up excessive whitespace
            const cleanedText = extractedText
              .replace(/\n{3,}/g, '\n\n')  // Replace multiple newlines with double newline
              .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
              .trim();
              
            // Get simplified HTML representation
            const htmlContent = clonedContent.innerHTML;
            
            return {
              title,
              url: window.location.href,
              content: cleanedText,
              html: htmlContent,
              images,
              videos
            };
          } catch (error) {
            console.error('Error extracting DOM:', error);
            return {
              title: document.title || 'Error extracting content',
              url: window.location.href,
              content: 'Failed to extract content: ' + ((error as Error)?.message || 'Unknown error'),
              images: [],
              videos: []
            };
          }
        };
        
        return extractFullDom();
      }
    });
    
    if (!result || !result[0] || !result[0].result) {
      throw new Error('Failed to extract full DOM content');
    }
    
    return result[0].result as EnhancedContent;
  } catch (error) {
    console.error('Error executing full DOM extraction:', error);
    throw new Error('Failed to extract full DOM: ' + ((error as Error)?.message || 'Unknown error'));
  }
};

/**
 * Converts Markdown to HTML for rich clipboard copying
 */
const markdownToHtml = (markdown: string): string => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Copied Content</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { font-size: 1.8em; margin-bottom: 10px; }
    h2 { font-size: 1.6em; margin-top: 30px; margin-bottom: 10px; }
    h3 { font-size: 1.4em; margin-top: 25px; margin-bottom: 10px; }
    h4, h5, h6 { margin-top: 20px; margin-bottom: 10px; }
    .content { margin-top: 20px; }
    p { margin-bottom: 1em; }
    strong { font-weight: bold; }
    em { font-style: italic; }
    code { font-family: monospace; background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
    pre code { background-color: transparent; padding: 0; }
    blockquote { border-left: 3px solid #ddd; padding-left: 10px; color: #555; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; height: auto; display: block; margin: 1em 0; }
    ul, ol { margin: 1em 0; padding-left: 2em; }
    li { margin-bottom: 0.5em; }
  </style>
</head>
<body>
  <div class="content">
    ${markdown
      // Headers
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
      .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
      // Bold and italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\_(.+?)\_/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
      // Lists
      .replace(/^• (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // Paragraphs (must be last)
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p && !p.startsWith('<h') && !p.startsWith('<pre>') && !p.startsWith('<blockquote>') && !p.startsWith('<li>'))
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('\n')}
  </div>
</body>
</html>`;
};

// Function to format content as Markdown with images at their original positions
const formatContentAsMarkdown = (content: EnhancedContent): string => {
  // The content already has images and formatting preserved in their original positions
  // from the extraction process, so we can just return it directly
  return content.content;
};

export const copyToClipboard = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.id) {
      throw new Error('Không tìm thấy tab hiện tại');
    }

    // Show extraction status 
    console.log('🔍 Starting advanced content extraction from tab:', tab.id);
    
    // Use new advanced extraction method (direct DOM extraction)
    const enhancedContent = await extractFullPageContent(tab.id);
    
    console.log('📊 Extracted content stats:', { 
      titleLength: enhancedContent.title?.length || 0,
      contentLength: enhancedContent.content?.length || 0,
      images: enhancedContent.images?.length || 0,
      videos: enhancedContent.videos?.length || 0
    });

    // Format content for both HTML and plain text with rich media support
    const markdownContent = formatContentAsMarkdown(enhancedContent);
    const htmlContent = markdownToHtml(markdownContent);

    try {
      // Try to use the more advanced ClipboardItem API for HTML formatting
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([markdownContent], { type: 'text/plain' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      console.log('✅ Content copied to clipboard with HTML formatting');
    } catch (clipError) {
      // Fallback to basic clipboard API if advanced API not supported
      console.log('Clipboard API fallback:', clipError);
      await navigator.clipboard.writeText(markdownContent);
      console.log('✅ Content copied to clipboard as plain text/markdown');
    }
    
    // Generate message based on content extracted
    let successMessage = 'Đã copy nội dung với định dạng!';
    
    if (enhancedContent.images?.length) {
      successMessage += ` (${enhancedContent.images.length} ảnh)`;
    }
    
    if (enhancedContent.videos?.length) {
      successMessage += ` (${enhancedContent.videos.length} video)`;
    }
    
    return {
      success: true,
      message: successMessage
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Lỗi copy: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
};
