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
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                  return '\n\n' + Array.from(element.childNodes).map(processNode).join('') + '\n\n';
                case 'div':
                  return '\n' + Array.from(element.childNodes).map(processNode).join('') + '\n';
                case 'li':
                  return '\n• ' + Array.from(element.childNodes).map(processNode).join('');
                case 'a':
                  const href = (element as HTMLAnchorElement).href;
                  const text = Array.from(element.childNodes).map(processNode).join('').trim();
                  return `${text} (${href})`;
                case 'img':
                  const alt = (element as HTMLImageElement).alt;
                  return alt ? `[Image: ${alt}]` : '[Image]';
                case 'strong':
                case 'b':
                  return '**' + Array.from(element.childNodes).map(processNode).join('') + '**';
                case 'em':
                case 'i':
                  return '_' + Array.from(element.childNodes).map(processNode).join('') + '_';
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

// Function to sanitize and format content for HTML
const formatContentAsHTML = (content: EnhancedContent): string => {
  // Ensure content is properly escaped HTML
  const escapeHTML = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  // Generate HTML for images
  const generateImagesHTML = (images: EnhancedContent['images'] = []): string => {
    if (!images.length) return '';
    
    return `<div class="image-gallery">
      ${images.map(img => `
        <figure>
          <img src="${escapeHTML(img.url)}" alt="${escapeHTML(img.alt || '')}" loading="lazy">
          ${img.alt ? `<figcaption>${escapeHTML(img.alt)}</figcaption>` : ''}
        </figure>
      `).join('')}
    </div>`;
  };
  
  // Generate HTML for videos
  const generateVideosHTML = (videos: EnhancedContent['videos'] = []): string => {
    if (!videos.length) return '';
    
    return `<div class="video-gallery">
      ${videos.map(video => {
        if (video.type === 'iframe') {
          return `<div class="video-embed">
            <iframe src="${escapeHTML(video.url)}" frameborder="0" allowfullscreen></iframe>
          </div>`;
        } else {
          return `<div class="video-player">
            <video controls ${video.thumbnail ? `poster="${escapeHTML(video.thumbnail)}"` : ''}>
              <source src="${escapeHTML(video.url)}" type="${escapeHTML(video.type)}">
              Your browser does not support video playback.
            </video>
          </div>`;
        }
      }).join('')}
    </div>`;
  };
  
  // Format content text with paragraphs
  const formatTextContent = (text: string): string => {
    // Split by double newlines to find paragraphs
    return text
      .split(/\n{2,}/)
      .map(p => p.trim())
      .filter(p => p)
      .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('\n');
  };
  
  // Create a nicely formatted HTML document
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHTML(content.title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { font-size: 1.8em; margin-bottom: 10px; }
    .source { color: #555; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
    .content { margin-top: 20px; }
    p { margin-bottom: 1em; }
    figure { margin: 1.5em 0; }
    figure img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
    figcaption { text-align: center; font-size: 0.9em; color: #666; margin-top: 0.5em; }
    .image-gallery, .video-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
    .video-embed, .video-player { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; }
    .video-embed iframe, .video-player video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
    .footer { margin-top: 30px; color: #777; font-size: 0.9em; border-top: 1px solid #eee; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>${escapeHTML(content.title)}</h1>
  <div class="source">
    Source: <a href="${escapeHTML(content.url)}">${escapeHTML(content.url)}</a>
  </div>
  <div class="content">
    ${formatTextContent(escapeHTML(content.content))}
    ${generateImagesHTML(content.images)}
    ${generateVideosHTML(content.videos)}
  </div>
  <div class="footer">
    Extracted via Copy to Notion Extension
  </div>
</body>
</html>`;
};

// Function to format content as Markdown with images
const formatContentAsMarkdown = (content: EnhancedContent): string => {
  // Format images
  const formatImages = (images: EnhancedContent['images'] = []): string => {
    if (!images.length) return '';
    
    return '\n\n## Images\n\n' + 
      images.map(img => `![${img.alt || 'Image'}](${img.url})`).join('\n\n');
  };
  
  // Format videos
  const formatVideos = (videos: EnhancedContent['videos'] = []): string => {
    if (!videos.length) return '';
    
    return '\n\n## Videos\n\n' + 
      videos.map(video => `🎥 [Video](${video.url})`).join('\n\n');
  };
  
  return `# ${content.title || 'Untitled Page'}

**URL:** ${content.url || 'No URL'}

## Content

${content.content}

${formatImages(content.images)}
${formatVideos(content.videos)}

---
*Extracted via Copy to Notion Extension*`;
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
    const htmlContent = formatContentAsHTML(enhancedContent);
    const markdownContent = formatContentAsMarkdown(enhancedContent);

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
    let successMessage = '✅ Đã copy nội dung với định dạng!';
    
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
