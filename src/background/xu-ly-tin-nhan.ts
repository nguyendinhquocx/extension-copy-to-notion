/**
 * Message Handler Service
 * Xử lý message passing giữa background, content script và popup
 */

import { QuanLyStorage } from './quan-ly-storage';
import { QuanLyTab } from './quan-ly-tab';
import { XuLyAPINotion } from './xu-ly-api-notion';

/**
 * Message types cho extension
 */
export enum LoaiMessage {
  // Notion API
  KIEM_TRA_KET_NOI = 'KIEM_TRA_KET_NOI',
  LUU_API_KEY = 'LUU_API_KEY',
  LAY_DATABASES = 'LAY_DATABASES',
  CHON_DATABASE = 'CHON_DATABASE',
  
  // Tab operations
  TRICH_XUAT_DU_LIEU = 'TRICH_XUAT_DU_LIEU',
  LUU_TRANG_WEB = 'LUU_TRANG_WEB',
  
  // Storage operations
  LAY_CAU_HINH = 'LAY_CAU_HINH',
  LUU_CAU_HINH = 'LUU_CAU_HINH',
  
  // Tab management
  CONTENT_SCRIPT_READY = 'CONTENT_SCRIPT_READY',
  
  // System
  PING = 'PING',
  GET_EXTENSION_INFO = 'GET_EXTENSION_INFO'
}

/**
 * Main Message Handler Class
 */
export class XuLyTinNhan {
  private storage: QuanLyStorage;
  private tabManager: QuanLyTab;
  private notionAPI: XuLyAPINotion;

  constructor() {
    this.storage = new QuanLyStorage();
    this.tabManager = new QuanLyTab();
    this.notionAPI = new XuLyAPINotion();
  }

  /**
   * Initialize storage system
   */
  async khoiTaoStorage() {
    await this.storage.khoi_tao();
  }

  /**
   * Handle all extension messages
   */
  async xuLyMessage(
    request: any,
    _sender: chrome.runtime.MessageSender,
    _sendResponse: (response?: any) => void
  ) {
    try {
      console.log('📨 Received message:', request.action, request);

      switch (request.action) {
        // Notion API operations
        case LoaiMessage.KIEM_TRA_KET_NOI:
          return await this.kiemTraKetNoi();

        case LoaiMessage.LUU_API_KEY:
          return await this.luuAPIKey(request.apiKey, request.databaseId);

        case LoaiMessage.LAY_DATABASES:
          return await this.layDatabases();

        case LoaiMessage.CHON_DATABASE:
          return await this.chonDatabase(request.databaseId);

        // Content extraction
        case LoaiMessage.TRICH_XUAT_DU_LIEU:
          return await this.trichXuatDuLieu(request.tabId);

        case LoaiMessage.LUU_TRANG_WEB:
          return await this.luuTrangWeb(request.tabId, request.data);

        // Storage operations
        case LoaiMessage.LAY_CAU_HINH:
          return await this.layCauHinh();

        case LoaiMessage.LUU_CAU_HINH:
          return await this.luuCauHinh(request.config);

        // Tab management
        case LoaiMessage.CONTENT_SCRIPT_READY:
          return await this.xuLyContentScriptReady(request.tabId);

        // System
        case LoaiMessage.PING:
          return { success: true, message: 'pong' };

        case LoaiMessage.GET_EXTENSION_INFO:
          return await this.getExtensionInfo();

        default:
          console.warn('❓ Unknown message action:', request.action);
          return { success: false, error: 'Unknown action: ' + request.action };
      }
    } catch (error) {
      console.error('❌ Message handler error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check Notion connection
   */
  private async kiemTraKetNoi() {
    try {
      const apiKey = await this.storage.lay_notion_api_key();
      const databaseId = await this.storage.lay_database_id_mac_dinh();
      
      if (!apiKey) {
        return { 
          success: false, 
          error: 'Chưa có API key',
          data: { hasApiKey: false, hasDatabase: false }
        };
      }

      const isConnected = await this.notionAPI.kiemTraKetNoi();
      
      return {
        success: isConnected,
        data: {
          hasApiKey: true,
          hasDatabase: !!databaseId,
          isConnected
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection check failed'
      };
    }
  }

  /**
   * Save API key and optional database ID
   */
  private async luuAPIKey(apiKey: string, databaseId?: string) {
    try {
      if (!apiKey) {
        throw new Error('API key is required');
      }

      await this.storage.luu_notion_api_key(apiKey);
      
      if (databaseId) {
        await this.storage.luu_database_id_mac_dinh(databaseId);
      }

      // Test the connection
      const isConnected = await this.notionAPI.kiemTraKetNoi();

      return {
        success: isConnected,
        message: isConnected ? 'API key saved and connection verified' : 'API key saved but connection failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save API key'
      };
    }
  }

  /**
   * Get available databases
   */
  private async layDatabases() {
    try {
      const databases = await this.notionAPI.layDatabases();
      return {
        success: true,
        data: databases
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get databases'
      };
    }
  }

  /**
   * Select database
   */
  private async chonDatabase(databaseId: string) {
    try {
      await this.storage.luu_database_id_mac_dinh(databaseId);

      return {
        success: true,
        message: 'Database selected successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to select database'
      };
    }
  }

  /**
   * Extract content from tab
   */
  private async trichXuatDuLieu(tabId: number) {
    try {
      const data = await this.tabManager.trichXuatNoiDung(tabId);
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract content'
      };
    }
  }

  /**
   * Save page to Notion
   */
  private async luuTrangWeb(tabId: number, data?: any) {
    try {
      // Extract content if not provided
      let contentData = data;
      if (!contentData) {
        contentData = await this.tabManager.trichXuatNoiDung(tabId);
      }

      // Save to Notion
      const result = await this.notionAPI.luuTrangWeb(contentData);
      
      return {
        success: true,
        data: result,
        message: 'Page saved to Notion successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save to Notion'
      };
    }
  }

  /**
   * Get configuration
   */
  private async layCauHinh() {
    try {
      const config = await this.storage.lay_cau_hinh_nguoi_dung();
      return {
        success: true,
        data: config
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get config'
      };
    }
  }

  /**
   * Save configuration
   */
  private async luuCauHinh(config: any) {
    try {
      await this.storage.luu_cau_hinh_nguoi_dung(config);
      return {
        success: true,
        message: 'Configuration saved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save config'
      };
    }
  }

  /**
   * Handle content script ready
   */
  private async xuLyContentScriptReady(tabId: number) {
    console.log('✅ Content script ready for tab:', tabId);
    return {
      success: true,
      message: 'Content script ready acknowledged'
    };
  }

  /**
   * Get extension info
   */
  private async getExtensionInfo() {
    return {
      success: true,
      data: {
        version: chrome.runtime.getManifest().version,
        name: chrome.runtime.getManifest().name,
        status: 'active'
      }
    };
  }
}

// Export singleton instance
export const xuLyTinNhan = new XuLyTinNhan();
