/**
 * Content Script Message Handler
 * Xử lý communication với background script và popup
 */

import { KetQuaTrichXuat } from '../shared/types/trang-web';
import { TrichXuatNoiDung } from './trich-xuat-noi-dung';
import { ChonPhanTu } from './chon-phan-tu';

/**
 * Message types cho content script
 */
export type ContentScriptMessage = 
  | { type: 'TRICH_XUAT_TRANG'; data?: any }
  | { type: 'TRICH_XUAT_SELECTION'; data?: any }
  | { type: 'PING'; data?: any }
  | { type: 'LAY_THONG_TIN_TRANG'; data?: any }
  | { type: 'KICH_HOAT_CHON_PHAN_TU'; data?: any }
  | { type: 'TAT_CHON_PHAN_TU'; data?: any }
  | { type: 'HIEN_THI_TOAST'; data: { message: string; type?: 'success' | 'error' | 'info' } };

/**
 * Response types
 */
export type ContentScriptResponse = 
  | { success: true; data: any }
  | { success: false; error: string };

/**
 * Service xử lý messages
 */
export class XuLyTinNhanContent {
  private trich_xuat_service: TrichXuatNoiDung;
  private chon_phan_tu_service: ChonPhanTu;
  private message_listeners: Map<string, Function> = new Map();

  constructor(
    trich_xuat_service: TrichXuatNoiDung,
    chon_phan_tu_service: ChonPhanTu
  ) {
    this.trich_xuat_service = trich_xuat_service;
    this.chon_phan_tu_service = chon_phan_tu_service;
  }

  /**
   * Khởi tạo message handling
   */
  async khoi_tao(): Promise<void> {
    try {
      // Setup runtime message listener
      chrome.runtime.onMessage.addListener(
        (message: ContentScriptMessage, sender, sendResponse) => {
          this.xu_ly_message(message, sender, sendResponse);
          return true; // Indicates we will send a response asynchronously
        }
      );

      console.log('[XuLyTinNhanContent] ✅ Message handlers đã được khởi tạo');
    } catch (error) {
      console.error('[XuLyTinNhanContent] ❌ Lỗi khởi tạo:', error);
      throw error;
    }
  }

  /**
   * Xử lý message từ popup/background
   */
  private async xu_ly_message(
    message: ContentScriptMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ContentScriptResponse) => void
  ): Promise<void> {
    try {
      console.log('[XuLyTinNhanContent] 📨 Nhận message:', message.type);

      switch (message.type) {
        case 'PING':
          sendResponse({ success: true, data: { status: 'alive', url: window.location.href } });
          break;

        case 'LAY_THONG_TIN_TRANG':
          await this.xu_ly_lay_thong_tin_trang(sendResponse);
          break;

        case 'TRICH_XUAT_TRANG':
          await this.xu_ly_trich_xuat_trang(sendResponse);
          break;

        case 'TRICH_XUAT_SELECTION':
          await this.xu_ly_trich_xuat_selection(sendResponse);
          break;

        case 'KICH_HOAT_CHON_PHAN_TU':
          await this.xu_ly_kich_hoat_chon_phan_tu(sendResponse);
          break;

        case 'TAT_CHON_PHAN_TU':
          await this.xu_ly_tat_chon_phan_tu(sendResponse);
          break;

        case 'HIEN_THI_TOAST':
          await this.xu_ly_hien_thi_toast(message.data, sendResponse);
          break;

        default:
          console.warn('[XuLyTinNhanContent] ⚠️ Unknown message type:', (message as any).type);
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('[XuLyTinNhanContent] ❌ Lỗi xử lý message:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Xử lý lấy thông tin trang
   */
  private async xu_ly_lay_thong_tin_trang(sendResponse: (response: ContentScriptResponse) => void): Promise<void> {
    try {
      const thong_tin = {
        url: window.location.href,
        title: document.title,
        domain: window.location.hostname,
        path: window.location.pathname,
        has_selection: window.getSelection()?.toString().trim().length ?? 0 > 0,
        can_extract: (document.body.textContent?.trim().length ?? 0) > 100,
        page_type: this.nhan_dien_loai_trang(),
        language: document.documentElement.lang || 'unknown'
      };

      sendResponse({ success: true, data: thong_tin });
    } catch (error) {
      throw new Error(`Lỗi lấy thông tin trang: ${error}`);
    }
  }

  /**
   * Xử lý trích xuất toàn bộ trang
   */
  private async xu_ly_trich_xuat_trang(sendResponse: (response: ContentScriptResponse) => void): Promise<void> {
    try {
      this.hien_thi_toast('🚀 Đang trích xuất nội dung trang...', 'info');
      
      const ket_qua: KetQuaTrichXuat = await this.trich_xuat_service.trich_xuat_toan_bo_trang();
      
      // Send to background for processing
      await this.gui_den_background('NOI_DUNG_TRICH_XUAT', ket_qua);
      
      this.hien_thi_toast('✅ Đã trích xuất nội dung thành công!', 'success');
      sendResponse({ success: true, data: ket_qua });
    } catch (error) {
      this.hien_thi_toast('❌ Lỗi trích xuất nội dung', 'error');
      throw new Error(`Lỗi trích xuất trang: ${error}`);
    }
  }

  /**
   * Xử lý trích xuất selection
   */
  private async xu_ly_trich_xuat_selection(sendResponse: (response: ContentScriptResponse) => void): Promise<void> {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        throw new Error('Không có nội dung được chọn');
      }

      this.hien_thi_toast('🚀 Đang trích xuất nội dung đã chọn...', 'info');

      // Get selected elements
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const parent_element = container.nodeType === Node.TEXT_NODE 
        ? container.parentElement 
        : container as Element;

      if (!parent_element) {
        throw new Error('Không tìm thấy element chứa selection');
      }

      const ket_qua = await this.trich_xuat_service.trich_xuat_tu_elements([parent_element]);
      
      // Send to background for processing
      await this.gui_den_background('NOI_DUNG_TRICH_XUAT', ket_qua);
      
      this.hien_thi_toast('✅ Đã trích xuất nội dung đã chọn!', 'success');
      sendResponse({ success: true, data: ket_qua });
    } catch (error) {
      this.hien_thi_toast('❌ Lỗi trích xuất nội dung đã chọn', 'error');
      throw new Error(`Lỗi trích xuất selection: ${error}`);
    }
  }

  /**
   * Xử lý kích hoạt chọn phần tử
   */
  private async xu_ly_kich_hoat_chon_phan_tu(sendResponse: (response: ContentScriptResponse) => void): Promise<void> {
    try {
      await this.chon_phan_tu_service.bat_dau_selection_mode();
      this.hien_thi_toast('🎯 Chế độ chọn phần tử đã được kích hoạt', 'info');
      sendResponse({ success: true, data: { activated: true } });
    } catch (error) {
      throw new Error(`Lỗi kích hoạt chọn phần tử: ${error}`);
    }
  }

  /**
   * Xử lý tắt chọn phần tử
   */
  private async xu_ly_tat_chon_phan_tu(sendResponse: (response: ContentScriptResponse) => void): Promise<void> {
    try {
      this.chon_phan_tu_service.huy_selection();
      this.hien_thi_toast('⏹️ Đã tắt chế độ chọn phần tử', 'info');
      sendResponse({ success: true, data: { deactivated: true } });
    } catch (error) {
      throw new Error(`Lỗi tắt chọn phần tử: ${error}`);
    }
  }

  /**
   * Xử lý hiển thị toast
   */
  private async xu_ly_hien_thi_toast(
    data: { message: string; type?: 'success' | 'error' | 'info' },
    sendResponse: (response: ContentScriptResponse) => void
  ): Promise<void> {
    try {
      this.hien_thi_toast(data.message, data.type || 'info');
      sendResponse({ success: true, data: { displayed: true } });
    } catch (error) {
      throw new Error(`Lỗi hiển thị toast: ${error}`);
    }
  }

  /**
   * Gửi message đến background script
   */
  private async gui_den_background(type: string, data: any): Promise<any> {
    try {
      const response = await chrome.runtime.sendMessage({ type, data });
      return response;
    } catch (error) {
      console.error('[XuLyTinNhanContent] Lỗi gửi message đến background:', error);
      throw error;
    }
  }

  /**
   * Gửi message đến popup
   */
  async gui_den_popup(type: string, data: any): Promise<any> {
    try {
      // Popup communication thông qua background
      return await this.gui_den_background('POPUP_MESSAGE', { type, data });
    } catch (error) {
      console.error('[XuLyTinNhanContent] Lỗi gửi message đến popup:', error);
      throw error;
    }
  }

  /**
   * Hiển thị toast notification
   */
  private hien_thi_toast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `copy-to-notion-toast copy-to-notion-toast-${type}`;
    toast.textContent = message;
    
    // Styles
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      zIndex: '2147483647',
      maxWidth: '400px',
      wordWrap: 'break-word',
      opacity: '0',
      transform: 'translateX(100%)',
      transition: 'all 0.3s ease'
    });

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 10);

    // Auto remove after 4 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }
    }, 4000);
  }

  /**
   * Nhận diện loại trang
   */
  private nhan_dien_loai_trang(): string {
    const url = window.location.href.toLowerCase();
    const title = document.title.toLowerCase();
    
    if (url.includes('/blog/') || url.includes('/article/')) return 'blog';
    if (url.includes('/news/') || title.includes('news')) return 'news';
    if (url.includes('/docs/') || title.includes('docs')) return 'documentation';
    if (url.includes('/product/')) return 'product';
    if (url.includes('github.com')) return 'github';
    if (url.includes('stackoverflow.com')) return 'stackoverflow';
    if (url.includes('reddit.com')) return 'reddit';
    
    return 'general';
  }

  /**
   * Thêm message listener
   */
  them_message_listener(type: string, handler: Function): void {
    this.message_listeners.set(type, handler);
  }

  /**
   * Xóa message listener
   */
  xoa_message_listener(type: string): void {
    this.message_listeners.delete(type);
  }

  /**
   * Lấy trạng thái content script
   */
  lay_trang_thai(): any {
    return {
      url: window.location.href,
      title: document.title,
      domain: window.location.hostname,
      content_script_active: true,
      services: {
        trich_xuat: !!this.trich_xuat_service,
        chon_phan_tu: !!this.chon_phan_tu_service,
        message_handler: this.message_listeners.size
      },
      last_activity: new Date()
    };
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.message_listeners.clear();
    
    // Remove all toast notifications
    const toasts = document.querySelectorAll('.copy-to-notion-toast');
    toasts.forEach(toast => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
  }
}
