/**
 * Notion API Integration Service
 * Tích hợp với Notion API để lưu nội dung
 */

import { 
  KetNoiNotion, 
  NoiDungTrang, 
  YeuCauLuuNotion, 
  TuyChonLuuTrang,
  NotionPageResponse,
  LoaiNoiDung
} from '../types/notion';
import { NoiDungDaDuocXuLy } from './xu-ly-noi-dung-phong-phu';

/**
 * Notion block structure
 */
interface NotionBlock {
  object: 'block';
  type: string;
  [key: string]: any;
}

/**
 * Database properties for content
 */
interface DatabaseProperties {
  title: {
    title: Array<{
      type: 'text';
      text: { content: string };
    }>;
  };
  url: {
    url: string;
  };
  tags: {
    multi_select: Array<{
      name: string;
    }>;
  };
  content_type: {
    select: {
      name: string;
    };
  };
  reading_time: {
    number: number;
  };
  word_count: {
    number: number;
  };
  created_date: {
    date: {
      start: string;
    };
  };
  domain: {
    rich_text: Array<{
      type: 'text';
      text: { content: string };
    }>;
  };
  description: {
    rich_text: Array<{
      type: 'text';
      text: { content: string };
    }>;
  };
}

/**
 * Service tích hợp Notion API
 */
export class TichHopNotionAPI {
  private api_base_url = 'https://api.notion.com/v1';
  private notion_version = '2022-06-28';
  private request_cache: Map<string, any> = new Map();

  constructor() {
    console.log('[TichHopNotionAPI] Service khởi tạo');
  }

  /**
   * Khởi tạo service
   */
  async khoi_tao(): Promise<void> {
    console.log('[TichHopNotionAPI] ✅ Service đã được khởi tạo');
  }

  /**
   * Kiểm tra kết nối Notion
   */
  async kiem_tra_ket_noi(api_key: string): Promise<KetNoiNotion> {
    try {
      console.log('[TichHopNotionAPI] 🔍 Kiểm tra kết nối Notion...');

      const response = await this.gui_request('/users/me', 'GET', api_key);
      
      if (response.object === 'user') {
        return {
          api_key,
          database_id: '', // Will be set later
          la_ket_noi_hop_le: true,
          ngay_ket_noi_cuoi: new Date(),
          ten_workspace: response.name || 'Notion Workspace'
        };
      }

      throw new Error('Invalid Notion API response');
    } catch (error) {
      console.error('[TichHopNotionAPI] ❌ Lỗi kết nối:', error);
      return {
        api_key,
        database_id: '',
        la_ket_noi_hop_le: false,
        ngay_ket_noi_cuoi: new Date()
      };
    }
  }

  /**
   * Lấy danh sách databases
   */
  async lay_danh_sach_databases(api_key: string): Promise<Array<{ id: string; title: string; url: string }>> {
    try {
      console.log('[TichHopNotionAPI] 📋 Lấy danh sách databases...');

      const response = await this.gui_request('/search', 'POST', api_key, {
        filter: {
          value: 'database',
          property: 'object'
        },
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time'
        }
      });

      return response.results.map((db: any) => ({
        id: db.id,
        title: this.trich_xuat_database_title(db),
        url: db.url
      }));
    } catch (error) {
      console.error('[TichHopNotionAPI] ❌ Lỗi lấy databases:', error);
      return [];
    }
  }

  /**
   * Tạo database mới cho web content
   */
  async tao_database_web_content(
    api_key: string, 
    parent_page_id: string,
    database_name: string = 'Web Content Collection'
  ): Promise<{ id: string; url: string }> {
    try {
      console.log('[TichHopNotionAPI] 🏗️ Tạo database mới...');

      const response = await this.gui_request('/databases', 'POST', api_key, {
        parent: {
          type: 'page_id',
          page_id: parent_page_id
        },
        title: [
          {
            type: 'text',
            text: {
              content: database_name
            }
          }
        ],
        properties: {
          'Title': {
            title: {}
          },
          'URL': {
            url: {}
          },
          'Content Type': {
            select: {
              options: [
                { name: 'Blog Post', color: 'blue' },
                { name: 'News Article', color: 'green' },
                { name: 'Documentation', color: 'purple' },
                { name: 'Tutorial', color: 'orange' },
                { name: 'Research', color: 'red' },
                { name: 'Other', color: 'gray' }
              ]
            }
          },
          'Tags': {
            multi_select: {}
          },
          'Domain': {
            rich_text: {}
          },
          'Reading Time (min)': {
            number: {
              format: 'number'
            }
          },
          'Word Count': {
            number: {
              format: 'number'
            }
          },
          'Created Date': {
            date: {}
          },
          'Description': {
            rich_text: {}
          },
          'Language': {
            select: {
              options: [
                { name: 'Vietnamese', color: 'red' },
                { name: 'English', color: 'blue' },
                { name: 'Other', color: 'gray' }
              ]
            }
          }
        }
      });

      return {
        id: response.id,
        url: response.url
      };
    } catch (error) {
      console.error('[TichHopNotionAPI] ❌ Lỗi tạo database:', error);
      throw new Error(`Không thể tạo database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Lưu nội dung vào Notion
   */
  async luu_noi_dung(yeu_cau: YeuCauLuuNotion): Promise<NotionPageResponse> {
    try {
      console.log('[TichHopNotionAPI] 💾 Lưu nội dung vào Notion...');

      const { noi_dung, cau_hinh, tuy_chon_luu, database_id_cu_the } = yeu_cau;
      const database_id = database_id_cu_the || cau_hinh.database_id;

      if (!database_id) {
        throw new Error('Database ID không được cung cấp');
      }

      // Prepare page properties
      const properties = this.tao_properties_cho_page(noi_dung, tuy_chon_luu);

      // Create page
      const response = await this.gui_request('/pages', 'POST', cau_hinh.api_key, {
        parent: {
          database_id: database_id
        },
        properties,
        children: await this.chuyen_doi_noi_dung_thanh_blocks(noi_dung.noi_dung)
      });

      console.log('[TichHopNotionAPI] ✅ Đã lưu thành công vào Notion');
      return response;
    } catch (error) {
      console.error('[TichHopNotionAPI] ❌ Lỗi lưu nội dung:', error);
      throw new Error(`Lỗi lưu vào Notion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Lưu rich content đã xử lý
   */
  async luu_rich_content(
    processed_content: NoiDungDaDuocXuLy,
    cau_hinh: KetNoiNotion,
    tuy_chon?: TuyChonLuuTrang
  ): Promise<NotionPageResponse> {
    try {
      console.log('[TichHopNotionAPI] 🎨 Lưu rich content vào Notion...');

      // Convert to NoiDungTrang format (for compatibility)
      // const noi_dung_trang: NoiDungTrang = { ... } - handled directly in enhanced_properties

      // Enhanced properties with rich content stats
      const enhanced_properties = this.tao_enhanced_properties(processed_content, tuy_chon);

      const response = await this.gui_request('/pages', 'POST', cau_hinh.api_key, {
        parent: {
          database_id: cau_hinh.database_id
        },
        properties: enhanced_properties,
        children: await this.chuyen_doi_rich_blocks_thanh_notion_blocks(processed_content.cac_block)
      });

      console.log('[TichHopNotionAPI] ✅ Đã lưu rich content thành công');
      return response;
    } catch (error) {
      console.error('[TichHopNotionAPI] ❌ Lỗi lưu rich content:', error);
      throw error;
    }
  }

  /**
   * Cập nhật nội dung page đã tồn tại
   */
  async cap_nhat_page(
    page_id: string,
    noi_dung_moi: NoiDungTrang,
    api_key: string
  ): Promise<NotionPageResponse> {
    try {
      console.log('[TichHopNotionAPI] 🔄 Cập nhật page...');

      // Update properties
      const properties = this.tao_properties_cho_page(noi_dung_moi);
      
      const response = await this.gui_request(`/pages/${page_id}`, 'PATCH', api_key, {
        properties
      });

      // Update content blocks (replace all)
      await this.thay_the_noi_dung_page(page_id, noi_dung_moi.noi_dung, api_key);

      console.log('[TichHopNotionAPI] ✅ Đã cập nhật page thành công');
      return response;
    } catch (error) {
      console.error('[TichHopNotionAPI] ❌ Lỗi cập nhật page:', error);
      throw error;
    }
  }

  /**
   * Tạo properties cho Notion page
   */
  private tao_properties_cho_page(
    noi_dung: NoiDungTrang, 
    _tuy_chon?: TuyChonLuuTrang
  ): Partial<DatabaseProperties> {
    const properties: any = {
      'Title': {
        title: [
          {
            type: 'text',
            text: {
              content: noi_dung.tieu_de || 'Untitled'
            }
          }
        ]
      },
      'URL': {
        url: noi_dung.url
      },
      'Content Type': {
        select: {
          name: this.loai_noi_dung_to_select_name(noi_dung.loai_noi_dung)
        }
      },
      'Domain': {
        rich_text: [
          {
            type: 'text',
            text: {
              content: noi_dung.meta_data.domain
            }
          }
        ]
      },
      'Created Date': {
        date: {
          start: noi_dung.ngay_luu.toISOString().split('T')[0]
        }
      }
    };

    // Add optional fields
    if (noi_dung.thoi_gian_doc_uoc_tinh) {
      properties['Reading Time (min)'] = {
        number: noi_dung.thoi_gian_doc_uoc_tinh
      };
    }

    if (noi_dung.meta_data.mo_ta) {
      properties['Description'] = {
        rich_text: [
          {
            type: 'text',
            text: {
              content: noi_dung.meta_data.mo_ta.substring(0, 2000) // Notion limit
            }
          }
        ]
      };
    }

    if (noi_dung.meta_data.tu_khoa?.length > 0) {
      properties['Tags'] = {
        multi_select: noi_dung.meta_data.tu_khoa.slice(0, 10).map(tag => ({ name: tag }))
      };
    }

    if (noi_dung.meta_data.ngon_ngu) {
      properties['Language'] = {
        select: {
          name: this.ngon_ngu_to_select_name(noi_dung.meta_data.ngon_ngu)
        }
      };
    }

    return properties;
  }

  /**
   * Tạo enhanced properties cho rich content
   */
  private tao_enhanced_properties(
    content: NoiDungDaDuocXuLy,
    _tuy_chon?: TuyChonLuuTrang
  ): any {
    const base_properties = this.tao_properties_cho_page({
      tieu_de: content.tieu_de,
      noi_dung: '',
      url: content.metadata.canonical_url || '',
      meta_data: content.metadata,
      ngay_luu: new Date(),
      loai_noi_dung: this.map_content_type(content)
    }, _tuy_chon);

    // Add rich content specific properties
    return {
      ...base_properties,
      'Word Count': {
        number: content.thong_ke.so_tu
      },
      'Reading Time (min)': {
        number: content.thong_ke.thoi_gian_doc_uoc_tinh
      },
      'Content Quality': {
        select: {
          name: this.quality_score_to_name(content.chat_luong_trich_xuat)
        }
      },
      'Content Richness': {
        select: {
          name: this.richness_score_to_name(content.do_phong_phu)
        }
      },
      'Difficulty': {
        select: {
          name: content.thong_ke.do_kho_doc
        }
      }
    };
  }

  /**
   * Chuyển đổi markdown content thành Notion blocks
   */
  private async chuyen_doi_noi_dung_thanh_blocks(markdown_content: string): Promise<NotionBlock[]> {
    const blocks: NotionBlock[] = [];
    const lines = markdown_content.split('\n');
    
    let current_paragraph_lines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Empty line - finish current paragraph
      if (!trimmed) {
        if (current_paragraph_lines.length > 0) {
          blocks.push(this.tao_paragraph_block(current_paragraph_lines.join('\n')));
          current_paragraph_lines = [];
        }
        continue;
      }

      // Heading
      if (trimmed.match(/^#{1,6}\s/)) {
        if (current_paragraph_lines.length > 0) {
          blocks.push(this.tao_paragraph_block(current_paragraph_lines.join('\n')));
          current_paragraph_lines = [];
        }
        blocks.push(this.tao_heading_block(trimmed));
        continue;
      }

      // Code block
      if (trimmed.startsWith('```')) {
        if (current_paragraph_lines.length > 0) {
          blocks.push(this.tao_paragraph_block(current_paragraph_lines.join('\n')));
          current_paragraph_lines = [];
        }
        // Handle code block (simplified)
        blocks.push(this.tao_code_block('// Code content'));
        continue;
      }

      // Quote
      if (trimmed.startsWith('>')) {
        if (current_paragraph_lines.length > 0) {
          blocks.push(this.tao_paragraph_block(current_paragraph_lines.join('\n')));
          current_paragraph_lines = [];
        }
        blocks.push(this.tao_quote_block(trimmed.substring(1).trim()));
        continue;
      }

      // List item
      if (trimmed.match(/^[-*+]\s/) || trimmed.match(/^\d+\.\s/)) {
        if (current_paragraph_lines.length > 0) {
          blocks.push(this.tao_paragraph_block(current_paragraph_lines.join('\n')));
          current_paragraph_lines = [];
        }
        blocks.push(this.tao_list_item_block(trimmed));
        continue;
      }

      // Regular text
      current_paragraph_lines.push(line);
    }

    // Add final paragraph
    if (current_paragraph_lines.length > 0) {
      blocks.push(this.tao_paragraph_block(current_paragraph_lines.join('\n')));
    }

    return blocks.slice(0, 100); // Notion API limit
  }

  /**
   * Chuyển đổi rich blocks thành Notion blocks
   */
  private async chuyen_doi_rich_blocks_thanh_notion_blocks(rich_blocks: any[]): Promise<NotionBlock[]> {
    const notion_blocks: NotionBlock[] = [];

    for (const block of rich_blocks) {
      switch (block.loai) {
        case 'heading':
          notion_blocks.push(this.tao_heading_block_tu_rich(block));
          break;
        case 'text':
          notion_blocks.push(this.tao_paragraph_block(block.noi_dung));
          break;
        case 'quote':
          notion_blocks.push(this.tao_quote_block(block.noi_dung));
          break;
        case 'code':
          notion_blocks.push(this.tao_code_block(block.noi_dung, block.ngon_ngu));
          break;
        case 'list':
          // Handle list items
          if (block.danh_sach_items) {
            for (const item of block.danh_sach_items) {
              notion_blocks.push(this.tao_list_item_block(`• ${item}`));
            }
          }
          break;
        case 'divider':
          notion_blocks.push(this.tao_divider_block());
          break;
        case 'image':
          if (block.metadata?.src) {
            notion_blocks.push(this.tao_image_block(block.metadata.src, block.noi_dung));
          }
          break;
      }
    }

    return notion_blocks.slice(0, 100); // Notion API limit
  }

  /**
   * Tạo các loại Notion blocks
   */
  private tao_paragraph_block(content: string): NotionBlock {
    return {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: content.substring(0, 2000) // Notion limit
            }
          }
        ]
      }
    };
  }

  private tao_heading_block(markdown_heading: string): NotionBlock {
    const level = (markdown_heading.match(/^#+/) || [''])[0].length;
    const content = markdown_heading.replace(/^#+\s*/, '');
    const heading_type = level === 1 ? 'heading_1' : level === 2 ? 'heading_2' : 'heading_3';

    return {
      object: 'block',
      type: heading_type,
      [heading_type]: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: content.substring(0, 2000)
            }
          }
        ]
      }
    };
  }

  private tao_heading_block_tu_rich(rich_block: any): NotionBlock {
    const level = Math.min(rich_block.cap_do || 1, 3);
    const heading_type = level === 1 ? 'heading_1' : level === 2 ? 'heading_2' : 'heading_3';

    return {
      object: 'block',
      type: heading_type,
      [heading_type]: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: rich_block.noi_dung.substring(0, 2000)
            }
          }
        ]
      }
    };
  }

  private tao_code_block(content: string, language?: string): NotionBlock {
    return {
      object: 'block',
      type: 'code',
      code: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: content.substring(0, 2000)
            }
          }
        ],
        language: language || 'plain text'
      }
    };
  }

  private tao_quote_block(content: string): NotionBlock {
    return {
      object: 'block',
      type: 'quote',
      quote: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: content.substring(0, 2000)
            }
          }
        ]
      }
    };
  }

  private tao_list_item_block(content: string): NotionBlock {
    const clean_content = content.replace(/^[-*+\d+.]\s*/, '');
    return {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: clean_content.substring(0, 2000)
            }
          }
        ]
      }
    };
  }

  private tao_divider_block(): NotionBlock {
    return {
      object: 'block',
      type: 'divider',
      divider: {}
    };
  }

  private tao_image_block(url: string, caption?: string): NotionBlock {
    return {
      object: 'block',
      type: 'image',
      image: {
        type: 'external',
        external: {
          url: url
        },
        caption: caption ? [
          {
            type: 'text',
            text: {
              content: caption.substring(0, 2000)
            }
          }
        ] : []
      }
    };
  }

  /**
   * Utility methods
   */
  private trich_xuat_database_title(db: any): string {
    if (db.title && db.title.length > 0) {
      return db.title[0].plain_text || 'Untitled Database';
    }
    return 'Untitled Database';
  }

  private loai_noi_dung_to_select_name(loai: LoaiNoiDung): string {
    const mapping: Record<LoaiNoiDung, string> = {
      [LoaiNoiDung.BAI_VIET]: 'Blog Post',
      [LoaiNoiDung.TRANG_TIN_TUC]: 'News Article',
      [LoaiNoiDung.BLOG_POST]: 'Blog Post',
      [LoaiNoiDung.NGHIEN_CUU]: 'Research',
      [LoaiNoiDung.TAI_LIEU]: 'Documentation',
      [LoaiNoiDung.TUTORIAL]: 'Tutorial',
      [LoaiNoiDung.VIDEO]: 'Video',
      [LoaiNoiDung.PODCAST]: 'Podcast',
      [LoaiNoiDung.SAN_PHAM]: 'Product',
      [LoaiNoiDung.KHAC]: 'Other'
    };
    return mapping[loai] || 'Other';
  }

  private ngon_ngu_to_select_name(ngon_ngu: string): string {
    if (ngon_ngu.startsWith('vi')) return 'Vietnamese';
    if (ngon_ngu.startsWith('en')) return 'English';
    return 'Other';
  }

  private quality_score_to_name(score: number): string {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  }

  private richness_score_to_name(score: number): string {
    if (score >= 0.8) return 'Very Rich';
    if (score >= 0.6) return 'Rich';
    if (score >= 0.4) return 'Moderate';
    return 'Simple';
  }

  private map_content_type(content: NoiDungDaDuocXuLy): LoaiNoiDung {
    // Use existing logic from rich content processing
    const url = content.metadata.canonical_url || '';
    const title = content.tieu_de.toLowerCase();
    
    if (url.includes('/blog/') || title.includes('blog')) return LoaiNoiDung.BLOG_POST;
    if (url.includes('/news/') || title.includes('news')) return LoaiNoiDung.TRANG_TIN_TUC;
    if (url.includes('/docs/') || title.includes('document')) return LoaiNoiDung.TAI_LIEU;
    if (content.thong_ke.so_block_code > 2) return LoaiNoiDung.TUTORIAL;
    
    return LoaiNoiDung.KHAC;
  }

  /**
   * Core API request method
   */
  private async gui_request(endpoint: string, method: string, api_key: string, data?: any): Promise<any> {
    const url = `${this.api_base_url}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${api_key}`,
      'Notion-Version': this.notion_version,
      'Content-Type': 'application/json'
    };

    const request_options: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    };

    try {
      const response = await fetch(url, request_options);
      
      if (!response.ok) {
        const error_data = await response.json();
        throw new Error(`Notion API Error: ${error_data.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[TichHopNotionAPI] Request failed:', error);
      throw error;
    }
  }

  /**
   * Thay thế nội dung page (xóa blocks cũ và thêm mới)
   */
  private async thay_the_noi_dung_page(page_id: string, markdown_content: string, api_key: string): Promise<void> {
    try {
      // Get existing blocks
      const blocks_response = await this.gui_request(`/blocks/${page_id}/children`, 'GET', api_key);
      
      // Delete existing blocks
      for (const block of blocks_response.results) {
        await this.gui_request(`/blocks/${block.id}`, 'DELETE', api_key);
      }

      // Add new blocks
      const new_blocks = await this.chuyen_doi_noi_dung_thanh_blocks(markdown_content);
      
      if (new_blocks.length > 0) {
        await this.gui_request(`/blocks/${page_id}/children`, 'PATCH', api_key, {
          children: new_blocks
        });
      }
    } catch (error) {
      console.error('[TichHopNotionAPI] Lỗi thay thế nội dung:', error);
      throw error;
    }
  }

  /**
   * Clear request cache
   */
  lam_moi_cache(): void {
    this.request_cache.clear();
    console.log('[TichHopNotionAPI] Cache đã được làm mới');
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.request_cache.clear();
  }
}
