/**
 * Application State Enums
 * Các enum định nghĩa trạng thái của ứng dụng
 */

/**
 * Trạng thái chính của extension
 */
export enum TrangThaiUngDung {
  KHOI_TAO = 'khoi-tao',
  SAN_SANG = 'san-sang',
  DANG_LAM_VIEC = 'dang-lam-viec',
  TAM_DUNG = 'tam-dung',
  LOI = 'loi',
  DONG = 'dong'
}

/**
 * Trạng thái kết nối mạng
 */
export enum TrangThaiMang {
  ONLINE = 'online',
  OFFLINE = 'offline',
  CHECKING = 'checking',
  LIMITED = 'limited'
}

/**
 * Trạng thái popup
 */
export enum TrangThaiPopup {
  LOADING = 'loading',
  READY = 'ready',
  WORKING = 'working',
  SUCCESS = 'success',
  ERROR = 'error',
  MINIMIZED = 'minimized'
}

/**
 * Trạng thái content script
 */
export enum TrangThaiContentScript {
  NOT_INJECTED = 'not-injected',
  INJECTING = 'injecting',
  READY = 'ready',
  WORKING = 'working',
  ERROR = 'error'
}

/**
 * Trạng thái background script
 */
export enum TrangThaiBackground {
  STARTING = 'starting',
  RUNNING = 'running',
  IDLE = 'idle',
  BUSY = 'busy',
  ERROR = 'error'
}

/**
 * Trạng thái xử lý dữ liệu
 */
export enum TrangThaiXuLy {
  CHUA_BAT_DAU = 'chua-bat-dau',
  DANG_XU_LY = 'dang-xu-ly',
  HOAN_THANH = 'hoan-thanh',
  LOI = 'loi',
  HUY_BO = 'huy-bo',
  TAM_DUNG = 'tam-dung'
}

/**
 * Trạng thái validation
 */
export enum TrangThaiValidation {
  CHUA_KIEM_TRA = 'chua-kiem-tra',
  DANG_KIEM_TRA = 'dang-kiem-tra',
  HOP_LE = 'hop-le',
  KHONG_HOP_LE = 'khong-hop-le',
  CANH_BAO = 'canh-bao'
}

/**
 * Trạng thái cache
 */
export enum TrangThaiCache {
  EMPTY = 'empty',
  LOADING = 'loading',
  FRESH = 'fresh',
  STALE = 'stale',
  EXPIRED = 'expired',
  ERROR = 'error'
}

/**
 * Trạng thái sync
 */
export enum TrangThaiSync {
  NOT_SYNCED = 'not-synced',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  CONFLICT = 'conflict',
  ERROR = 'error'
}

/**
 * Trạng thái cấu hình
 */
export enum TrangThaiCauHinh {
  NOT_CONFIGURED = 'not-configured',
  CONFIGURING = 'configuring',
  CONFIGURED = 'configured',
  INVALID = 'invalid',
  NEEDS_UPDATE = 'needs-update'
}

/**
 * Trạng thái authentication
 */
export enum TrangThaiAuth {
  NOT_AUTHENTICATED = 'not-authenticated',
  AUTHENTICATING = 'authenticating',
  AUTHENTICATED = 'authenticated',
  EXPIRED = 'expired',
  INVALID = 'invalid',
  REFRESHING = 'refreshing'
}

/**
 * Trạng thái tác vụ
 */
export enum TrangThaiTask {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
}

/**
 * Trạng thái form
 */
export enum TrangThaiForm {
  PRISTINE = 'pristine',
  DIRTY = 'dirty',
  VALID = 'valid',
  INVALID = 'invalid',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted'
}

/**
 * Trạng thái modal
 */
export enum TrangThaiModal {
  CLOSED = 'closed',
  OPENING = 'opening',
  OPEN = 'open',
  CLOSING = 'closing'
}

/**
 * Trạng thái notification
 */
export enum TrangThaiNotification {
  QUEUED = 'queued',
  SHOWING = 'showing',
  DISMISSING = 'dismissing',
  DISMISSED = 'dismissed',
  EXPIRED = 'expired'
}

/**
 * Trạng thái download/upload
 */
export enum TrangThaiTransfer {
  NOT_STARTED = 'not-started',
  STARTING = 'starting',
  IN_PROGRESS = 'in-progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Trạng thái permissions
 */
export enum TrangThaiPermission {
  NOT_REQUESTED = 'not-requested',
  REQUESTING = 'requesting',
  GRANTED = 'granted',
  DENIED = 'denied',
  REVOKED = 'revoked'
}

/**
 * Trạng thái storage
 */
export enum TrangThaiStorage {
  AVAILABLE = 'available',
  FULL = 'full',
  WARNING = 'warning',
  ERROR = 'error',
  QUOTA_EXCEEDED = 'quota-exceeded'
}

/**
 * Trạng thái feature
 */
export enum TrangThaiFeature {
  DISABLED = 'disabled',
  ENABLED = 'enabled',
  BETA = 'beta',
  EXPERIMENTAL = 'experimental',
  DEPRECATED = 'deprecated'
}

/**
 * Trạng thái update
 */
export enum TrangThaiUpdate {
  UP_TO_DATE = 'up-to-date',
  UPDATE_AVAILABLE = 'update-available',
  DOWNLOADING = 'downloading',
  INSTALLING = 'installing',
  RESTART_REQUIRED = 'restart-required',
  FAILED = 'failed'
}

/**
 * Trạng thái debug
 */
export enum TrangThaiDebug {
  DISABLED = 'disabled',
  ENABLED = 'enabled',
  VERBOSE = 'verbose',
  TRACE = 'trace'
}

/**
 * Trạng thái performance
 */
export enum TrangThaiPerformance {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CRITICAL = 'critical'
}

/**
 * Trạng thái accessibility
 */
export enum TrangThaiAccessibility {
  DEFAULT = 'default',
  HIGH_CONTRAST = 'high-contrast',
  LARGE_TEXT = 'large-text',
  REDUCED_MOTION = 'reduced-motion',
  SCREEN_READER = 'screen-reader'
}

/**
 * Helper function để kiểm tra trạng thái loading
 */
export function laTrangThaiLoading(trang_thai: any): boolean {
  const loading_states = [
    TrangThaiUngDung.KHOI_TAO,
    TrangThaiPopup.LOADING,
    TrangThaiContentScript.INJECTING,
    TrangThaiBackground.STARTING,
    TrangThaiXuLy.DANG_XU_LY,
    TrangThaiValidation.DANG_KIEM_TRA,
    TrangThaiCache.LOADING,
    TrangThaiSync.SYNCING,
    TrangThaiAuth.AUTHENTICATING,
    TrangThaiTask.RUNNING,
    TrangThaiForm.SUBMITTING,
    TrangThaiModal.OPENING,
    TrangThaiModal.CLOSING,
    TrangThaiTransfer.STARTING,
    TrangThaiTransfer.IN_PROGRESS,
    TrangThaiPermission.REQUESTING,
    TrangThaiUpdate.DOWNLOADING,
    TrangThaiUpdate.INSTALLING
  ];
  
  return loading_states.includes(trang_thai);
}

/**
 * Helper function để kiểm tra trạng thái lỗi
 */
export function laTrangThaiLoi(trang_thai: any): boolean {
  const error_states = [
    TrangThaiUngDung.LOI,
    TrangThaiPopup.ERROR,
    TrangThaiContentScript.ERROR,
    TrangThaiBackground.ERROR,
    TrangThaiXuLy.LOI,
    TrangThaiCache.ERROR,
    TrangThaiSync.ERROR,
    TrangThaiCauHinh.INVALID,
    TrangThaiAuth.INVALID,
    TrangThaiTask.FAILED,
    TrangThaiForm.INVALID,
    TrangThaiTransfer.FAILED,
    TrangThaiStorage.ERROR,
    TrangThaiUpdate.FAILED
  ];
  
  return error_states.includes(trang_thai);
}

/**
 * Helper function để kiểm tra trạng thái thành công
 */
export function laTrangThaiThanhCong(trang_thai: any): boolean {
  const success_states = [
    TrangThaiUngDung.SAN_SANG,
    TrangThaiPopup.SUCCESS,
    TrangThaiContentScript.READY,
    TrangThaiBackground.RUNNING,
    TrangThaiXuLy.HOAN_THANH,
    TrangThaiValidation.HOP_LE,
    TrangThaiCache.FRESH,
    TrangThaiSync.SYNCED,
    TrangThaiCauHinh.CONFIGURED,
    TrangThaiAuth.AUTHENTICATED,
    TrangThaiTask.COMPLETED,
    TrangThaiForm.SUBMITTED,
    TrangThaiTransfer.COMPLETED,
    TrangThaiPermission.GRANTED,
    TrangThaiUpdate.UP_TO_DATE
  ];
  
  return success_states.includes(trang_thai);
}

/**
 * Helper function để lấy màu sắc cho trạng thái
 */
export function layMauSacTrangThai(trang_thai: any): string {
  if (laTrangThaiLoi(trang_thai)) {
    return 'do'; // red
  } else if (laTrangThaiLoading(trang_thai)) {
    return 'xanh-duong'; // blue
  } else if (laTrangThaiThanhCong(trang_thai)) {
    return 'xanh-la'; // green
  } else {
    return 'xam'; // gray
  }
}
