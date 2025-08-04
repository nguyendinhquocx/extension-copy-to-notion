# Advanced Content Extraction Feature

This document outlines the implementation of advanced content extraction capabilities for the "Copy to Notion" browser extension, similar to Notion Web Clipper's functionality.

## Features Added

- **Rich Content Extraction**: Added support for extracting full article content with all formatting.
- **Image Support**: The extension now captures and includes images from the article.
- **Video Support**: YouTube, Vimeo, and HTML5 videos are now detected and included.
- **Advanced HTML Formatting**: Content is now formatted with proper HTML structure for better presentation in Notion.
- **Markdown Fallback**: For platforms that don't support rich HTML, content is also available as formatted Markdown.
- **Toggle in UI**: Added a toggle in the popup UI to enable/disable advanced extraction.

## Implementation Details

### New Files Created
- `trich-xuat-noi-dung-day-du.ts`: Contains the core advanced extraction logic

### Files Modified
1. **Popup Component (`popup.tsx`)**:
   - Added toggle for advanced extraction
   - Added persistent storage for user preferences
   - Updated UI to show extraction mode

2. **Copy to Clipboard Function**:
   - Enhanced to handle rich content with images and videos
   - Added support for both HTML and Markdown formats

3. **Content Script Message Handler**:
   - Added support for the new advanced extraction message type
   - Implemented the handler to process rich content extraction

4. **Background Service Worker**:
   - Added new message type for advanced extraction
   - Updated handlers to support rich content

## How It Works

1. When the user toggles "Advanced Extraction" on, the extension saves this preference.
2. During extraction, the extension:
   - Analyzes the page structure to find the main content
   - Extracts all relevant images, filtering out icons and tiny images
   - Identifies videos embedded in the page
   - Creates a structured representation of the content
   - Formats this content as both HTML and Markdown

3. The rich content is then either:
   - Copied to clipboard with HTML formatting preserved
   - Sent to Notion via the API with all media intact

## Testing

To test the advanced extraction:

1. Open any content-rich webpage (news articles, blogs, etc.)
2. Click the extension icon
3. Toggle "Advanced Extraction" on
4. Click "Copy to Clipboard"
5. Paste into Notion or a rich text editor to see the formatted content with images

## Limitations

- Some websites may block content extraction
- Very large pages might be truncated to avoid performance issues
- Video embedding depends on the destination platform's support
