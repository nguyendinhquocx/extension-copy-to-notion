// Extension Constants - Vietnamese Naming
// Đây là placeholder cho Step 03: Shared Types & Utilities Foundation

export const EXTENSION_CONFIG = {
  TEN_EXTENSION: 'Copy To Notion',
  PHIEN_BAN: '1.0.0',
  MO_TA: 'Browser extension để copy content vào Notion với thiết kế tối giản',
  
  // Chrome extension specific
  ID_EXTENSION: 'copy-to-notion-extension',
  URL_STORE: 'https://chrome.google.com/webstore/detail/copy-to-notion',
  
  // Development
  DEVELOPMENT_PORT: 3000,
  HMR_PORT: 3001
} as const;

export const API_ENDPOINTS = {
  NOTION_BASE_URL: 'https://api.notion.com',
  NOTION_VERSION: '2022-06-28'
} as const;

export const STORAGE_KEYS = {
  NOTION_API_KEY: 'notion_api_key',
  DATABASE_ID_MAC_DINH: 'database_id_mac_dinh',
  CAU_HINH_NGUOI_DUNG: 'cau_hinh_nguoi_dung',
  LICH_SU_SU_DUNG: 'lich_su_su_dung'
} as const;
