/**
 * Rich Content Processing Service
 * Xử lý nội dung phong phú cho Notion integration
 */

import { KetQuaTrichXuat } from '../types/trang-web';
import { NoiDungTrang, MetaDataTrang, LoaiNoiDung } from '../types/notion';
// import { DinhDangMarkdown } from '../utils/dinh-dang-md'; // Available for future use

/**
 * Content block structure for rich processing
 */
export interface NoiDungBlock {
  loai: 'text' | 'heading' | 'list' | 'code' | 'quote' | 'image' | 'link' | 'table' | 'divider';
  noi_dung: string;
  metadata?: Record<string, any>;
  cap_do?: number; // For headings
  ngon_ngu?: string; // For code blocks
  danh_sach_items?: string[]; // For lists
  bang_data?: string[][]; // For tables
}

/**
 * Enhanced content structure
 */
export interface NoiDungDaDuocXuLy {
  tieu_de: string;
  mo_ta_ngan: string;
  cac_block: NoiDungBlock[];
  metadata: MetaDataTrang;
  thong_ke: ThongKeNoiDung;
  do_phong_phu: number; // 0-1 score
  chat_luong_trich_xuat: number; // 0-1 score
}

/**
 * Content statistics
 */
export interface ThongKeNoiDung {
  so_tu: number;
  so_ky_tu: number;
  so_heading: number;
  so_hinh_anh: number;
  so_lien_ket: number;
  so_block_code: number;
  so_bang: number;
  thoi_gian_doc_uoc_tinh: number; // minutes
  do_kho_doc: 'easy' | 'medium' | 'hard';
}

/**
 * Service xử lý nội dung phong phú
 */
export class XuLyNoiDungPhongPhu {
  private content_cache: Map<string, NoiDungDaDuocXuLy> = new Map();

  constructor() {
    // Markdown processor could be initialized here if needed
    // this.markdown_processor = new DinhDangMarkdown();
  }

  /**
   * Khởi tạo service
   */
  async khoi_tao(): Promise<void> {
    console.log('[XuLyNoiDungPhongPhu] ✅ Service đã được khởi tạo');
  }

  /**
   * Xử lý content thô thành rich content
   */
  async xu_ly_noi_dung_tho(
    ket_qua_trich_xuat: KetQuaTrichXuat,
    tuy_chon?: TuyChonXuLy
  ): Promise<NoiDungDaDuocXuLy> {
    try {
      console.log('[XuLyNoiDungPhongPhu] 🚀 Bắt đầu xử lý rich content');

      const cache_key = this.tao_cache_key(ket_qua_trich_xuat);
      
      // Check cache first
      if (this.content_cache.has(cache_key) && !tuy_chon?.force_reprocess) {
        console.log('[XuLyNoiDungPhongPhu] 📋 Sử dụng cached content');
        return this.content_cache.get(cache_key)!;
      }

      // Process raw content
      const cac_block = await this.phan_tich_noi_dung_thanh_blocks(
        ket_qua_trich_xuat.noi_dung, 
        tuy_chon
      );

      // Extract metadata
      const metadata = this.xu_ly_metadata(ket_qua_trich_xuat);

      // Generate statistics
      const thong_ke = this.tinh_thong_ke_noi_dung(cac_block, ket_qua_trich_xuat.noi_dung);

      // Calculate quality scores
      const do_phong_phu = this.tinh_do_phong_phu(cac_block, thong_ke);
      const chat_luong_trich_xuat = this.danh_gia_chat_luong_trich_xuat(ket_qua_trich_xuat, thong_ke);

      // Generate smart summary
      const mo_ta_ngan = this.tao_mo_ta_ngan(cac_block, metadata, tuy_chon?.max_summary_length || 200);

      const ket_qua: NoiDungDaDuocXuLy = {
        tieu_de: ket_qua_trich_xuat.title,
        mo_ta_ngan,
        cac_block,
        metadata,
        thong_ke,
        do_phong_phu,
        chat_luong_trich_xuat
      };

      // Cache result
      this.content_cache.set(cache_key, ket_qua);

      console.log('[XuLyNoiDungPhongPhu] ✅ Hoàn thành xử lý rich content');
      return ket_qua;

    } catch (error) {
      console.error('[XuLyNoiDungPhongPhu] ❌ Lỗi xử lý:', error);
      throw new Error(`Lỗi xử lý nội dung phong phú: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Phân tích nội dung thành blocks
   */
  private async phan_tich_noi_dung_thanh_blocks(
    noi_dung: string, 
    tuy_chon?: TuyChonXuLy
  ): Promise<NoiDungBlock[]> {
    const blocks: NoiDungBlock[] = [];
    const lines = noi_dung.split('\n');
    
    let current_block: NoiDungBlock | null = null;
    let trong_code_block = false;
    let code_language = '';
    let code_content: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines unless we're in a code block
      if (!line && !trong_code_block) {
        if (current_block) {
          blocks.push(current_block);
          current_block = null;
        }
        continue;
      }

      // Handle code blocks
      if (line.startsWith('```')) {
        if (trong_code_block) {
          // End of code block
          blocks.push({
            loai: 'code',
            noi_dung: code_content.join('\n'),
            ngon_ngu: code_language || 'text'
          });
          trong_code_block = false;
          code_content = [];
          code_language = '';
        } else {
          // Start of code block
          trong_code_block = true;
          code_language = line.substring(3).trim();
        }
        continue;
      }

      if (trong_code_block) {
        code_content.push(lines[i]); // Keep original formatting in code
        continue;
      }

      // Handle headings
      if (line.startsWith('#')) {
        if (current_block) {
          blocks.push(current_block);
        }
        const level = line.match(/^#+/)?.[0].length || 1;
        const content = line.replace(/^#+\s*/, '');
        current_block = {
          loai: 'heading',
          noi_dung: content,
          cap_do: Math.min(level, 6)
        };
        blocks.push(current_block);
        current_block = null;
        continue;
      }

      // Handle blockquotes
      if (line.startsWith('>')) {
        if (current_block?.loai !== 'quote') {
          if (current_block) blocks.push(current_block);
          current_block = {
            loai: 'quote',
            noi_dung: line.replace(/^>\s*/, '')
          };
        } else {
          current_block.noi_dung += '\n' + line.replace(/^>\s*/, '');
        }
        continue;
      }

      // Handle lists
      if (line.match(/^[-*+]\s/) || line.match(/^\d+\.\s/)) {
        if (current_block?.loai !== 'list') {
          if (current_block) blocks.push(current_block);
          current_block = {
            loai: 'list',
            noi_dung: line,
            danh_sach_items: [line.replace(/^[-*+\d+.]\s*/, '')]
          };
        } else {
          current_block.noi_dung += '\n' + line;
          current_block.danh_sach_items?.push(line.replace(/^[-*+\d+.]\s*/, ''));
        }
        continue;
      }

      // Handle images
      if (line.match(/!\[.*?\]\(.*?\)/)) {
        if (current_block) blocks.push(current_block);
        const match = line.match(/!\[(.*?)\]\((.*?)\)/);
        blocks.push({
          loai: 'image',
          noi_dung: match?.[1] || '',
          metadata: { src: match?.[2] || '', alt: match?.[1] || '' }
        });
        current_block = null;
        continue;
      }

      // Handle links (standalone)
      if (line.match(/^\[.*?\]\(.*?\)$/) && !line.includes(' ')) {
        if (current_block) blocks.push(current_block);
        const match = line.match(/\[(.*?)\]\((.*?)\)/);
        blocks.push({
          loai: 'link',
          noi_dung: match?.[1] || '',
          metadata: { href: match?.[2] || '', text: match?.[1] || '' }
        });
        current_block = null;
        continue;
      }

      // Handle horizontal rules
      if (line.match(/^-{3,}$/) || line.match(/^\*{3,}$/) || line.match(/^_{3,}$/)) {
        if (current_block) blocks.push(current_block);
        blocks.push({
          loai: 'divider',
          noi_dung: '---'
        });
        current_block = null;
        continue;
      }

      // Handle regular text
      if (current_block?.loai !== 'text') {
        if (current_block) blocks.push(current_block);
        current_block = {
          loai: 'text',
          noi_dung: line
        };
      } else {
        current_block.noi_dung += '\n' + line;
      }
    }

    // Push final block
    if (current_block) {
      blocks.push(current_block);
    }

    // Post-process blocks
    return this.hau_xu_ly_blocks(blocks, tuy_chon);
  }

  /**
   * Hậu xử lý blocks
   */
  private hau_xu_ly_blocks(blocks: NoiDungBlock[], tuy_chon?: TuyChonXuLy): NoiDungBlock[] {
    let processed_blocks = [...blocks];

    // Merge consecutive text blocks if enabled
    if (tuy_chon?.merge_consecutive_text !== false) {
      processed_blocks = this.gop_text_blocks_lien_tiep(processed_blocks);
    }

    // Clean up empty blocks
    processed_blocks = processed_blocks.filter(block => 
      block.noi_dung.trim().length > 0 || block.loai === 'divider'
    );

    // Enhance blocks with metadata
    processed_blocks = processed_blocks.map(block => this.bo_sung_metadata_block(block));

    return processed_blocks;
  }

  /**
   * Gộp text blocks liên tiếp
   */
  private gop_text_blocks_lien_tiep(blocks: NoiDungBlock[]): NoiDungBlock[] {
    const merged: NoiDungBlock[] = [];
    let current_text_block: NoiDungBlock | null = null;

    for (const block of blocks) {
      if (block.loai === 'text') {
        if (current_text_block) {
          current_text_block.noi_dung += '\n\n' + block.noi_dung;
        } else {
          current_text_block = { ...block };
        }
      } else {
        if (current_text_block) {
          merged.push(current_text_block);
          current_text_block = null;
        }
        merged.push(block);
      }
    }

    if (current_text_block) {
      merged.push(current_text_block);
    }

    return merged;
  }

  /**
   * Bổ sung metadata cho block
   */
  private bo_sung_metadata_block(block: NoiDungBlock): NoiDungBlock {
    const enhanced = { ...block };

    switch (block.loai) {
      case 'text':
        enhanced.metadata = {
          word_count: block.noi_dung.split(/\s+/).length,
          char_count: block.noi_dung.length,
          estimated_reading_time: Math.ceil(block.noi_dung.split(/\s+/).length / 200) // 200 WPM average
        };
        break;
        
      case 'heading':
        enhanced.metadata = {
          level: block.cap_do || 1,
          anchor_id: this.tao_anchor_id(block.noi_dung)
        };
        break;
        
      case 'list':
        enhanced.metadata = {
          item_count: block.danh_sach_items?.length || 0,
          list_type: block.noi_dung.match(/^\d+\./) ? 'ordered' : 'unordered'
        };
        break;
        
      case 'code':
        enhanced.metadata = {
          language: block.ngon_ngu || 'text',
          line_count: block.noi_dung.split('\n').length,
          char_count: block.noi_dung.length
        };
        break;
    }

    return enhanced;
  }

  /**
   * Xử lý metadata từ extraction result
   */
  private xu_ly_metadata(ket_qua: KetQuaTrichXuat): MetaDataTrang {
    const base_metadata = ket_qua.meta_data || {};
    
    return {
      mo_ta: base_metadata.description || base_metadata.og_description || '',
      anh_dai_dien: base_metadata.og_image || '',
      tac_gia: base_metadata.author || '',
      ngay_xuat_ban: base_metadata.publishedTime ? new Date(base_metadata.publishedTime) : undefined,
      tu_khoa: this.trich_xuat_tu_khoa(ket_qua.noi_dung, base_metadata.keywords),
      domain: new URL(ket_qua.url).hostname,
      ngon_ngu: ket_qua.ngon_ngu || 'vi',
      favicon_url: base_metadata.favicon || `https://${new URL(ket_qua.url).hostname}/favicon.ico`,
      canonical_url: base_metadata.canonical || ket_qua.url
    };
  }

  /**
   * Trích xuất từ khóa từ nội dung
   */
  private trich_xuat_tu_khoa(noi_dung: string, existing_keywords?: string): string[] {
    const keywords: string[] = [];
    
    // Add existing keywords
    if (existing_keywords) {
      keywords.push(...existing_keywords.split(',').map(k => k.trim()));
    }

    // Extract from content using simple frequency analysis
    const words = noi_dung
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const word_freq: Record<string, number> = {};
    words.forEach(word => {
      word_freq[word] = (word_freq[word] || 0) + 1;
    });

    // Get top frequent words
    const top_words = Object.entries(word_freq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    keywords.push(...top_words);

    return [...new Set(keywords)].slice(0, 20); // Unique, max 20
  }

  /**
   * Tính thống kê nội dung
   */
  private tinh_thong_ke_noi_dung(blocks: NoiDungBlock[], raw_content: string): ThongKeNoiDung {
    const stats = {
      so_tu: 0,
      so_ky_tu: raw_content.length,
      so_heading: 0,
      so_hinh_anh: 0,
      so_lien_ket: 0,
      so_block_code: 0,
      so_bang: 0,
      thoi_gian_doc_uoc_tinh: 0,
      do_kho_doc: 'medium' as 'easy' | 'medium' | 'hard'
    };

    blocks.forEach(block => {
      switch (block.loai) {
        case 'text':
        case 'quote':
          const words = block.noi_dung.split(/\s+/).filter(w => w.length > 0);
          stats.so_tu += words.length;
          break;
        case 'heading':
          stats.so_heading++;
          break;
        case 'image':
          stats.so_hinh_anh++;
          break;
        case 'link':
          stats.so_lien_ket++;
          break;
        case 'code':
          stats.so_block_code++;
          break;
        case 'table':
          stats.so_bang++;
          break;
      }
    });

    // Calculate reading time (200 WPM average)
    stats.thoi_gian_doc_uoc_tinh = Math.ceil(stats.so_tu / 200);

    // Determine difficulty based on various factors
    const avg_sentence_length = stats.so_tu / Math.max(1, raw_content.split(/[.!?]+/).length);
    const technical_indicators = stats.so_block_code + stats.so_bang;
    
    if (avg_sentence_length > 20 || technical_indicators > 3) {
      stats.do_kho_doc = 'hard';
    } else if (avg_sentence_length < 12 && technical_indicators === 0) {
      stats.do_kho_doc = 'easy';
    }

    return stats;
  }

  /**
   * Tính độ phong phú content
   */
  private tinh_do_phong_phu(blocks: NoiDungBlock[], stats: ThongKeNoiDung): number {
    let score = 0.5; // Base score

    // Content variety bonus
    const block_types = new Set(blocks.map(b => b.loai));
    score += block_types.size * 0.05; // +5% per unique block type

    // Structure bonus
    if (stats.so_heading > 0) score += 0.1;
    if (stats.so_hinh_anh > 0) score += 0.1;
    if (stats.so_lien_ket > 0) score += 0.05;
    if (stats.so_block_code > 0) score += 0.1;

    // Length bonus
    if (stats.so_tu > 100) score += 0.1;
    if (stats.so_tu > 500) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Đánh giá chất lượng trích xuất
   */
  private danh_gia_chat_luong_trich_xuat(ket_qua: KetQuaTrichXuat, stats: ThongKeNoiDung): number {
    let score = ket_qua.do_tin_cay || 0.5;

    // Content completeness
    if (stats.so_tu > 50) score += 0.1;
    if (stats.so_heading > 0) score += 0.1;
    if (ket_qua.title && ket_qua.title.trim().length > 0) score += 0.1;

    // Metadata richness
    const metadata_count = Object.keys(ket_qua.meta_data || {}).length;
    score += Math.min(metadata_count * 0.02, 0.2);

    return Math.min(score, 1.0);
  }

  /**
   * Tạo mô tả ngắn thông minh
   */
  private tao_mo_ta_ngan(blocks: NoiDungBlock[], metadata: MetaDataTrang, max_length: number): string {
    // Try existing description first
    if (metadata.mo_ta && metadata.mo_ta.length <= max_length) {
      return metadata.mo_ta;
    }

    // Extract from first text block
    const first_text_block = blocks.find(b => b.loai === 'text');
    if (first_text_block) {
      const content = first_text_block.noi_dung;
      if (content.length <= max_length) {
        return content;
      }
      
      // Smart truncation at sentence boundary
      const sentences = content.split(/[.!?]+/);
      let summary = '';
      for (const sentence of sentences) {
        if ((summary + sentence + '.').length <= max_length) {
          summary += sentence + '.';
        } else {
          break;
        }
      }
      
      return summary.trim() || content.substring(0, max_length - 3) + '...';
    }

    return 'Nội dung được trích xuất từ trang web';
  }

  /**
   * Tạo anchor ID từ text
   */
  private tao_anchor_id(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  /**
   * Tạo cache key
   */
  private tao_cache_key(ket_qua: KetQuaTrichXuat): string {
    const content_hash = this.hash_string(ket_qua.noi_dung);
    return `${ket_qua.url}_${content_hash}`;
  }

  /**
   * Simple string hash
   */
  private hash_string(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Chuyển đổi sang Notion content format
   */
  async chuyen_doi_cho_notion(processed_content: NoiDungDaDuocXuLy): Promise<NoiDungTrang> {
    const notion_content: NoiDungTrang = {
      tieu_de: processed_content.tieu_de,
      noi_dung: this.blocks_to_markdown(processed_content.cac_block),
      url: processed_content.metadata.canonical_url || '',
      meta_data: processed_content.metadata,
      ngay_luu: new Date(),
      loai_noi_dung: this.xac_dinh_loai_noi_dung(processed_content),
      thoi_gian_doc_uoc_tinh: processed_content.thong_ke.thoi_gian_doc_uoc_tinh
    };

    return notion_content;
  }

  /**
   * Convert blocks to markdown
   */
  private blocks_to_markdown(blocks: NoiDungBlock[]): string {
    return blocks.map(block => {
      switch (block.loai) {
        case 'heading':
          const hashes = '#'.repeat(block.cap_do || 1);
          return `${hashes} ${block.noi_dung}`;
        case 'text':
          return block.noi_dung;
        case 'quote':
          return block.noi_dung.split('\n').map(line => `> ${line}`).join('\n');
        case 'list':
          return block.noi_dung;
        case 'code':
          return `\`\`\`${block.ngon_ngu || ''}\n${block.noi_dung}\n\`\`\``;
        case 'image':
          return `![${block.metadata?.alt || ''}](${block.metadata?.src || ''})`;
        case 'link':
          return `[${block.noi_dung}](${block.metadata?.href || ''})`;
        case 'divider':
          return '---';
        default:
          return block.noi_dung;
      }
    }).join('\n\n');
  }

  /**
   * Xác định loại nội dung
   */
  private xac_dinh_loai_noi_dung(content: NoiDungDaDuocXuLy): LoaiNoiDung {
    const url = content.metadata.canonical_url || '';
    const title = content.tieu_de.toLowerCase();
    
    if (url.includes('/blog/') || title.includes('blog')) return LoaiNoiDung.BLOG_POST;
    if (url.includes('/news/') || title.includes('news')) return LoaiNoiDung.TRANG_TIN_TUC;
    if (url.includes('/docs/') || title.includes('document')) return LoaiNoiDung.TAI_LIEU;
    if (content.thong_ke.so_block_code > 2) return LoaiNoiDung.TUTORIAL;
    if (content.thong_ke.so_hinh_anh > 3) return LoaiNoiDung.BAI_VIET;
    
    return LoaiNoiDung.KHAC;
  }

  /**
   * Clear cache
   */
  lam_moi_cache(): void {
    this.content_cache.clear();
    console.log('[XuLyNoiDungPhongPhu] Cache đã được làm mới');
  }

  /**
   * Get cache size
   */
  lay_kich_thuoc_cache(): number {
    return this.content_cache.size;
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.content_cache.clear();
  }
}

/**
 * Tùy chọn xử lý content
 */
export interface TuyChonXuLy {
  force_reprocess?: boolean;
  merge_consecutive_text?: boolean;
  max_summary_length?: number;
  extract_keywords?: boolean;
  enhance_metadata?: boolean;
}
