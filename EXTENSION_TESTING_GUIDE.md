# 🔧 Extension Testing Guide - Hướng dẫn Test Extension

## Bước 1: Load Extension vào Chrome

1. **Mở Chrome Extension Management:**
   - Vào `chrome://extensions/` 
   - Bật "Developer mode" (góc trên bên phải)

2. **Load Extension:**
   - Click "Load unpacked"
   - Chọn folder `dist` trong project của bạn
   - Extension sẽ xuất hiện trong danh sách

## Bước 2: Test Basic Functionality 

### Test Service Worker
1. **Mở DevTools cho Extension:**
   - Click "Inspect views: service worker" trong extension card
   - Check console cho errors

### Test Popup
1. **Click vào extension icon** trong toolbar
2. **Mở DevTools cho popup:**
   - Right-click trong popup → "Inspect"
   - Check console cho errors

### Test Content Script
1. **Mở bất kỳ trang web nào**
2. **Mở DevTools (F12)**
3. **Check console** cho content script logs

## Bước 3: Test Content Extraction

1. **Mở một trang web có nội dung** (VD: Wikipedia, blog, news)
2. **Click extension icon**
3. **Click "Sao chép trang này"**
4. **Check console** trong popup và content script cho errors

## Bước 4: Debug Common Issues

### Lỗi "Failed to extract content"
```javascript
// Run in webpage console để test manual extraction:
function testContentExtraction() {
  const title = document.title;
  const content = document.body.textContent || document.body.innerText;
  console.log('Title:', title);
  console.log('Content length:', content.length);
  console.log('Content preview:', content.substring(0, 200));
  return { title, content: content.substring(0, 1000) };
}
testContentExtraction();
```

### Lỗi Service Worker
```javascript
// Test trong service worker console:
chrome.runtime.sendMessage({ action: 'PING' }, (response) => {
  console.log('Ping response:', response);
});
```

### Lỗi Content Script Injection
```javascript
// Test trong popup console:
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    func: () => console.log('Content script injection test')
  });
});
```

## Bước 5: Reload Extension After Changes

**Sau khi thay đổi code:**

1. **Build lại:**
   ```bash
   npm run build
   ```

2. **Reload extension:**
   - Vào `chrome://extensions/`
   - Click refresh icon (🔄) trong extension card

3. **Hard reload nếu cần:**
   - Remove extension
   - Add lại bằng "Load unpacked"

## Troubleshooting Common Errors

### ❌ "Extension context invalidated"
- **Nguyên nhân:** Extension bị reload
- **Giải pháp:** Refresh trang web và thử lại

### ❌ "Unchecked runtime.lastError"
- **Nguyên nhân:** Missing error handling
- **Giải pháp:** Check console để xem error cụ thể

### ❌ "Could not establish connection"
- **Nguyên nhân:** Service worker crashed hoặc chưa ready
- **Giải pháp:** Reload extension và check service worker console

### ❌ "Cannot access chrome://"
- **Nguyên nhân:** Trying to access restricted pages
- **Giải pháp:** Test trên normal websites (không phải chrome:// pages)

## Debug Commands

Paste vào browser console để debug:

```javascript
// Check if extension is loaded
console.log('Extension ID:', chrome.runtime.id);

// Test message passing
chrome.runtime.sendMessage(
  { action: 'PING' }, 
  response => console.log('Response:', response)
);

// Check permissions
chrome.permissions.getAll(permissions => console.log('Permissions:', permissions));
```
