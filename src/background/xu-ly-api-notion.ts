/**
 * Notion API Integration Service
 * Xử lý tất cả interactions với Notion API
 */

import { Client, LogLevel } from '@notionhq/client';
import { 
  KetNoiNotion, 
  NoiDungTrang, 
  YeuCauLuuNotion, 
  KetQuaLuuNotion,
  TuyChonLuuTrang 
} from '../shared/types/notion';
import { QuanLyStorage } from './quan-ly-storage';
import { XuLyLoi, LoaiLoi } from '../shared/utils/xu-ly-loi';

/**
 * Service xử lý Notion API operations
 */
export class XuLyAPINotion {
  private notion_client: Client | null = null;
  private quan_ly_storage: QuanLyStorage;
  private xu_ly_loi: XuLyLoi;
  private ket_noi_hien_tai: KetNoiNotion | null = null;
  private da_khoi_tao = false;

  constructor(quan_ly_storage: QuanLyStorage) {
    this.quan_ly_storage = quan_ly_storage;
    this.xu_ly_loi = XuLyLoi.getInstance();
  }

  /**
   * Khởi tạo Notion client
   */
  async khoi_tao(): Promise<void> {
    if (this.da_khoi_tao) return;

    try {
      const api_key = await this.quan_ly_storage.lay_notion_api_key();
      if (api_key) {
        await this.tao_ket_noi(api_key);
      }
      this.da_khoi_tao = true;
      console.log('[Notion API] Service khởi tạo thành công');
    } catch (error) {
      console.error('[Notion API] Lỗi khởi tạo:', error);
      this.xu_ly_loi.taoLoi(LoaiLoi.NOTION_API_ERROR, 'Khởi tạo Notion API thất bại', {
        context: { error: String(error) }
      });
    }
  }

  /**
   * Tạo kết nối mới với Notion
   */
  async tao_ket_noi(api_key: string): Promise<boolean> {
    try {
      this.notion_client = new Client({
        auth: api_key,
        timeoutMs: 10000,
        logLevel: LogLevel.WARN
      });

      // Test connection
      const kiem_tra = await this.kiem_tra_ket_noi();
      if (kiem_tra) {
        this.ket_noi_hien_tai = {
          api_key,
          database_id: await this.quan_ly_storage.lay_database_id_mac_dinh() || '',
          la_ket_noi_hop_le: true,
          ngay_ket_noi_cuoi: new Date()
        };

        await this.quan_ly_storage.luu_ket_noi_notion(this.ket_noi_hien_tai);
        console.log('[Notion API] Kết nối thành công');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[Notion API] Lỗi tạo kết nối:', error);
      this.xu_ly_loi.taoLoi(LoaiLoi.NOTION_API_ERROR, 'Tạo kết nối Notion thất bại', {
        context: { error: String(error), api_key: api_key.substring(0, 10) + '...' }
      });
      return false;
    }
  }

  /**
   * Kiểm tra kết nối Notion có hoạt động
   */
  async kiem_tra_ket_noi(): Promise<boolean> {
    if (!this.notion_client) return false;

    try {
      const user = await this.notion_client.users.me({});
      console.log(`[Notion API] Kết nối thành công với user: ${user.name || 'Unknown'}`);
      return true;
    } catch (error) {
      console.error('[Notion API] Test connection failed:', error);
      return false;
    }
  }

  /**
   * Lưu trang web vào Notion
   */
  async luu_trang_web(yeu_cau: YeuCauLuuNotion): Promise<KetQuaLuuNotion> {
    const thoi_gian_bat_dau = Date.now();
    
    try {
      if (!this.notion_client) {
        throw new Error('Chưa kết nối với Notion');
      }

      const { noi_dung, cau_hinh, tuy_chon_luu } = yeu_cau;
      
      // Chuẩn bị dữ liệu cho Notion page
      const properties = await this.chuan_bi_properties(noi_dung);
      const children = await this.chuan_bi_noi_dung(noi_dung, tuy_chon_luu);

      // Tạo page trong Notion
      const response = await this.notion_client.pages.create({
        parent: {
          type: 'database_id',
          database_id: cau_hinh.database_id
        },
        properties,
        children
      });

      const thoi_gian_xu_ly = Date.now() - thoi_gian_bat_dau;

      console.log(`[Notion API] Lưu trang thành công trong ${thoi_gian_xu_ly}ms`);
      
      return {
        thanh_cong: true,
        page_id: response.id,
        url_notion: `https://notion.so/${response.id}`,
        thoi_gian_xu_ly
      };

    } catch (error) {
      const thoi_gian_xu_ly = Date.now() - thoi_gian_bat_dau;
      const chi_tiet_loi = this.xu_ly_loi.taoLoi(LoaiLoi.NOTION_API_ERROR, 'Lưu trang vào Notion thất bại', {
        context: { error: String(error) }
      });

      return {
        thanh_cong: false,
        thong_bao_loi: chi_tiet_loi.message_user_friendly,
        thoi_gian_xu_ly
      };
    }
  }

  /**
   * Chuẩn bị properties cho Notion page
   */
  private async chuan_bi_properties(noi_dung: NoiDungTrang): Promise<any> {
    const properties: any = {
      'Tiêu đề': {
        title: [
          {
            text: { content: noi_dung.tieu_de || 'Untitled' }
          }
        ]
      }
    };

    // Thêm URL nếu có
    if (noi_dung.url) {
      properties['URL'] = {
        url: noi_dung.url
      };
    }

    // Thêm ngày lưu
    properties['Ngày lưu'] = {
      date: {
        start: noi_dung.ngay_luu.toISOString()
      }
    };

    // Thêm domain nếu có
    if (noi_dung.meta_data?.domain) {
      properties['Domain'] = {
        rich_text: [
          {
            text: { content: noi_dung.meta_data.domain }
          }
        ]
      };
    }

    // Thêm tags nếu có
    if (noi_dung.meta_data?.tu_khoa && noi_dung.meta_data.tu_khoa.length > 0) {
      properties['Tags'] = {
        multi_select: noi_dung.meta_data.tu_khoa.slice(0, 5).map(tag => ({ name: tag }))
      };
    }

    return properties;
  }

  /**
   * Chuẩn bị nội dung cho Notion page
   */
  private async chuan_bi_noi_dung(
    noi_dung: NoiDungTrang, 
    _tuy_chon?: TuyChonLuuTrang
  ): Promise<any[]> {
    const blocks = [];

    // Thêm metadata block nếu có mô tả
    if (noi_dung.meta_data?.mo_ta) {
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: [
            {
              type: 'text',
              text: { content: noi_dung.meta_data.mo_ta }
            }
          ]
        }
      });
    }

    // Thêm divider
    if (blocks.length > 0) {
      blocks.push({
        object: 'block',
        type: 'divider',
        divider: {}
      });
    }

    // Thêm nội dung chính
    if (noi_dung.noi_dung) {
      const paragraphs = noi_dung.noi_dung.split('\n\n');
      for (const paragraph of paragraphs) {
        const text = paragraph.trim();
        if (text) {
          // Check if it's a heading
          if (text.startsWith('# ')) {
            blocks.push({
              object: 'block',
              type: 'heading_1',
              heading_1: {
                rich_text: [
                  {
                    type: 'text',
                    text: { content: text.substring(2) }
                  }
                ]
              }
            });
          } else if (text.startsWith('## ')) {
            blocks.push({
              object: 'block',
              type: 'heading_2',
              heading_2: {
                rich_text: [
                  {
                    type: 'text',
                    text: { content: text.substring(3) }
                  }
                ]
              }
            });
          } else {
            // Regular paragraph
            blocks.push({
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: { content: text }
                  }
                ]
              }
            });
          }
        }
      }
    }

    // Giới hạn số blocks (Notion có limit)
    return blocks.slice(0, 100);
  }

  /**
   * Lấy danh sách databases từ Notion
   */
  async lay_danh_sach_databases(): Promise<any[]> {
    if (!this.notion_client) {
      console.warn('[Notion API] Client chưa được khởi tạo');
      return [];
    }

    try {
      const response = await this.notion_client.search({
        filter: {
          value: 'database',
          property: 'object'
        },
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time'
        }
      });

      console.log(`[Notion API] Tìm thấy ${response.results.length} databases`);
      return response.results;
    } catch (error) {
      console.error('[Notion API] Lỗi lấy danh sách databases:', error);
      this.xu_ly_loi.taoLoi(LoaiLoi.NOTION_API_ERROR, 'Lấy danh sách databases thất bại', {
        context: { error: String(error) }
      });
      return [];
    }
  }

  /**
   * Lấy thông tin database cụ thể
   */
  async lay_thong_tin_database(database_id: string): Promise<any | null> {
    if (!this.notion_client) return null;

    try {
      const database = await this.notion_client.databases.retrieve({
        database_id
      });
      
      return database;
    } catch (error) {
      console.error('[Notion API] Lỗi lấy thông tin database:', error);
      return null;
    }
  }

  /**
   * Lưu URL đơn giản với note
   */
  async luu_url_voi_ghi_chu(
    database_id: string,
    url: string,
    tieu_de: string,
    ghi_chu?: string
  ): Promise<KetQuaLuuNotion> {
    const thoi_gian_bat_dau = Date.now();

    try {
      if (!this.notion_client) {
        throw new Error('Chưa kết nối với Notion');
      }

      const response = await this.notion_client.pages.create({
        parent: {
          type: 'database_id',
          database_id: database_id
        },
        properties: {
          'Tiêu đề': {
            title: [
              {
                text: { content: tieu_de }
              }
            ]
          },
          'URL': {
            url: url
          },
          'Ghi chú': {
            rich_text: ghi_chu ? [
              {
                text: { content: ghi_chu }
              }
            ] : []
          },
          'Ngày lưu': {
            date: {
              start: new Date().toISOString()
            }
          }
        }
      });

      const thoi_gian_xu_ly = Date.now() - thoi_gian_bat_dau;

      return {
        thanh_cong: true,
        page_id: response.id,
        url_notion: `https://notion.so/${response.id}`,
        thoi_gian_xu_ly
      };
    } catch (error) {
      const thoi_gian_xu_ly = Date.now() - thoi_gian_bat_dau;
      console.error('[Notion API] Lỗi lưu URL:', error);

      return {
        thanh_cong: false,
        thong_bao_loi: 'Không thể lưu URL vào Notion',
        thoi_gian_xu_ly
      };
    }
  }

  /**
   * Lấy thông tin kết nối hiện tại
   */
  lay_ket_noi_hien_tai(): KetNoiNotion | null {
    return this.ket_noi_hien_tai;
  }

  /**
   * Ngắt kết nối Notion
   */
  ngat_ket_noi(): void {
    this.notion_client = null;
    this.ket_noi_hien_tai = null;
    console.log('[Notion API] Đã ngắt kết nối');
  }

  /**
   * Kiểm tra API key có hợp lệ không
   */
  async kiem_tra_api_key(api_key: string): Promise<boolean> {
    try {
      const temp_client = new Client({
        auth: api_key,
        timeoutMs: 5000
      });

      await temp_client.users.me({});
      return true;
    } catch (error) {
      console.error('[Notion API] API key không hợp lệ:', error);
      return false;
    }
  }
}
