/**
 * Main Content Processing & Notion Integration Orchestrator
 * Điều phối toàn bộ quá trình xử lý và lưu nội dung
 */

import { KetQuaTrichXuat } from '../types/trang-web';
import { KetNoiNotion, NotionPageResponse } from '../types/notion';
import { XuLyNoiDungPhongPhu, NoiDungDaDuocXuLy, TuyChonXuLy } from './xu-ly-noi-dung-phong-phu';
import { TichHopNotionAPI } from './tich-hop-notion-api';

/**
 * Processing workflow status
 */
export interface TrangThaiXuLy {
  buoc_hien_tai: string;
  tien_do: number; // 0-100
  thoi_gian_bat_dau: Date;
  thoi_gian_uoc_tinh?: Date;
  loi?: string;
  canh_bao?: string[];
}

/**
 * Workflow result
 */
export interface KetQuaWorkflow {
  thanh_cong: boolean;
  notion_page?: NotionPageResponse;
  processed_content?: NoiDungDaDuocXuLy;
  thong_ke_xu_ly: ThongKeXuLy;
  loi?: string;
  trang_thai_cuoi: TrangThaiXuLy;
}

/**
 * Processing statistics
 */
export interface ThongKeXuLy {
  thoi_gian_tong: number; // ms
  thoi_gian_rich_processing: number;
  thoi_gian_notion_upload: number;
  so_blocks_da_tao: number;
  kich_thuoc_noi_dung: number; // characters
  so_lan_thu_lai: number;
}

/**
 * Workflow options
 */
export interface TuyChonWorkflow {
  processing_options?: TuyChonXuLy;
  auto_retry?: boolean;
  max_retries?: number;
  notion_database_id?: string;
  enable_progress_callback?: boolean;
  progress_callback?: (status: TrangThaiXuLy) => void;
}

/**
 * Main orchestration service
 */
export class DieuPhoidNoidungVaNotion {
  private xu_ly_noi_dung_service: XuLyNoiDungPhongPhu;
  private notion_api_service: TichHopNotionAPI;
  private active_workflows: Map<string, TrangThaiXuLy> = new Map();

  constructor() {
    this.xu_ly_noi_dung_service = new XuLyNoiDungPhongPhu();
    this.notion_api_service = new TichHopNotionAPI();
  }

  /**
   * Khởi tạo orchestrator
   */
  async khoi_tao(): Promise<void> {
    try {
      await this.xu_ly_noi_dung_service.khoi_tao();
      await this.notion_api_service.khoi_tao();
      console.log('[DieuPhoidNoidungVaNotion] ✅ Orchestrator đã được khởi tạo');
    } catch (error) {
      console.error('[DieuPhoidNoidungVaNotion] ❌ Lỗi khởi tạo:', error);
      throw error;
    }
  }

  /**
   * Quy trình chính: Xử lý và lưu nội dung vào Notion
   */
  async xu_ly_va_luu_vao_notion(
    ket_qua_trich_xuat: KetQuaTrichXuat,
    ket_noi_notion: KetNoiNotion,
    tuy_chon?: TuyChonWorkflow
  ): Promise<KetQuaWorkflow> {
    const workflow_id = this.tao_workflow_id();
    const bat_dau = Date.now();
    
    let trang_thai: TrangThaiXuLy = {
      buoc_hien_tai: 'Khởi tạo quy trình',
      tien_do: 0,
      thoi_gian_bat_dau: new Date()
    };

    try {
      console.log('[DieuPhoidNoidungVaNotion] 🚀 Bắt đầu workflow xử lý và lưu');
      
      this.active_workflows.set(workflow_id, trang_thai);
      this.cap_nhat_trang_thai(workflow_id, trang_thai, tuy_chon?.progress_callback);

      // Bước 1: Rich Content Processing
      trang_thai = {
        ...trang_thai,
        buoc_hien_tai: 'Xử lý nội dung phong phú',
        tien_do: 20
      };
      this.cap_nhat_trang_thai(workflow_id, trang_thai, tuy_chon?.progress_callback);

      const rich_processing_start = Date.now();
      const processed_content = await this.xu_ly_noi_dung_service.xu_ly_noi_dung_tho(
        ket_qua_trich_xuat,
        tuy_chon?.processing_options
      );
      const rich_processing_time = Date.now() - rich_processing_start;

      // Bước 2: Validate Notion connection
      trang_thai = {
        ...trang_thai,
        buoc_hien_tai: 'Kiểm tra kết nối Notion',
        tien_do: 40
      };
      this.cap_nhat_trang_thai(workflow_id, trang_thai, tuy_chon?.progress_callback);

      const ket_noi_status = await this.notion_api_service.kiem_tra_ket_noi(ket_noi_notion.api_key);
      if (!ket_noi_status.la_ket_noi_hop_le) {
        throw new Error('Kết nối Notion không hợp lệ');
      }

      // Bước 3: Prepare for Notion upload
      trang_thai = {
        ...trang_thai,
        buoc_hien_tai: 'Chuẩn bị dữ liệu cho Notion',
        tien_do: 60
      };
      this.cap_nhat_trang_thai(workflow_id, trang_thai, tuy_chon?.progress_callback);

      // Use custom database ID if provided
      const final_ket_noi = {
        ...ket_noi_notion,
        database_id: tuy_chon?.notion_database_id || ket_noi_notion.database_id
      };

      // Bước 4: Upload to Notion
      trang_thai = {
        ...trang_thai,
        buoc_hien_tai: 'Tải lên Notion',
        tien_do: 80
      };
      this.cap_nhat_trang_thai(workflow_id, trang_thai, tuy_chon?.progress_callback);

      const notion_upload_start = Date.now();
      const notion_page = await this.luu_rich_content_vao_notion(
        processed_content,
        final_ket_noi,
        tuy_chon?.auto_retry || false,
        tuy_chon?.max_retries || 3
      );
      const notion_upload_time = Date.now() - notion_upload_start;

      // Bước 5: Hoàn thành
      trang_thai = {
        ...trang_thai,
        buoc_hien_tai: 'Hoàn thành',
        tien_do: 100
      };
      this.cap_nhat_trang_thai(workflow_id, trang_thai, tuy_chon?.progress_callback);

      const thoi_gian_tong = Date.now() - bat_dau;

      const ket_qua: KetQuaWorkflow = {
        thanh_cong: true,
        notion_page,
        processed_content,
        thong_ke_xu_ly: {
          thoi_gian_tong,
          thoi_gian_rich_processing: rich_processing_time,
          thoi_gian_notion_upload: notion_upload_time,
          so_blocks_da_tao: processed_content.cac_block.length,
          kich_thuoc_noi_dung: ket_qua_trich_xuat.noi_dung.length,
          so_lan_thu_lai: 0
        },
        trang_thai_cuoi: trang_thai
      };

      console.log('[DieuPhoidNoidungVaNotion] ✅ Workflow hoàn thành thành công');
      this.active_workflows.delete(workflow_id);
      
      return ket_qua;

    } catch (error) {
      console.error('[DieuPhoidNoidungVaNotion] ❌ Lỗi workflow:', error);
      
      trang_thai = {
        ...trang_thai,
        buoc_hien_tai: 'Lỗi',
        loi: error instanceof Error ? error.message : 'Unknown error'
      };

      const ket_qua_loi: KetQuaWorkflow = {
        thanh_cong: false,
        thong_ke_xu_ly: {
          thoi_gian_tong: Date.now() - bat_dau,
          thoi_gian_rich_processing: 0,
          thoi_gian_notion_upload: 0,
          so_blocks_da_tao: 0,
          kich_thuoc_noi_dung: ket_qua_trich_xuat.noi_dung.length,
          so_lan_thu_lai: 0
        },
        loi: error instanceof Error ? error.message : 'Unknown error',
        trang_thai_cuoi: trang_thai
      };

      this.active_workflows.delete(workflow_id);
      return ket_qua_loi;
    }
  }

  /**
   * Lưu rich content với retry logic
   */
  private async luu_rich_content_vao_notion(
    processed_content: NoiDungDaDuocXuLy,
    ket_noi: KetNoiNotion,
    auto_retry: boolean,
    max_retries: number
  ): Promise<NotionPageResponse> {
    let attempt = 0;
    let last_error: Error | null = null;

    while (attempt <= max_retries) {
      try {
        console.log(`[DieuPhoidNoidungVaNotion] Thử lần ${attempt + 1}/${max_retries + 1}`);
        
        const result = await this.notion_api_service.luu_rich_content(
          processed_content,
          ket_noi
        );
        
        return result;
      } catch (error) {
        last_error = error instanceof Error ? error : new Error('Unknown error');
        attempt++;
        
        if (!auto_retry || attempt > max_retries) {
          break;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`[DieuPhoidNoidungVaNotion] Đợi ${delay}ms trước khi thử lại...`);
        await this.delay(delay);
      }
    }

    throw last_error || new Error('Failed to save to Notion after retries');
  }

  /**
   * Quy trình đơn giản: Chỉ xử lý rich content
   */
  async chi_xu_ly_rich_content(
    ket_qua_trich_xuat: KetQuaTrichXuat,
    tuy_chon?: TuyChonXuLy
  ): Promise<NoiDungDaDuocXuLy> {
    try {
      console.log('[DieuPhoidNoidungVaNotion] 🎨 Chỉ xử lý rich content');
      
      return await this.xu_ly_noi_dung_service.xu_ly_noi_dung_tho(
        ket_qua_trich_xuat,
        tuy_chon
      );
    } catch (error) {
      console.error('[DieuPhoidNoidungVaNotion] ❌ Lỗi xử lý rich content:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra và thiết lập Notion database
   */
  async thiet_lap_notion_database(
    api_key: string
  ): Promise<{ databases: Array<{ id: string; title: string; url: string }>; ket_noi: KetNoiNotion }> {
    try {
      console.log('[DieuPhoidNoidungVaNotion] 🔧 Thiết lập Notion database');

      // Kiểm tra kết nối
      const ket_noi = await this.notion_api_service.kiem_tra_ket_noi(api_key);
      
      if (!ket_noi.la_ket_noi_hop_le) {
        throw new Error('API key không hợp lệ');
      }

      // Lấy danh sách databases
      const databases = await this.notion_api_service.lay_danh_sach_databases(api_key);

      return { databases, ket_noi };
    } catch (error) {
      console.error('[DieuPhoidNoidungVaNotion] ❌ Lỗi thiết lập database:', error);
      throw error;
    }
  }

  /**
   * Tạo database mới nếu cần
   */
  async tao_database_moi(
    api_key: string,
    parent_page_id: string,
    database_name: string = 'Web Content Collection'
  ): Promise<{ id: string; url: string }> {
    try {
      console.log('[DieuPhoidNoidungVaNotion] 🏗️ Tạo database mới');
      
      return await this.notion_api_service.tao_database_web_content(
        api_key,
        parent_page_id,
        database_name
      );
    } catch (error) {
      console.error('[DieuPhoidNoidungVaNotion] ❌ Lỗi tạo database:', error);
      throw error;
    }
  }

  /**
   * Lấy trạng thái workflow
   */
  lay_trang_thai_workflow(workflow_id: string): TrangThaiXuLy | null {
    return this.active_workflows.get(workflow_id) || null;
  }

  /**
   * Lấy tất cả workflows đang chạy
   */
  lay_tat_ca_workflows(): Record<string, TrangThaiXuLy> {
    return Object.fromEntries(this.active_workflows);
  }

  /**
   * Hủy workflow
   */
  huy_workflow(workflow_id: string): boolean {
    if (this.active_workflows.has(workflow_id)) {
      this.active_workflows.delete(workflow_id);
      console.log(`[DieuPhoidNoidungVaNotion] Workflow ${workflow_id} đã được hủy`);
      return true;
    }
    return false;
  }

  /**
   * Utility methods
   */
  private tao_workflow_id(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cap_nhat_trang_thai(
    workflow_id: string, 
    trang_thai: TrangThaiXuLy, 
    callback?: (status: TrangThaiXuLy) => void
  ): void {
    this.active_workflows.set(workflow_id, trang_thai);
    
    if (callback) {
      try {
        callback(trang_thai);
      } catch (error) {
        console.warn('[DieuPhoidNoidungVaNotion] Lỗi progress callback:', error);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Batch processing support
   */
  async xu_ly_nhieu_noi_dung(
    danh_sach_trich_xuat: KetQuaTrichXuat[],
    ket_noi_notion: KetNoiNotion,
    tuy_chon?: TuyChonWorkflow
  ): Promise<KetQuaWorkflow[]> {
    const ket_qua: KetQuaWorkflow[] = [];
    
    console.log(`[DieuPhoidNoidungVaNotion] 📦 Bắt đầu xử lý batch: ${danh_sach_trich_xuat.length} items`);

    for (let i = 0; i < danh_sach_trich_xuat.length; i++) {
      const item = danh_sach_trich_xuat[i];
      
      try {
        console.log(`[DieuPhoidNoidungVaNotion] Xử lý item ${i + 1}/${danh_sach_trich_xuat.length}`);
        
        const ket_qua_item = await this.xu_ly_va_luu_vao_notion(
          item,
          ket_noi_notion,
          tuy_chon
        );
        
        ket_qua.push(ket_qua_item);
        
        // Small delay between items to avoid rate limiting
        if (i < danh_sach_trich_xuat.length - 1) {
          await this.delay(1000);
        }
        
      } catch (error) {
        console.error(`[DieuPhoidNoidungVaNotion] Lỗi item ${i + 1}:`, error);
        
        ket_qua.push({
          thanh_cong: false,
          thong_ke_xu_ly: {
            thoi_gian_tong: 0,
            thoi_gian_rich_processing: 0,
            thoi_gian_notion_upload: 0,
            so_blocks_da_tao: 0,
            kich_thuoc_noi_dung: item.noi_dung.length,
            so_lan_thu_lai: 0
          },
          loi: error instanceof Error ? error.message : 'Unknown error',
          trang_thai_cuoi: {
            buoc_hien_tai: 'Lỗi',
            tien_do: 0,
            thoi_gian_bat_dau: new Date(),
            loi: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }

    console.log(`[DieuPhoidNoidungVaNotion] ✅ Hoàn thành batch processing`);
    return ket_qua;
  }

  /**
   * Statistics and monitoring
   */
  lay_thong_ke_tong_quan(): {
    so_workflow_dang_chay: number;
    cache_sizes: {
      rich_content: number;
      notion_requests: number;
    };
  } {
    return {
      so_workflow_dang_chay: this.active_workflows.size,
      cache_sizes: {
        rich_content: this.xu_ly_noi_dung_service.lay_kich_thuoc_cache(),
        notion_requests: 0 // Notion service doesn't expose cache size
      }
    };
  }

  /**
   * Clear all caches
   */
  lam_moi_tat_ca_cache(): void {
    this.xu_ly_noi_dung_service.lam_moi_cache();
    this.notion_api_service.lam_moi_cache();
    console.log('[DieuPhoidNoidungVaNotion] ✅ Đã làm mới tất cả cache');
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.active_workflows.clear();
    this.xu_ly_noi_dung_service.cleanup();
    this.notion_api_service.cleanup();
  }
}
