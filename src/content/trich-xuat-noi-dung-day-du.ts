/**
 * Enhanced Content Extraction Module
 * Supports rich content extraction including images, links, and videos
 */

export interface EnhancedContent {
  title: string;
  url: string;
  content: string;
  images: string[];
  videos: string[];
  favicon: string;
  metadata: {
    description?: string;
    author?: string;
    publishDate?: string;
  };
}

// Function to execute in target page to get complete content
const executeExtraction = (): EnhancedContent => {
  // Utility functions
  const cleanHtml = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove unwanted elements
    const elementsToRemove = [
      'script', 'style', 'iframe:not([src*="youtube"]):not([src*="vimeo"])', 
      'noscript', '.ad', '.ads', '.advertisement', 
      'form', '.comments', '.comment-section',
      'nav', 'header:not(:first-child)', 'footer',
      '[role="banner"]', '[role="navigation"]'
    ];
    
    elementsToRemove.forEach(selector => {
      tempDiv.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    return tempDiv.innerHTML;
  };

  const getMainContent = (): HTMLElement | null => {
    // Try different strategies to find main content
    const contentSelectors = [
      'article', 
      'main',
      '.content', 
      '#content', 
      '.post-content',
      '.article-content',
      '.entry-content',
      'div.main-content',
      '[role="main"]',
      // Fallback to looking for the largest content block
      'section',
      '.container',
      'div.post',
      'div.page'
    ];
    
    // Try each selector
    for (const selector of contentSelectors) {
      const elements = document.querySelectorAll<HTMLElement>(selector);
      if (elements.length > 0) {
        // Find element with most text content
        let bestElement = elements[0];
        let maxLength = bestElement.innerText.length;
        
        for (let i = 1; i < elements.length; i++) {
          const length = elements[i].innerText.length;
          if (length > maxLength) {
            maxLength = length;
            bestElement = elements[i];
          }
        }
        
        if (maxLength > 200) { // Only if it has substantial content
          return bestElement;
        }
      }
    }
    
    // Last resort: body
    return document.body;
  };
  
  // Extract images, ensuring we get full URLs
  const getImages = (): string[] => {
    const mainContent = getMainContent();
    const images: string[] = [];
    
    if (mainContent) {
      mainContent.querySelectorAll('img[src]').forEach(img => {
        const src = (img as HTMLImageElement).src;
        if (src && !src.startsWith('data:') && src.trim() !== '') {
          // Filter out tiny images (likely icons, etc)
          const width = (img as HTMLImageElement).width;
          const height = (img as HTMLImageElement).height;
          
          if (width > 100 && height > 100) {
            images.push(src);
          }
        }
      });
    }
    
    return images;
  };
  
  // Extract videos (YouTube, Vimeo, etc)
  const getVideos = (): string[] => {
    const videos: string[] = [];
    
    // YouTube and Vimeo iframes
    document.querySelectorAll('iframe[src*="youtube"], iframe[src*="vimeo"]').forEach(iframe => {
      videos.push((iframe as HTMLIFrameElement).src);
    });
    
    // HTML5 videos
    document.querySelectorAll('video[src]').forEach(video => {
      videos.push((video as HTMLVideoElement).src);
    });
    
    return videos;
  };
  
  // Get page metadata
  const getMetadata = () => {
    const getMetaContent = (name: string): string | undefined => {
      const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"], meta[property="og:${name}"], meta[name="og:${name}"]`);
      return meta ? (meta as HTMLMetaElement).content : undefined;
    };
    
    return {
      description: getMetaContent('description'),
      author: getMetaContent('author'),
      publishDate: getMetaContent('published_time') || getMetaContent('article:published_time')
    };
  };
  
  // Main extraction logic
  const mainElement = getMainContent();
  const title = document.title;
  const url = window.location.href;
  const favicon = document.querySelector('link[rel="shortcut icon"], link[rel="icon"]')?.getAttribute('href') || '/favicon.ico';
  
  let content = '';
  if (mainElement) {
    content = cleanHtml(mainElement.innerHTML);
  } else {
    content = cleanHtml(document.body.innerHTML);
  }
  
  return {
    title,
    url,
    content,
    images: getImages(),
    videos: getVideos(),
    favicon: new URL(favicon, document.baseURI).href,
    metadata: getMetadata()
  };
};

/**
 * Extract full page content with rich media support
 */
export const extractFullPageContent = async (tabId?: number): Promise<EnhancedContent> => {
  // If we're already in the content script context, run the extraction directly
  if (typeof tabId === 'undefined') {
    console.log('Running extraction directly in content script');
    return executeExtraction();
  }
  
  console.log('Running extraction via executeScript in tab:', tabId);
  // Execute the script in the tab
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: executeExtraction,
  });
  
  if (!result || !result[0] || !result[0].result) {
    throw new Error('Không thể trích xuất nội dung từ trang');
  }
  
  return result[0].result as EnhancedContent;
};

/**
 * Format the extracted content as HTML
 */
export const formatContentAsHTML = (content: EnhancedContent): string => {
  let htmlOutput = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="font-size: 24px; margin-bottom: 10px;">${content.title}</h1>
      <p style="color: #666; margin-bottom: 20px;">
        <a href="${content.url}" style="color: #0366d6; text-decoration: none;" target="_blank">Nguồn gốc: ${content.url}</a>
      </p>
  `;
  
  // Add rich content
  htmlOutput += `<div style="line-height: 1.6;">${content.content}</div>`;
  
  // Add image gallery if there are images
  if (content.images && content.images.length > 0) {
    htmlOutput += `
      <div style="margin-top: 30px;">
        <h2 style="font-size: 20px; margin-bottom: 15px;">Ảnh (${content.images.length})</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
    `;
    
    content.images.forEach(imgSrc => {
      htmlOutput += `
        <div style="margin-bottom: 15px; flex: 0 0 calc(33.33% - 10px);">
          <img src="${imgSrc}" style="max-width: 100%; border-radius: 4px; border: 1px solid #eee;" />
        </div>
      `;
    });
    
    htmlOutput += `</div></div>`;
  }
  
  // Add videos if there are any
  if (content.videos && content.videos.length > 0) {
    htmlOutput += `
      <div style="margin-top: 30px;">
        <h2 style="font-size: 20px; margin-bottom: 15px;">Video (${content.videos.length})</h2>
    `;
    
    content.videos.forEach(videoSrc => {
      htmlOutput += `
        <div style="margin-bottom: 20px;">
          <iframe src="${videoSrc}" style="width: 100%; height: 400px; border: none; border-radius: 4px;" allowfullscreen></iframe>
        </div>
      `;
    });
    
    htmlOutput += `</div>`;
  }
  
  // Close the main container
  htmlOutput += `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 13px;">
        Copied with "Copy to Notion" extension
      </div>
    </div>
  `;
  
  return htmlOutput;
};

/**
 * Format the extracted content as Markdown (for plain text fallback)
 */
export const formatContentAsMarkdown = (content: EnhancedContent): string => {
  let markdown = `# ${content.title}\n\n`;
  markdown += `Source: ${content.url}\n\n`;
  
  // Convert HTML content to markdown-like format
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content.content;
  
  // Extract text content, preserving some structure
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  markdown += textContent.trim() + '\n\n';
  
  // Add images as markdown links
  if (content.images && content.images.length > 0) {
    markdown += `## Images (${content.images.length})\n\n`;
    
    content.images.forEach(imgSrc => {
      markdown += `![Image](${imgSrc})\n\n`;
    });
  }
  
  // Add videos as links
  if (content.videos && content.videos.length > 0) {
    markdown += `## Videos (${content.videos.length})\n\n`;
    
    content.videos.forEach(videoSrc => {
      markdown += `Video: ${videoSrc}\n\n`;
    });
  }
  
  markdown += '---\nCopied with "Copy to Notion" extension';
  
  return markdown;
};
