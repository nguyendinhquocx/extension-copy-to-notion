/**
 * Extension-specific Type Definitions  
 * Định nghĩa types cho Chrome Extension functionality
 */

// Trạng thái Extension
export interface TrangThaiExtension {
  dang_ket_noi: boolean;
  co_loi: boolean;
  thong_bao_hien_tai?: string;
  lan_su_dung_cuoi: Date;
  phien_ban: string;
  che_do_debug: boolean;
}

// Cấu hình người dùng
export interface CauHinhNguoiDung {
  notion_api_key: string;
  database_id_mac_dinh: string;
  tu_dong_dong_popup: boolean;
  hien_thi_thong_bao: boolean;
  ngon_ngu_giao_dien: 'vi' | 'en';
  che_do_toi_gian: boolean;
  tu_dong_lam_sach: boolean;
  gioi_han_ky_tu_mac_dinh: number;
  luu_lich_su_local: boolean;
  dong_bo_cau_hinh_cloud: boolean;
  auto_inject?: boolean; // Tự động inject content script
}

// Phiên làm việc
export interface PhienLamViec {
  session_id: string;
  ngay_bat_dau: Date;
  so_trang_da_luu: number;
  thoi_gian_su_dung: number; // seconds
  loi_gap_phai: string[];
  cac_domain_da_truy_cap: string[];
  database_da_su_dung: string[];
}

// Thống kê Extension
export interface ThongKeExtension {
  tong_so_trang_luu: number;
  tong_thoi_gian_su_dung: number; // seconds
  database_duoc_su_dung_nhieu: string;
  lan_cap_nhat_cuoi: Date;
  phien_ban_extension: string;
  so_lan_loi: number;
  domain_pho_bien_nhat: string;
  loai_noi_dung_pho_bien: string;
  thoi_gian_trung_binh_luu: number; // milliseconds
}

// Context Menu Items
export interface ContextMenuItem {
  id: string;
  title: string;
  contexts: chrome.contextMenus.ContextType[];
  visible: boolean;
  enabled: boolean;
  onclick?: (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => void;
}

// Extension Commands (Keyboard Shortcuts)
export interface ExtensionCommand {
  name: string;
  description: string;
  shortcut?: string;
  handler: () => void | Promise<void>;
}

// Storage Data Structure
export interface DuLieuStorage {
  cau_hinh_nguoi_dung: CauHinhNguoiDung;
  thong_ke: ThongKeExtension;
  phien_hien_tai: PhienLamViec;
  lich_su_luu: LichSuLuuTrang[];
  cache_database: Record<string, any>;
  lan_dong_bo_cuoi: Date;
}

// Lịch sử lưu trang
export interface LichSuLuuTrang {
  id: string;
  url: string;
  tieu_de: string;
  ngay_luu: Date;
  notion_page_id?: string;
  notion_url?: string;
  database_id: string;
  database_ten: string;
  so_ky_tu: number;
  thoi_gian_xu_ly: number;
  thanh_cong: boolean;
  thong_bao_loi?: string;
}

// Tab Information
export interface ThongTinTab {
  id: number;
  url: string;
  title: string;
  favicon_url?: string;
  active: boolean;
  pinned: boolean;
  window_id: number;
  index: number;
  loading: boolean;
  domain: string;
  co_the_truy_cap: boolean;
}

// Message Types for Extension Communication
export enum LoaiMessage {
  // Popup to Background
  KIEM_TRA_KET_NOI = 'kiem-tra-ket-noi',
  LUU_TRANG = 'luu-trang',
  LAY_CAU_HINH = 'lay-cau-hinh',
  CAP_NHAT_CAU_HINH = 'cap-nhat-cau-hinh',
  LAY_THONG_KE = 'lay-thong-ke',
  LAY_LICH_SU = 'lay-lich-su',
  
  // Background to Content
  TRICH_XUAT_NOI_DUNG = 'trich-xuat-noi-dung',
  HIEN_THI_LOADING = 'hien-thi-loading',
  AN_LOADING = 'an-loading',
  HIEN_THI_KET_QUA = 'hien-thi-ket-qua',
  
  // Content to Background
  NOI_DUNG_DA_TRICH_XUAT = 'noi-dung-da-trich-xuat',
  NGUOI_DUNG_HUY = 'nguoi-dung-huy',
  TAB_DA_THAY_DOI = 'tab-da-thay-doi',
  
  // Background to Popup
  CAU_HINH_DA_CAP_NHAT = 'cau-hinh-da-cap-nhat',
  KET_QUA_LUU = 'ket-qua-luu',
  THONG_KE_DA_CAP_NHAT = 'thong-ke-da-cap-nhat',
  
  // Error Messages
  LOI_NETWORK = 'loi-network',
  LOI_PERMISSION = 'loi-permission',
  LOI_NOTION_API = 'loi-notion-api',
  LOI_KHONG_XAC_DINH = 'loi-khong-xac-dinh'
}

// Message Data Structure
export interface MessageData<T = any> {
  type: LoaiMessage;
  payload?: T;
  sender: 'popup' | 'background' | 'content';
  timestamp: Date;
  request_id?: string;
}

// Response Message
export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  request_id?: string;
  timestamp: Date;
}

// Permission Types
export interface QuyenHan {
  active_tab: boolean;
  storage: boolean;
  notifications: boolean;
  context_menus: boolean;
  scripting: boolean;
  host_permissions: string[];
  co_day_du_quyen_han: boolean;
}

// Notification Data
export interface ThongBaoExtension {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  icon_url?: string;
  action_buttons?: NotificationButton[];
  auto_hide_after?: number; // milliseconds
  click_handler?: () => void;
}

export interface NotificationButton {
  title: string;
  icon_url?: string;
  handler: () => void;
}

// Badge Information
export interface ThongTinBadge {
  text: string;
  background_color: string;
  text_color: string;
  tooltip?: string;
}

// Extension Update Information
export interface ThongTinCapNhat {
  phien_ban_hien_tai: string;
  phien_ban_moi_nhat: string;
  co_cap_nhat: boolean;
  ghi_chu_cap_nhat?: string;
  bat_buoc_cap_nhat: boolean;
  url_cap_nhat?: string;
}

// Performance Metrics
export interface MetricHieuSuat {
  thoi_gian_khoi_dong: number; // milliseconds
  thoi_gian_ket_noi_notion: number;
  thoi_gian_trich_xuat_trung_binh: number;
  thoi_gian_luu_trung_binh: number;
  so_lan_restart: number;
  memory_usage: number; // MB
  cpu_usage: number; // percentage
}

// Debug Information
export interface ThongTinDebug {
  che_do_debug: boolean;
  log_level: 'verbose' | 'info' | 'warn' | 'error';
  log_entries: LogEntry[];
  performance_metrics: MetricHieuSuat;
  browser_info: BrowserInfo;
  extension_info: ExtensionInfo;
}

export interface LogEntry {
  timestamp: Date;
  level: 'verbose' | 'info' | 'warn' | 'error';
  message: string;
  context?: string;
  data?: any;
}

export interface BrowserInfo {
  name: string;
  version: string;
  platform: string;
  language: string;
  user_agent: string;
}

export interface ExtensionInfo {
  id: string;
  version: string;
  manifest_version: number;
  installation_date: Date;
  enabled: boolean;
  permissions: string[];
}
