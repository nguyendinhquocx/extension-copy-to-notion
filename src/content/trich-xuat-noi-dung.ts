/**
 * Content Extraction Service
 * Trích xuất nội dung từ trang web với algorithms thông minh
 */

import { KetQuaTrichXuat } from '../shared/types/trang-web';

/**
 * Interface cho content block
 */
interface ContentBlock {
  type: 'text' | 'heading' | 'list' | 'code' | 'quote' | 'image' | 'link';
  content: string;
  level?: number; // For headings
  attributes?: Record<string, string>; // For images, links
}

/**
 * Service trích xuất nội dung
 */
export class TrichXuatNoiDung {
  private content_cache: Map<string, KetQuaTrichXuat> = new Map();

  /**
   * Khởi tạo service
   */
  async khoi_tao(): Promise<void> {
    console.log('[TrichXuatNoiDung] Service khởi tạo thành công');
  }

  /**
   * Trích xuất toàn bộ trang
   */
  async trich_xuat_toan_bo_trang(): Promise<KetQuaTrichXuat> {
    const cache_key = 'full_page_' + window.location.href;
    
    if (this.content_cache.has(cache_key)) {
      console.log('[TrichXuatNoiDung] Sử dụng cached content');
      return this.content_cache.get(cache_key)!;
    }

    try {
      console.log('[TrichXuatNoiDung] 🚀 Bắt đầu trích xuất toàn bộ trang');

      const ket_qua: KetQuaTrichXuat = {
        url: window.location.href,
        title: this.lay_title_trang(),
        noi_dung: await this.trich_xuat_main_content(),
        meta_data: this.lay_metadata(),
        thoi_gian_trich_xuat: new Date(),
        loai_trang: this.nhan_dien_loai_trang(),
        ngon_ngu: this.phat_hien_ngon_ngu(),
        do_tin_cay: this.tinh_do_tin_cay()
      };

      this.content_cache.set(cache_key, ket_qua);
      console.log('[TrichXuatNoiDung] ✅ Hoàn thành trích xuất');
      
      return ket_qua;
    } catch (error) {
      console.error('[TrichXuatNoiDung] Lỗi trích xuất:', error);
      throw error;
    }
  }

  /**
   * Trích xuất nội dung từ elements cụ thể
   */
  async trich_xuat_tu_elements(elements: Element[]): Promise<KetQuaTrichXuat> {
    try {
      const noi_dung_blocks: ContentBlock[] = [];

      for (const element of elements) {
        const blocks = this.phan_tich_element(element);
        noi_dung_blocks.push(...blocks);
      }

      const ket_qua: KetQuaTrichXuat = {
        url: window.location.href,
        title: this.lay_title_trang(),
        noi_dung: this.chuyen_blocks_thanh_text(noi_dung_blocks),
        meta_data: this.lay_metadata(),
        thoi_gian_trich_xuat: new Date(),
        loai_trang: 'partial_selection',
        ngon_ngu: this.phat_hien_ngon_ngu(),
        do_tin_cay: 0.9 // High confidence for manual selection
      };

      return ket_qua;
    } catch (error) {
      console.error('[TrichXuatNoiDung] Lỗi trích xuất elements:', error);
      throw error;
    }
  }

  /**
   * Lấy title trang
   */
  private lay_title_trang(): string {
    // Try multiple sources for title
    const sources = [
      document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      document.querySelector('meta[name="twitter:title"]')?.getAttribute('content'),
      document.querySelector('h1')?.textContent,
      document.title
    ];

    for (const source of sources) {
      if (source && source.trim()) {
        return source.trim();
      }
    }

    return document.title || 'Untitled Page';
  }

  /**
   * Trích xuất main content sử dụng readability algorithm
   */
  private async trich_xuat_main_content(): Promise<string> {
    // Try to find main content container
    const main_container = this.tim_main_container();
    
    if (main_container) {
      const blocks = this.phan_tich_element(main_container);
      return this.chuyen_blocks_thanh_text(blocks);
    }

    // Fallback: analyze entire body
    const blocks = this.phan_tich_element(document.body);
    return this.chuyen_blocks_thanh_text(blocks);
  }

  /**
   * Tìm main content container
   */
  private tim_main_container(): Element | null {
    // Common main content selectors
    const selectors = [
      'main',
      '[role="main"]',
      'article',
      '.main-content',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '#main-content',
      '#content',
      '.container .content'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && this.kiem_tra_co_noi_dung_chinh(element)) {
        return element;
      }
    }

    // Use heuristics to find content
    return this.tim_container_bang_heuristics();
  }

  /**
   * Tìm container bằng heuristics
   */
  private tim_container_bang_heuristics(): Element | null {
    const candidates = Array.from(document.querySelectorAll('div, section, article'))
      .filter(el => this.kiem_tra_co_noi_dung_chinh(el))
      .map(el => ({
        element: el,
        score: this.tinh_diem_content_container(el)
      }))
      .sort((a, b) => b.score - a.score);

    return candidates[0]?.element || null;
  }

  /**
   * Kiểm tra element có nội dung chính không
   */
  private kiem_tra_co_noi_dung_chinh(element: Element): boolean {
    const text_content = element.textContent || '';
    const text_length = text_content.trim().length;
    
    // Must have substantial text
    if (text_length < 200) return false;

    // Check for meaningful structure
    const paragraphs = element.querySelectorAll('p').length;
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
    
    return paragraphs > 0 || headings > 0;
  }

  /**
   * Tính điểm cho content container
   */
  private tinh_diem_content_container(element: Element): number {
    let score = 0;
    const text_content = element.textContent || '';
    
    // Base score from text length
    score += Math.min(text_content.length / 100, 50);
    
    // Bonus for structural elements
    score += element.querySelectorAll('p').length * 2;
    score += element.querySelectorAll('h1, h2, h3').length * 3;
    score += element.querySelectorAll('h4, h5, h6').length * 1;
    score += element.querySelectorAll('li').length * 0.5;
    score += element.querySelectorAll('blockquote').length * 2;
    
    // Penalty for negative indicators
    score -= element.querySelectorAll('nav, footer, aside, .sidebar').length * 5;
    score -= element.querySelectorAll('script, style').length * 10;
    
    // Class/ID based scoring
    const class_id = (element.className + ' ' + element.id).toLowerCase();
    if (class_id.includes('content') || class_id.includes('main') || class_id.includes('article')) {
      score += 10;
    }
    if (class_id.includes('sidebar') || class_id.includes('nav') || class_id.includes('footer')) {
      score -= 10;
    }
    
    return score;
  }

  /**
   * Phân tích element thành content blocks
   */
  private phan_tich_element(element: Element): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    
    this.duyet_element_recursive(element, blocks);
    
    return this.lam_sach_blocks(blocks);
  }

  /**
   * Duyệt element recursively
   */
  private duyet_element_recursive(element: Element, blocks: ContentBlock[]): void {
    const tag_name = element.tagName.toLowerCase();
    
    // Skip unwanted elements
    if (this.nen_bo_qua_element(element)) {
      return;
    }

    switch (tag_name) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        this.xu_ly_heading(element, blocks);
        break;
        
      case 'p':
        this.xu_ly_paragraph(element, blocks);
        break;
        
      case 'ul':
      case 'ol':
        this.xu_ly_list(element, blocks);
        break;
        
      case 'blockquote':
        this.xu_ly_blockquote(element, blocks);
        break;
        
      case 'pre':
      case 'code':
        this.xu_ly_code(element, blocks);
        break;
        
      case 'img':
        this.xu_ly_image(element, blocks);
        break;
        
      case 'a':
        this.xu_ly_link(element, blocks);
        break;
        
      default:
        // Continue processing children
        Array.from(element.children).forEach(child => {
          this.duyet_element_recursive(child, blocks);
        });
        break;
    }
  }

  /**
   * Kiểm tra có nên bỏ qua element không
   */
  private nen_bo_qua_element(element: Element): boolean {
    const tag_name = element.tagName.toLowerCase();
    
    // Skip script, style, etc.
    if (['script', 'style', 'noscript', 'meta', 'link'].includes(tag_name)) {
      return true;
    }
    
    // Skip navigation, sidebar, footer
    const class_id = (element.className + ' ' + element.id).toLowerCase();
    const skip_patterns = ['nav', 'sidebar', 'footer', 'header', 'menu', 'advertisement', 'ad-'];
    
    return skip_patterns.some(pattern => class_id.includes(pattern));
  }

  /**
   * Xử lý heading
   */
  private xu_ly_heading(element: Element, blocks: ContentBlock[]): void {
    const level = parseInt(element.tagName.substring(1));
    const content = this.lay_text_sach(element);
    
    if (content.trim()) {
      blocks.push({
        type: 'heading',
        content: content.trim(),
        level
      });
    }
  }

  /**
   * Xử lý paragraph
   */
  private xu_ly_paragraph(element: Element, blocks: ContentBlock[]): void {
    const content = this.lay_text_sach(element);
    
    if (content.trim() && content.length > 10) {
      blocks.push({
        type: 'text',
        content: content.trim()
      });
    }
  }

  /**
   * Xử lý list
   */
  private xu_ly_list(element: Element, blocks: ContentBlock[]): void {
    const items = Array.from(element.querySelectorAll('li'))
      .map(li => this.lay_text_sach(li).trim())
      .filter(text => text.length > 0);
    
    if (items.length > 0) {
      const list_content = items.map(item => `• ${item}`).join('\n');
      blocks.push({
        type: 'list',
        content: list_content
      });
    }
  }

  /**
   * Xử lý blockquote
   */
  private xu_ly_blockquote(element: Element, blocks: ContentBlock[]): void {
    const content = this.lay_text_sach(element);
    
    if (content.trim()) {
      blocks.push({
        type: 'quote',
        content: content.trim()
      });
    }
  }

  /**
   * Xử lý code
   */
  private xu_ly_code(element: Element, blocks: ContentBlock[]): void {
    const content = element.textContent || '';
    
    if (content.trim()) {
      blocks.push({
        type: 'code',
        content: content
      });
    }
  }

  /**
   * Xử lý image
   */
  private xu_ly_image(element: Element, blocks: ContentBlock[]): void {
    const img = element as HTMLImageElement;
    const src = img.src;
    const alt = img.alt || '';
    
    if (src) {
      blocks.push({
        type: 'image',
        content: alt || 'Image',
        attributes: { src, alt }
      });
    }
  }

  /**
   * Xử lý link
   */
  private xu_ly_link(element: Element, blocks: ContentBlock[]): void {
    const link = element as HTMLAnchorElement;
    const href = link.href;
    const text = this.lay_text_sach(element);
    
    if (href && text.trim()) {
      blocks.push({
        type: 'link',
        content: text.trim(),
        attributes: { href }
      });
    }
  }

  /**
   * Lấy text sạch từ element
   */
  private lay_text_sach(element: Element): string {
    // Clone element để không ảnh hưởng DOM
    const clone = element.cloneNode(true) as Element;
    
    // Remove unwanted elements
    const unwanted = clone.querySelectorAll('script, style, noscript');
    unwanted.forEach(el => el.remove());
    
    // Get text content
    let text = clone.textContent || '';
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }

  /**
   * Làm sạch blocks
   */
  private lam_sach_blocks(blocks: ContentBlock[]): ContentBlock[] {
    return blocks
      .filter(block => block.content.trim().length > 0)
      .filter(block => {
        // Remove very short text blocks
        if (block.type === 'text' && block.content.length < 10) {
          return false;
        }
        return true;
      });
  }

  /**
   * Chuyển blocks thành text
   */
  private chuyen_blocks_thanh_text(blocks: ContentBlock[]): string {
    return blocks.map(block => {
      switch (block.type) {
        case 'heading':
          const hashes = '#'.repeat(block.level || 1);
          return `${hashes} ${block.content}`;
          
        case 'text':
          return block.content;
          
        case 'list':
          return block.content;
          
        case 'quote':
          return `> ${block.content}`;
          
        case 'code':
          return `\`\`\`\n${block.content}\n\`\`\``;
          
        case 'image':
          return `![${block.content}](${block.attributes?.src || ''})`;
          
        case 'link':
          return `[${block.content}](${block.attributes?.href || ''})`;
          
        default:
          return block.content;
      }
    }).join('\n\n');
  }

  /**
   * Lấy metadata
   */
  private lay_metadata(): Record<string, any> {
    const metadata: Record<string, any> = {};
    
    // Open Graph
    const og_title = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const og_description = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
    const og_image = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    
    if (og_title) metadata.og_title = og_title;
    if (og_description) metadata.og_description = og_description;
    if (og_image) metadata.og_image = og_image;
    
    // Twitter Card
    const twitter_title = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
    const twitter_description = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
    
    if (twitter_title) metadata.twitter_title = twitter_title;
    if (twitter_description) metadata.twitter_description = twitter_description;
    
    // Standard meta
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    const author = document.querySelector('meta[name="author"]')?.getAttribute('content');
    const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content');
    
    if (description) metadata.description = description;
    if (author) metadata.author = author;
    if (keywords) metadata.keywords = keywords;
    
    // Page info
    metadata.url = window.location.href;
    metadata.domain = window.location.hostname;
    metadata.path = window.location.pathname;
    
    return metadata;
  }

  /**
   * Nhận diện loại trang
   */
  private nhan_dien_loai_trang(): string {
    const url = window.location.href.toLowerCase();
    const title = document.title.toLowerCase();
    
    // Check for blog/article patterns
    if (url.includes('/blog/') || url.includes('/article/') || url.includes('/post/')) {
      return 'blog_post';
    }
    
    // Check for news patterns
    if (url.includes('/news/') || title.includes('news') || 
        document.querySelector('article[data-type="news"]')) {
      return 'news_article';
    }
    
    // Check for documentation
    if (url.includes('/docs/') || url.includes('/documentation/') || 
        title.includes('documentation') || title.includes('docs')) {
      return 'documentation';
    }
    
    // Check for e-commerce
    if (url.includes('/product/') || document.querySelector('.product, .item-detail')) {
      return 'product_page';
    }
    
    return 'general_page';
  }

  /**
   * Phát hiện ngôn ngữ
   */
  private phat_hien_ngon_ngu(): string {
    // Check HTML lang attribute
    const html_lang = document.documentElement.lang;
    if (html_lang) {
      return html_lang.toLowerCase();
    }
    
    // Check meta language
    const meta_lang = document.querySelector('meta[http-equiv="Content-Language"]')?.getAttribute('content');
    if (meta_lang) {
      return meta_lang.toLowerCase();
    }
    
    // Simple text-based detection
    const sample_text = document.body.textContent?.substring(0, 1000) || '';
    
    // Vietnamese detection
    const vietnamese_chars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    if (vietnamese_chars.test(sample_text)) {
      return 'vi';
    }
    
    return 'en'; // Default to English
  }

  /**
   * Tính độ tin cậy
   */
  private tinh_do_tin_cay(): number {
    let score = 0.5; // Base score
    
    // Có title
    if (document.title?.trim()) {
      score += 0.1;
    }
    
    // Có meta description
    if (document.querySelector('meta[name="description"]')) {
      score += 0.1;
    }
    
    // Có main content structure
    const has_main_structure = Boolean(
      document.querySelector('main, article, .content, .main-content')
    );
    if (has_main_structure) {
      score += 0.2;
    }
    
    // Có headings
    const headings = document.querySelectorAll('h1, h2, h3').length;
    if (headings > 0) {
      score += Math.min(headings * 0.05, 0.2);
    }
    
    // Có paragraphs
    const paragraphs = document.querySelectorAll('p').length;
    if (paragraphs > 0) {
      score += Math.min(paragraphs * 0.02, 0.2);
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Làm mới cache
   */
  lam_moi_cache(): void {
    this.content_cache.clear();
    console.log('[TrichXuatNoiDung] Cache đã được làm mới');
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.content_cache.clear();
  }
}
