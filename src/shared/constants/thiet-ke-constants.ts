/**
 * Thiết Kế Constants - Design System Values
 * Jobs/Ive Minimalist Design Philosophy Implementation
 */

// Color Palette - Minimalist Foundation
export const MAU_SAC = {
  // Core Colors - Primary Palette
  NEN_CHINH: '#ffffff',        // Pure white background
  CHU_CHINH: '#000000',        // True black text
  
  // Gray Scale - Subtle Hierarchy  
  XAM_NHAT: '#f8f9fa',         // Subtle background
  XAM_NHE: '#e9ecef',          // Borders, dividers
  XAM_TRUNG: '#6c757d',        // Secondary text
  XAM_DAM: '#495057',          // Tertiary text
  
  // Accent Colors - Minimal Usage Only
  XANH_DUONG: '#007bff',       // Primary actions
  DO_CANH_BAO: '#dc3545',      // Errors
  XANH_THANH_CONG: '#28a745',  // Success states
  VANG_CHU_Y: '#ffc107',       // Warnings
} as const;

// Typography System - Clean Hierarchy
export const CHU_VIET = {
  // Font Families
  HE_THONG: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  MA_LENH: 'SF Mono, Monaco, Inconsolata, monospace',
  
  // Font Sizes - 8px Grid Based
  KICH_THUOC: {
    XS: '0.75rem',    // 12px
    SM: '0.875rem',   // 14px  
    BASE: '1rem',     // 16px
    LG: '1.125rem',   // 18px
    XL: '1.25rem',    // 20px
    XXL: '1.5rem',    // 24px
  },
  
  // Font Weights
  TRONG_LUONG: {
    MONG: 300,
    THUONG: 400,
    TRUNG: 500,
    DAM: 600,
    BOLD: 700,
  },
  
  // Line Heights
  CHIEU_CAO_DONG: {
    CHAT: 1.2,
    THUONG: 1.5,
    RONG: 1.75,
  },
} as const;

// Spacing System - 8px Grid
export const KHOANG_CACH = {
  // Base Grid - 8px System
  XS: '0.125rem',   // 2px
  SM: '0.25rem',    // 4px
  BASE: '0.5rem',   // 8px
  MD: '0.75rem',    // 12px
  LG: '1rem',       // 16px
  XL: '1.25rem',    // 20px
  XXL: '1.5rem',    // 24px
  XXXL: '2rem',     // 32px
  
  // Semantic Spacing
  NGAN: '0.5rem',   // 8px - Tight spacing
  TRUNG: '1rem',    // 16px - Normal spacing  
  DAI: '1.5rem',    // 24px - Loose spacing
  XA: '2rem',       // 32px - Section spacing
} as const;

// Border Radius - Consistent Curves
export const BO_GOC = {
  KHONG: '0',
  NHO: '0.125rem',    // 2px
  TRUNG: '0.25rem',   // 4px
  LON: '0.375rem',    // 6px
  XL: '0.5rem',       // 8px
  XXL: '0.75rem',     // 12px
  TRON: '50%',        // Circle
  DAY_DU: '9999px',   // Pill shape
} as const;

// Shadows - Subtle Depth
export const BONG_DOI = {
  KHONG: 'none',
  NHE: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  TRUNG: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  LON: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

// Animation Durations - Subtle Timing
export const THOI_GIAN = {
  NHANH: '0.15s',     // Quick feedback
  TRUNG: '0.2s',      // Normal transitions  
  CHAM: '0.3s',       // Deliberate movements
  XA: '0.5s',         // Major state changes
} as const;

// Z-Index Layers - Stacking Context
export const LAP_TANG = {
  BASE: 0,
  DROPDOWN: 10,
  MODAL: 20,
  NOTIFICATION: 30,
  TOOLTIP: 40,
  OVERLAY: 50,
} as const;

// Breakpoints - Extension Constraints
export const KICH_THUOC_MAN_HINH = {
  POPUP_MIN: '320px',     // Minimum popup width
  POPUP_MAX: '400px',     // Maximum popup width  
  CONTENT_MAX: '768px',   // Content script max width
} as const;

// Component Sizes - Consistent Scaling
export const KICH_THUOC_THANH_PHAN = {
  // Button Heights
  BUTTON: {
    NHO: '2rem',      // 32px
    TRUNG: '2.5rem',  // 40px
    LON: '3rem',      // 48px
  },
  
  // Input Heights
  INPUT: {
    NHO: '2rem',      // 32px
    TRUNG: '2.5rem',  // 40px
    LON: '3rem',      // 48px
  },
  
  // Icon Sizes
  ICON: {
    NHO: '1rem',      // 16px
    TRUNG: '1.25rem', // 20px
    LON: '1.5rem',    // 24px
    XL: '2rem',       // 32px
  },
} as const;

// Extension Specific Constants
export const EXTENSION = {
  // Popup Dimensions
  POPUP: {
    WIDTH: '320px',
    MIN_HEIGHT: '400px',
    MAX_HEIGHT: '600px',
  },
  
  // Content Script Overlay
  OVERLAY: {
    MAX_WIDTH: '400px',
    PADDING: KHOANG_CACH.LG,
    BORDER_RADIUS: BO_GOC.LON,
  },
  
  // Notion Integration
  NOTION: {
    PAGE_PREVIEW_HEIGHT: '100px',
    PROPERTY_ITEM_HEIGHT: '40px',
    ICON_SIZE: KICH_THUOC_THANH_PHAN.ICON.TRUNG,
  },
} as const;

// Semantic Design Tokens - Context Aware
export const THIET_KE = {
  // States
  TRANG_THAI: {
    THANH_CONG: MAU_SAC.XANH_THANH_CONG,
    CANH_BAO: MAU_SAC.VANG_CHU_Y,
    LOI: MAU_SAC.DO_CANH_BAO,
    THONG_TIN: MAU_SAC.XANH_DUONG,
  },
  
  // Interactive Elements
  TUONG_TAC: {
    HOVER_OPACITY: 0.8,
    ACTIVE_SCALE: 0.95,
    DISABLED_OPACITY: 0.5,
    FOCUS_OUTLINE: `2px solid ${MAU_SAC.XANH_DUONG}`,
  },
  
  // Content Hierarchy
  PHAN_CAP: {
    TITLE: {
      SIZE: CHU_VIET.KICH_THUOC.XXL,
      WEIGHT: CHU_VIET.TRONG_LUONG.DAM,
      COLOR: MAU_SAC.CHU_CHINH,
    },
    SUBTITLE: {
      SIZE: CHU_VIET.KICH_THUOC.LG,
      WEIGHT: CHU_VIET.TRONG_LUONG.TRUNG,
      COLOR: MAU_SAC.CHU_CHINH,
    },
    BODY: {
      SIZE: CHU_VIET.KICH_THUOC.BASE,
      WEIGHT: CHU_VIET.TRONG_LUONG.THUONG,
      COLOR: MAU_SAC.CHU_CHINH,
    },
    CAPTION: {
      SIZE: CHU_VIET.KICH_THUOC.SM,
      WEIGHT: CHU_VIET.TRONG_LUONG.THUONG,
      COLOR: MAU_SAC.XAM_TRUNG,
    },
  },
} as const;

// Type Definitions for TypeScript
export type MauSac = typeof MAU_SAC[keyof typeof MAU_SAC];
export type KhoangCach = typeof KHOANG_CACH[keyof typeof KHOANG_CACH];
export type BoGoc = typeof BO_GOC[keyof typeof BO_GOC];
export type BongDoi = typeof BONG_DOI[keyof typeof BONG_DOI];
export type ThoiGian = typeof THOI_GIAN[keyof typeof THOI_GIAN];

// Helper Functions
export const layMauSac = (ten: keyof typeof MAU_SAC): string => MAU_SAC[ten];
export const layKhoangCach = (ten: keyof typeof KHOANG_CACH): string => KHOANG_CACH[ten];
export const layBoGoc = (ten: keyof typeof BO_GOC): string => BO_GOC[ten];

// Export default theme object
export const THEME_CHU_DE = {
  colors: MAU_SAC,
  typography: CHU_VIET,
  spacing: KHOANG_CACH,
  borderRadius: BO_GOC,
  shadows: BONG_DOI,
  timing: THOI_GIAN,
  zIndex: LAP_TANG,
  breakpoints: KICH_THUOC_MAN_HINH,
  components: KICH_THUOC_THANH_PHAN,
  extension: EXTENSION,
  semantic: THIET_KE,
} as const;

export default THEME_CHU_DE;
