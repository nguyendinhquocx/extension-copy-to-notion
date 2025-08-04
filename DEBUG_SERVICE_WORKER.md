## 🐛 Debug Service Worker Errors

### 📋 Bước kiểm tra chi tiết:

#### 1. **Kiểm tra Service Worker Console**
```
1. Vào chrome://extensions/
2. Tìm "Copy To Notion" extension  
3. Click "service worker" (màu xanh)
4. Console sẽ mở → Check có lỗi gì màu đỏ
```

#### 2. **Check Extension Errors**
```
1. Vào chrome://extensions/
2. Click "Errors" button trong extension
3. Xem có lỗi runtime nào không
```

#### 3. **Reload và Test lại**
```
1. chrome://extensions/ → Click "Reload"
2. Đợi 5 giây cho service worker khởi động
3. Test lại content extraction
```

#### 4. **Manual Debug Test**
Mở Console và chạy:
```javascript
// Test extension ping
chrome.runtime.sendMessage({action: 'PING'})
  .then(console.log)
  .catch(console.error);

// Test content extraction 
chrome.tabs.query({active: true, currentWindow: true})
  .then(tabs => {
    return chrome.runtime.sendMessage({
      action: 'TRICH_XUAT_DU_LIEU',
      tabId: tabs[0].id
    });
  })
  .then(console.log)
  .catch(console.error);
```

### 🔧 Common Fixes:

#### **Fix 1: Service Worker Registration**
```
1. chrome://extensions/
2. Turn OFF extension
3. Turn ON extension  
4. Wait 10 seconds
5. Test again
```

#### **Fix 2: Clear Extension Data**
```javascript
// Run in Console:
chrome.storage.local.clear();
chrome.storage.session.clear();
```

#### **Fix 3: Check Permissions**
Extension cần permissions:
- activeTab ✓
- storage ✓ 
- scripting ✓

### 📞 Next Steps:

1. **Paste Service Worker Console logs**
2. **Paste Extension Errors (if any)**  
3. **Try manual debug commands above**
