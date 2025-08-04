/**
 * Copy to Clipboard Function
 * Trích xuất content và copy vào clipboard
 */

export const copyToClipboard = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.id) {
      throw new Error('Không tìm thấy tab hiện tại');
    }

    // Extract content
    const extractResponse = await chrome.runtime.sendMessage({
      action: 'TRICH_XUAT_DU_LIEU',
      tabId: tab.id
    });

    if (!extractResponse.success) {
      throw new Error(extractResponse.error || 'Không thể trích xuất nội dung');
    }

    const { title, content, url } = extractResponse.data;
    
    // Format content for clipboard
    const clipboardContent = `# ${title || 'Untitled Page'}

**URL:** ${url || 'No URL'}

**Content:**
${content || 'No content extracted'}

---
*Extracted via Copy to Notion Extension*`;

    // Copy to clipboard
    await navigator.clipboard.writeText(clipboardContent);
    
    return {
      success: true,
      message: '✅ Đã copy vào clipboard! Paste vào Notion.'
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Lỗi copy: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
};
