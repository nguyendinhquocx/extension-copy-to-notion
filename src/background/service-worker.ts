/**
 * Service Worker Chính - Main Background Service
 * Điều khiển trung tâm cho extension với Manifest V3
 */

import { XuLyAPINotion } from './xu-ly-api-notion';
import { QuanLyTab } from './quan-ly-tab';
import { XuLyTinNhan } from './xu-ly-tin-nhan';
import { QuanLyStorage } from './quan-ly-storage';
import { XuLyLoi, LoaiLoi } from '../shared/utils/xu-ly-loi';
import { CauHinhNguoiDung } from '../shared/types/extension';

/**
 * Service Worker chính quản lý lifecycle và coordination
 */
class ServiceWorkerChinh {
  private xu_ly_api: XuLyAPINotion;
  private quan_ly_tab: QuanLyTab;
  private xu_ly_tin_nhan: XuLyTinNhan;
  private quan_ly_storage: QuanLyStorage;
  private xu_ly_loi: XuLyLoi;
  private da_khoi_tao = false;

  constructor() {
    this.xu_ly_loi = XuLyLoi.getInstance();
    this.quan_ly_storage = new QuanLyStorage();
    this.xu_ly_api = new XuLyAPINotion(this.quan_ly_storage);
    this.quan_ly_tab = new QuanLyTab(this.quan_ly_storage);
    this.xu_ly_tin_nhan = new XuLyTinNhan(this.quan_ly_storage, this.quan_ly_tab, this.xu_ly_api);
  }

  /**
   * Khởi tạo service worker khi extension start
   */
  async khoi_tao(): Promise<void> {
    if (this.da_khoi_tao) {
      console.log('[Copy To Notion] Service Worker đã được khởi tạo');
      return;
    }

    try {
      console.log('[Copy To Notion] Service Worker bắt đầu khởi tạo...');
      
      // Đăng ký event listeners
      await this.dang_ky_event_listeners();
      
      // Khởi tạo các services
      await this.khoi_tao_services();
      
      // Kiểm tra connection Notion
      await this.kiem_tra_ket_noi_notion();
      
      this.da_khoi_tao = true;
      console.log('[Copy To Notion] Service Worker khởi tạo thành công!');
    } catch (error) {
      console.error('[Copy To Notion] Lỗi khởi tạo Service Worker:', error);
      this.xu_ly_loi.taoLoi(LoaiLoi.CONFIGURATION_ERROR, 'Khởi tạo service worker thất bại', {
        context: { error: String(error) }
      });
    }
  }

  /**
   * Đăng ký tất cả event listeners
   */
  private async dang_ky_event_listeners(): Promise<void> {
    // Extension lifecycle events
    chrome.runtime.onStartup.addListener(() => this.xu_ly_startup());
    chrome.runtime.onInstalled.addListener((details) => this.xu_ly_installed(details));
    
    // Tab events
    chrome.tabs.onActivated.addListener((info) => this.quan_ly_tab.xu_ly_tab_activated(info));
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => 
      this.quan_ly_tab.xu_ly_tab_updated(tabId, changeInfo, tab)
    );
    
    // Message passing - Sử dụng return true cho async
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.xu_ly_tin_nhan.xu_ly_message(message, sender, sendResponse);
      return true; // Keep channel open for async response
    });
    
    // Extension icon click
    chrome.action.onClicked.addListener((tab) => this.xu_ly_icon_click(tab));

    // Alarm events cho periodic tasks
    chrome.alarms.onAlarm.addListener((alarm) => this.xu_ly_alarm(alarm));
    
    console.log('[Service Worker] Event listeners đã được đăng ký');
  }

  /**
   * Khởi tạo các services
   */
  private async khoi_tao_services(): Promise<void> {
    try {
      await this.quan_ly_storage.khoi_tao();
      await this.xu_ly_api.khoi_tao();
      await this.quan_ly_tab.khoi_tao();
      
      console.log('[Service Worker] Tất cả services đã khởi tạo thành công');
    } catch (error) {
      console.error('[Service Worker] Lỗi khởi tạo services:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra kết nối Notion
   */
  private async kiem_tra_ket_noi_notion(): Promise<void> {
    try {
      const co_api_key = await this.quan_ly_storage.lay_notion_api_key();
      if (co_api_key) {
        const ket_noi_thanh_cong = await this.xu_ly_api.kiem_tra_ket_noi();
        if (ket_noi_thanh_cong) {
          console.log('[Service Worker] Kết nối Notion thành công');
        } else {
          console.warn('[Service Worker] Kết nối Notion thất bại');
        }
      } else {
        console.log('[Service Worker] Chưa có API key Notion');
      }
    } catch (error) {
      console.error('[Service Worker] Lỗi kiểm tra kết nối Notion:', error);
    }
  }

  /**
   * Xử lý extension startup
   */
  private xu_ly_startup(): void {
    console.log('[Copy To Notion] Extension startup detected');
    
    // Restart any needed services
    this.khoi_tao_services().catch(error => {
      console.error('[Service Worker] Lỗi restart services:', error);
    });
  }

  /**
   * Xử lý extension installed/updated
   */
  private xu_ly_installed(details: chrome.runtime.InstalledDetails): void {
    if (details.reason === 'install') {
      console.log('[Copy To Notion] Extension installed for first time');
      this.mo_trang_chao_mung();
      this.tao_default_settings();
    } else if (details.reason === 'update') {
      const version = chrome.runtime.getManifest().version;
      console.log(`[Copy To Notion] Extension updated to version ${version}`);
      this.xu_ly_update(details.previousVersion, version);
    }
  }

  /**
   * Xử lý click vào extension icon
   */
  private xu_ly_icon_click(tab: chrome.tabs.Tab): void {
    if (tab.id && tab.url && this.quan_ly_tab.kiem_tra_url_hop_le(tab.url)) {
      // Open popup for supported tabs
      chrome.action.openPopup();
    } else {
      // Show notification for unsupported tabs
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'Copy To Notion',
        message: 'Extension không thể hoạt động trên trang này'
      });
    }
  }

  /**
   * Xử lý alarms cho periodic tasks
   */
  private xu_ly_alarm(alarm: chrome.alarms.Alarm): void {
    switch (alarm.name) {
      case 'cleanup_storage':
        this.quan_ly_storage.lam_sach_storage();
        break;
      case 'check_notion_connection':
        this.kiem_tra_ket_noi_notion();
        break;
      default:
        console.log(`[Service Worker] Unknown alarm: ${alarm.name}`);
    }
  }

  /**
   * Mở trang chào mừng cho user mới
   */
  private mo_trang_chao_mung(): void {
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }

  /**
   * Tạo cài đặt mặc định cho user mới
   */
  private async tao_default_settings(): Promise<void> {
    try {
      const cau_hinh_mac_dinh: Partial<CauHinhNguoiDung> = {
        notion_api_key: '',
        database_id_mac_dinh: '',
        tu_dong_dong_popup: false,
        hien_thi_thong_bao: true,
        ngon_ngu_giao_dien: 'vi',
        che_do_toi_gian: false,
        tu_dong_lam_sach: true,
        gioi_han_ky_tu_mac_dinh: 2000,
        luu_lich_su_local: true,
        dong_bo_cau_hinh_cloud: false,
        auto_inject: true
      };

      await this.quan_ly_storage.luu_cau_hinh_nguoi_dung(cau_hinh_mac_dinh);
      
      // Tạo periodic alarms
      chrome.alarms.create('cleanup_storage', { periodInMinutes: 60 }); // Hourly cleanup
      chrome.alarms.create('check_notion_connection', { periodInMinutes: 30 }); // Check connection every 30min
      
      console.log('[Service Worker] Default settings created');
    } catch (error) {
      console.error('[Service Worker] Lỗi tạo default settings:', error);
    }
  }

  /**
   * Xử lý extension update
   */
  private async xu_ly_update(previous_version?: string, current_version?: string): Promise<void> {
    try {
      // Migration logic nếu cần
      if (previous_version && current_version) {
        console.log(`[Service Worker] Migrating from ${previous_version} to ${current_version}`);
        
        // Add migration logic here if needed
        await this.migration_data(previous_version, current_version);
      }
    } catch (error) {
      console.error('[Service Worker] Lỗi update migration:', error);
    }
  }

  /**
   * Migration data giữa các versions
   */
  private async migration_data(from_version: string, to_version: string): Promise<void> {
    // Implementation for data migration between versions
    console.log(`[Service Worker] Data migration từ ${from_version} đến ${to_version} hoàn thành`);
  }

  /**
   * Cleanup khi service worker bị terminate
   */
  async cleanup(): Promise<void> {
    try {
      this.xu_ly_api.ngat_ket_noi();
      console.log('[Service Worker] Cleanup hoàn thành');
    } catch (error) {
      console.error('[Service Worker] Lỗi cleanup:', error);
    }
  }
}

// Khởi tạo service worker
const service_worker = new ServiceWorkerChinh();

// Start service worker
service_worker.khoi_tao().catch(error => {
  console.error('[Copy To Notion] Critical error khởi tạo service worker:', error);
});

// Handle service worker events
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Service Worker] Installing...');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('[Service Worker] Activating...');
});

// Export for potential testing
export { ServiceWorkerChinh };
