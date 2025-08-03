/**
 * Error Handling Utilities
 * Tiện ích xử lý lỗi cho extension
 */

/**
 * Loại lỗi trong extension
 */
export enum LoaiLoi {
  NETWORK_ERROR = 'network-error',
  NOTION_API_ERROR = 'notion-api-error',
  CONTENT_EXTRACTION_ERROR = 'content-extraction-error',
  PERMISSION_ERROR = 'permission-error',
  STORAGE_ERROR = 'storage-error',
  VALIDATION_ERROR = 'validation-error',
  UNKNOWN_ERROR = 'unknown-error',
  USER_ACTION_ERROR = 'user-action-error',
  CONFIGURATION_ERROR = 'configuration-error',
  TIMEOUT_ERROR = 'timeout-error'
}

/**
 * Mức độ nghiêm trọng của lỗi
 */
export enum MucDoLoi {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Thông tin chi tiết về lỗi
 */
export interface ThongTinLoi {
  id: string;
  loai: LoaiLoi;
  muc_do: MucDoLoi;
  message: string;
  message_user_friendly: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: Date;
  user_action?: string;
  recovery_suggestions: string[];
  reported: boolean;
  retryable: boolean;
  max_retry_count?: number;
  current_retry_count?: number;
}

/**
 * Kết quả của thao tác có thể thất bại
 */
export type KetQuaThaoTac<T> = {
  thanh_cong: true;
  du_lieu: T;
} | {
  thanh_cong: false;
  loi: ThongTinLoi;
};

/**
 * Class chính xử lý lỗi
 */
export class XuLyLoi {
  private static instance: XuLyLoi;
  private error_history: ThongTinLoi[] = [];
  private max_history_size = 100;
  private error_listeners: Array<(error: ThongTinLoi) => void> = [];

  private constructor() {}

  /**
   * Singleton pattern
   */
  static getInstance(): XuLyLoi {
    if (!XuLyLoi.instance) {
      XuLyLoi.instance = new XuLyLoi();
    }
    return XuLyLoi.instance;
  }

  /**
   * Tạo và xử lý lỗi mới
   */
  taoLoi(
    loai: LoaiLoi,
    message: string,
    options: Partial<ThongTinLoi> = {}
  ): ThongTinLoi {
    const error_id = this.taoErrorId();
    
    const thong_tin_loi: ThongTinLoi = {
      id: error_id,
      loai,
      muc_do: options.muc_do || this.xacDinhMucDoLoi(loai),
      message,
      message_user_friendly: options.message_user_friendly || this.taoMessageUserFriendly(loai, message),
      stack: options.stack || new Error().stack,
      context: options.context || {},
      timestamp: new Date(),
      user_action: options.user_action,
      recovery_suggestions: options.recovery_suggestions || this.taoRecoverySuggestions(loai),
      reported: false,
      retryable: options.retryable ?? this.laCotheThuLai(loai),
      max_retry_count: options.max_retry_count || this.layMaxRetryCount(loai),
      current_retry_count: 0
    };

    this.luuLoi(thong_tin_loi);
    this.thongBaoLoi(thong_tin_loi);
    
    return thong_tin_loi;
  }

  /**
   * Wrap async function để bắt lỗi tự động
   */
  async wrapAsync<T>(
    fn: () => Promise<T>,
    loai_loi: LoaiLoi = LoaiLoi.UNKNOWN_ERROR,
    context?: Record<string, any>
  ): Promise<KetQuaThaoTac<T>> {
    try {
      const ket_qua = await fn();
      return {
        thanh_cong: true,
        du_lieu: ket_qua
      };
    } catch (error) {
      const thong_tin_loi = this.taoLoiTuException(error, loai_loi, context);
      return {
        thanh_cong: false,
        loi: thong_tin_loi
      };
    }
  }

  /**
   * Wrap sync function để bắt lỗi tự động
   */
  wrapSync<T>(
    fn: () => T,
    loai_loi: LoaiLoi = LoaiLoi.UNKNOWN_ERROR,
    context?: Record<string, any>
  ): KetQuaThaoTac<T> {
    try {
      const ket_qua = fn();
      return {
        thanh_cong: true,
        du_lieu: ket_qua
      };
    } catch (error) {
      const thong_tin_loi = this.taoLoiTuException(error, loai_loi, context);
      return {
        thanh_cong: false,
        loi: thong_tin_loi
      };
    }
  }

  /**
   * Retry với exponential backoff
   */
  async retryAsync<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<KetQuaThaoTac<T>> {
    const {
      max_attempts = 3,
      base_delay = 1000,
      max_delay = 10000,
      exponential_base = 2,
      jitter = true
    } = options;

    let last_error: ThongTinLoi | null = null;

    for (let attempt = 1; attempt <= max_attempts; attempt++) {
      const result = await this.wrapAsync(fn);
      
      if (result.thanh_cong) {
        return result;
      }

      last_error = result.loi;
      
      // Cập nhật retry count
      last_error.current_retry_count = attempt;

      // Không retry nếu lỗi không thể retry
      if (!last_error.retryable) {
        break;
      }

      // Không retry ở lần cuối
      if (attempt === max_attempts) {
        break;
      }

      // Tính delay cho lần retry tiếp theo
      const delay = this.tinhDelayRetry(attempt, base_delay, max_delay, exponential_base, jitter);
      await this.delay(delay);
    }

    return {
      thanh_cong: false,
      loi: last_error!
    };
  }

  /**
   * Lấy lịch sử lỗi
   */
  layLichSuLoi(): ThongTinLoi[] {
    return [...this.error_history];
  }

  /**
   * Lấy lỗi theo loại
   */
  layLoiTheoLoai(loai: LoaiLoi): ThongTinLoi[] {
    return this.error_history.filter(error => error.loai === loai);
  }

  /**
   * Xóa lịch sử lỗi
   */
  xoaLichSuLoi(): void {
    this.error_history = [];
  }

  /**
   * Đăng ký listener cho lỗi
   */
  dangKyListener(listener: (error: ThongTinLoi) => void): () => void {
    this.error_listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.error_listeners.indexOf(listener);
      if (index > -1) {
        this.error_listeners.splice(index, 1);
      }
    };
  }

  /**
   * Tạo lỗi từ exception
   */
  private taoLoiTuException(
    error: unknown,
    loai: LoaiLoi,
    context?: Record<string, any>
  ): ThongTinLoi {
    let message = 'Unknown error';
    let stack = undefined;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    } else if (typeof error === 'string') {
      message = error;
    } else {
      message = String(error);
    }

    return this.taoLoi(loai, message, { context, stack });
  }

  /**
   * Tạo ID unique cho lỗi
   */
  private taoErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Xác định mức độ lỗi dựa trên loại
   */
  private xacDinhMucDoLoi(loai: LoaiLoi): MucDoLoi {
    const muc_do_map: Record<LoaiLoi, MucDoLoi> = {
      [LoaiLoi.NETWORK_ERROR]: MucDoLoi.MEDIUM,
      [LoaiLoi.NOTION_API_ERROR]: MucDoLoi.HIGH,
      [LoaiLoi.CONTENT_EXTRACTION_ERROR]: MucDoLoi.MEDIUM,
      [LoaiLoi.PERMISSION_ERROR]: MucDoLoi.HIGH,
      [LoaiLoi.STORAGE_ERROR]: MucDoLoi.MEDIUM,
      [LoaiLoi.VALIDATION_ERROR]: MucDoLoi.LOW,
      [LoaiLoi.UNKNOWN_ERROR]: MucDoLoi.MEDIUM,
      [LoaiLoi.USER_ACTION_ERROR]: MucDoLoi.LOW,
      [LoaiLoi.CONFIGURATION_ERROR]: MucDoLoi.HIGH,
      [LoaiLoi.TIMEOUT_ERROR]: MucDoLoi.MEDIUM
    };

    return muc_do_map[loai] || MucDoLoi.MEDIUM;
  }

  /**
   * Tạo message thân thiện với người dùng
   */
  private taoMessageUserFriendly(loai: LoaiLoi, message: string): string {
    const friendly_messages: Record<LoaiLoi, string> = {
      [LoaiLoi.NETWORK_ERROR]: 'Không thể kết nối mạng. Vui lòng kiểm tra kết nối internet.',
      [LoaiLoi.NOTION_API_ERROR]: 'Lỗi kết nối với Notion. Vui lòng kiểm tra API key và quyền truy cập.',
      [LoaiLoi.CONTENT_EXTRACTION_ERROR]: 'Không thể trích xuất nội dung từ trang web này.',
      [LoaiLoi.PERMISSION_ERROR]: 'Không có quyền thực hiện thao tác này.',
      [LoaiLoi.STORAGE_ERROR]: 'Lỗi lưu trữ dữ liệu. Vui lòng thử lại.',
      [LoaiLoi.VALIDATION_ERROR]: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
      [LoaiLoi.UNKNOWN_ERROR]: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
      [LoaiLoi.USER_ACTION_ERROR]: 'Thao tác không hợp lệ.',
      [LoaiLoi.CONFIGURATION_ERROR]: 'Lỗi cấu hình. Vui lòng kiểm tra cài đặt.',
      [LoaiLoi.TIMEOUT_ERROR]: 'Thao tác mất quá nhiều thời gian. Vui lòng thử lại.'
    };

    return friendly_messages[loai] || message;
  }

  /**
   * Tạo đề xuất khắc phục
   */
  private taoRecoverySuggestions(loai: LoaiLoi): string[] {
    const suggestions_map: Record<LoaiLoi, string[]> = {
      [LoaiLoi.NETWORK_ERROR]: [
        'Kiểm tra kết nối internet',
        'Thử tải lại trang',
        'Kiểm tra proxy/firewall'
      ],
      [LoaiLoi.NOTION_API_ERROR]: [
        'Kiểm tra API key trong cài đặt',
        'Xác nhận quyền truy cập database',
        'Thử kết nối lại với Notion'
      ],
      [LoaiLoi.CONTENT_EXTRACTION_ERROR]: [
        'Thử chọn nội dung khác',
        'Sử dụng chế độ manual selection',
        'Kiểm tra xem trang có load đầy đủ không'
      ],
      [LoaiLoi.PERMISSION_ERROR]: [
        'Kiểm tra quyền của extension',
        'Cấp quyền truy cập trang web',
        'Đăng nhập lại vào Notion'
      ],
      [LoaiLoi.STORAGE_ERROR]: [
        'Xóa cache của extension',
        'Kiểm tra dung lượng trống',
        'Khởi động lại browser'
      ],
      [LoaiLoi.VALIDATION_ERROR]: [
        'Kiểm tra format dữ liệu',
        'Điền đầy đủ thông tin bắt buộc',
        'Sử dụng ký tự hợp lệ'
      ],
      [LoaiLoi.UNKNOWN_ERROR]: [
        'Thử lại thao tác',
        'Khởi động lại extension',
        'Liên hệ support nếu lỗi tiếp tục'
      ],
      [LoaiLoi.USER_ACTION_ERROR]: [
        'Đọc hướng dẫn sử dụng',
        'Thực hiện đúng trình tự',
        'Kiểm tra điều kiện tiên quyết'
      ],
      [LoaiLoi.CONFIGURATION_ERROR]: [
        'Kiểm tra file cấu hình',
        'Reset về cài đặt mặc định',
        'Cập nhật extension'
      ],
      [LoaiLoi.TIMEOUT_ERROR]: [
        'Thử lại với timeout lớn hơn',
        'Kiểm tra kết nối mạng',
        'Giảm kích thước dữ liệu xử lý'
      ]
    };

    return suggestions_map[loai] || ['Thử lại thao tác'];
  }

  /**
   * Kiểm tra xem lỗi có thể retry không
   */
  private laCotheThuLai(loai: LoaiLoi): boolean {
    const retryable_errors = [
      LoaiLoi.NETWORK_ERROR,
      LoaiLoi.TIMEOUT_ERROR,
      LoaiLoi.STORAGE_ERROR,
      LoaiLoi.UNKNOWN_ERROR
    ];

    return retryable_errors.includes(loai);
  }

  /**
   * Lấy số lần retry tối đa cho loại lỗi
   */
  private layMaxRetryCount(loai: LoaiLoi): number {
    const retry_counts: Record<LoaiLoi, number> = {
      [LoaiLoi.NETWORK_ERROR]: 3,
      [LoaiLoi.NOTION_API_ERROR]: 2,
      [LoaiLoi.CONTENT_EXTRACTION_ERROR]: 1,
      [LoaiLoi.PERMISSION_ERROR]: 0,
      [LoaiLoi.STORAGE_ERROR]: 2,
      [LoaiLoi.VALIDATION_ERROR]: 0,
      [LoaiLoi.UNKNOWN_ERROR]: 1,
      [LoaiLoi.USER_ACTION_ERROR]: 0,
      [LoaiLoi.CONFIGURATION_ERROR]: 0,
      [LoaiLoi.TIMEOUT_ERROR]: 2
    };

    return retry_counts[loai] || 1;
  }

  /**
   * Lưu lỗi vào history
   */
  private luuLoi(loi: ThongTinLoi): void {
    this.error_history.unshift(loi);
    
    // Giới hạn kích thước history
    if (this.error_history.length > this.max_history_size) {
      this.error_history = this.error_history.slice(0, this.max_history_size);
    }
  }

  /**
   * Thông báo lỗi cho listeners
   */
  private thongBaoLoi(loi: ThongTinLoi): void {
    this.error_listeners.forEach(listener => {
      try {
        listener(loi);
      } catch (error) {
        console.error('Error in error listener:', error);
      }
    });
  }

  /**
   * Tính delay cho retry
   */
  private tinhDelayRetry(
    attempt: number,
    base_delay: number,
    max_delay: number,
    exponential_base: number,
    jitter: boolean
  ): number {
    let delay = base_delay * Math.pow(exponential_base, attempt - 1);
    delay = Math.min(delay, max_delay);
    
    if (jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }

  /**
   * Helper delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Retry options interface
 */
export interface RetryOptions {
  max_attempts?: number;
  base_delay?: number;
  max_delay?: number;
  exponential_base?: number;
  jitter?: boolean;
}

/**
 * Utility functions để sử dụng trực tiếp
 */
const error_handler = XuLyLoi.getInstance();

export const taoLoi = (
  loai: LoaiLoi,
  message: string,
  options?: Partial<ThongTinLoi>
): ThongTinLoi => {
  return error_handler.taoLoi(loai, message, options);
};

export const wrapAsync = <T>(
  fn: () => Promise<T>,
  loai_loi?: LoaiLoi,
  context?: Record<string, any>
): Promise<KetQuaThaoTac<T>> => {
  return error_handler.wrapAsync(fn, loai_loi, context);
};

export const wrapSync = <T>(
  fn: () => T,
  loai_loi?: LoaiLoi,
  context?: Record<string, any>
): KetQuaThaoTac<T> => {
  return error_handler.wrapSync(fn, loai_loi, context);
};

export const retryAsync = <T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<KetQuaThaoTac<T>> => {
  return error_handler.retryAsync(fn, options);
};

export const layLichSuLoi = (): ThongTinLoi[] => {
  return error_handler.layLichSuLoi();
};

export const dangKyErrorListener = (listener: (error: ThongTinLoi) => void): (() => void) => {
  return error_handler.dangKyListener(listener);
};
