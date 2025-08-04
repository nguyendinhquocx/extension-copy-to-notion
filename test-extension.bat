@echo off
echo 🚀 Testing Copy to Notion Extension
echo.

echo 📋 Hướng dẫn test extension:
echo 1. Đảm bảo Chrome đã mở
echo 2. Vào chrome://extensions/
echo 3. Bật "Developer mode" ở góc trên phải
echo 4. Click "Load unpacked" và chọn thư mục "dist"
echo 5. Mở trang web bất kỳ và click extension icon
echo.

echo 🔧 Debugging:
echo - F12 để mở DevTools
echo - Check Console tab để xem logs
echo - Check Application > Storage để xem stored data
echo.

echo 📊 Test cases:
echo ✓ Extension loads without errors
echo ✓ Popup opens with Settings UI
echo ✓ API key input works
echo ✓ Database selection works
echo ✓ Service worker logs appear in console
echo.

pause
