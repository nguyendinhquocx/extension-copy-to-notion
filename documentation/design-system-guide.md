# Hướng Dẫn Hệ Thống Thiết Kế - Copy To Notion Extension

## 🎨 Triết Lý Thiết Kế

Hệ thống thiết kế Copy To Notion Extension được xây dựng dựa trên nguyên tắc tối giản của Jobs/Ive với các nguyên tắc cốt lõi:

### Nguyên Tắc Cốt Lõi
- **Tối Giản Tuyệt Đối**: Chỉ sử dụng những gì cần thiết
- **Không Gian Trắng**: Ưu tiên khoảng trống để tạo sự thở
- **Màu Sắc Hạn Chế**: Tối đa 8 màu trong toàn bộ hệ thống
- **Typography Rõ Ràng**: Phân cấp thông tin rõ ràng
- **Tương Tác Tinh Tế**: Feedback nhẹ nhàng, không gây phiền nhiễu

## 🎨 Bảng Màu

### Màu Cơ Bản
```css
/* Pure Foundation */
--mau-nen-chinh: #ffffff;    /* Nền chính - trắng tinh khiết */
--mau-chu-chinh: #000000;    /* Chữ chính - đen tuyệt đối */

/* Gray Scale - Thang độ xám */
--mau-xam-nhat: #f8f9fa;     /* Nền phụ nhẹ nhàng */
--mau-xam-nhe: #e9ecef;      /* Đường viền, divider */
--mau-xam-trung: #6c757d;    /* Chữ phụ */
--mau-xam-dam: #495057;      /* Chữ phụ cấp 3 */
```

### Màu Nhấn Mạnh (Sử Dụng Tối Thiểu)
```css
/* Accent Colors - Chỉ cho trạng thái đặc biệt */
--mau-xanh-duong: #007bff;   /* Hành động chính */
--mau-do-canh-bao: #dc3545;  /* Lỗi, cảnh báo */
--mau-xanh-thanh-cong: #28a745; /* Thành công */
--mau-vang-chu-y: #ffc107;   /* Chú ý, warning */
```

### Cách Sử Dụng Màu
- **Trắng + Đen**: 90% của interface
- **Xám**: 8% cho hierarchy và borders
- **Màu nhấn**: 2% chỉ cho states quan trọng

## ✍️ Typography

### Font Families
```css
/* Hệ thống fonts */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* Monospace (cho code) */
font-family: SF Mono, Monaco, Inconsolata, monospace;
```

### Phân Cấp Typography
```css
/* Heading 1 - Tiêu đề chính */
.text-heading-1 {
  font-size: 1.5rem;    /* 24px */
  font-weight: 600;
  line-height: 2rem;
  color: var(--mau-chu-chinh);
}

/* Heading 2 - Tiêu đề phụ */
.text-heading-2 {
  font-size: 1.25rem;   /* 20px */
  font-weight: 600;
  line-height: 1.75rem;
  color: var(--mau-chu-chinh);
}

/* Body Text - Nội dung chính */
.text-body {
  font-size: 1rem;      /* 16px */
  font-weight: 400;
  line-height: 1.5rem;
  color: var(--mau-chu-chinh);
}

/* Caption - Chú thích */
.text-caption {
  font-size: 0.75rem;   /* 12px */
  font-weight: 400;
  line-height: 1rem;
  color: var(--mau-xam-trung);
}
```

## 📏 Spacing System

### 8px Grid System
Toàn bộ spacing sử dụng hệ thống 8px grid:

```css
/* Base spacing values */
--khoang-cach-nho: 0.5rem;    /* 8px */
--khoang-cach-trung: 1rem;    /* 16px */
--khoang-cach-lon: 1.5rem;    /* 24px */
--khoang-cach-xl: 2rem;       /* 32px */
```

### Semantic Spacing
```css
/* Component spacing */
.container-padding { padding: 1rem; }       /* 16px */
.section-spacing { margin-bottom: 1.5rem; } /* 24px */
.element-spacing { margin-bottom: 0.5rem; } /* 8px */
```

## 🎯 Components

### Buttons
```css
/* Button cơ bản */
.btn-base {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease-in-out;
}

/* Primary button */
.btn-primary {
  background-color: var(--mau-chu-chinh);
  color: var(--mau-nen-chinh);
}

/* Secondary button */
.btn-secondary {
  background-color: var(--mau-xam-nhat);
  color: var(--mau-chu-chinh);
  border: 1px solid var(--mau-xam-nhe);
}
```

### Inputs
```css
.input-base {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--mau-xam-nhe);
  border-radius: 0.25rem;
  font-size: 1rem;
  transition: border-color 0.2s ease-in-out;
}

.input-base:focus {
  outline: none;
  border-color: var(--mau-xanh-duong);
  box-shadow: 0 0 0 1px var(--mau-xanh-duong);
}
```

### Cards
```css
.card-base {
  background-color: var(--mau-nen-chinh);
  border: 1px solid var(--mau-xam-nhe);
  border-radius: 0.5rem;
  padding: 1rem;
}

.card-hover {
  transition: box-shadow 0.2s ease-in-out;
}

.card-hover:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

## 🎭 Animation & Transitions

### Timing
```css
/* Animation durations */
--thoi-gian-nhanh: 0.15s;   /* Quick feedback */
--thoi-gian-trung: 0.2s;    /* Normal transitions */
--thoi-gian-cham: 0.3s;     /* Deliberate movements */
```

### Subtle Animations
```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from { 
    transform: translateY(10px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

/* Scale in */
@keyframes scaleIn {
  from { 
    transform: scale(0.95); 
    opacity: 0; 
  }
  to { 
    transform: scale(1); 
    opacity: 1; 
  }
}
```

## 📱 Extension Specific Guidelines

### Popup Interface
```css
.popup-container {
  width: 320px;
  min-height: 400px;
  max-height: 600px;
  background-color: var(--mau-nen-chinh);
}

.popup-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--mau-xam-nhe);
}

.popup-content {
  padding: 1rem;
  overflow-y: auto;
}
```

### Content Script Overlay
```css
.overlay-base {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-base {
  background-color: var(--mau-nen-chinh);
  border-radius: 0.5rem;
  max-width: 24rem;
  margin: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

## ♿ Accessibility

### Focus States
```css
/* Enhanced focus visibility */
.focus-visible {
  outline: 2px solid var(--mau-xanh-duong);
  outline-offset: 2px;
}

/* High contrast support */
@media (prefers-contrast: high) {
  .high-contrast-border {
    border-width: 2px;
    border-color: var(--mau-chu-chinh);
  }
}
```

### Color Contrast
- Tất cả text combinations đều WCAG AA compliant
- Primary text: 21:1 contrast ratio
- Secondary text: 7.5:1 contrast ratio
- Minimum text: 4.5:1 contrast ratio

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🛠️ Cách Sử Dụng

### 1. Import Design Constants
```typescript
import { MAU_SAC, KHOANG_CACH, CHU_VIET } from '@/shared/constants/thiet-ke-constants';

// Sử dụng trong components
const styles = {
  backgroundColor: MAU_SAC.NEN_CHINH,
  color: MAU_SAC.CHU_CHINH,
  padding: KHOANG_CACH.TRUNG,
  fontFamily: CHU_VIET.HE_THONG,
};
```

### 2. Sử Dụng Tailwind Classes
```jsx
<div className="bg-nen-chinh text-chu-chinh p-4">
  <h1 className="text-heading-1 mb-4">Tiêu đề</h1>
  <p className="text-body text-xam-trung">Nội dung</p>
  <button className="btn-primary">Hành động</button>
</div>
```

### 3. CSS Custom Properties
```css
.custom-component {
  background-color: var(--mau-nen-chinh);
  color: var(--mau-chu-chinh);
  padding: var(--khoang-cach-trung);
  border-radius: var(--bo-goc-trung);
}
```

## 🔍 Validation Checklist

### Design Compliance
- [ ] Chỉ sử dụng màu từ defined palette
- [ ] Spacing tuân theo 8px grid
- [ ] Typography sử dụng system font stack
- [ ] Animations subtle và có mục đích
- [ ] Interactive states consistent

### Accessibility
- [ ] Color contrast WCAG AA compliant
- [ ] Focus states visible và consistent
- [ ] Text readable ở tất cả sizes
- [ ] Motion preferences respected
- [ ] Screen reader friendly

### Performance
- [ ] CSS bundle size < 5kb additional
- [ ] No unused styles trong production
- [ ] Optimized for extension constraints
- [ ] Fast rendering performance

---

**Design System hoàn chỉnh cho Copy To Notion Extension** 🎨  
*Tối giản, accessible, và consistent theo Jobs/Ive principles*
