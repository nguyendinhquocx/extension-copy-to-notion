/**
 * Text Extraction Utilities
 * Tiện ích trích xuất text từ các phần tử HTML
 */

import { 
  TuyChonTrichXuat, 
  KetQuaTrichXuat,
  BoLocNoiDung,
  MetaDataTrichXuat,
  DinhDangOutput
} from '../types/trang-web';

/**
 * Trích xuất text từ phần tử HTML
 */
export class TrichXuatText {
  private readonly bo_loc_mac_dinh: BoLocNoiDung = {
    loai_bo_quang_cao: true,
    loai_bo_navigation: true,
    loai_bo_footer: true,
    loai_bo_sidebar: true,
    loai_bo_comments: true,
    loai_bo_social_buttons: true,
    loai_bo_popup_overlay: true,
    chi_giu_noi_dung_chinh: true,
    custom_selectors_loai_bo: [
      '[class*="ad"]',
      '[class*="advertisement"]',
      '[id*="ad"]',
      '.popup',
      '.modal',
      '.overlay',
      '[class*="share"]',
      '.sidebar',
      '.navigation',
      '.nav',
      '.menu',
      '.footer',
      '.header',
      '.comments',
      '.comment'
    ],
    custom_selectors_giu_lai: [
      'main',
      'article',
      '.content',
      '.post',
      '.entry',
      '[role="main"]'
    ]
  };

  /**
   * Trích xuất nội dung từ phần tử được chọn
   */
  async trichXuatTuPhanTu(
    element: HTMLElement, 
    tuy_chon?: Partial<TuyChonTrichXuat>
  ): Promise<KetQuaTrichXuat> {
    const bat_dau = performance.now();
    const cau_hinh = this.ketHopTuyChon(tuy_chon);
    
    try {
      // Làm sạch phần tử trước khi trích xuất
      const phan_tu_da_lam_sach = await this.lamSachPhanTu(element, cau_hinh);
      
      // Trích xuất nội dung theo định dạng
      const noi_dung = await this.trichXuatTheoDefinhdang(phan_tu_da_lam_sach, cau_hinh);
      
      // Tạo metadata
      const metadata = await this.taoMetadata(element, phan_tu_da_lam_sach, cau_hinh);
      
      const thoi_gian_xu_ly = performance.now() - bat_dau;
      
      return {
        url: window.location.href,
        title: document.title,
        noi_dung,
        meta_data: metadata as Record<string, any>,
        thoi_gian_trich_xuat: new Date(),
        loai_trang: 'general',
        ngon_ngu: document.documentElement.lang || 'en',
        do_tin_cay: 0.8,
        thanh_cong: true,
        metadata,
        thoi_gian_xu_ly,
        so_phan_tu_da_xu_ly: this.demSoPhanTu(phan_tu_da_lam_sach)
      };
    } catch (error) {
      return {
        url: window.location.href,
        title: document.title,
        noi_dung: '',
        meta_data: {} as Record<string, any>,
        thoi_gian_trich_xuat: new Date(),
        loai_trang: 'general',
        ngon_ngu: document.documentElement.lang || 'en',
        do_tin_cay: 0.1,
        thanh_cong: false,
        metadata: await this.taoMetadataLoi(element),
        loi: error instanceof Error ? error.message : 'Lỗi không xác định',
        thoi_gian_xu_ly: performance.now() - bat_dau,
        so_phan_tu_da_xu_ly: 0
      };
    }
  }

  /**
   * Trích xuất nội dung từ nhiều phần tử
   */
  async trichXuatTuNhieuPhanTu(
    elements: HTMLElement[], 
    tuy_chon?: Partial<TuyChonTrichXuat>
  ): Promise<KetQuaTrichXuat> {
    const cau_hinh = this.ketHopTuyChon(tuy_chon);
    const ket_qua_cac_phan_tu: string[] = [];
    let tong_so_phan_tu = 0;
    const cac_canh_bao: string[] = [];
    
    for (const element of elements) {
      try {
        const ket_qua = await this.trichXuatTuPhanTu(element, cau_hinh);
        if (ket_qua.thanh_cong) {
          ket_qua_cac_phan_tu.push(ket_qua.noi_dung);
          tong_so_phan_tu += ket_qua.so_phan_tu_da_xu_ly || 0;
        } else {
          cac_canh_bao.push(`Lỗi trích xuất phần tử: ${ket_qua.loi}`);
        }
      } catch (error) {
        cac_canh_bao.push(`Lỗi xử lý phần tử: ${error}`);
      }
    }

    const noi_dung_hop_nhat = ket_qua_cac_phan_tu.join('\n\n');
    
    return {
      url: window.location.href,
      title: document.title,
      noi_dung: noi_dung_hop_nhat,
      meta_data: await this.taoMetadataChoNhieuPhanTu(elements, noi_dung_hop_nhat) as Record<string, any>,
      thoi_gian_trich_xuat: new Date(),
      loai_trang: 'multiple_elements',
      ngon_ngu: document.documentElement.lang || 'en',
      do_tin_cay: 0.8,
      thanh_cong: ket_qua_cac_phan_tu.length > 0,
      metadata: await this.taoMetadataChoNhieuPhanTu(elements, noi_dung_hop_nhat),
      canh_bao: cac_canh_bao.length > 0 ? cac_canh_bao : undefined,
      thoi_gian_xu_ly: 0, // Will be calculated
      so_phan_tu_da_xu_ly: tong_so_phan_tu
    };
  }

  /**
   * Tự động phát hiện và trích xuất nội dung chính
   */
  async trichXuatNoiDungChinh(
    document: Document, 
    tuy_chon?: Partial<TuyChonTrichXuat>
  ): Promise<KetQuaTrichXuat> {
    const cau_hinh = this.ketHopTuyChon(tuy_chon);
    
    // Thử các selector phổ biến cho nội dung chính
    const cac_selector_chinh = [
      'main',
      'article',
      '[role="main"]',
      '.main-content',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '#content',
      '#main'
    ];

    for (const selector of cac_selector_chinh) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element && this.laPhanTuHopLe(element)) {
        return await this.trichXuatTuPhanTu(element, cau_hinh);
      }
    }

    // Nếu không tìm thấy, sử dụng body
    const body = document.body;
    if (body) {
      return await this.trichXuatTuPhanTu(body, cau_hinh);
    }

    throw new Error('Không thể tìm thấy nội dung để trích xuất');
  }

  /**
   * Làm sạch phần tử HTML
   */
  private async lamSachPhanTu(
    element: HTMLElement, 
    cau_hinh: TuyChonTrichXuat
  ): Promise<HTMLElement> {
    const clone = element.cloneNode(true) as HTMLElement;
    
    if (cau_hinh.lam_sach_html) {
      // Loại bỏ các phần tử không mong muốn
      this.loaiBoPhanntuKhongMongMuon(clone, cau_hinh);
      
      // Làm sạch thuộc tính
      this.lamSachThuocTinh(clone);
      
      // Loại bỏ text trống
      this.loaiBoTextTrong(clone);
    }

    return clone;
  }

  /**
   * Loại bỏ các phần tử không mong muốn
   */
  private loaiBoPhanntuKhongMongMuon(element: HTMLElement, cau_hinh: TuyChonTrichXuat): void {
    const bo_loc = { ...this.bo_loc_mac_dinh, ...cau_hinh };
    
    // Loại bỏ theo custom selectors
    if (cau_hinh.loai_tru_css_selector) {
      cau_hinh.loai_tru_css_selector.forEach(selector => {
        element.querySelectorAll(selector).forEach(el => el.remove());
      });
    }

    // Loại bỏ các thẻ thường không mong muốn
    const cac_tag_loai_bo = ['script', 'style', 'noscript', 'iframe', 'embed', 'object'];
    cac_tag_loai_bo.forEach(tag => {
      element.querySelectorAll(tag).forEach(el => el.remove());
    });

    // Loại bỏ theo class/id patterns
    if (bo_loc.loai_bo_quang_cao) {
      bo_loc.custom_selectors_loai_bo.forEach(selector => {
        element.querySelectorAll(selector).forEach(el => el.remove());
      });
    }
  }

  /**
   * Làm sạch thuộc tính HTML
   */
  private lamSachThuocTinh(element: HTMLElement): void {
    const cac_thuoc_tinh_giu_lai = ['href', 'src', 'alt', 'title'];
    
    this.duquyElement(element, (el) => {
      if (el instanceof HTMLElement) {
        const attributes = Array.from(el.attributes);
        attributes.forEach(attr => {
          if (!cac_thuoc_tinh_giu_lai.includes(attr.name)) {
            el.removeAttribute(attr.name);
          }
        });
      }
    });
  }

  /**
   * Loại bỏ text node trống
   */
  private loaiBoTextTrong(element: HTMLElement): void {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    const cac_node_can_xoa: Node[] = [];
    let node;
    
    while (node = walker.nextNode()) {
      if (node.textContent?.trim() === '') {
        cac_node_can_xoa.push(node);
      }
    }

    cac_node_can_xoa.forEach(node => {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });
  }

  /**
   * Trích xuất theo định dạng
   */
  private async trichXuatTheoDefinhdang(
    element: HTMLElement, 
    cau_hinh: TuyChonTrichXuat
  ): Promise<string> {
    switch (cau_hinh.dinh_dang_output) {
      case DinhDangOutput.PLAIN_TEXT:
        return this.trichXuatPlainText(element, cau_hinh);
      
      case DinhDangOutput.HTML:
        return this.trichXuatHTML(element, cau_hinh);
      
      case DinhDangOutput.MARKDOWN:
        return this.trichXuatMarkdown(element, cau_hinh);
      
      case DinhDangOutput.JSON:
        return this.trichXuatJSON(element, cau_hinh);
      
      default:
        return this.trichXuatPlainText(element, cau_hinh);
    }
  }

  /**
   * Trích xuất plain text
   */
  private trichXuatPlainText(element: HTMLElement, cau_hinh: TuyChonTrichXuat): string {
    let text = element.textContent || '';
    
    // Làm sạch và format text
    text = text.replace(/\s+/g, ' ').trim();
    
    // Giới hạn ký tự nếu có
    if (cau_hinh.gioi_han_ky_tu && text.length > cau_hinh.gioi_han_ky_tu) {
      text = text.substring(0, cau_hinh.gioi_han_ky_tu) + '...';
    }
    
    return text;
  }

  /**
   * Trích xuất HTML
   */
  private trichXuatHTML(element: HTMLElement, _cau_hinh: TuyChonTrichXuat): string {
    let html = element.innerHTML;
    
    // Loại bỏ inline styles nếu không cần
    html = html.replace(/style="[^"]*"/gi, '');
    
    return html;
  }

  /**
   * Trích xuất Markdown
   */
  private trichXuatMarkdown(element: HTMLElement, _cau_hinh: TuyChonTrichXuat): string {
    // Chuyển đổi HTML sang Markdown
    return this.htmlSangMarkdown(element);
  }

  /**
   * Trích xuất JSON
   */
  private trichXuatJSON(element: HTMLElement, cau_hinh: TuyChonTrichXuat): string {
    const data = {
      tag: element.tagName.toLowerCase(),
      text: this.trichXuatPlainText(element, cau_hinh),
      html: element.innerHTML,
      attributes: this.layThuocTinh(element),
      children: this.layThongTinChildren(element)
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Chuyển đổi HTML sang Markdown (simplified)
   */
  private htmlSangMarkdown(element: HTMLElement): string {
    let markdown = '';
    
    this.duquyElement(element, (el) => {
      if (el instanceof HTMLElement) {
        const tag = el.tagName.toLowerCase();
        
        switch (tag) {
          case 'h1':
            markdown += `# ${el.textContent?.trim()}\n\n`;
            break;
          case 'h2':
            markdown += `## ${el.textContent?.trim()}\n\n`;
            break;
          case 'h3':
            markdown += `### ${el.textContent?.trim()}\n\n`;
            break;
          case 'p':
            markdown += `${el.textContent?.trim()}\n\n`;
            break;
          case 'strong':
          case 'b':
            markdown += `**${el.textContent?.trim()}**`;
            break;
          case 'em':
          case 'i':
            markdown += `*${el.textContent?.trim()}*`;
            break;
          case 'a':
            const href = el.getAttribute('href');
            markdown += `[${el.textContent?.trim()}](${href})`;
            break;
          case 'code':
            markdown += `\`${el.textContent?.trim()}\``;
            break;
          case 'pre':
            markdown += `\n\`\`\`\n${el.textContent?.trim()}\n\`\`\`\n\n`;
            break;
          case 'ul':
          case 'ol':
            // Handle lists
            break;
          case 'li':
            markdown += `- ${el.textContent?.trim()}\n`;
            break;
        }
      }
    });
    
    return markdown.trim();
  }

  /**
   * Đệ quy qua các element
   */
  private duquyElement(element: Element, callback: (el: Element) => void): void {
    callback(element);
    Array.from(element.children).forEach(child => {
      this.duquyElement(child, callback);
    });
  }

  /**
   * Lấy thuộc tính của element
   */
  private layThuocTinh(element: HTMLElement): Record<string, string> {
    const attributes: Record<string, string> = {};
    Array.from(element.attributes).forEach(attr => {
      attributes[attr.name] = attr.value;
    });
    return attributes;
  }

  /**
   * Lấy thông tin children
   */
  private layThongTinChildren(element: HTMLElement): any[] {
    return Array.from(element.children).map(child => ({
      tag: child.tagName.toLowerCase(),
      text: child.textContent?.trim(),
      hasChildren: child.children.length > 0
    }));
  }

  /**
   * Tạo metadata cho kết quả trích xuất
   */
  private async taoMetadata(
    element_goc: HTMLElement,
    element_da_xu_ly: HTMLElement,
    cau_hinh: TuyChonTrichXuat
  ): Promise<MetaDataTrichXuat> {
    const so_ky_tu_goc = element_goc.textContent?.length || 0;
    const so_ky_tu_sau_lam_sach = element_da_xu_ly.textContent?.length || 0;
    
    return {
      so_ky_tu_goc,
      so_ky_tu_sau_lam_sach,
      so_hinh_anh_tim_thay: element_da_xu_ly.querySelectorAll('img').length,
      so_lien_ket_tim_thay: element_da_xu_ly.querySelectorAll('a').length,
      ngon_ngu_phat_hien: this.phatHienNgonNgu(element_da_xu_ly.textContent || ''),
      do_tin_cay_noi_dung: this.tinhDoTinCay(element_da_xu_ly),
      cac_selector_da_dung: cau_hinh.bo_loc_css_selector || [],
      thoi_gian_doc_uoc_tinh: Math.ceil(so_ky_tu_sau_lam_sach / 1000) // ~1000 ký tự/phút
    };
  }

  /**
   * Tạo metadata cho trường hợp lỗi
   */
  private async taoMetadataLoi(element: HTMLElement): Promise<MetaDataTrichXuat> {
    return {
      so_ky_tu_goc: element.textContent?.length || 0,
      so_ky_tu_sau_lam_sach: 0,
      so_hinh_anh_tim_thay: 0,
      so_lien_ket_tim_thay: 0,
      ngon_ngu_phat_hien: 'unknown',
      do_tin_cay_noi_dung: 0,
      cac_selector_da_dung: [],
      thoi_gian_doc_uoc_tinh: 0
    };
  }

  /**
   * Tạo metadata cho nhiều phần tử
   */
  private async taoMetadataChoNhieuPhanTu(
    elements: HTMLElement[],
    noi_dung_hop_nhat: string
  ): Promise<MetaDataTrichXuat> {
    const tong_ky_tu_goc = elements.reduce((sum, el) => sum + (el.textContent?.length || 0), 0);
    
    return {
      so_ky_tu_goc: tong_ky_tu_goc,
      so_ky_tu_sau_lam_sach: noi_dung_hop_nhat.length,
      so_hinh_anh_tim_thay: elements.reduce((sum, el) => sum + el.querySelectorAll('img').length, 0),
      so_lien_ket_tim_thay: elements.reduce((sum, el) => sum + el.querySelectorAll('a').length, 0),
      ngon_ngu_phat_hien: this.phatHienNgonNgu(noi_dung_hop_nhat),
      do_tin_cay_noi_dung: this.tinhDoTinCayChoNhieuPhanTu(elements),
      cac_selector_da_dung: [],
      thoi_gian_doc_uoc_tinh: Math.ceil(noi_dung_hop_nhat.length / 1000)
    };
  }

  /**
   * Phát hiện ngôn ngữ từ text
   */
  private phatHienNgonNgu(text: string): string {
    // Simplified language detection
    const vietnamese_chars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    
    if (vietnamese_chars.test(text)) {
      return 'vi';
    }
    
    return 'en'; // default to English
  }

  /**
   * Tính độ tin cậy của nội dung
   */
  private tinhDoTinCay(element: HTMLElement): number {
    const text = element.textContent || '';
    let score = 0.5; // base score
    
    // Có đủ nội dung text
    if (text.length > 100) score += 0.2;
    if (text.length > 500) score += 0.1;
    
    // Có cấu trúc hợp lý
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
    if (headings > 0) score += 0.1;
    
    // Có đoạn văn
    const paragraphs = element.querySelectorAll('p').length;
    if (paragraphs > 0) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  /**
   * Tính độ tin cậy cho nhiều phần tử
   */
  private tinhDoTinCayChoNhieuPhanTu(elements: HTMLElement[]): number {
    if (elements.length === 0) return 0;
    
    const avg_score = elements.reduce((sum, el) => sum + this.tinhDoTinCay(el), 0) / elements.length;
    return avg_score;
  }

  /**
   * Đếm số phần tử trong element
   */
  private demSoPhanTu(element: HTMLElement): number {
    return element.querySelectorAll('*').length;
  }

  /**
   * Kiểm tra phần tử có hợp lệ không
   */
  private laPhanTuHopLe(element: HTMLElement): boolean {
    const text = element.textContent?.trim() || '';
    return text.length > 10; // At least 10 characters
  }

  /**
   * Kết hợp tùy chọn với mặc định
   */
  private ketHopTuyChon(tuy_chon?: Partial<TuyChonTrichXuat>): TuyChonTrichXuat {
    const mac_dinh: TuyChonTrichXuat = {
      bao_gom_hinh_anh: false,
      bao_gom_lien_ket: true,
      lam_sach_html: true,
      loai_bo_quang_cao: true,
      chi_lay_noi_dung_chinh: false,
      bao_gom_metadata: true,
      dinh_dang_output: DinhDangOutput.PLAIN_TEXT
    };
    
    return { ...mac_dinh, ...tuy_chon };
  }
}

/**
 * Utility functions để sử dụng trực tiếp
 */
export const trichXuatTextTuElement = async (
  element: HTMLElement, 
  tuy_chon?: Partial<TuyChonTrichXuat>
): Promise<KetQuaTrichXuat> => {
  const extractor = new TrichXuatText();
  return await extractor.trichXuatTuPhanTu(element, tuy_chon);
};

export const trichXuatNoiDungChinh = async (
  document: Document, 
  tuy_chon?: Partial<TuyChonTrichXuat>
): Promise<KetQuaTrichXuat> => {
  const extractor = new TrichXuatText();
  return await extractor.trichXuatNoiDungChinh(document, tuy_chon);
};
