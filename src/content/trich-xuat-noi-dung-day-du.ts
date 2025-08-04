/**
 * Enhanced Content Extraction Module
 * Supports rich content extraction including images, links, and videos
 * with proper formatting for Notion compatibility
 */

export interface EnhancedContent {
  title: string;
  url: string;
  content: string;
  html: string;
  images: Array<{
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  videos: Array<{
    url: string;
    type: string;
    thumbnail?: string;
  }>;
  metadata?: {
    description?: string;
    author?: string;
    publishDate?: string;
  };
}

/**
 * Extract full page content with rich media and formatting
 */
export const extractFullPageContent = async (): Promise<EnhancedContent> => {
  try {
    console.log('📋 Starting full DOM extraction with media...');
    
    // Get title
    const pageTitle = document.title || 
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
    const images: Array<{
      url: string;
      alt?: string;
      width?: number;
      height?: number;
    }> = [];
    
    const imageElements = mainContent.querySelectorAll('img');
    
    for (const img of Array.from(imageElements)) {
      // Check if image is visible and has decent size
      const rect = img.getBoundingClientRect();
      const isVisible = rect.width > 50 && rect.height > 50 && 
                       window.getComputedStyle(img).display !== 'none';
      
      if (isVisible) {
        let imgUrl = img.getAttribute('src') || '';
        
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
          alt: img.getAttribute('alt') || '',
          width: img.naturalWidth || rect.width,
          height: img.naturalHeight || rect.height
        });
      }
    }
    
    // Extract videos - look for video elements and iframes (youtube, etc.)
    const videos: Array<{
      url: string;
      type: string;
      thumbnail?: string;
    }> = [];
    
    // HTML5 video elements
    const videoElements = mainContent.querySelectorAll('video');
    for (const video of Array.from(videoElements)) {
      const src = video.getAttribute('src') || video.querySelector('source')?.getAttribute('src') || '';
      if (src) {
        videos.push({
          url: src,
          type: 'video/mp4',
          thumbnail: video.getAttribute('poster') || ''
        });
      }
    }
    
    // YouTube and other embedded videos
    const iframes = mainContent.querySelectorAll('iframe');
    for (const iframe of Array.from(iframes)) {
      const src = iframe.getAttribute('src') || '';
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
    
    // Convert the DOM to structured Markdown with text formatting preserved
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
        case 'a':
          const href = element.getAttribute('href') || '';
          const text = Array.from(element.childNodes).map(processNode).join('').trim();
          // If href is empty or just a hash, only return the text
          if (!href || href === '#') return text;
          // Fix relative URLs
          let fullHref = href;
          if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
            if (href.startsWith('/')) {
              const origin = window.location.origin;
              fullHref = origin + href;
            } else {
              const base = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
              fullHref = base + href;
            }
          }
          return `[${text}](${fullHref})`;
        case 'img':
          const src = element.getAttribute('src') || '';
          const alt = element.getAttribute('alt') || 'Image';
          return `![${alt}](${src})`;
        case 'ul':
          return '\n' + Array.from(element.childNodes).map(processNode).join('') + '\n';
        case 'ol':
          // Track ordered list items properly
          let index = 1;
          return '\n' + Array.from(element.childNodes)
            .filter(node => node.nodeType === Node.ELEMENT_NODE && 
                   (node as Element).tagName.toLowerCase() === 'li')
            .map(node => {
              const liContent = processNode(node).replace(/^•\s+/, ''); // Remove bullet if present
              return `${index++}. ${liContent}`;
            })
            .join('\n') + '\n';
        case 'li':
          const parentTag = element.parentElement?.tagName.toLowerCase();
          if (parentTag === 'ol') {
            // This will be handled by the ol case
            return Array.from(element.childNodes).map(processNode).join('');
          }
          return '\n• ' + Array.from(element.childNodes).map(processNode).join('');
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
      .replace(/[ \t]+/g, ' ')     // Replace multiple spaces with single space
      .trim();
    
    // Get metadata
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
      
    return {
      title: pageTitle,
      url: window.location.href,
      content: cleanedText,
      html: clonedContent.innerHTML,
      images,
      videos,
      metadata: getMetadata()
    };
  } catch (error) {
    console.error('Error extracting enhanced content:', error);
    return {
      title: document.title || 'Error extracting content',
      url: window.location.href,
      content: 'Failed to extract content: ' + ((error as Error)?.message || 'Unknown error'),
      html: '<p>Extraction failed</p>',
      images: [],
      videos: []
    };
  }
};
