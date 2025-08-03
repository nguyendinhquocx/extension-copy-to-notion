/**
 * Popup UI Type Definitions
 * Định nghĩa types cho giao diện popup của extension
 */

// Trạng thái chính của popup
export interface TrangThaiPopup {
  dang_tai: boolean;
  co_loi: boolean;
  thong_bao_loi?: string;
  buoc_hien_tai: BuocThucHien;
  progress: number; // 0-100
  co_the_thuc_hien: boolean;
}

// Các bước thực hiện trong popup
export enum BuocThucHien {
  SAP_XEP = 'sap-xep',
  KIEM_TRA_TRANG = 'kiem-tra-trang',
  CHON_NOI_DUNG = 'chon-noi-dung',
  XU_LY_NOI_DUNG = 'xu-ly-noi-dung',
  HIEN_THI_PREVIEW = 'hien-thi-preview',
  KET_NOI_NOTION = 'ket-noi-notion',
  LUU_VAO_NOTION = 'luu-vao-notion',
  HOAN_THANH = 'hoan-thanh'
}

// Cấu hình popup UI
export interface CauHinhPopupUI {
  theme: Theme;
  ngon_ngu: NgonNgu;
  kich_thuoc: KichThuocPopup;
  hien_thi_debug: boolean;
  tu_dong_dong: boolean;
  thoi_gian_auto_close?: number; // seconds
  hieu_ung_animation: boolean;
  am_thanh_thong_bao: boolean;
}

// Theme UI
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
  HIGH_CONTRAST = 'high-contrast'
}

// Ngôn ngữ UI
export enum NgonNgu {
  VIETNAMESE = 'vi',
  ENGLISH = 'en'
}

// Kích thước popup
export interface KichThuocPopup {
  chieu_rong: number;
  chieu_cao: number;
  co_the_thay_doi_kich_thuoc: boolean;
  kich_thuoc_toi_thieu: { chieu_rong: number; chieu_cao: number };
  kich_thuoc_toi_da: { chieu_rong: number; chieu_cao: number };
}

// Form data trong popup
export interface FormDataPopup {
  tieu_de_notion: string;
  database_id?: string;
  properties_notion: Record<string, any>;
  tags: string[];
  ghi_chu: string;
  che_do_luu: CheDoChuyen;
  dinh_dang_markdown: boolean;
  bao_gom_metadata: boolean;
  bao_gom_hinh_anh: boolean;
  bao_gom_link_goc: boolean;
}

// Chế độ chuyển đổi
export enum CheDoChuyen {
  TU_DONG = 'tu-dong',
  CHI_TEXT = 'chi-text',
  HTML_TO_MD = 'html-to-md',
  RAW_HTML = 'raw-html',
  CUSTOM = 'custom'
}

// Thông tin preview
export interface ThongTinPreview {
  tieu_de: string;
  noi_dung_markdown: string;
  metadata: PreviewMetadata;
  so_ky_tu: number;
  so_tu: number;
  thoi_gian_doc_uoc_tinh: number; // phút
  dang_tai_hinh_anh: boolean;
  cac_hinh_anh_loi: string[]; // URLs failed to load
}

export interface PreviewMetadata {
  url_goc: string;
  tieu_de_trang: string;
  ngay_trich_xuat: Date;
  so_phan_tu_da_chon: number;
  phuong_thuc_chon: string;
  chat_luong_noi_dung: number; // 0-1
}

// Component states
export interface ComponentState {
  header: HeaderState;
  content_selector: ContentSelectorState;
  preview_panel: PreviewPanelState;
  form_controls: FormControlsState;
  footer: FooterState;
  notifications: NotificationState;
}

export interface HeaderState {
  title: string;
  subtitle?: string;
  hien_thi_close_button: boolean;
  hien_thi_minimize_button: boolean;
  hien_thi_help_button: boolean;
  connection_status: TrangThaiKetNoi;
}

export enum TrangThaiKetNoi {
  CHUA_KET_NOI = 'chua-ket-noi',
  DANG_KET_NOI = 'dang-ket-noi',
  DA_KET_NOI = 'da-ket-noi',
  LOI_KET_NOI = 'loi-ket-noi',
  MAT_KET_NOI = 'mat-ket-noi'
}

export interface ContentSelectorState {
  mode: CheDochon;
  selection_active: boolean;
  cac_vung_de_xuat: VungDeXuatUI[];
  vung_dang_chon?: VungDeXuatUI;
  tools_visible: boolean;
  overlay_active: boolean;
}

export enum CheDochon {
  AUTO = 'auto',
  MANUAL = 'manual',
  SMART_SELECT = 'smart-select',
  CUSTOM_SELECTOR = 'custom-selector'
}

export interface VungDeXuatUI {
  id: string;
  title: string;
  description: string;
  preview_text: string;
  so_ky_tu: number;
  confidence_score: number;
  is_selected: boolean;
  is_suggested: boolean;
  highlight_color: string;
}

export interface PreviewPanelState {
  visible: boolean;
  mode: CheDoPreview;
  scroll_position: number;
  zoom_level: number;
  word_wrap: boolean;
  line_numbers: boolean;
  search_query?: string;
  highlighted_matches: number[];
}

export enum CheDoPreview {
  MARKDOWN = 'markdown',
  HTML = 'html',
  RENDERED = 'rendered',
  JSON = 'json'
}

export interface FormControlsState {
  expanded: boolean;
  validation_errors: Record<string, string>;
  is_submitting: boolean;
  auto_save: boolean;
  unsaved_changes: boolean;
  database_list_loading: boolean;
  available_databases: NotionDatabase[];
}

export interface NotionDatabase {
  id: string;
  title: string;
  description?: string;
  properties: NotionProperty[];
  created_time: Date;
  last_edited_time: Date;
  url: string;
  icon?: string;
}

export interface NotionProperty {
  id: string;
  name: string;
  type: NotionPropertyType;
  required: boolean;
  description?: string;
  options?: any; // specific to property type
}

export enum NotionPropertyType {
  TITLE = 'title',
  TEXT = 'rich_text',
  NUMBER = 'number',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  DATE = 'date',
  CHECKBOX = 'checkbox',
  URL = 'url',
  EMAIL = 'email',
  PHONE = 'phone_number',
  RELATION = 'relation',
  ROLLUP = 'rollup',
  PEOPLE = 'people',
  FILES = 'files',
  FORMULA = 'formula',
  CREATED_TIME = 'created_time',
  CREATED_BY = 'created_by',
  LAST_EDITED_TIME = 'last_edited_time',
  LAST_EDITED_BY = 'last_edited_by'
}

export interface FooterState {
  visible: boolean;
  actions_enabled: boolean;
  shortcuts_visible: boolean;
  status_message?: string;
  progress_visible: boolean;
}

// Notifications
export interface NotificationState {
  notifications: ThongBao[];
  max_notifications: number;
  auto_dismiss_time: number; // ms
  sound_enabled: boolean;
}

export interface ThongBao {
  id: string;
  type: LoaiThongBao;
  title: string;
  message: string;
  action?: ThongBaoAction;
  timestamp: Date;
  dismissible: boolean;
  auto_dismiss: boolean;
  duration?: number; // ms
  persistent: boolean;
}

export enum LoaiThongBao {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  LOADING = 'loading'
}

export interface ThongBaoAction {
  label: string;
  action: string;
  style: 'primary' | 'secondary' | 'danger';
}

// Keyboard shortcuts
export interface PhimTat {
  key_combination: string;
  description: string;
  action: string;
  enabled: boolean;
  scope: 'global' | 'popup-only';
}

// Accessibility
export interface CauHinhTruyCapability {
  high_contrast: boolean;
  large_text: boolean;
  reduce_motion: boolean;
  screen_reader_support: boolean;
  keyboard_navigation_only: boolean;
  focus_indicators: boolean;
  aria_labels_verbose: boolean;
}

// Performance monitoring
export interface HieuSuatPopup {
  render_time: number; // ms
  memory_usage: number; // MB
  api_response_times: Record<string, number>;
  user_interaction_lag: number; // ms
  bundle_size: number; // KB
  load_time: number; // ms
}

// Error handling
export interface PopupError {
  id: string;
  type: LoaiLoiPopup;
  message: string;
  stack?: string;
  user_action: string;
  timestamp: Date;
  resolved: boolean;
  recovery_suggestions: string[];
}

export enum LoaiLoiPopup {
  NETWORK_ERROR = 'network-error',
  NOTION_API_ERROR = 'notion-api-error',
  CONTENT_EXTRACTION_ERROR = 'content-extraction-error',
  UI_RENDER_ERROR = 'ui-render-error',
  VALIDATION_ERROR = 'validation-error',
  STORAGE_ERROR = 'storage-error',
  PERMISSION_ERROR = 'permission-error',
  UNKNOWN_ERROR = 'unknown-error'
}

// Animation states
export interface TrangThaiAnimation {
  loading_spinner: boolean;
  page_transition: boolean;
  button_feedback: boolean;
  notification_slide: boolean;
  progress_bar: boolean;
  hover_effects: boolean;
  focus_animations: boolean;
}

// Modal dialogs
export interface ModalState {
  active_modal?: LoaiModal;
  modal_data?: any;
  overlay_click_closes: boolean;
  escape_key_closes: boolean;
  prevent_scroll: boolean;
}

export enum LoaiModal {
  SETTINGS = 'settings',
  HELP = 'help',
  ERROR_DETAILS = 'error-details',
  DATABASE_SELECTOR = 'database-selector',
  CONFIRMATION = 'confirmation',
  CUSTOM_SELECTOR = 'custom-selector',
  ABOUT = 'about'
}

// Context menu
export interface ContextMenuState {
  visible: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  target_element?: string;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
  shortcut?: string;
  action: string;
}

// Drag and drop
export interface DragDropState {
  dragging: boolean;
  drag_type: 'file' | 'text' | 'url';
  drag_data?: any;
  drop_zones: DropZone[];
  valid_drop_target?: string;
}

export interface DropZone {
  id: string;
  element_selector: string;
  accepted_types: string[];
  highlight_on_hover: boolean;
  feedback_message: string;
}

// Export all types
export * from './trang-web';
export * from './notion';
export * from './extension';
