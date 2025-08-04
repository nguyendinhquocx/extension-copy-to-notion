/**
 * Content Script - Main Entry Point
 * Engine chính cho DOM interaction và content extraction
 */

import { ChonPhanTu } from './chon-phan-tu';
import { TrichXuatNoiDung } from './trich-xuat-noi-dung';
import { XuLyTinNhanContent } from './xu-ly-tin-nhan-content';

/**
 * Content Script Manager - Điều khiển chính
 */
class ContentScriptManager {
  private chon_phan_tu: ChonPhanTu;
  private trich_xuat_noi_dung: TrichXuatNoiDung;
  private xu_ly_tin_nhan: XuLyTinNhanContent;
  private da_khoi_tao = false;

  constructor() {
    this.trich_xuat_noi_dung = new TrichXuatNoiDung();
    this.chon_phan_tu = new ChonPhanTu();
    this.xu_ly_tin_nhan = new XuLyTinNhanContent(this.trich_xuat_noi_dung, this.chon_phan_tu);
  }

  /**
   * Khởi tạo content script
   */
  async khoi_tao(): Promise<void> {
    if (this.da_khoi_tao) return;

    try {
      // Kiểm tra môi trường
      if (!this.kiem_tra_moi_truong_hop_le()) {
        console.log('[ContentScript] Trang không được hỗ trợ, skip injection');
        return;
      }

      // Khởi tạo các services
      await this.trich_xuat_noi_dung.khoi_tao();
      await this.chon_phan_tu.khoi_tao();
      await this.xu_ly_tin_nhan.khoi_tao();

      // Đăng ký event listeners
      this.dang_ky_listeners();

      this.da_khoi_tao = true;
      console.log('[ContentScript] ✅ Content script khởi tạo thành công:', window.location.href);

      // Notify background script
      this.thong_bao_background_ready();
    } catch (error) {
      console.error('[ContentScript] ❌ Lỗi khởi tạo:', error);
    }
  }

  /**
   * Kiểm tra môi trường có hợp lệ không
   */
  private kiem_tra_moi_truong_hop_le(): boolean {
    // Skip extension pages
    if (window.location.protocol === 'chrome-extension:' || 
        window.location.protocol === 'moz-extension:') {
      return false;
    }

    // Skip data URLs
    if (window.location.protocol === 'data:') {
      return false;
    }

    // Skip about pages
    if (window.location.href.startsWith('about:')) {
      return false;
    }

    // Support HTTP/HTTPS and file:// for testing
    return window.location.protocol === 'http:' || 
           window.location.protocol === 'https:' || 
           window.location.protocol === 'file:';
  }

  /**
   * Đăng ký event listeners
   */
  private dang_ky_listeners(): void {
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      this.xu_ly_keyboard_shortcuts(event);
    });

    // Page navigation changes
    window.addEventListener('popstate', () => {
      this.xu_ly_navigation_change();
    });

    // DOM mutations for SPA detection
    const observer = new MutationObserver((mutations) => {
      this.xu_ly_dom_mutations(mutations);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });

    console.log('[ContentScript] Event listeners đăng ký thành công');
  }

  /**
   * Xử lý keyboard shortcuts
   */
  private xu_ly_keyboard_shortcuts(event: KeyboardEvent): void {
    // Ctrl/Cmd + Shift + N = Quick capture
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'N') {
      event.preventDefault();
      this.bat_dau_quick_capture();
    }

    // Ctrl/Cmd + Shift + S = Multi-select mode
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
      event.preventDefault();
      this.bat_dau_multi_select();
    }

    // Escape = Cancel selection
    if (event.key === 'Escape') {
      this.huy_selection();
    }
  }

  /**
   * Xử lý navigation changes (SPA support)
   */
  private xu_ly_navigation_change(): void {
    console.log('[ContentScript] Navigation change detected:', window.location.href);
    // Reset selection state
    this.chon_phan_tu.reset_selection();
  }

  /**
   * Xử lý DOM mutations
   */
  private xu_ly_dom_mutations(mutations: MutationRecord[]): void {
    // Check for significant content changes
    const co_thay_doi_quan_trong = mutations.some(mutation => 
      mutation.type === 'childList' && 
      mutation.addedNodes.length > 0 &&
      Array.from(mutation.addedNodes).some(node => 
        node.nodeType === Node.ELEMENT_NODE &&
        (node as Element).tagName !== 'SCRIPT' &&
        (node as Element).tagName !== 'STYLE'
      )
    );

    if (co_thay_doi_quan_trong) {
      // Debounce để tránh quá nhiều updates
      this.debounce_content_change();
    }
  }

  private debounce_timer: NodeJS.Timeout | null = null;
  
  /**
   * Debounce content changes
   */
  private debounce_content_change(): void {
    if (this.debounce_timer) {
      clearTimeout(this.debounce_timer);
    }

    this.debounce_timer = setTimeout(() => {
      console.log('[ContentScript] Content thay đổi đáng kể, refresh extraction cache');
      this.trich_xuat_noi_dung.lam_moi_cache();
    }, 1000);
  }

  /**
   * Bắt đầu quick capture mode
   */
  private async bat_dau_quick_capture(): Promise<void> {
    try {
      console.log('[ContentScript] 🚀 Bắt đầu quick capture');
      const ket_qua = await this.trich_xuat_noi_dung.trich_xuat_toan_bo_trang();
      
      // Send to background for processing
      const response = await chrome.runtime.sendMessage({
        action: 'LUU_NOI_DUNG_NOTION',
        data: ket_qua,
        source: 'quick_capture'
      });

      if (response?.success) {
        this.hien_thi_thong_bao_thanh_cong('Đã lưu toàn bộ trang vào Notion!');
      } else {
        throw new Error(response?.error || 'Không thể lưu vào Notion');
      }
    } catch (error) {
      console.error('[ContentScript] Lỗi quick capture:', error);
      this.hien_thi_thong_bao_loi('Lỗi khi lưu trang: ' + (error as Error).message);
    }
  }

  /**
   * Bắt đầu multi-select mode
   */
  private bat_dau_multi_select(): void {
    console.log('[ContentScript] 🎯 Bắt đầu multi-select mode');
    this.chon_phan_tu.bat_dau_selection_mode();
  }

  /**
   * Hủy selection
   */
  private huy_selection(): void {
    this.chon_phan_tu.huy_selection();
  }

  /**
   * Thông báo background script ready
   */
  private thong_bao_background_ready(): void {
    chrome.runtime.sendMessage({
      action: 'CONTENT_SCRIPT_READY',
      url: window.location.href,
      title: document.title,
      timestamp: Date.now()
    }).catch(error => {
      console.log('[ContentScript] Background script không phản hồi:', error);
    });
  }

  /**
   * Hiển thị thông báo thành công
   */
  private hien_thi_thong_bao_thanh_cong(message: string): void {
    this.hien_thi_toast(message, 'success');
  }

  /**
   * Hiển thị thông báo lỗi
   */
  private hien_thi_thong_bao_loi(message: string): void {
    this.hien_thi_toast(message, 'error');
  }

  /**
   * Hiển thị toast notification
   */
  private hien_thi_toast(message: string, type: 'success' | 'error' | 'info'): void {
    // Tạo toast element
    const toast = document.createElement('div');
    toast.className = `copy-to-notion-toast copy-to-notion-toast--${type}`;
    toast.textContent = message;

    // Styles
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 16px',
      borderRadius: '6px',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '999999',
      opacity: '0',
      transform: 'translateY(-10px)',
      transition: 'all 0.3s ease',
      backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'
    });

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    // Auto remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Cleanup when page unloads
   */
  cleanup(): void {
    this.chon_phan_tu?.cleanup();
    this.xu_ly_tin_nhan?.cleanup();
    this.da_khoi_tao = false;
  }
}

// Initialize content script
const contentScriptManager = new ContentScriptManager();

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    contentScriptManager.khoi_tao();
  });
} else {
  contentScriptManager.khoi_tao();
}

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  contentScriptManager.cleanup();
});

// Export for debugging
(window as any).copyToNotionDebug = {
  contentScriptManager,
  reinitialize: () => contentScriptManager.khoi_tao()
};

console.log('[Copy To Notion] 🎯 Content script loaded successfully');
