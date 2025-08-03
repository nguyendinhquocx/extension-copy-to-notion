/**
 * Element Selection Service
 * Quản lý selection elements với visual feedback
 */

/**
 * Interface cho selected element
 */
interface PhanTuDaChon {
  element: Element;
  index: number;
  rect: DOMRect;
  selector: string;
  noi_dung: string;
}

/**
 * Service chọn phần tử với visual feedback
 */
export class ChonPhanTu {
  private is_selection_mode = false;
  private selected_elements: PhanTuDaChon[] = [];
  private highlight_overlay: HTMLElement | null = null;
  private selection_counter = 0;
  // Current hover element (for reference but not actively used)
  private _hover_element: Element | null = null;
  
  // Event listeners references for cleanup
  private bound_mouse_move: ((e: MouseEvent) => void) | null = null;
  private bound_mouse_click: ((e: MouseEvent) => void) | null = null;
  private bound_key_press: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    this.bound_mouse_move = this.xu_ly_mouse_move.bind(this);
    this.bound_mouse_click = this.xu_ly_mouse_click.bind(this);
    this.bound_key_press = this.xu_ly_key_press.bind(this);
  }

  /**
   * Khởi tạo service
   */
  async khoi_tao(): Promise<void> {
    console.log('[ChonPhanTu] Service khởi tạo thành công');
  }

  /**
   * Bắt đầu selection mode
   */
  bat_dau_selection_mode(): void {
    if (this.is_selection_mode) return;

    this.is_selection_mode = true;
    this.selected_elements = [];
    this.selection_counter = 0;

    // Create overlay for highlighting
    this.tao_highlight_overlay();

    // Add event listeners
    document.addEventListener('mousemove', this.bound_mouse_move!, true);
    document.addEventListener('click', this.bound_mouse_click!, true);
    document.addEventListener('keydown', this.bound_key_press!, true);

    // Show instruction toast
    this.hien_thi_huong_dan();

    console.log('[ChonPhanTu] 🎯 Selection mode bắt đầu');
  }

  /**
   * Hủy selection mode
   */
  huy_selection(): void {
    if (!this.is_selection_mode) return;

    this.is_selection_mode = false;
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.bound_mouse_move!, true);
    document.removeEventListener('click', this.bound_mouse_click!, true);
    document.removeEventListener('keydown', this.bound_key_press!, true);

    // Clear highlights
    this.xoa_tat_ca_highlights();
    this.remove_highlight_overlay();

    console.log('[ChonPhanTu] Selection mode đã hủy');
  }

  /**
   * Reset selection
   */
  reset_selection(): void {
    this.selected_elements = [];
    this.selection_counter = 0;
    this.xoa_tat_ca_highlights();
  }

  /**
   * Tạo highlight overlay
   */
  private tao_highlight_overlay(): void {
    this.highlight_overlay = document.createElement('div');
    this.highlight_overlay.className = 'copy-to-notion-highlight-overlay';
    
    Object.assign(this.highlight_overlay.style, {
      position: 'absolute',
      background: 'rgba(59, 130, 246, 0.2)',
      border: '2px solid #3b82f6',
      borderRadius: '4px',
      pointerEvents: 'none',
      zIndex: '999998',
      display: 'none',
      transition: 'all 0.1s ease'
    });

    document.body.appendChild(this.highlight_overlay);
  }

  /**
   * Remove highlight overlay
   */
  private remove_highlight_overlay(): void {
    if (this.highlight_overlay && this.highlight_overlay.parentNode) {
      this.highlight_overlay.parentNode.removeChild(this.highlight_overlay);
      this.highlight_overlay = null;
    }
  }

  /**
   * Xử lý mouse move
   */
  private xu_ly_mouse_move(event: MouseEvent): void {
    if (!this.is_selection_mode || !this.highlight_overlay) return;

    const element = document.elementFromPoint(event.clientX, event.clientY);
    if (!element || this.la_element_extension(element)) {
      this.highlight_overlay.style.display = 'none';
      return;
    }

    // Check if element is suitable for selection
    if (!this.kiem_tra_element_hop_le(element)) {
      this.highlight_overlay.style.display = 'none';
      return;
    }

    this._hover_element = element;
    this.cap_nhat_highlight_position(element);
  }

  /**
   * Xử lý mouse click
   */
  private xu_ly_mouse_click(event: MouseEvent): void {
    if (!this.is_selection_mode) return;

    event.preventDefault();
    event.stopPropagation();

    const element = event.target as Element;
    if (!element || this.la_element_extension(element)) return;

    if (!this.kiem_tra_element_hop_le(element)) {
      console.log('[ChonPhanTu] Element không hợp lệ cho selection');
      return;
    }

    // Check if already selected
    const da_chon = this.selected_elements.find(item => item.element === element);
    if (da_chon) {
      this.bo_chon_element(da_chon);
    } else {
      this.chon_element(element);
    }
  }

  /**
   * Xử lý key press
   */
  private xu_ly_key_press(event: KeyboardEvent): void {
    if (!this.is_selection_mode) return;

    switch (event.key) {
      case 'Escape':
        this.huy_selection();
        break;
      case 'Enter':
        if (this.selected_elements.length > 0) {
          this.hoan_thanh_selection();
        }
        break;
      case 'Backspace':
      case 'Delete':
        if (this.selected_elements.length > 0) {
          const last_item = this.selected_elements[this.selected_elements.length - 1];
          this.bo_chon_element(last_item);
        }
        break;
    }
  }

  /**
   * Chọn element
   */
  private chon_element(element: Element): void {
    const rect = element.getBoundingClientRect();
    const selector = this.tao_css_selector(element);
    const noi_dung = this.lay_noi_dung_element(element);

    const selected_item: PhanTuDaChon = {
      element,
      index: ++this.selection_counter,
      rect,
      selector,
      noi_dung
    };

    this.selected_elements.push(selected_item);
    this.them_highlight_cho_element(element, selected_item.index);

    console.log(`[ChonPhanTu] ✅ Đã chọn element ${selected_item.index}:`, selector);
    this.hien_thi_selection_count();
  }

  /**
   * Bỏ chọn element
   */
  private bo_chon_element(item: PhanTuDaChon): void {
    const index = this.selected_elements.indexOf(item);
    if (index > -1) {
      this.selected_elements.splice(index, 1);
      this.xoa_highlight_element(item.element);
      console.log(`[ChonPhanTu] ❌ Đã bỏ chọn element ${item.index}`);
      this.hien_thi_selection_count();
    }
  }

  /**
   * Hoàn thành selection
   */
  private async hoan_thanh_selection(): Promise<void> {
    console.log(`[ChonPhanTu] 🎉 Hoàn thành selection với ${this.selected_elements.length} elements`);
    
    // Extract content from selected elements
    const extracted_content = this.selected_elements.map(item => ({
      selector: item.selector,
      content: item.noi_dung,
      index: item.index
    }));

    // Send to background for processing
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'LUU_MULTI_SELECT_NOTION',
        data: {
          url: window.location.href,
          title: document.title,
          selected_content: extracted_content,
          total_elements: this.selected_elements.length
        },
        source: 'multi_select'
      });

      if (response?.success) {
        this.hien_thi_toast('Đã lưu các phần tử đã chọn vào Notion!', 'success');
      } else {
        throw new Error(response?.error || 'Không thể lưu vào Notion');
      }
    } catch (error) {
      console.error('[ChonPhanTu] Lỗi lưu multi-select:', error);
      this.hien_thi_toast('Lỗi khi lưu: ' + (error as Error).message, 'error');
    }

    this.huy_selection();
  }

  /**
   * Kiểm tra element có hợp lệ cho selection không
   */
  private kiem_tra_element_hop_le(element: Element): boolean {
    // Skip extension elements
    if (this.la_element_extension(element)) return false;

    // Skip script and style tags
    const tag_name = element.tagName.toLowerCase();
    if (['script', 'style', 'noscript', 'meta', 'link', 'title'].includes(tag_name)) {
      return false;
    }

    // Element must have some content or be meaningful
    const has_text = element.textContent?.trim().length || 0 > 0;
    const has_meaningful_children = element.children.length > 0;
    const is_interactive = ['button', 'a', 'input', 'select', 'textarea'].includes(tag_name);

    return Boolean(has_text || has_meaningful_children || is_interactive);
  }

  /**
   * Kiểm tra có phải element của extension không
   */
  private la_element_extension(element: Element): boolean {
    // Check class names
    const class_name = element.className;
    if (typeof class_name === 'string' && class_name.includes('copy-to-notion')) {
      return true;
    }

    // Check parents
    let parent = element.parentElement;
    while (parent) {
      const parent_class = parent.className;
      if (typeof parent_class === 'string' && parent_class.includes('copy-to-notion')) {
        return true;
      }
      parent = parent.parentElement;
    }

    return false;
  }

  /**
   * Cập nhật highlight position
   */
  private cap_nhat_highlight_position(element: Element): void {
    if (!this.highlight_overlay) return;

    const rect = element.getBoundingClientRect();
    const scroll_x = window.pageXOffset || document.documentElement.scrollLeft;
    const scroll_y = window.pageYOffset || document.documentElement.scrollTop;

    Object.assign(this.highlight_overlay.style, {
      display: 'block',
      left: `${rect.left + scroll_x}px`,
      top: `${rect.top + scroll_y}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    });
  }

  /**
   * Thêm highlight cho element đã chọn
   */
  private them_highlight_cho_element(element: Element, index: number): void {
    const highlight = document.createElement('div');
    highlight.className = 'copy-to-notion-selected-highlight';
    highlight.dataset.selectionIndex = index.toString();

    const rect = element.getBoundingClientRect();
    const scroll_x = window.pageXOffset || document.documentElement.scrollLeft;
    const scroll_y = window.pageYOffset || document.documentElement.scrollTop;

    Object.assign(highlight.style, {
      position: 'absolute',
      left: `${rect.left + scroll_x}px`,
      top: `${rect.top + scroll_y}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      background: 'rgba(16, 185, 129, 0.2)',
      border: '2px solid #10b981',
      borderRadius: '4px',
      pointerEvents: 'none',
      zIndex: '999997'
    });

    // Add number badge
    const badge = document.createElement('div');
    badge.textContent = index.toString();
    Object.assign(badge.style, {
      position: 'absolute',
      top: '-10px',
      left: '-10px',
      width: '20px',
      height: '20px',
      background: '#10b981',
      color: 'white',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    });

    highlight.appendChild(badge);
    document.body.appendChild(highlight);

    // Store reference on element for cleanup
    (element as any)._copyToNotionHighlight = highlight;
  }

  /**
   * Xóa highlight element
   */
  private xoa_highlight_element(element: Element): void {
    const highlight = (element as any)._copyToNotionHighlight;
    if (highlight && highlight.parentNode) {
      highlight.parentNode.removeChild(highlight);
      delete (element as any)._copyToNotionHighlight;
    }
  }

  /**
   * Xóa tất cả highlights
   */
  private xoa_tat_ca_highlights(): void {
    this.selected_elements.forEach(item => {
      this.xoa_highlight_element(item.element);
    });

    // Clean up any remaining highlights
    const highlights = document.querySelectorAll('.copy-to-notion-selected-highlight');
    highlights.forEach(highlight => {
      if (highlight.parentNode) {
        highlight.parentNode.removeChild(highlight);
      }
    });
  }

  /**
   * Tạo CSS selector cho element
   */
  private tao_css_selector(element: Element): string {
    // Use ID if available
    if (element.id) {
      return `#${element.id}`;
    }

    // Use unique class combination
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        const class_selector = '.' + classes.join('.');
        if (document.querySelectorAll(class_selector).length === 1) {
          return class_selector;
        }
      }
    }

    // Build path-based selector
    const path: string[] = [];
    let current: Element | null = element;

    while (current && current !== document.body) {
      const tag = current.tagName.toLowerCase();
      const siblings = Array.from(current.parentElement?.children || [])
        .filter(el => el.tagName.toLowerCase() === tag);
      
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        path.unshift(`${tag}:nth-of-type(${index})`);
      } else {
        path.unshift(tag);
      }

      current = current.parentElement;
    }

    return path.join(' > ');
  }

  /**
   * Lấy nội dung element
   */
  private lay_noi_dung_element(element: Element): string {
    // For input elements
    if (element.tagName.toLowerCase() === 'input') {
      return (element as HTMLInputElement).value || '';
    }

    // For text areas
    if (element.tagName.toLowerCase() === 'textarea') {
      return (element as HTMLTextAreaElement).value || '';
    }

    // For other elements, get text content but clean it up
    const text = element.textContent || '';
    return text.trim().replace(/\s+/g, ' ').substring(0, 200);
  }

  /**
   * Hiển thị hướng dẫn
   */
  private hien_thi_huong_dan(): void {
    this.hien_thi_toast('🎯 Click để chọn elements | Enter để hoàn thành | Esc để hủy', 'info');
  }

  /**
   * Hiển thị số lượng đã chọn
   */
  private hien_thi_selection_count(): void {
    if (this.selected_elements.length > 0) {
      this.hien_thi_toast(`✅ Đã chọn ${this.selected_elements.length} phần tử`, 'info');
    }
  }

  /**
   * Hiển thị toast
   */
  private hien_thi_toast(message: string, type: 'success' | 'error' | 'info'): void {
    // Remove existing toast
    const existing = document.querySelector('.copy-to-notion-selection-toast');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    const toast = document.createElement('div');
    toast.className = 'copy-to-notion-selection-toast';
    toast.textContent = message;

    Object.assign(toast.style, {
      position: 'fixed',
      top: '60px',
      right: '20px',
      padding: '8px 12px',
      borderRadius: '6px',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '13px',
      fontWeight: '500',
      zIndex: '999999',
      backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
      maxWidth: '300px'
    });

    document.body.appendChild(toast);

    // Auto remove for info messages
    if (type === 'info') {
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 2000);
    } else {
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 3000);
    }
  }

  /**
   * Get selected elements
   */
  lay_selected_elements(): PhanTuDaChon[] {
    return [...this.selected_elements];
  }

  /**
   * Check if in selection mode
   */
  dang_trong_selection_mode(): boolean {
    return this.is_selection_mode;
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.huy_selection();
  }

  /**
   * Lấy hover element hiện tại
   */
  lay_hover_element(): Element | null {
    return this._hover_element;
  }
}
