// Popup React Entry Point
// Đây là placeholder cho Step 06: Popup Interface Foundation & React Setup

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '@/styles/globals.css';
import Settings from './components/Settings';

// Main popup component
const CopyToNotionPopup: React.FC = () => {
  const [currentView, setCurrentView] = useState<'main' | 'settings'>('main');
  const [status, setStatus] = useState<string>('Sẵn sàng');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasNotionConnection, setHasNotionConnection] = useState<boolean>(false);

  // Check Notion connection on load
  useEffect(() => {
    checkNotionConnection();
  }, []);

  const checkNotionConnection = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'KIEM_TRA_KET_NOI'
      });

      if (response.success && response.data) {
        setHasNotionConnection(true);
        setStatus('Đã kết nối Notion');
      } else {
        setHasNotionConnection(false);
        setStatus('Chưa kết nối Notion');
      }
    } catch (error) {
      setHasNotionConnection(false);
      setStatus('Lỗi kiểm tra kết nối');
    }
  };

  const handleCopyContent = async () => {
    if (!hasNotionConnection) {
      setStatus('Vui lòng cài đặt Notion API trước');
      return;
    }

    setIsLoading(true);
    setStatus('Đang trích xuất nội dung...');
    
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

      setStatus('Đang lưu vào Notion...');

      // Save to Notion
      const saveResponse = await chrome.runtime.sendMessage({
        action: 'LUU_TRANG_WEB',
        tabId: tab.id,
        data: extractResponse.data
      });

      if (saveResponse.success) {
        setStatus('✅ Đã lưu thành công vào Notion!');
        // Auto close popup after 2 seconds
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        setStatus('❌ Lỗi lưu: ' + (saveResponse.error || 'Unknown error'));
      }
    } catch (error) {
      setStatus('❌ Lỗi: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckConnection = async () => {
    setIsLoading(true);
    setStatus('Đang kiểm tra kết nối...');
    await checkNotionConnection();
    setIsLoading(false);
  };

  const handleOpenSettings = () => {
    setCurrentView('settings');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    // Refresh connection status
    checkNotionConnection();
  };

  // Render Settings view
  if (currentView === 'settings') {
    return <Settings onBack={handleBackToMain} />;
  }

  // Render Main view
  return (
    <div className="w-80 bg-white p-6">
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold mb-2">Copy To Notion</h1>
        <div className="flex items-center justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${hasNotionConnection ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <p className="text-sm text-gray-600">{status}</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleCopyContent}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded font-medium transition-colors ${
            hasNotionConnection 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? 'Đang xử lý...' : '📄 Sao chép trang này'}
        </button>

        <button
          onClick={handleCheckConnection}
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          🔄 Kiểm tra kết nối
        </button>

        <button
          onClick={handleOpenSettings}
          disabled={isLoading}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ⚙️ Cài đặt
        </button>

        <button
          onClick={() => chrome.tabs.create({url: chrome.runtime.getURL('debug.html')})}
          disabled={isLoading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          🔧 Debug Console
        </button>
      </div>

      {/* Quick Setup hint */}
      {!hasNotionConnection && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <p className="text-yellow-800">
            💡 <strong>Cài đặt nhanh:</strong> Click "Cài đặt" để nhập Notion API key
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        v1.0.0 - Extension hoạt động {hasNotionConnection ? '✅' : '⚠️'}
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
