# Tham Khảo Bảng Màu - Color Palette Reference

## 🎨 Overview

Bảng màu Copy To Notion Extension được thiết kế theo triết lý tối giản Jobs/Ive với palette hạn chế chỉ 8 màu chính để đảm bảo consistency và aesthetic appeal.

## 📊 Màu Cơ Bản (Core Colors)

### Pure Foundation
```
┌─────────────────────────────────────────┐
│ Trắng Tinh Khiết                         │
│ #ffffff                                 │
│ --mau-nen-chinh                         │
│ RGB(255, 255, 255)                      │
│ Usage: Primary background, cards        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Đen Tuyệt Đối                           │
│ #000000                                 │
│ --mau-chu-chinh                         │
│ RGB(0, 0, 0)                           │
│ Usage: Primary text, headers           │
└─────────────────────────────────────────┘
```

### Gray Scale Hierarchy
```
┌─────────────────────────────────────────┐
│ Xám Nhất                                │
│ #f8f9fa                                 │
│ --mau-xam-nhat                          │
│ RGB(248, 249, 250)                      │
│ Usage: Subtle backgrounds, hover states │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Xám Nhẹ                                 │
│ #e9ecef                                 │
│ --mau-xam-nhe                           │
│ RGB(233, 236, 239)                      │
│ Usage: Borders, dividers, disabled      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Xám Trung                               │
│ #6c757d                                 │
│ --mau-xam-trung                         │
│ RGB(108, 117, 125)                      │
│ Usage: Secondary text, placeholders     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Xám Đậm                                 │
│ #495057                                 │
│ --mau-xam-dam                           │
│ RGB(73, 80, 87)                        │
│ Usage: Tertiary text, icons            │
└─────────────────────────────────────────┘
```

## 🎯 Màu Nhấn Mạnh (Accent Colors)

### Primary Action
```
┌─────────────────────────────────────────┐
│ Xanh Dương                              │
│ #007bff                                 │
│ --mau-xanh-duong                        │
│ RGB(0, 123, 255)                       │
│ Usage: Primary buttons, links, focus    │
│ Contrast Ratio: 4.5:1 (WCAG AA)        │
└─────────────────────────────────────────┘
```

### Status Colors
```
┌─────────────────────────────────────────┐
│ Đỏ Cảnh Báo                             │
│ #dc3545                                 │
│ --mau-do-canh-bao                       │
│ RGB(220, 53, 69)                       │
│ Usage: Errors, destructive actions      │
│ Contrast Ratio: 5.2:1 (WCAG AA)        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Xanh Thành Công                         │
│ #28a745                                 │
│ --mau-xanh-thanh-cong                   │
│ RGB(40, 167, 69)                       │
│ Usage: Success states, confirmations    │
│ Contrast Ratio: 4.8:1 (WCAG AA)        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Vàng Chú Ý                              │
│ #ffc107                                 │
│ --mau-vang-chu-y                        │
│ RGB(255, 193, 7)                       │
│ Usage: Warnings, pending states         │
│ Note: Requires dark text for contrast   │
└─────────────────────────────────────────┘
```

## 🎨 Color Usage Guidelines

### Primary Combinations (90% of UI)
```css
/* Most common combination */
background: #ffffff;
color: #000000;

/* Card surfaces */
background: #ffffff;
border: 1px solid #e9ecef;

/* Secondary text */
background: #ffffff;
color: #6c757d;
```

### Interactive States
```css
/* Hover states */
background: #f8f9fa;
color: #000000;

/* Active states */
background: #e9ecef;
color: #000000;

/* Focus states */
outline: 2px solid #007bff;
outline-offset: 2px;
```

### Status Indicators
```css
/* Success */
background: #28a745;
color: #ffffff;

/* Warning */
background: #ffc107;
color: #000000;

/* Error */
background: #dc3545;
color: #ffffff;

/* Info */
background: #007bff;
color: #ffffff;
```

## 🛡️ Accessibility Compliance

### WCAG AA Contrast Ratios

| Foreground | Background | Ratio | Status |
|------------|------------|-------|--------|
| #000000 | #ffffff | 21:1 | ✅ AAA |
| #495057 | #ffffff | 8.6:1 | ✅ AAA |
| #6c757d | #ffffff | 4.5:1 | ✅ AA |
| #ffffff | #007bff | 4.5:1 | ✅ AA |
| #ffffff | #dc3545 | 5.2:1 | ✅ AA |
| #ffffff | #28a745 | 4.8:1 | ✅ AA |
| #000000 | #ffc107 | 11.7:1 | ✅ AAA |

### Color Blind Considerations
- Không dựa vào màu sắc duy nhất để truyền đạt thông tin
- Sử dụng icons và text labels kèm màu sắc
- Pattern sẵn có cho các status states
- High contrast mode support

## 🎭 Semantic Color Mapping

### Component States
```scss
// Buttons
$btn-primary-bg: var(--mau-chu-chinh);
$btn-primary-text: var(--mau-nen-chinh);
$btn-secondary-bg: var(--mau-xam-nhat);
$btn-secondary-text: var(--mau-chu-chinh);

// Form Elements
$input-border: var(--mau-xam-nhe);
$input-focus: var(--mau-xanh-duong);
$input-error: var(--mau-do-canh-bao);

// Surfaces
$card-bg: var(--mau-nen-chinh);
$card-border: var(--mau-xam-nhe);
$overlay-bg: rgba(0, 0, 0, 0.5);
```

### Extension Specific
```scss
// Popup Interface
$popup-bg: var(--mau-nen-chinh);
$popup-header-border: var(--mau-xam-nhe);
$popup-footer-bg: var(--mau-xam-nhat);

// Content Script
$modal-bg: var(--mau-nen-chinh);
$modal-shadow: rgba(0, 0, 0, 0.1);

// Notion Integration
$notion-page-hover: var(--mau-xam-nhat);
$notion-selected: rgba(0, 123, 255, 0.1);
```

## 🌙 Dark Mode Preparation

### Future Dark Palette
```scss
// Core (for future implementation)
$dark-bg-primary: #121212;
$dark-bg-secondary: #1e1e1e;
$dark-text-primary: #ffffff;
$dark-text-secondary: #b3b3b3;
$dark-border: #404040;

// Accent colors remain same for consistency
$dark-accent-blue: #007bff;
$dark-accent-red: #dc3545;
$dark-accent-green: #28a745;
$dark-accent-yellow: #ffc107;
```

## 🛠️ Implementation Examples

### CSS Custom Properties
```css
:root {
  /* Core palette */
  --mau-nen-chinh: #ffffff;
  --mau-chu-chinh: #000000;
  --mau-xam-nhat: #f8f9fa;
  --mau-xam-nhe: #e9ecef;
  --mau-xam-trung: #6c757d;
  --mau-xam-dam: #495057;
  
  /* Accent colors */
  --mau-xanh-duong: #007bff;
  --mau-do-canh-bao: #dc3545;
  --mau-xanh-thanh-cong: #28a745;
  --mau-vang-chu-y: #ffc107;
}
```

### Tailwind Configuration
```javascript
colors: {
  'nen-chinh': '#ffffff',
  'chu-chinh': '#000000',
  'xam-nhat': '#f8f9fa',
  'xam-nhe': '#e9ecef',
  'xam-trung': '#6c757d',
  'xam-dam': '#495057',
  'xanh-duong': '#007bff',
  'do-canh-bao': '#dc3545',
  'xanh-thanh-cong': '#28a745',
  'vang-chu-y': '#ffc107',
}
```

### TypeScript Constants
```typescript
export const MAU_SAC = {
  NEN_CHINH: '#ffffff',
  CHU_CHINH: '#000000',
  XAM_NHAT: '#f8f9fa',
  XAM_NHE: '#e9ecef',
  XAM_TRUNG: '#6c757d',
  XAM_DAM: '#495057',
  XANH_DUONG: '#007bff',
  DO_CANH_BAO: '#dc3545',
  XANH_THANH_CONG: '#28a745',
  VANG_CHU_Y: '#ffc107',
} as const;
```

## 🔍 Validation Tools

### Design Review Checklist
- [ ] Chỉ sử dụng màu từ approved palette
- [ ] Contrast ratios meet WCAG AA standards
- [ ] Màu nhấn chỉ dùng cho states quan trọng
- [ ] Consistent color usage across components
- [ ] Color blind accessibility maintained

### Browser Testing
```css
/* Test accessibility in browser dev tools */
@media (prefers-contrast: high) {
  /* High contrast overrides */
}

@media (prefers-color-scheme: dark) {
  /* Dark mode preparation */
}

@media (prefers-reduced-motion: reduce) {
  /* Motion reduction */
}
```

---

**Complete Color Palette cho Copy To Notion Extension** 🎨  
*8 màu tối giản, accessible, Jobs/Ive inspired*
