/**
 * API Constants
 * Hằng số cho các API được sử dụng trong extension
 */

/**
 * Notion API Constants
 */
export const NOTION_API = {
  BASE_URL: 'https://api.notion.com/v1',
  VERSION: '2022-06-28',
  
  ENDPOINTS: {
    DATABASES: '/databases',
    PAGES: '/pages',
    BLOCKS: '/blocks',
    USERS: '/users',
    SEARCH: '/search'
  },
  
  LIMITS: {
    CONTENT_SIZE: 100000, // 100KB max content
    BLOCKS_PER_REQUEST: 100,
    REQUESTS_PER_SECOND: 3,
    REQUEST_TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3
  },
  
  HEADERS: {
    NOTION_VERSION: 'Notion-Version',
    AUTHORIZATION: 'Authorization',
    CONTENT_TYPE: 'Content-Type'
  }
} as const;

/**
 * Extension API Constants
 */
export const EXTENSION_API = {
  NAME: 'Copy to Notion',
  VERSION: '1.0.0',
  
  CHROME_API: {
    SCRIPTING: 'scripting',
    STORAGE: 'storage',
    TABS: 'tabs',
    ACTIVE_TAB: 'activeTab',
    NOTIFICATIONS: 'notifications',
    CONTEXT_MENUS: 'contextMenus'
  },
  
  MESSAGES: {
    ACTION_EXTRACT: 'extract-content',
    ACTION_SAVE: 'save-to-notion',
    ACTION_GET_CONFIG: 'get-config',
    ACTION_SET_CONFIG: 'set-config',
    ACTION_TEST_CONNECTION: 'test-connection',
    ACTION_GET_DATABASES: 'get-databases',
    ACTION_GET_PAGE_INFO: 'get-page-info'
  },
  
  TIMEOUTS: {
    CONTENT_EXTRACTION: 10000, // 10 seconds
    NOTION_SAVE: 30000, // 30 seconds
    CONFIG_LOAD: 5000, // 5 seconds
    TAB_INJECTION: 3000 // 3 seconds
  }
} as const;

/**
 * Content Extraction Constants
 */
export const CONTENT_EXTRACTION = {
  SELECTORS: {
    MAIN_CONTENT: [
      'main',
      'article',
      '[role="main"]',
      '.main-content',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '#content',
      '#main'
    ],
    
    EXCLUDE: [
      'script',
      'style',
      'noscript',
      'iframe',
      'embed',
      'object',
      '.advertisement',
      '.ads',
      '.popup',
      '.modal',
      '.overlay',
      '.navigation',
      '.nav',
      '.menu',
      '.sidebar',
      '.footer',
      '.header',
      '.comments',
      '.social-share'
    ],
    
    HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    LISTS: ['ul', 'ol', 'li'],
    MEDIA: ['img', 'video', 'audio', 'iframe'],
    LINKS: ['a[href]'],
    CODE: ['code', 'pre', 'kbd', 'samp'],
    EMPHASIS: ['strong', 'b', 'em', 'i', 'u', 'mark']
  },
  
  LIMITS: {
    MAX_CONTENT_LENGTH: 1000000, // 1MB
    MAX_ELEMENTS: 10000,
    MAX_DEPTH: 50,
    MIN_TEXT_LENGTH: 10,
    MAX_IMAGE_SIZE: 5242880, // 5MB
    EXTRACTION_TIMEOUT: 30000 // 30 seconds
  },
  
  PATTERNS: {
    EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    URL: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
    PHONE: /(\+\d{1,3}[- ]?)?\d{10}/g,
    DATE: /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/g
  }
} as const;

/**
 * Storage Constants
 */
export const STORAGE = {
  KEYS: {
    // Configuration
    USER_CONFIG: 'user_config',
    NOTION_TOKEN: 'notion_token',
    SELECTED_DATABASE: 'selected_database',
    
    // Cache
    DATABASES_CACHE: 'databases_cache',
    PAGE_CACHE: 'page_cache',
    USER_CACHE: 'user_cache',
    
    // Session
    CURRENT_SESSION: 'current_session',
    LAST_EXTRACTION: 'last_extraction',
    POPUP_STATE: 'popup_state',
    
    // History
    EXTRACTION_HISTORY: 'extraction_history',
    ERROR_HISTORY: 'error_history',
    USAGE_STATS: 'usage_stats'
  },
  
  PREFIXES: {
    CACHE: 'cache_',
    CONFIG: 'config_',
    TEMP: 'temp_',
    BACKUP: 'backup_'
  },
  
  TTL: {
    DATABASE_CACHE: 3600000, // 1 hour
    PAGE_CACHE: 1800000, // 30 minutes
    USER_CACHE: 7200000, // 2 hours
    SESSION: 86400000, // 24 hours
    TEMP_DATA: 300000 // 5 minutes
  },
  
  LIMITS: {
    MAX_HISTORY_ITEMS: 100,
    MAX_CACHE_SIZE: 10485760, // 10MB
    MAX_ERROR_LOGS: 50,
    MAX_SESSION_AGE: 86400000 // 24 hours
  }
} as const;

/**
 * URL and Domain Constants
 */
export const URLS = {
  NOTION: {
    BASE: 'https://notion.so',
    API_BASE: 'https://api.notion.com',
    OAUTH: 'https://api.notion.com/v1/oauth',
    DOCS: 'https://developers.notion.com'
  },
  
  EXTENSION: {
    POPUP: 'popup.html',
    OPTIONS: 'options.html',
    BACKGROUND: 'background.js',
    CONTENT_SCRIPT: 'content.js'
  },
  
  EXTERNAL: {
    SUPPORT: 'https://github.com/your-repo/support',
    DOCUMENTATION: 'https://github.com/your-repo/docs',
    FEEDBACK: 'https://github.com/your-repo/issues',
    PRIVACY: 'https://github.com/your-repo/privacy'
  }
} as const;

/**
 * UI Constants
 */
export const UI = {
  POPUP: {
    WIDTH: 400,
    HEIGHT: 600,
    MIN_WIDTH: 350,
    MIN_HEIGHT: 500,
    MAX_WIDTH: 800,
    MAX_HEIGHT: 1000
  },
  
  ANIMATION: {
    DURATION_FAST: 150,
    DURATION_NORMAL: 300,
    DURATION_SLOW: 500,
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  BREAKPOINTS: {
    MOBILE: 480,
    TABLET: 768,
    DESKTOP: 1024
  },
  
  Z_INDEX: {
    MODAL: 9999,
    OVERLAY: 9998,
    DROPDOWN: 9997,
    TOOLTIP: 9996,
    NOTIFICATION: 9995
  }
} as const;

/**
 * Validation Constants
 */
export const VALIDATION = {
  NOTION_TOKEN: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 200,
    PATTERN: /^secret_[a-zA-Z0-9]+$/
  },
  
  DATABASE_ID: {
    LENGTH: 32,
    PATTERN: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/
  },
  
  PAGE_TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 2000
  },
  
  CONTENT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 1000000 // 1MB
  },
  
  URL: {
    PATTERN: /^https?:\/\/.+/
  }
} as const;

/**
 * Error Constants
 */
export const ERRORS = {
  CODES: {
    // Network errors
    NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
    NETWORK_OFFLINE: 'NETWORK_OFFLINE',
    NETWORK_ERROR: 'NETWORK_ERROR',
    
    // Notion API errors
    NOTION_UNAUTHORIZED: 'NOTION_UNAUTHORIZED',
    NOTION_FORBIDDEN: 'NOTION_FORBIDDEN',
    NOTION_NOT_FOUND: 'NOTION_NOT_FOUND',
    NOTION_RATE_LIMITED: 'NOTION_RATE_LIMITED',
    NOTION_SERVER_ERROR: 'NOTION_SERVER_ERROR',
    
    // Extension errors
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    CONTENT_EXTRACTION_FAILED: 'CONTENT_EXTRACTION_FAILED',
    INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
    STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
    
    // Validation errors
    INVALID_TOKEN: 'INVALID_TOKEN',
    INVALID_DATABASE: 'INVALID_DATABASE',
    INVALID_CONTENT: 'INVALID_CONTENT'
  },
  
  RETRY: {
    MAX_ATTEMPTS: 3,
    BASE_DELAY: 1000,
    MAX_DELAY: 10000,
    EXPONENTIAL_BASE: 2
  }
} as const;

/**
 * Performance Constants
 */
export const PERFORMANCE = {
  METRICS: {
    CONTENT_EXTRACTION_TIME: 'content_extraction_time',
    NOTION_SAVE_TIME: 'notion_save_time',
    POPUP_LOAD_TIME: 'popup_load_time',
    TOTAL_OPERATION_TIME: 'total_operation_time'
  },
  
  THRESHOLDS: {
    SLOW_EXTRACTION: 5000, // 5 seconds
    SLOW_SAVE: 10000, // 10 seconds
    SLOW_POPUP: 1000, // 1 second
    MEMORY_WARNING: 50 * 1024 * 1024 // 50MB
  }
} as const;

/**
 * Feature Flags
 */
export const FEATURES = {
  EXPERIMENTAL: {
    AUTO_DETECTION: true,
    SMART_SELECTION: true,
    BULK_OPERATIONS: false,
    OFFLINE_MODE: false
  },
  
  BETA: {
    ADVANCED_FORMATTING: true,
    CUSTOM_TEMPLATES: true,
    EXPORT_OPTIONS: false
  }
} as const;

/**
 * Logging Constants
 */
export const LOGGING = {
  LEVELS: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
  },
  
  MAX_LOG_SIZE: 1048576, // 1MB
  MAX_LOG_FILES: 5,
  LOG_RETENTION_DAYS: 7
} as const;
