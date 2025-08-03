/**
 * Tab Management Service
 * Quản lý tabs và state tracking cho extension
 */

import { QuanLyStorage } from './quan-ly-storage';
import { KetQuaTrichXuat } from '../shared/types/trang-web';

/**
 * Service quản lý tabs và content script injection
 */
export class QuanLyTab {
  private storage: QuanLyStorage;
  private tabs_da_inject: Set<number> = new Set();
  private tab_states: Map<number, any> = new Map();

  constructor(storage: QuanLyStorage) {
    this.storage = storage;
  }

  /**
   * Khởi tạo tab manager
   */
  async khoi_tao(): Promise<void> {
    try {
      // Listen to tab events
      this.dang_ky_listeners();
      console.log('[TabManager] Service khởi tạo thành công');
    } catch (error) {
      console.error('[TabManager] Lỗi khởi tạo:', error);
      throw error;
    }
  }

  /**
   * Đăng ký event listeners
   */
  private dang_ky_listeners(): void {
    // Tab updated
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.xu_ly_tab_updated(tabId, changeInfo, tab);
    });

    // Tab removed
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.xu_ly_tab_removed(tabId);
    });

    // Tab activated
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.xu_ly_tab_activated(activeInfo);
    });
  }

  /**
   * Xử lý tab updated event
   */
  xu_ly_tab_updated(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void {
    try {
      if (changeInfo.status === 'complete' && tab.url) {
        // Check if this is a supported URL
        if (this.kiem_tra_url_hop_le(tab.url)) {
          // Auto-inject content script if needed
          this.tu_dong_inject_content_script(tabId);
        }
      }

      // Update tab state
      this.cap_nhat_trang_thai_tab(tabId, { ...changeInfo, tab });
    } catch (error) {
      console.error('[TabManager] Lỗi xử lý tab updated:', error);
    }
  }

  /**
   * Xử lý tab removed event
   */
  private xu_ly_tab_removed(tabId: number): void {
    try {
      this.tabs_da_inject.delete(tabId);
      this.tab_states.delete(tabId);
      console.log(`[TabManager] Cleaned up tab ${tabId}`);
    } catch (error) {
      console.error('[TabManager] Lỗi xử lý tab removed:', error);
    }
  }

  /**
   * Xử lý tab activated event
   */
  xu_ly_tab_activated(activeInfo: chrome.tabs.TabActiveInfo): void {
    try {
      // Update current active tab
      this.cap_nhat_trang_thai_tab(activeInfo.tabId, { active: true });
    } catch (error) {
      console.error('[TabManager] Lỗi xử lý tab activated:', error);
    }
  }

  /**
   * Kiểm tra URL có được hỗ trợ không
   */
  kiem_tra_url_hop_le(url: string): boolean {
    try {
      const url_obj = new URL(url);
      
      // Check against supported protocols
      const supported_protocols = ['http:', 'https:'];
      const excluded_domains = ['chrome:', 'chrome-extension:', 'moz-extension:', 'about:', 'data:'];
      
      return supported_protocols.includes(url_obj.protocol) &&
             !excluded_domains.some((domain: string) => url_obj.hostname.includes(domain));
    } catch (error) {
      return false;
    }
  }

  /**
   * Tự động inject content script
   */
  private async tu_dong_inject_content_script(tabId: number): Promise<void> {
    try {
      // Skip if already injected
      if (this.tabs_da_inject.has(tabId)) return;

      // Check user settings
      const config = await this.storage.lay_cau_hinh_nguoi_dung();
      if (!config?.auto_inject) return;

      await this.inject_content_script(tabId);
    } catch (error) {
      console.error('[TabManager] Lỗi tự động inject:', error);
    }
  }

  /**
   * Inject content script vào tab
   */
  async inject_content_script(tabId: number): Promise<boolean> {
    try {
      // Check if tab exists and is valid
      const tab = await chrome.tabs.get(tabId);
      if (!tab.url || !this.kiem_tra_url_hop_le(tab.url)) {
        return false;
      }

      // Skip if already injected
      if (this.tabs_da_inject.has(tabId)) {
        return true;
      }

      // Inject content script
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['dist/content/content-script.js']
      });

      // Inject CSS if needed
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['dist/content/content-styles.css']
      });

      this.tabs_da_inject.add(tabId);
      console.log(`[TabManager] Content script injected vào tab ${tabId}`);
      
      return true;
    } catch (error) {
      console.error(`[TabManager] Lỗi inject content script vào tab ${tabId}:`, error);
      return false;
    }
  }

  /**
   * Lấy thông tin tab hiện tại
   */
  async lay_tab_hien_tai(): Promise<chrome.tabs.Tab | null> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab || null;
    } catch (error) {
      console.error('[TabManager] Lỗi lấy tab hiện tại:', error);
      return null;
    }
  }

  /**
   * Lấy tất cả tabs đang mở
   */
  async lay_tat_ca_tabs(): Promise<chrome.tabs.Tab[]> {
    try {
      const tabs = await chrome.tabs.query({});
      return tabs.filter(tab => tab.url && this.kiem_tra_url_hop_le(tab.url));
    } catch (error) {
      console.error('[TabManager] Lỗi lấy tất cả tabs:', error);
      return [];
    }
  }

  /**
   * Lấy tabs có content script
   */
  lay_tabs_da_inject(): number[] {
    return Array.from(this.tabs_da_inject);
  }

  /**
   * Kiểm tra tab đã có content script chưa
   */
  kiem_tra_tab_da_inject(tabId: number): boolean {
    return this.tabs_da_inject.has(tabId);
  }

  /**
   * Cập nhật trạng thái tab
   */
  private cap_nhat_trang_thai_tab(tabId: number, state: any): void {
    const current_state = this.tab_states.get(tabId) || {};
    this.tab_states.set(tabId, { ...current_state, ...state, timestamp: Date.now() });
  }

  /**
   * Lấy trạng thái tab
   */
  lay_trang_thai_tab(tabId: number): any {
    return this.tab_states.get(tabId) || null;
  }

  /**
   * Trích xuất dữ liệu từ tab
   */
  async trich_xuat_du_lieu_tab(tabId: number): Promise<KetQuaTrichXuat | null> {
    try {
      // Check if content script is injected
      if (!this.tabs_da_inject.has(tabId)) {
        const injected = await this.inject_content_script(tabId);
        if (!injected) {
          throw new Error('Không thể inject content script');
        }
      }

      // Send message to content script to extract data
      const response = await chrome.tabs.sendMessage(tabId, {
        action: 'TRICH_XUAT_DU_LIEU',
        timestamp: Date.now()
      });

      if (!response || !response.success) {
        throw new Error(response?.error || 'Không thể trích xuất dữ liệu');
      }

      return response.data;
    } catch (error) {
      console.error(`[TabManager] Lỗi trích xuất dữ liệu tab ${tabId}:`, error);
      return null;
    }
  }

  /**
   * Lưu URL với ghi chú
   */
  async luu_url_voi_ghi_chu(tabId: number, ghi_chu?: string): Promise<boolean> {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (!tab.url || !tab.title) {
        throw new Error('Tab không hợp lệ');
      }

      // Extract additional data if content script is available
      let du_lieu_bo_sung = null;
      if (this.tabs_da_inject.has(tabId)) {
        try {
          const response = await chrome.tabs.sendMessage(tabId, {
            action: 'LAY_THONG_TIN_CO_BAN'
          });
          if (response?.success) {
            du_lieu_bo_sung = response.data;
          }
        } catch (error) {
          // Content script might not be ready, continue without additional data
        }
      }

      const thong_tin_luu = {
        url: tab.url,
        title: tab.title,
        ghi_chu: ghi_chu || '',
        favicon: tab.favIconUrl,
        timestamp: Date.now(),
        ...du_lieu_bo_sung
      };

      // Save to storage history
      await this.storage.luu_lich_su_extraction(thong_tin_luu);
      
      return true;
    } catch (error) {
      console.error(`[TabManager] Lỗi lưu URL tab ${tabId}:`, error);
      return false;
    }
  }

  /**
   * Reload content script trong tab
   */
  async reload_content_script(tabId: number): Promise<boolean> {
    try {
      // Remove from injected list
      this.tabs_da_inject.delete(tabId);
      
      // Re-inject
      return await this.inject_content_script(tabId);
    } catch (error) {
      console.error(`[TabManager] Lỗi reload content script tab ${tabId}:`, error);
      return false;
    }
  }

  /**
   * Gửi message đến content script
   */
  async gui_message_den_tab(tabId: number, message: any): Promise<any> {
    try {
      if (!this.tabs_da_inject.has(tabId)) {
        throw new Error('Content script chưa được inject');
      }

      const response = await chrome.tabs.sendMessage(tabId, message);
      return response;
    } catch (error) {
      console.error(`[TabManager] Lỗi gửi message đến tab ${tabId}:`, error);
      throw error;
    }
  }

  /**
   * Kiểm tra kết nối với content script
   */
  async kiem_tra_ket_noi_content_script(tabId: number): Promise<boolean> {
    try {
      const response = await chrome.tabs.sendMessage(tabId, {
        action: 'PING'
      });
      return response?.success === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Làm sạch tabs data cũ
   */
  lam_sach_tabs_data(): void {
    try {
      const now = Date.now();
      const timeout = 3600000; // 1 hour cleanup timeout

      // Clean old tab states
      for (const [tabId, state] of this.tab_states.entries()) {
        if (now - state.timestamp > timeout) {
          this.tab_states.delete(tabId);
          this.tabs_da_inject.delete(tabId);
        }
      }

      console.log('[TabManager] Đã làm sạch tabs data cũ');
    } catch (error) {
      console.error('[TabManager] Lỗi làm sạch tabs data:', error);
    }
  }

  /**
   * Lấy thống kê tabs
   */
  lay_thong_ke_tabs(): {
    tong_tabs: number;
    tabs_da_inject: number;
    tabs_hop_le: number;
  } {
    return {
      tong_tabs: this.tab_states.size,
      tabs_da_inject: this.tabs_da_inject.size,
      tabs_hop_le: Array.from(this.tab_states.values()).filter(state => 
        state.tab?.url && this.kiem_tra_url_hop_le(state.tab.url)
      ).length
    };
  }
}
