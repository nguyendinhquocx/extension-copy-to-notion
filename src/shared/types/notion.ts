/**
 * Notion API Type Definitions
 * Định nghĩa types cho tích hợp Notion API
 */

// Kết nối Notion Configuration
export interface KetNoiNotion {
  api_key: string;
  database_id: string;
  workspace_id?: string;
  la_ket_noi_hop_le: boolean;
  ngay_ket_noi_cuoi: Date;
  ten_workspace?: string;
  ten_database?: string;
}

// Nội dung trang web được lưu
export interface NoiDungTrang {
  tieu_de: string;
  noi_dung: string;
  url: string;
  meta_data: MetaDataTrang;
  ngay_luu: Date;
  loai_noi_dung: LoaiNoiDung;
  thoi_gian_doc_uoc_tinh?: number; // phút
}

// Metadata của trang web
export interface MetaDataTrang {
  mo_ta?: string;
  anh_dai_dien?: string;
  tac_gia?: string;
  ngay_xuat_ban?: Date;
  tu_khoa: string[];
  domain: string;
  ngon_ngu: string;
  favicon_url?: string;
  canonical_url?: string;
}

// Yêu cầu lưu vào Notion
export interface YeuCauLuuNotion {
  noi_dung: NoiDungTrang;
  cau_hinh: KetNoiNotion;
  tuy_chon_luu?: TuyChonLuuTrang;
  database_id_cu_the?: string; // Override default database
}

// Tùy chọn khi lưu trang
export interface TuyChonLuuTrang {
  bao_gom_hinh_anh: boolean;
  dinh_dang_markdown: boolean;
  them_thu_vien_tags: boolean;
  tu_dong_phan_loai: boolean;
  lam_sach_noi_dung: boolean;
  gioi_han_ky_tu?: number;
  chi_luu_noi_dung_chinh: boolean;
}

// Kết quả sau khi lưu
export interface KetQuaLuuNotion {
  thanh_cong: boolean;
  page_id?: string;
  url_notion?: string;
  thong_bao_loi?: string;
  thoi_gian_xu_ly: number; // milliseconds
  so_ky_tu_da_luu?: number;
  database_ten?: string;
}

// Notion Database Information
export interface ThongTinDatabase {
  id: string;
  ten: string;
  mo_ta?: string;
  icon?: {
    type: 'emoji' | 'external' | 'file';
    emoji?: string;
    external?: { url: string };
    file?: { url: string };
  };
  cover?: {
    type: 'external' | 'file';
    external?: { url: string };
    file?: { url: string };
  };
  thuoc_tinh: ThuocTinhDatabase[];
  so_trang: number;
  ngay_cap_nhat_cuoi: Date;
}

// Database Properties
export interface ThuocTinhDatabase {
  id: string;
  ten: string;
  loai: LoaiThuocTinhNotion;
  cau_hinh?: any; // Specific configuration based on property type
}

// Notion Property Types
export enum LoaiThuocTinhNotion {
  TITLE = 'title',
  RICH_TEXT = 'rich_text',
  NUMBER = 'number',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  DATE = 'date',
  PEOPLE = 'people',
  FILES = 'files',
  CHECKBOX = 'checkbox',
  URL = 'url',
  EMAIL = 'email',
  PHONE_NUMBER = 'phone_number',
  FORMULA = 'formula',
  RELATION = 'relation',
  ROLLUP = 'rollup',
  CREATED_TIME = 'created_time',
  CREATED_BY = 'created_by',
  LAST_EDITED_TIME = 'last_edited_time',
  LAST_EDITED_BY = 'last_edited_by'
}

// Content Types
export enum LoaiNoiDung {
  BAI_VIET = 'bai-viet',
  TRANG_TIN_TUC = 'trang-tin-tuc',
  BLOG_POST = 'blog-post',
  NGHIEN_CUU = 'nghien-cuu',
  TAI_LIEU = 'tai-lieu',
  TUTORIAL = 'tutorial',
  VIDEO = 'video',
  PODCAST = 'podcast',
  SAN_PHAM = 'san-pham',
  KHAC = 'khac'
}

// Notion API Response Types
export interface NotionPageResponse {
  object: 'page';
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: NotionUser;
  last_edited_by: NotionUser;
  cover?: NotionFile;
  icon?: NotionIcon;
  parent: NotionParent;
  archived: boolean;
  properties: Record<string, NotionPropertyValue>;
  url: string;
  public_url?: string;
}

export interface NotionUser {
  object: 'user';
  id: string;
  name?: string;
  avatar_url?: string;
  type: 'person' | 'bot';
  person?: {
    email?: string;
  };
  bot?: Record<string, unknown>;
}

export interface NotionFile {
  type: 'external' | 'file';
  external?: {
    url: string;
  };
  file?: {
    url: string;
    expiry_time: string;
  };
}

export interface NotionIcon {
  type: 'emoji' | 'external' | 'file';
  emoji?: string;
  external?: {
    url: string;
  };
  file?: {
    url: string;
    expiry_time: string;
  };
}

export interface NotionParent {
  type: 'database_id' | 'page_id' | 'workspace';
  database_id?: string;
  page_id?: string;
  workspace?: boolean;
}

export interface NotionPropertyValue {
  id: string;
  type: string;
  [key: string]: any; // Specific value based on property type
}

// Search and Filter Types
export interface TimKiemNotion {
  query?: string;
  sort?: {
    property: string;
    direction: 'ascending' | 'descending';
  };
  filter?: any; // Notion filter object
  start_cursor?: string;
  page_size?: number;
}

export interface KetQuaTimKiem {
  object: 'list';
  results: NotionPageResponse[];
  next_cursor?: string;
  has_more: boolean;
  type: 'page' | 'database';
  page: Record<string, unknown>;
}

// Workspace Information
export interface ThongTinWorkspace {
  workspace: {
    id: string;
    name: string;
    domain?: string;
    icon?: NotionIcon;
  };
  results: ThongTinDatabase[];
  co_them_database: boolean;
  tong_so_database: number;
}

// Template for Page Creation
export interface MauTrang {
  id: string;
  ten: string;
  mo_ta?: string;
  thuoc_tinh_mac_dinh: Record<string, any>;
  icon_mac_dinh?: NotionIcon;
  cover_mac_dinh?: NotionFile;
}

// API Error Types
export interface NotionAPIError {
  object: 'error';
  status: number;
  code: string;
  message: string;
  developer_survey?: string;
}

// Rate Limiting Info
export interface ThongTinRateLimit {
  requests_remaining: number;
  reset_time: Date;
  requests_per_minute: number;
  current_usage: number;
}
