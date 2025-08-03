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
  LUU_URL_VOI_GHI_CHU = 'LUU_URL_VOI_GHI_CHU',
  
  // Step 06: Rich Content Processing & Notion Integration
  XU_LY_NOI_DUNG_PHONG_PHU = 'XU_LY_NOI_DUNG_PHONG_PHU',
  LUU_RICH_CONTENT_VAO_NOTION = 'LUU_RICH_CONTENT_VAO_NOTION',
  THIET_LAP_NOTION_DATABASE = 'THIET_LAP_NOTION_DATABASE',
  TAO_DATABASE_MOI = 'TAO_DATABASE_MOI',
  LAY_TRANG_THAI_WORKFLOW = 'LAY_TRANG_THAI_WORKFLOW',
  HUY_WORKFLOW = 'HUY_WORKFLOW',
  
  // Storage operations
  LAY_CAU_HINH = 'LAY_CAU_HINH',
  LUU_CAU_HINH = 'LUU_CAU_HINH',
  LAY_LICH_SU = 'LAY_LICH_SU',
  
  // Tab management
  INJECT_CONTENT_SCRIPT = 'INJECT_CONTENT_SCRIPT',
  KIEM_TRA_TAB_STATUS = 'KIEM_TRA_TAB_STATUS',
  
  // System
  PING = 'PING',
  GET_EXTENSION_INFO = 'GET_EXTENSION_INFO'
}

/**
 * Interface cho message request
 */
export interface MessageRequest {
  action: LoaiMessage | string;
  data?: any;
  tabId?: number;
  timestamp?: number;
}

/**
 * Interface cho message response
 */
export interface MessageResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

/**
 * Service xử lý message passing
 */
export class XuLyTinNhan {
  private storage: QuanLyStorage;
  private tab_manager: QuanLyTab;
  private notion_api: XuLyAPINotion;

  constructor(
    storage: QuanLyStorage,
    tab_manager: QuanLyTab,
    notion_api: XuLyAPINotion
  ) {
    this.storage = storage;
    this.tab_manager = tab_manager;
    this.notion_api = notion_api;
  }

  /**
   * Khởi tạo message handler
   */
  async khoi_tao(): Promise<void> {
    try {
      this.dang_ky_listeners();
      console.log('[MessageHandler] Service khởi tạo thành công');
    } catch (error) {
      console.error('[MessageHandler] Lỗi khởi tạo:', error);
      throw error;
    }
  }

  /**
   * Đăng ký message listeners
   */
  private dang_ky_listeners(): void {
    // Runtime message listener
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.xu_ly_message(request, sender, sendResponse);
      return true; // Keep channel open for async response
    });

    // External message listener (for web pages)
    chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
      this.xu_ly_external_message(request, sender, sendResponse);
      return true;
    });
  }

  /**
   * Xử lý message từ extension components
   */
  async xu_ly_message(
    request: MessageRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ): Promise<void> {
    try {
      const response = await this.tao_response_cho_action(request, sender);
      sendResponse(response);
    } catch (error) {
      console.error('[MessageHandler] Lỗi xử lý message:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Xử lý external message
   */
  private async xu_ly_external_message(
    request: MessageRequest,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ): Promise<void> {
    try {
      // Only handle specific external actions
      const allowed_actions = [LoaiMessage.PING, LoaiMessage.GET_EXTENSION_INFO];
      
      if (!allowed_actions.includes(request.action as LoaiMessage)) {
        throw new Error('Action không được phép từ external source');
      }

      const response = await this.tao_response_cho_action(request, sender);
      sendResponse(response);
    } catch (error) {
      console.error('[MessageHandler] Lỗi xử lý external message:', error);
      sendResponse({
        success: false,
        error: 'External action not allowed',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Tạo response cho action
   */
  private async tao_response_cho_action(
    request: MessageRequest,
    sender: chrome.runtime.MessageSender
  ): Promise<MessageResponse> {
    const { action, data, tabId } = request;
    const current_tab_id = tabId || sender.tab?.id;

    switch (action) {
      // Notion API actions
      case LoaiMessage.KIEM_TRA_KET_NOI:
        return await this.xu_ly_kiem_tra_ket_noi();

      case LoaiMessage.LUU_API_KEY:
        return await this.xu_ly_luu_api_key(data?.api_key);

      case LoaiMessage.LAY_DATABASES:
        return await this.xu_ly_lay_databases();

      case LoaiMessage.CHON_DATABASE:
        return await this.xu_ly_chon_database(data?.database_id);

      // Tab operations
      case LoaiMessage.TRICH_XUAT_DU_LIEU:
        return await this.xu_ly_trich_xuat_du_lieu(current_tab_id);

      case LoaiMessage.LUU_TRANG_WEB:
        return await this.xu_ly_luu_trang_web(current_tab_id, data);

      case LoaiMessage.LUU_URL_VOI_GHI_CHU:
        return await this.xu_ly_luu_url_voi_ghi_chu(current_tab_id, data?.ghi_chu);

      // Storage operations
      case LoaiMessage.LAY_CAU_HINH:
        return await this.xu_ly_lay_cau_hinh();

      case LoaiMessage.LUU_CAU_HINH:
        return await this.xu_ly_luu_cau_hinh(data);

      case LoaiMessage.LAY_LICH_SU:
        return await this.xu_ly_lay_lich_su();

      // Tab management
      case LoaiMessage.INJECT_CONTENT_SCRIPT:
        return await this.xu_ly_inject_content_script(current_tab_id);

      case LoaiMessage.KIEM_TRA_TAB_STATUS:
        return await this.xu_ly_kiem_tra_tab_status(current_tab_id);

      // System
      case LoaiMessage.PING:
        return this.xu_ly_ping();

      case LoaiMessage.GET_EXTENSION_INFO:
        return await this.xu_ly_get_extension_info();

      default:
        throw new Error(`Action không được hỗ trợ: ${action}`);
    }
  }

  /**
   * Kiểm tra kết nối Notion
   */
  private async xu_ly_kiem_tra_ket_noi(): Promise<MessageResponse> {
    try {
      const ket_qua = await this.notion_api.kiem_tra_ket_noi();
      return {
        success: true,
        data: ket_qua,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi kiểm tra kết nối',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Lưu API key
   */
  private async xu_ly_luu_api_key(api_key: string): Promise<MessageResponse> {
    try {
      if (!api_key) {
        throw new Error('API key không được để trống');
      }

      const success = await this.storage.luu_notion_api_key(api_key);
      if (success) {
        // Reinitialize Notion API with new key
        await this.notion_api.khoi_tao();
      }

      return {
        success: success,
        data: { api_key_saved: success },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi lưu API key',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Lấy danh sách databases
   */
  private async xu_ly_lay_databases(): Promise<MessageResponse> {
    try {
      const databases = await this.notion_api.lay_danh_sach_databases();
      return {
        success: true,
        data: { databases },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi lấy databases',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Chọn database mặc định
   */
  private async xu_ly_chon_database(database_id: string): Promise<MessageResponse> {
    try {
      if (!database_id) {
        throw new Error('Database ID không được để trống');
      }

      const success = await this.storage.luu_database_id_mac_dinh(database_id);
      return {
        success: success,
        data: { database_selected: success },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi chọn database',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Trích xuất dữ liệu từ tab
   */
  private async xu_ly_trich_xuat_du_lieu(tab_id?: number): Promise<MessageResponse> {
    try {
      if (!tab_id) {
        const current_tab = await this.tab_manager.lay_tab_hien_tai();
        if (!current_tab?.id) {
          throw new Error('Không tìm thấy tab hiện tại');
        }
        tab_id = current_tab.id;
      }

      const du_lieu = await this.tab_manager.trich_xuat_du_lieu_tab(tab_id);
      return {
        success: true,
        data: du_lieu,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi trích xuất dữ liệu',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Lưu trang web vào Notion
   */
  private async xu_ly_luu_trang_web(tab_id?: number, du_lieu?: any): Promise<MessageResponse> {
    try {
      if (!tab_id) {
        const current_tab = await this.tab_manager.lay_tab_hien_tai();
        if (!current_tab?.id) {
          throw new Error('Không tìm thấy tab hiện tại');
        }
        tab_id = current_tab.id;
      }

      // Get data from tab if not provided
      let thong_tin_trang = du_lieu;
      if (!thong_tin_trang) {
        thong_tin_trang = await this.tab_manager.trich_xuat_du_lieu_tab(tab_id);
      }

      if (!thong_tin_trang) {
        throw new Error('Không thể lấy thông tin trang');
      }

      // Save to Notion
      const ket_qua = await this.notion_api.luu_trang_web(thong_tin_trang);
      
      // Save to history
      await this.storage.luu_lich_su_extraction({
        ...thong_tin_trang,
        notion_page_id: ket_qua.page_id,
        saved_at: Date.now()
      });

      return {
        success: true,
        data: ket_qua,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi lưu trang web',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Lưu URL với ghi chú
   */
  private async xu_ly_luu_url_voi_ghi_chu(tab_id?: number, ghi_chu?: string): Promise<MessageResponse> {
    try {
      if (!tab_id) {
        const current_tab = await this.tab_manager.lay_tab_hien_tai();
        if (!current_tab?.id) {
          throw new Error('Không tìm thấy tab hiện tại');
        }
        tab_id = current_tab.id;
      }

      const success = await this.tab_manager.luu_url_voi_ghi_chu(tab_id, ghi_chu);
      return {
        success: success,
        data: { url_saved: success },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi lưu URL',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Lấy cấu hình người dùng
   */
  private async xu_ly_lay_cau_hinh(): Promise<MessageResponse> {
    try {
      const config = await this.storage.lay_cau_hinh_nguoi_dung();
      return {
        success: true,
        data: config,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi lấy cấu hình',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Lưu cấu hình người dùng
   */
  private async xu_ly_luu_cau_hinh(config: any): Promise<MessageResponse> {
    try {
      const success = await this.storage.luu_cau_hinh_nguoi_dung(config);
      return {
        success: success,
        data: { config_saved: success },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi lưu cấu hình',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Lấy lịch sử extraction
   */
  private async xu_ly_lay_lich_su(): Promise<MessageResponse> {
    try {
      const history = await this.storage.lay_lich_su_extraction();
      return {
        success: true,
        data: { history },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi lấy lịch sử',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Inject content script
   */
  private async xu_ly_inject_content_script(tab_id?: number): Promise<MessageResponse> {
    try {
      if (!tab_id) {
        const current_tab = await this.tab_manager.lay_tab_hien_tai();
        if (!current_tab?.id) {
          throw new Error('Không tìm thấy tab hiện tại');
        }
        tab_id = current_tab.id;
      }

      const success = await this.tab_manager.inject_content_script(tab_id);
      return {
        success: success,
        data: { script_injected: success },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi inject content script',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Kiểm tra trạng thái tab
   */
  private async xu_ly_kiem_tra_tab_status(tab_id?: number): Promise<MessageResponse> {
    try {
      if (!tab_id) {
        const current_tab = await this.tab_manager.lay_tab_hien_tai();
        if (!current_tab?.id) {
          throw new Error('Không tìm thấy tab hiện tại');
        }
        tab_id = current_tab.id;
      }

      const status = {
        tab_id: tab_id,
        co_content_script: this.tab_manager.kiem_tra_tab_da_inject(tab_id),
        trang_thai: this.tab_manager.lay_trang_thai_tab(tab_id),
        thong_ke: this.tab_manager.lay_thong_ke_tabs()
      };

      return {
        success: true,
        data: status,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi kiểm tra tab status',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Ping response
   */
  private xu_ly_ping(): MessageResponse {
    return {
      success: true,
      data: { pong: true, service: 'background' },
      timestamp: Date.now()
    };
  }

  /**
   * Lấy thông tin extension
   */
  private async xu_ly_get_extension_info(): Promise<MessageResponse> {
    try {
      const manifest = chrome.runtime.getManifest();
      const storage_info = await this.storage.lay_thong_tin_storage();
      const tab_stats = this.tab_manager.lay_thong_ke_tabs();

      return {
        success: true,
        data: {
          version: manifest.version,
          name: manifest.name,
          storage: storage_info,
          tabs: tab_stats
        },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi lấy thông tin extension',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Gửi message đến popup
   */
  async gui_message_den_popup(message: any): Promise<any> {
    try {
      const response = await chrome.runtime.sendMessage(message);
      return response;
    } catch (error) {
      console.error('[MessageHandler] Lỗi gửi message đến popup:', error);
      throw error;
    }
  }

  /**
   * Gửi message đến content script
   */
  async gui_message_den_content_script(tab_id: number, message: any): Promise<any> {
    try {
      return await this.tab_manager.gui_message_den_tab(tab_id, message);
    } catch (error) {
      console.error('[MessageHandler] Lỗi gửi message đến content script:', error);
      throw error;
    }
  }

  /**
   * Broadcast message đến tất cả tabs
   */
  async broadcast_message_den_tabs(message: any): Promise<void> {
    try {
      const injected_tabs = this.tab_manager.lay_tabs_da_inject();

      const promises = injected_tabs.map(async (tab_id: number) => {
        try {
          await this.gui_message_den_content_script(tab_id, message);
        } catch (error) {
          // Tab might be closed or content script not ready
          console.warn(`[MessageHandler] Không thể gửi message đến tab ${tab_id}`);
        }
      });

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('[MessageHandler] Lỗi broadcast message:', error);
    }
  }
}
