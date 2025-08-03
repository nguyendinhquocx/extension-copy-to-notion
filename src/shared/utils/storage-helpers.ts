/**
 * Storage Helper Utilities
 * Tiện ích hỗ trợ lưu trữ dữ liệu cho Chrome Extension
 */

/**
 * Storage areas available in Chrome Extension
 */
export enum VungLuuTru {
  LOCAL = 'local',
  SYNC = 'sync',
  SESSION = 'session',
  MANAGED = 'managed'
}

/**
 * Storage operation result
 */
export interface KetQuaLuuTru<T = any> {
  thanh_cong: boolean;
  du_lieu?: T;
  loi?: string;
  thoi_gian_thuc_hien?: number;
}

/**
 * Storage quota information
 */
export interface ThongTinQuota {
  bytes_used: number;
  bytes_available: number;
  total_bytes: number;
  percentage_used: number;
}

/**
 * Change listener callback
 */
export type StorageChangeCallback = (changes: Record<string, chrome.storage.StorageChange>) => void;

/**
 * Storage configuration
 */
export interface CauHinhStorage {
  default_area: VungLuuTru;
  enable_compression: boolean;
  auto_cleanup: boolean;
  max_cache_age: number; // milliseconds
  encryption_enabled: boolean;
}

/**
 * Main Storage Helper Class
 */
export class StorageHelper {
  private config: CauHinhStorage;
  private change_listeners: Map<string, StorageChangeCallback> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl?: number }> = new Map();

  constructor(config?: Partial<CauHinhStorage>) {
    this.config = {
      default_area: VungLuuTru.LOCAL,
      enable_compression: false,
      auto_cleanup: true,
      max_cache_age: 5 * 60 * 1000, // 5 minutes
      encryption_enabled: false,
      ...config
    };

    // Setup auto cleanup if enabled
    if (this.config.auto_cleanup) {
      this.setupAutoCleanup();
    }
  }

  /**
   * Set data to storage
   */
  async set<T>(
    key: string,
    value: T,
    options: {
      area?: VungLuuTru;
      ttl?: number; // time to live in milliseconds
      compress?: boolean;
      encrypt?: boolean;
    } = {}
  ): Promise<KetQuaLuuTru<T>> {
    const start_time = performance.now();
    
    try {
      const area = options.area || this.config.default_area;
      let processed_value = value;

      // Apply compression if enabled
      if (options.compress || this.config.enable_compression) {
        processed_value = await this.compressData(processed_value);
      }

      // Apply encryption if enabled
      if (options.encrypt || this.config.encryption_enabled) {
        processed_value = await this.encryptData(processed_value);
      }

      // Wrap with metadata
      const storage_item = {
        data: processed_value,
        timestamp: Date.now(),
        ttl: options.ttl,
        compressed: options.compress || this.config.enable_compression,
        encrypted: options.encrypt || this.config.encryption_enabled
      };

      // Save to Chrome storage
      await this.saveToStorage(area, key, storage_item);

      // Update cache
      this.updateCache(key, value, options.ttl);

      const execution_time = performance.now() - start_time;

      return {
        thanh_cong: true,
        du_lieu: value,
        thoi_gian_thuc_hien: execution_time
      };

    } catch (error) {
      const execution_time = performance.now() - start_time;
      return {
        thanh_cong: false,
        loi: error instanceof Error ? error.message : 'Unknown storage error',
        thoi_gian_thuc_hien: execution_time
      };
    }
  }

  /**
   * Get data from storage
   */
  async get<T>(
    key: string,
    options: {
      area?: VungLuuTru;
      default_value?: T;
      use_cache?: boolean;
    } = {}
  ): Promise<KetQuaLuuTru<T>> {
    const start_time = performance.now();

    try {
      // Check cache first if enabled
      if (options.use_cache !== false) {
        const cached = this.getFromCache<T>(key);
        if (cached !== null) {
          return {
            thanh_cong: true,
            du_lieu: cached,
            thoi_gian_thuc_hien: performance.now() - start_time
          };
        }
      }

      const area = options.area || this.config.default_area;
      const storage_item = await this.loadFromStorage(area, key);

      if (!storage_item) {
        return {
          thanh_cong: true,
          du_lieu: options.default_value,
          thoi_gian_thuc_hien: performance.now() - start_time
        };
      }

      // Check TTL
      if (storage_item.ttl && (Date.now() - storage_item.timestamp) > storage_item.ttl) {
        await this.remove(key, { area });
        return {
          thanh_cong: true,
          du_lieu: options.default_value,
          thoi_gian_thuc_hien: performance.now() - start_time
        };
      }

      let processed_data = storage_item.data;

      // Decrypt if needed
      if (storage_item.encrypted) {
        processed_data = await this.decryptData(processed_data);
      }

      // Decompress if needed
      if (storage_item.compressed) {
        processed_data = await this.decompressData(processed_data);
      }

      // Update cache
      this.updateCache(key, processed_data, storage_item.ttl);

      return {
        thanh_cong: true,
        du_lieu: processed_data,
        thoi_gian_thuc_hien: performance.now() - start_time
      };

    } catch (error) {
      return {
        thanh_cong: false,
        loi: error instanceof Error ? error.message : 'Unknown storage error',
        thoi_gian_thuc_hien: performance.now() - start_time
      };
    }
  }

  /**
   * Remove data from storage
   */
  async remove(
    key: string,
    options: { area?: VungLuuTru } = {}
  ): Promise<KetQuaLuuTru<void>> {
    const start_time = performance.now();

    try {
      const area = options.area || this.config.default_area;
      
      await this.removeFromStorage(area, key);
      this.removeFromCache(key);

      return {
        thanh_cong: true,
        thoi_gian_thuc_hien: performance.now() - start_time
      };

    } catch (error) {
      return {
        thanh_cong: false,
        loi: error instanceof Error ? error.message : 'Unknown storage error',
        thoi_gian_thuc_hien: performance.now() - start_time
      };
    }
  }

  /**
   * Clear all data from storage area
   */
  async clear(area: VungLuuTru = this.config.default_area): Promise<KetQuaLuuTru<void>> {
    const start_time = performance.now();

    try {
      await this.clearStorage(area);
      this.cache.clear();

      return {
        thanh_cong: true,
        thoi_gian_thuc_hien: performance.now() - start_time
      };

    } catch (error) {
      return {
        thanh_cong: false,
        loi: error instanceof Error ? error.message : 'Unknown storage error',
        thoi_gian_thuc_hien: performance.now() - start_time
      };
    }
  }

  /**
   * Get all keys from storage area
   */
  async getAllKeys(area: VungLuuTru = this.config.default_area): Promise<KetQuaLuuTru<string[]>> {
    const start_time = performance.now();

    try {
      const keys = await this.getKeysFromStorage(area);

      return {
        thanh_cong: true,
        du_lieu: keys,
        thoi_gian_thuc_hien: performance.now() - start_time
      };

    } catch (error) {
      return {
        thanh_cong: false,
        loi: error instanceof Error ? error.message : 'Unknown storage error',
        thoi_gian_thuc_hien: performance.now() - start_time
      };
    }
  }

  /**
   * Get storage quota information
   */
  async getQuotaInfo(area: VungLuuTru = this.config.default_area): Promise<KetQuaLuuTru<ThongTinQuota>> {
    const start_time = performance.now();

    try {
      const quota_info = await this.getStorageQuota(area);

      return {
        thanh_cong: true,
        du_lieu: quota_info,
        thoi_gian_thuc_hien: performance.now() - start_time
      };

    } catch (error) {
      return {
        thanh_cong: false,
        loi: error instanceof Error ? error.message : 'Unknown storage error',
        thoi_gian_thuc_hien: performance.now() - start_time
      };
    }
  }

  /**
   * Add change listener
   */
  addChangeListener(
    listener_id: string,
    callback: StorageChangeCallback,
    area?: VungLuuTru
  ): void {
    this.change_listeners.set(listener_id, callback);
    
    if (chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, changed_area) => {
        if (!area || changed_area === area) {
          callback(changes);
        }
      });
    }
  }

  /**
   * Remove change listener
   */
  removeChangeListener(listener_id: string): void {
    this.change_listeners.delete(listener_id);
  }

  /**
   * Batch operations
   */
  async batchSet<T>(
    items: Record<string, T>,
    options: {
      area?: VungLuuTru;
      ttl?: number;
      compress?: boolean;
      encrypt?: boolean;
    } = {}
  ): Promise<KetQuaLuuTru<Record<string, T>>> {
    const start_time = performance.now();

    try {
      const area = options.area || this.config.default_area;
      const batch_data: Record<string, any> = {};

      for (const [key, value] of Object.entries(items)) {
        let processed_value = value;

        if (options.compress || this.config.enable_compression) {
          processed_value = await this.compressData(processed_value);
        }

        if (options.encrypt || this.config.encryption_enabled) {
          processed_value = await this.encryptData(processed_value);
        }

        batch_data[key] = {
          data: processed_value,
          timestamp: Date.now(),
          ttl: options.ttl,
          compressed: options.compress || this.config.enable_compression,
          encrypted: options.encrypt || this.config.encryption_enabled
        };

        this.updateCache(key, value, options.ttl);
      }

      await this.saveBatchToStorage(area, batch_data);

      return {
        thanh_cong: true,
        du_lieu: items,
        thoi_gian_thuc_hien: performance.now() - start_time
      };

    } catch (error) {
      return {
        thanh_cong: false,
        loi: error instanceof Error ? error.message : 'Batch operation failed',
        thoi_gian_thuc_hien: performance.now() - start_time
      };
    }
  }

  /**
   * Cache management methods
   */
  private updateCache<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Check TTL
    if (cached.ttl && (Date.now() - cached.timestamp) > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Check max age
    if ((Date.now() - cached.timestamp) > this.config.max_cache_age) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private removeFromCache(key: string): void {
    this.cache.delete(key);
  }

  private setupAutoCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      
      for (const [key, cached] of this.cache.entries()) {
        const is_expired = cached.ttl && (now - cached.timestamp) > cached.ttl;
        const is_old = (now - cached.timestamp) > this.config.max_cache_age;
        
        if (is_expired || is_old) {
          this.cache.delete(key);
        }
      }
    }, this.config.max_cache_age);
  }

  /**
   * Chrome Storage API wrappers
   */
  private async saveToStorage(area: VungLuuTru, key: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const storage_area = this.getStorageArea(area);
      storage_area.set({ [key]: data }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  private async loadFromStorage(area: VungLuuTru, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const storage_area = this.getStorageArea(area);
      storage_area.get(key, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result[key]);
        }
      });
    });
  }

  private async removeFromStorage(area: VungLuuTru, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const storage_area = this.getStorageArea(area);
      storage_area.remove(key, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  private async clearStorage(area: VungLuuTru): Promise<void> {
    return new Promise((resolve, reject) => {
      const storage_area = this.getStorageArea(area);
      storage_area.clear(() => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  private async getKeysFromStorage(area: VungLuuTru): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const storage_area = this.getStorageArea(area);
      storage_area.get(null, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(Object.keys(result || {}));
        }
      });
    });
  }

  private async getStorageQuota(area: VungLuuTru): Promise<ThongTinQuota> {
    return new Promise((resolve, reject) => {
      const storage_area = this.getStorageArea(area);
      storage_area.getBytesInUse(null, (bytes_used) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          const limits = this.getStorageLimits(area);
          resolve({
            bytes_used,
            bytes_available: limits.max_bytes - bytes_used,
            total_bytes: limits.max_bytes,
            percentage_used: (bytes_used / limits.max_bytes) * 100
          });
        }
      });
    });
  }

  private async saveBatchToStorage(area: VungLuuTru, data: Record<string, any>): Promise<void> {
    return new Promise((resolve, reject) => {
      const storage_area = this.getStorageArea(area);
      storage_area.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  private getStorageArea(area: VungLuuTru): chrome.storage.StorageArea {
    switch (area) {
      case VungLuuTru.LOCAL:
        return chrome.storage.local;
      case VungLuuTru.SYNC:
        return chrome.storage.sync;
      case VungLuuTru.SESSION:
        return chrome.storage.session;
      case VungLuuTru.MANAGED:
        return chrome.storage.managed;
      default:
        return chrome.storage.local;
    }
  }

  private getStorageLimits(area: VungLuuTru): { max_bytes: number; max_items: number } {
    switch (area) {
      case VungLuuTru.LOCAL:
        return { max_bytes: 5242880, max_items: Infinity }; // 5MB
      case VungLuuTru.SYNC:
        return { max_bytes: 102400, max_items: 512 }; // 100KB
      case VungLuuTru.SESSION:
        return { max_bytes: 10485760, max_items: Infinity }; // 10MB
      case VungLuuTru.MANAGED:
        return { max_bytes: Infinity, max_items: Infinity };
      default:
        return { max_bytes: 5242880, max_items: Infinity };
    }
  }

  /**
   * Data processing methods (stubs for compression/encryption)
   */
  private async compressData(data: any): Promise<any> {
    // TODO: Implement compression (e.g., using pako)
    return data;
  }

  private async decompressData(data: any): Promise<any> {
    // TODO: Implement decompression
    return data;
  }

  private async encryptData(data: any): Promise<any> {
    // TODO: Implement encryption (e.g., using crypto-js)
    return data;
  }

  private async decryptData(data: any): Promise<any> {
    // TODO: Implement decryption
    return data;
  }
}

/**
 * Utility functions cho việc sử dụng nhanh
 */
const default_storage = new StorageHelper();

export const luu = <T>(key: string, value: T, options?: any): Promise<KetQuaLuuTru<T>> => {
  return default_storage.set(key, value, options);
};

export const lay = <T>(key: string, default_value?: T, options?: any): Promise<KetQuaLuuTru<T>> => {
  return default_storage.get(key, { default_value, ...options });
};

export const xoa = (key: string, options?: any): Promise<KetQuaLuuTru<void>> => {
  return default_storage.remove(key, options);
};

export const xoaTatCa = (area?: VungLuuTru): Promise<KetQuaLuuTru<void>> => {
  return default_storage.clear(area);
};

export const layTatCaKey = (area?: VungLuuTru): Promise<KetQuaLuuTru<string[]>> => {
  return default_storage.getAllKeys(area);
};

export const layThongTinQuota = (area?: VungLuuTru): Promise<KetQuaLuuTru<ThongTinQuota>> => {
  return default_storage.getQuotaInfo(area);
};
