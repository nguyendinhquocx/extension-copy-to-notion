/**
 * Chrome Storage Management Service
 * Quản lý Chrome storage với caching và optimization
 */

import { 
  CauHinhNguoiDung, 
  PhienLamViec
} from '../shared/types/extension';
import { KetNoiNotion } from '../shared/types/notion';
import { STORAGE } from '../shared/constants/api-constants';

/**
 * Service quản lý Chrome storage operations
 */
export class QuanLyStorage {
  private cache_local: Map<string, any> = new Map();
  private da_khoi_tao = false;

  /**
   * Khởi tạo storage service
   */
  async khoi_tao(): Promise<void> {
    if (this.da_khoi_tao) return;

    try {
      // Preload frequently used data
      await this.tai_cache_tu_storage();
      this.da_khoi_tao = true;
      console.log('[Storage] Service khởi tạo thành công');
    } catch (error) {
      console.error('[Storage] Lỗi khởi tạo:', error);
      throw error;
    }
  }

  /**
   * Tải cache từ Chrome storage
   */
  private async tai_cache_tu_storage(): Promise<void> {
    try {
      const keys = [
        STORAGE.KEYS.USER_CONFIG,
        STORAGE.KEYS.NOTION_TOKEN,
        STORAGE.KEYS.SELECTED_DATABASE,
        STORAGE.KEYS.CURRENT_SESSION
      ];

      const result = await chrome.storage.local.get(keys);
      
      for (const key of keys) {
        if (result[key]) {
          this.cache_local.set(key, result[key]);
        }
      }

      console.log(`[Storage] Đã tải ${this.cache_local.size} items vào cache`);
    } catch (error) {
      console.error('[Storage] Lỗi tải cache:', error);
    }
  }

  /**
   * Lấy Notion API key
   */
  async lay_notion_api_key(): Promise<string | null> {
    try {
      // Check cache first
      let api_key = this.cache_local.get(STORAGE.KEYS.NOTION_TOKEN);
      
      if (!api_key) {
        const result = await chrome.storage.local.get([STORAGE.KEYS.NOTION_TOKEN]);
        api_key = result[STORAGE.KEYS.NOTION_TOKEN];
        
        if (api_key) {
          this.cache_local.set(STORAGE.KEYS.NOTION_TOKEN, api_key);
        }
      }

      return api_key || null;
    } catch (error) {
      console.error('[Storage] Lỗi lấy API key:', error);
      return null;
    }
  }

  /**
   * Lưu Notion API key
   */
  async luu_notion_api_key(api_key: string): Promise<boolean> {
    try {
      await chrome.storage.local.set({
        [STORAGE.KEYS.NOTION_TOKEN]: api_key
      });

      this.cache_local.set(STORAGE.KEYS.NOTION_TOKEN, api_key);
      console.log('[Storage] API key đã được lưu');
      return true;
    } catch (error) {
      console.error('[Storage] Lỗi lưu API key:', error);
      return false;
    }
  }

  /**
   * Lấy database ID mặc định
   */
  async lay_database_id_mac_dinh(): Promise<string | null> {
    try {
      let database_id = this.cache_local.get(STORAGE.KEYS.SELECTED_DATABASE);
      
      if (!database_id) {
        const result = await chrome.storage.local.get([STORAGE.KEYS.SELECTED_DATABASE]);
        database_id = result[STORAGE.KEYS.SELECTED_DATABASE];
        
        if (database_id) {
          this.cache_local.set(STORAGE.KEYS.SELECTED_DATABASE, database_id);
        }
      }

      return database_id || null;
    } catch (error) {
      console.error('[Storage] Lỗi lấy database ID:', error);
      return null;
    }
  }

  /**
   * Lưu database ID mặc định
   */
  async luu_database_id_mac_dinh(database_id: string): Promise<boolean> {
    try {
      await chrome.storage.local.set({
        [STORAGE.KEYS.SELECTED_DATABASE]: database_id
      });

      this.cache_local.set(STORAGE.KEYS.SELECTED_DATABASE, database_id);
      console.log('[Storage] Database ID đã được lưu');
      return true;
    } catch (error) {
      console.error('[Storage] Lỗi lưu database ID:', error);
      return false;
    }
  }

  /**
   * Lấy cấu hình người dùng
   */
  async lay_cau_hinh_nguoi_dung(): Promise<CauHinhNguoiDung | null> {
    try {
      let config = this.cache_local.get(STORAGE.KEYS.USER_CONFIG);
      
      if (!config) {
        const result = await chrome.storage.local.get([STORAGE.KEYS.USER_CONFIG]);
        config = result[STORAGE.KEYS.USER_CONFIG];
        
        if (config) {
          this.cache_local.set(STORAGE.KEYS.USER_CONFIG, config);
        }
      }

      return config || null;
    } catch (error) {
      console.error('[Storage] Lỗi lấy cấu hình:', error);
      return null;
    }
  }

  /**
   * Lưu cấu hình người dùng
   */
  async luu_cau_hinh_nguoi_dung(config: Partial<CauHinhNguoiDung>): Promise<boolean> {
    try {
      // Merge với config hiện tại
      const current_config = await this.lay_cau_hinh_nguoi_dung();
      const merged_config = { ...current_config, ...config };

      await chrome.storage.local.set({
        [STORAGE.KEYS.USER_CONFIG]: merged_config
      });

      this.cache_local.set(STORAGE.KEYS.USER_CONFIG, merged_config);
      console.log('[Storage] Cấu hình người dùng đã được lưu');
      return true;
    } catch (error) {
      console.error('[Storage] Lỗi lưu cấu hình:', error);
      return false;
    }
  }

  /**
   * Lưu kết nối Notion
   */
  async luu_ket_noi_notion(ket_noi: KetNoiNotion): Promise<boolean> {
    try {
      await chrome.storage.local.set({
        [STORAGE.KEYS.NOTION_TOKEN]: ket_noi.api_key,
        [STORAGE.KEYS.SELECTED_DATABASE]: ket_noi.database_id
      });

      // Update cache
      this.cache_local.set(STORAGE.KEYS.NOTION_TOKEN, ket_noi.api_key);
      this.cache_local.set(STORAGE.KEYS.SELECTED_DATABASE, ket_noi.database_id);

      console.log('[Storage] Kết nối Notion đã được lưu');
      return true;
    } catch (error) {
      console.error('[Storage] Lỗi lưu kết nối Notion:', error);
      return false;
    }
  }

  /**
   * Lấy phiên làm việc hiện tại
   */
  async lay_phien_hien_tai(): Promise<PhienLamViec | null> {
    try {
      let session = this.cache_local.get(STORAGE.KEYS.CURRENT_SESSION);
      
      if (!session) {
        const result = await chrome.storage.local.get([STORAGE.KEYS.CURRENT_SESSION]);
        session = result[STORAGE.KEYS.CURRENT_SESSION];
        
        if (session) {
          this.cache_local.set(STORAGE.KEYS.CURRENT_SESSION, session);
        }
      }

      return session || null;
    } catch (error) {
      console.error('[Storage] Lỗi lấy phiên làm việc:', error);
      return null;
    }
  }

  /**
   * Lưu phiên làm việc
   */
  async luu_phien_lam_viec(session: PhienLamViec): Promise<boolean> {
    try {
      await chrome.storage.local.set({
        [STORAGE.KEYS.CURRENT_SESSION]: session
      });

      this.cache_local.set(STORAGE.KEYS.CURRENT_SESSION, session);
      return true;
    } catch (error) {
      console.error('[Storage] Lỗi lưu phiên làm việc:', error);
      return false;
    }
  }

  /**
   * Lưu cache databases
   */
  async luu_cache_databases(databases: any[]): Promise<boolean> {
    try {
      const cache_data = {
        data: databases,
        timestamp: Date.now(),
        ttl: STORAGE.TTL.DATABASE_CACHE
      };

      await chrome.storage.local.set({
        [STORAGE.KEYS.DATABASES_CACHE]: cache_data
      });

      console.log(`[Storage] Đã cache ${databases.length} databases`);
      return true;
    } catch (error) {
      console.error('[Storage] Lỗi lưu cache databases:', error);
      return false;
    }
  }

  /**
   * Lấy cache databases
   */
  async lay_cache_databases(): Promise<any[] | null> {
    try {
      const result = await chrome.storage.local.get([STORAGE.KEYS.DATABASES_CACHE]);
      const cache_data = result[STORAGE.KEYS.DATABASES_CACHE];

      if (!cache_data) return null;

      // Check if cache is still valid
      const now = Date.now();
      if (now - cache_data.timestamp > cache_data.ttl) {
        // Cache expired
        await this.xoa_cache_databases();
        return null;
      }

      return cache_data.data;
    } catch (error) {
      console.error('[Storage] Lỗi lấy cache databases:', error);
      return null;
    }
  }

  /**
   * Xóa cache databases
   */
  async xoa_cache_databases(): Promise<void> {
    try {
      await chrome.storage.local.remove([STORAGE.KEYS.DATABASES_CACHE]);
    } catch (error) {
      console.error('[Storage] Lỗi xóa cache databases:', error);
    }
  }

  /**
   * Lưu lịch sử extraction
   */
  async luu_lich_su_extraction(entry: any): Promise<boolean> {
    try {
      const history = await this.lay_lich_su_extraction();
      history.unshift(entry);

      // Giới hạn kích thước history
      const limited_history = history.slice(0, STORAGE.LIMITS.MAX_HISTORY_ITEMS);

      await chrome.storage.local.set({
        [STORAGE.KEYS.EXTRACTION_HISTORY]: limited_history
      });

      return true;
    } catch (error) {
      console.error('[Storage] Lỗi lưu lịch sử:', error);
      return false;
    }
  }

  /**
   * Lấy lịch sử extraction
   */
  async lay_lich_su_extraction(): Promise<any[]> {
    try {
      const result = await chrome.storage.local.get([STORAGE.KEYS.EXTRACTION_HISTORY]);
      return result[STORAGE.KEYS.EXTRACTION_HISTORY] || [];
    } catch (error) {
      console.error('[Storage] Lỗi lấy lịch sử:', error);
      return [];
    }
  }

  /**
   * Lưu trạng thái popup
   */
  async luu_trang_thai_popup(state: any): Promise<boolean> {
    try {
      await chrome.storage.session.set({
        [STORAGE.KEYS.POPUP_STATE]: state
      });
      return true;
    } catch (error) {
      console.error('[Storage] Lỗi lưu trạng thái popup:', error);
      return false;
    }
  }

  /**
   * Lấy trạng thái popup
   */
  async lay_trang_thai_popup(): Promise<any | null> {
    try {
      const result = await chrome.storage.session.get([STORAGE.KEYS.POPUP_STATE]);
      return result[STORAGE.KEYS.POPUP_STATE] || null;
    } catch (error) {
      console.error('[Storage] Lỗi lấy trạng thái popup:', error);
      return null;
    }
  }

  /**
   * Lấy thông tin storage usage
   */
  async lay_thong_tin_storage(): Promise<{ bytesInUse: number; quotaBytes: number }> {
    try {
      const info = await chrome.storage.local.getBytesInUse();
      return {
        bytesInUse: info,
        quotaBytes: chrome.storage.local.QUOTA_BYTES
      };
    } catch (error) {
      console.error('[Storage] Lỗi lấy thông tin storage:', error);
      return { bytesInUse: 0, quotaBytes: 0 };
    }
  }

  /**
   * Làm sạch storage - xóa data cũ/expired
   */
  async lam_sach_storage(): Promise<void> {
    try {
      console.log('[Storage] Bắt đầu làm sạch storage...');

      // Clear expired cache
      await this.lay_cache_databases(); // This will auto-remove expired cache

      // Clear old history if too large
      const history = await this.lay_lich_su_extraction();
      if (history.length > STORAGE.LIMITS.MAX_HISTORY_ITEMS) {
        const trimmed = history.slice(0, STORAGE.LIMITS.MAX_HISTORY_ITEMS);
        await chrome.storage.local.set({
          [STORAGE.KEYS.EXTRACTION_HISTORY]: trimmed
        });
      }

      // Clear session data older than 24 hours
      await this.lam_sach_session_data();

      console.log('[Storage] Hoàn thành làm sạch storage');
    } catch (error) {
      console.error('[Storage] Lỗi làm sạch storage:', error);
    }
  }

  /**
   * Làm sạch session data cũ
   */
  private async lam_sach_session_data(): Promise<void> {
    try {
      // Clear all session storage as it should be ephemeral
      await chrome.storage.session.clear();
    } catch (error) {
      console.error('[Storage] Lỗi làm sạch session data:', error);
    }
  }

  /**
   * Backup toàn bộ data
   */
  async backup_data(): Promise<any> {
    try {
      const all_data = await chrome.storage.local.get();
      return {
        data: all_data,
        timestamp: Date.now(),
        version: chrome.runtime.getManifest().version
      };
    } catch (error) {
      console.error('[Storage] Lỗi backup data:', error);
      return null;
    }
  }

  /**
   * Restore data từ backup
   */
  async restore_data(backup: any): Promise<boolean> {
    try {
      if (!backup.data) return false;

      await chrome.storage.local.clear();
      await chrome.storage.local.set(backup.data);
      
      // Reload cache
      this.cache_local.clear();
      await this.tai_cache_tu_storage();

      console.log('[Storage] Restore data thành công');
      return true;
    } catch (error) {
      console.error('[Storage] Lỗi restore data:', error);
      return false;
    }
  }

  /**
   * Reset toàn bộ storage
   */
  async reset_storage(): Promise<boolean> {
    try {
      await chrome.storage.local.clear();
      await chrome.storage.session.clear();
      this.cache_local.clear();
      
      console.log('[Storage] Storage đã được reset');
      return true;
    } catch (error) {
      console.error('[Storage] Lỗi reset storage:', error);
      return false;
    }
  }
}
