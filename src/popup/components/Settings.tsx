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
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'LUU_API_KEY',
        apiKey: apiKey
      });

      if (response.success) {
        setStatus('API key đã lưu thành công!');
        await loadDatabases();
      } else {
        setStatus('Lỗi: ' + (response.error || 'Không thể lưu API key'));
      }
    } catch (error) {
      setStatus('Lỗi: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadDatabases = async () => {
    setIsLoading(true);
    setStatus('Đang tải databases...');
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'LAY_DATABASES'
      });

      if (response.success) {
        const databases = response.data || [];
        setDatabases(databases);
        setStatus(`Tìm thấy ${databases.length} databases`);
      } else {
        setStatus('Lỗi: ' + (response.error || 'Không thể tải databases'));
      }
    } catch (error) {
      setStatus('Lỗi: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
        setStatus('Database đã được chọn!');
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
    <div className="p-4 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium">Cài đặt</h2>
        <button 
          onClick={onBack}
          className="text-gray-600 hover:text-black"
        >
          Quay lại
        </button>
      </div>

      {/* Status display */}
      {status && (
        <div className="mb-4 text-sm text-gray-700">{status}</div>
      )}

      {/* API Key Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notion API Key
        </label>
        <div className="flex space-x-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Nhập Notion API key"
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            onClick={handleSaveApiKey}
            disabled={isLoading || !apiKey}
            className="bg-black text-white px-3 py-2 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>

      {/* Database Selection */}
      {databases.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chọn Database
          </label>
          <div className="space-y-2">
            <select
              value={selectedDatabase}
              onChange={(e) => setSelectedDatabase(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
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
              className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="w-full bg-gray-200 text-black py-2 px-4 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang tải...' : 'Tải Databases'}
        </button>
      )}
    </div>
  );
};

export default Settings;
