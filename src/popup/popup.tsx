// Popup React Entry Point
// Đây là placeholder cho Step 06: Popup Interface Foundation & React Setup

import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/styles/globals.css';

// Functional popup component
const CopyToNotionPopup: React.FC = () => {
  const [status, setStatus] = React.useState<string>('Sẵn sàng');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleCopyContent = async () => {
    setIsLoading(true);
    setStatus('Đang trích xuất nội dung...');
    
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        throw new Error('Không tìm thấy tab hiện tại');
      }

      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        action: 'TRICH_XUAT_DU_LIEU',
        tabId: tab.id
      });

      if (response.success) {
        setStatus('Trích xuất thành công!');
        console.log('Dữ liệu trích xuất:', response.data);
      } else {
        setStatus('Lỗi: ' + (response.error || 'Không thể trích xuất nội dung'));
      }
    } catch (error) {
      setStatus('Lỗi: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckConnection = async () => {
    setIsLoading(true);
    setStatus('Đang kiểm tra kết nối...');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'KIEM_TRA_KET_NOI'
      });

      if (response.success) {
        setStatus('Kết nối Notion thành công!');
      } else {
        setStatus('Chưa kết nối Notion');
      }
    } catch (error) {
      setStatus('Lỗi kiểm tra kết nối');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSettings = () => {
    // Open extension options page
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="w-80 bg-white p-6">
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold mb-2">Copy To Notion</h1>
        <p className="text-sm text-gray-600">{status}</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleCopyContent}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Đang xử lý...' : 'Sao chép trang này'}
        </button>

        <button
          onClick={handleCheckConnection}
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Kiểm tra kết nối
        </button>

        <button
          onClick={handleOpenSettings}
          disabled={isLoading}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cài đặt
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        v1.0.0 - Extension hoạt động bình thường
      </div>
    </div>
  );
};

// Mount React app
const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<CopyToNotionPopup />);
}
