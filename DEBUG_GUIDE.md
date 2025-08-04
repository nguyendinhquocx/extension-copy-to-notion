## 🐛 Extension Debug Guide

### 📋 Bước test chi tiết:

#### 1. **Reload Extension**
```
1. Vào chrome://extensions/
2. Tìm "Copy To Notion" extension
3. Click "Reload" (🔄)
4. Kiểm tra không có lỗi đỏ
```

#### 2. **Kiểm tra Service Worker**
```
1. Vào chrome://extensions/
2. Click "service worker" link trong extension
3. Console sẽ mở → check có logs:
   - "🚀 Service worker script loading..."
   - "✅ Storage initialized"  
   - "✅ Message listener initialized"
```

#### 3. **Test Extension với Debug Page**
```
1. Mở file extension-debug.html
2. Click "Test Extension Ping"
3. Check console logs
4. Click "Test API Connection" 
5. Click "Test Get Databases"
```

#### 4. **Debug Database Loading**
```
1. Mở extension popup
2. Nhập API key Notion
3. Click "Lưu API Key"
4. Mở DevTools (F12) → Console tab
5. Check logs khi click "Tải Databases":
   - "🔄 Loading databases from popup..."
   - "📊 Database response in popup: {...}"
   - "✅ Loaded X databases: [...]"
```

### 🔍 Expected Logs:

**Service Worker Console:**
```
🚀 Service worker script loading...
✅ Storage initialized
✅ Message listener initialized
📨 Message received: LAY_DATABASES {...}
🔄 Getting available databases...
🔑 API key for databases: Found
📡 Making search request to Notion API...
📊 Search API response status: 200
📋 Raw database results: {...}
✅ Processed databases: [...]
✅ Message response: {success: true, data: [...]}
```

**Popup Console:**
```
🔄 Loading databases from popup...
📊 Database response in popup: {success: true, data: [...]}
✅ Loaded X databases: [...]
```

### ❌ Common Issues:

1. **Service Worker không có logs**
   - Extension chưa reload sau build mới
   - Extension bị crash → reload extension

2. **"No API key configured"**
   - API key chưa được lưu vào storage
   - Check Chrome Storage: Application tab → Storage → Extension

3. **"API request failed: 401"**
   - API key sai hoặc hết hạn
   - Tạo API key mới tại notion.so/my-integrations

4. **"0 databases found"**
   - Notion workspace chưa có database nào
   - API key chưa được share với database
   - Database permissions không đúng

### 🔧 Troubleshooting Steps:

1. **Clear Extension Data:**
   ```
   1. F12 → Console
   2. Run: chrome.storage.local.clear()
   3. Reload extension
   4. Nhập API key mới
   ```

2. **Check API Key Permissions:**
   ```
   1. Vào notion.so/my-integrations
   2. Click vào integration
   3. Check "Associated pages" có databases không
   4. Share databases với integration
   ```

3. **Manual API Test:**
   ```
   Paste vào Console:
   
   fetch('https://api.notion.com/v1/search', {
     method: 'POST',
     headers: {
       'Authorization': 'Bearer YOUR_API_KEY',
       'Notion-Version': '2022-06-28',
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       filter: { value: 'database', property: 'object' }
     })
   }).then(r => r.json()).then(console.log)
   ```

### 📞 Next Steps:

Nếu vẫn có lỗi, paste console logs đầy đủ từ:
1. Service Worker console
2. Extension popup console  
3. Debug page results
