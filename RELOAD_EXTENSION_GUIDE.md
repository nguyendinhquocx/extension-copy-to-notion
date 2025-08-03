# 🔄 Step 06 Extension Testing - Reload Required

## 🎯 Hướng Dẫn Reload Extension

### 1. Go to Chrome Extensions
Navigate to: `chrome://extensions/`

### 2. Find Copy To Notion Extension
Look for extension với tên **"Copy To Notion"**

### 3. Reload Extension
Click button **🔄 Reload** or **↻** next to extension

### 4. Verify No Errors
Check status shows:
- ✅ **Enabled** toggle ON
- ✅ **No error messages**
- ✅ **Service worker: Active**

### 5. Test Updated Popup

**Test Steps:**
1. Navigate to test page: `file:///d:/pcloud/code/extension/copy%20to%20notion/test-page.html`
2. Click extension icon trong toolbar
3. Verify popup shows:
   - ✅ **Copy To Notion** title với **Step 06** badge
   - ✅ **📄 Article Capture** button (blue)
   - ✅ **🎯 Multi-Select** button (green)  
   - ✅ **🔖 URL Bookmark** button (orange)
   - ✅ **Status display** showing "Ready for Step 06 testing"

### 6. Test Button Interactions

**Article Capture Test:**
- Click **📄 Article Capture**
- Status should show: "Starting Article Capture..."
- Console should log communication attempts

**Multi-Select Test:**
- Click **🎯 Multi-Select** 
- Should attempt to activate selection mode

**URL Bookmark Test:**
- Click **🔖 URL Bookmark**
- Should attempt to save current URL

### 7. Debug Console

Open DevTools để check:

**Popup Console:**
1. Right-click extension icon → **Inspect popup**
2. Check Console tab cho messages:
```
🚀 Step 06 Popup Interface loaded
[PopupStatus] Initializing popup...
[PopupStatus] Extension communication OK
```

**Service Worker Console:**
1. Go to `chrome://extensions/`
2. Click **Service worker** link under extension
3. Check Console cho initialization messages

---

## ✅ Expected Results After Reload

### Popup Interface
- ✅ Modern minimalist design
- ✅ Three functional buttons
- ✅ Status display updates
- ✅ Hover effects work
- ✅ No console errors

### Communication
- ✅ Popup → Background service communication
- ✅ Button clicks trigger actions
- ✅ Status updates show progress
- ✅ Error handling graceful

### Performance
- ✅ Fast popup load (< 200ms)
- ✅ Smooth button interactions
- ✅ No memory leaks
- ✅ Extension stays active

---

## 🚨 If Issues Found

### Common Problems & Solutions

**1. Popup Still Shows Old Interface**
- Solution: Hard refresh extension (disable → enable)
- Clear Chrome cache: `chrome://settings/clearBrowserData`

**2. Script Loading Errors**
- Check console for specific error messages
- Verify `popup-interface.js` exists in dist/
- Check CSP policy allows script loading

**3. Communication Failures**
- Background service might not be running
- Check service worker status in extensions page
- Restart Chrome if needed

**4. Button Clicks Not Working**
- Check popup console for JavaScript errors
- Verify event listeners attached
- Test with different websites

---

## 🎉 Success Criteria

**Step 06 is successful when:**
- ✅ Extension loads without errors
- ✅ Popup shows Step 06 interface  
- ✅ All buttons clickable và responsive
- ✅ Status updates work correctly
- ✅ Console shows proper initialization
- ✅ Performance meets targets

**Ready for next step:** Continue to comprehensive Step 06 functionality testing!

---

**Happy Testing!** 🧪✨
