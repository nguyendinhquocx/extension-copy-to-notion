/**
 * Web Content Type Definitions
 * Định nghĩa types cho xử lý nội dung trang web
 */

// Phần tử được chọn trên trang
export interface PhanTuDuocChon {
  element: HTMLElement;
  so_thu_tu: number;
  noi_dung_text: string;
  noi_dung_html: string;
  loai_phan_tu: LoaiPhanTu;
  vi_tri: ViTriPhanTu;
  duong_dan_css: string;
  thuoc_tinh: Record<string, string>;
  co_quan_trong: boolean;
}

// Vị trí phần tử trên trang
export interface ViTriPhanTu {
  x: number;
  y: number;
  chieu_rong: number;
  chieu_cao: number;
  trong_viewport: boolean;
  khoang_cach_tu_top: number;
  khoang_cach_tu_left: number;
  z_index: number;
}

// Nội dung được chọn
export interface NoiDungDaChon {
  cac_phan_tu: PhanTuDuocChon[];
  tong_so_ky_tu: number;
  ngay_chon: Date;
  url_trang: string;
  tieu_de_trang: string;
  vung_chon: VungLuaChon;
  phuong_thuc_chon: PhuongThucChon;
}

// Vùng lựa chọn
export interface VungLuaChon {
  bat_dau: ViTri2D;
  ket_thuc: ViTri2D;
  dien_tich: number;
  so_phan_tu_trong_vung: number;
  loai_vung: 'rectangle' | 'freeform' | 'text-selection';
}

export interface ViTri2D {
  x: number;
  y: number;
}

// Phương thức chọn nội dung
export enum PhuongThucChon {
  CLICK_SIMPLE = 'click-simple',
  DRAG_SELECTION = 'drag-selection',
  TEXT_SELECTION = 'text-selection',
  CONTEXT_MENU = 'context-menu',
  KEYBOARD_SHORTCUT = 'keyboard-shortcut',
  AUTO_DETECTION = 'auto-detection'
}

// Loại phần tử HTML
export enum LoaiPhanTu {
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  LIST = 'list',
  LIST_ITEM = 'list-item',
  LINK = 'link',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  TABLE = 'table',
  FORM = 'form',
  BUTTON = 'button',
  INPUT = 'input',
  CODE = 'code',
  BLOCKQUOTE = 'blockquote',
  ARTICLE = 'article',
  SECTION = 'section',
  DIV = 'div',
  SPAN = 'span',
  UNKNOWN = 'unknown'
}

// Tùy chọn trích xuất nội dung
export interface TuyChonTrichXuat {
  bao_gom_hinh_anh: boolean;
  bao_gom_lien_ket: boolean;
  lam_sach_html: boolean;
  gioi_han_ky_tu?: number;
  loai_bo_quang_cao: boolean;
  chi_lay_noi_dung_chinh: boolean;
  bao_gom_metadata: boolean;
  dinh_dang_output: DinhDangOutput;
  bo_loc_css_selector?: string[];
  loai_tru_css_selector?: string[];
}

// Định dạng output
export enum DinhDangOutput {
  PLAIN_TEXT = 'plain-text',
  HTML = 'html',
  MARKDOWN = 'markdown',
  JSON = 'json'
}

// Kết quả trích xuất
export interface KetQuaTrichXuat {
  url: string;
  title: string;
  noi_dung: string;
  meta_data: Record<string, any>;
  thoi_gian_trich_xuat: Date;
  loai_trang: string;
  ngon_ngu: string;
  do_tin_cay: number;
  thanh_cong?: boolean;
  metadata?: MetaDataTrichXuat;
  loi?: string;
  canh_bao?: string[];
  thoi_gian_xu_ly?: number;
  so_phan_tu_da_xu_ly?: number;
}

// Metadata trích xuất
export interface MetaDataTrichXuat {
  so_ky_tu_goc: number;
  so_ky_tu_sau_lam_sach: number;
  so_hinh_anh_tim_thay: number;
  so_lien_ket_tim_thay: number;
  ngon_ngu_phat_hien: string;
  do_tin_cay_noi_dung: number; // 0-1
  cac_selector_da_dung: string[];
  thoi_gian_doc_uoc_tinh: number; // phút
}

// Bộ lọc nội dung
export interface BoLocNoiDung {
  loai_bo_quang_cao: boolean;
  loai_bo_navigation: boolean;
  loai_bo_footer: boolean;
  loai_bo_sidebar: boolean;
  loai_bo_comments: boolean;
  loai_bo_social_buttons: boolean;
  loai_bo_popup_overlay: boolean;
  chi_giu_noi_dung_chinh: boolean;
  custom_selectors_loai_bo: string[];
  custom_selectors_giu_lai: string[];
}

// Cấu hình auto-detection
export interface CauHinhAutoDetect {
  kich_hoat: boolean;
  nguong_tin_cay: number; // 0-1
  uu_tien_selector: string[];
  loai_tru_selector: string[];
  phat_hien_article: boolean;
  phat_hien_main_content: boolean;
  phat_hien_text_dense_areas: boolean;
}

// Thông tin trang web
export interface ThongTinTrangWeb {
  url: string;
  domain: string;
  title: string;
  description?: string;
  keywords: string[];
  author?: string;
  publish_date?: Date;
  language: string;
  canonical_url?: string;
  og_data: OpenGraphData;
  twitter_data: TwitterCardData;
  schema_org_data?: any;
  favicon_url?: string;
  rss_feeds: string[];
}

// Open Graph Data
export interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  site_name?: string;
  locale?: string;
}

// Twitter Card Data
export interface TwitterCardData {
  card?: string;
  title?: string;
  description?: string;
  image?: string;
  site?: string;
  creator?: string;
}

// Readable Content Analysis
export interface PhanTichNoiDung {
  do_doc_duoc: number; // 0-1 readability score
  mat_do_text: number; // characters per square pixel
  so_luong_hinh_anh: number;
  so_luong_lien_ket: number;
  phan_cap_heading: HeadingStructure[];
  ngon_ngu_chinh: string;
  do_tin_cay: number; // 0-1 confidence score
  dac_diem_noi_dung: ContentFeatures;
}

export interface HeadingStructure {
  level: number; // h1, h2, h3, etc.
  text: string;
  position: number; // character position in document
}

export interface ContentFeatures {
  co_table: boolean;
  co_list: boolean;
  co_code_block: boolean;
  co_blockquote: boolean;
  co_embedded_media: boolean;
  pattern_phat_hien: string[]; // detected content patterns
}

// Smart Selection
export interface LuaChonThongMinh {
  cac_vung_de_xuat: VungDeXuat[];
  vung_duoc_chon?: VungDeXuat;
  do_chinh_xac: number; // 0-1
  li_do_de_xuat: string[];
  thoi_gian_phan_tich: number;
}

export interface VungDeXuat {
  selector: string;
  element: HTMLElement;
  diem_so: number; // relevance score
  li_do: string;
  preview_text: string;
  so_ky_tu: number;
  loai_noi_dung_du_doan: LoaiNoiDung;
}

// Content Extraction Status
export enum TrangThaiTrichXuat {
  CHUA_BAT_DAU = 'chua-bat-dau',
  DANG_PHAN_TICH = 'dang-phan-tich',
  DANG_TRICH_XUAT = 'dang-trich-xuat',
  DANG_LAM_SACH = 'dang-lam-sach',
  HOAN_THANH = 'hoan-thanh',
  LOI = 'loi',
  HUY_BO = 'huy-bo'
}

// Progress Information
export interface TienDoTrichXuat {
  trang_thai: TrangThaiTrichXuat;
  phan_tram_hoan_thanh: number; // 0-100
  buoc_hien_tai: string;
  thoi_gian_con_lai_uoc_tinh?: number; // seconds
  so_phan_tu_da_xu_ly: number;
  tong_so_phan_tu: number;
}

// Content Validation
export interface KiemTraNoiDung {
  hop_le: boolean;
  cac_loi: string[];
  cac_canh_bao: string[];
  de_xuat_sua_chua: string[];
  diem_chat_luong: number; // 0-1 quality score
}

// Content Type Detection
export enum LoaiTrangWeb {
  BLOG_POST = 'blog-post',
  NEWS_ARTICLE = 'news-article',
  ACADEMIC_PAPER = 'academic-paper',
  DOCUMENTATION = 'documentation',
  TUTORIAL = 'tutorial',
  PRODUCT_PAGE = 'product-page',
  LANDING_PAGE = 'landing-page',
  SOCIAL_MEDIA = 'social-media',
  VIDEO_PAGE = 'video-page',
  FORUM_POST = 'forum-post',
  UNKNOWN = 'unknown'
}

// Import từ types khác
import { LoaiNoiDung } from './notion';

// Export tất cả types để sử dụng
export * from './notion';
