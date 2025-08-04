import React, { useState, useEffect } from 'react';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [databases, setDatabases] = useState<any[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');

  // Load saved settings
  useEffect(() => {
    loadSavedSettings();
  }, []);

  const loadSavedSettings = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'LAY_CAU_HINH'
      });
      
      if (response.success && response.data) {
        // Load API key and database if saved
        const savedApiKey = await chrome.storage.local.get(['notion_api_key']);
        if (savedApiKey.notion_api_key) {
          setApiKey('•••••••••••••••'); // Show masked
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey || apiKey === '•••••••••••••••') return;
    
    setIsLoading(true);
    setStatus('Đang lưu API key...');
    
    console.log('🔄 Saving API key from popup...');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'LUU_API_KEY',
        apiKey: apiKey
      });

      console.log('📊 API key save response:', response);

      if (response.success) {
        setStatus('API key đã lưu thành công!');
        console.log('✅ API key saved successfully');
        await loadDatabases();
      } else {
        setStatus('Lỗi: ' + (response.error || 'Không thể lưu API key'));
        console.error('❌ API key save failed:', response.error);
      }
    } catch (error) {
      setStatus('Lỗi: ' + (error instanceof Error ? error.message : 'Unknown error'));
      console.error('❌ API key save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDatabases = async () => {
    setIsLoading(true);
    setStatus('Đang tải databases...');
    
    console.log('🔄 Loading databases from popup...');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'LAY_DATABASES'
      });

      console.log('📊 Database response in popup:', response);

      if (response.success) {
        // Fix: response.data is the array directly, not response.data.databases
        const databases = response.data || [];
        setDatabases(databases);
        setStatus(`Tìm thấy ${databases.length} databases`);
        console.log(`✅ Loaded ${databases.length} databases:`, databases);
      } else {
        setStatus('Lỗi: ' + (response.error || 'Không thể tải databases'));
        console.error('❌ Database loading failed:', response.error);
      }
    } catch (error) {
      setStatus('Lỗi: ' + (error instanceof Error ? error.message : 'Unknown error'));
      console.error('❌ Database loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDatabase = async () => {
    if (!selectedDatabase) return;

    setIsLoading(true);
    setStatus('Đang lưu database...');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'CHON_DATABASE',
        databaseId: selectedDatabase
      });

      if (response.success) {
        setStatus('Database đã được chọn thành công!');
      } else {
        setStatus('Lỗi: ' + (response.error || 'Không thể chọn database'));
      }
    } catch (error) {
      setStatus('Lỗi: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-80 bg-white p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-3 text-gray-600 hover:text-gray-800"
        >
          ← Quay lại
        </button>
        <h1 className="text-xl font-semibold">Cài đặt</h1>
      </div>

      {/* Status */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">{status}</p>
      </div>

      {/* API Key Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Notion API Key
        </label>
        <div className="space-y-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="secret_1234567890abcdef..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSaveApiKey}
            disabled={isLoading || !apiKey || apiKey === '•••••••••••••••'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Đang lưu...' : 'Lưu API Key'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Lấy API key từ: notion.so/my-integrations
        </p>
      </div>

      {/* Database Selection */}
      {databases.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Chọn Database
          </label>
          <div className="space-y-2">
            <select
              value={selectedDatabase}
              onChange={(e) => setSelectedDatabase(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn database --</option>
              {databases.map((db) => (
                <option key={db.id} value={db.id}>
                  {db.title || 'Untitled Database'}
                </option>
              ))}
            </select>
            <button
              onClick={handleSelectDatabase}
              disabled={isLoading || !selectedDatabase}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang lưu...' : 'Chọn Database'}
            </button>
          </div>
        </div>
      )}

      {/* Load Databases Button */}
      {databases.length === 0 && (
        <button
          onClick={loadDatabases}
          disabled={isLoading}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Đang tải...' : 'Tải Databases'}
        </button>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded text-sm">
        <h3 className="font-medium mb-2">Hướng dẫn:</h3>
        <ol className="list-decimal list-inside space-y-1 text-gray-600">
          <li>Tạo Integration tại notion.so/my-integrations</li>
          <li>Copy API key và paste vào trên</li>
          <li>Share database với Integration</li>
          <li>Chọn database từ danh sách</li>
        </ol>
      </div>
    </div>
  );
};

export default Settings;
