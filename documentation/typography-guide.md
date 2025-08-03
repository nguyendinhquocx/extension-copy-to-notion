# Typography Guide - Hướng Dẫn Typography

## 📝 Typography Philosophy

Typography system cho Copy To Notion Extension được thiết kế theo nguyên tắc Jobs/Ive minimalism với focus vào:

- **Clarity**: Độ rõ ràng tuyệt đối trong mọi kích thước
- **Hierarchy**: Phân cấp thông tin rõ ràng không gây confusion
- **Simplicity**: Sử dụng system fonts, không decorative
- **Accessibility**: WCAG compliant, readable cho mọi user
- **Performance**: Zero web font loading, native performance

## 🔤 Font Families

### Primary System Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

**Rationale:**
- `-apple-system`: iOS và macOS native
- `BlinkMacSystemFont`: macOS Blink rendering
- `Segoe UI`: Windows system font
- `Roboto`: Android system font
- `sans-serif`: Universal fallback

### Monospace Stack (Code/Technical)
```css
font-family: SF Mono, Monaco, Inconsolata, monospace;
```

**Usage:**
- Code snippets
- File paths
- Technical identifiers
- Notion page IDs

## 📏 Font Sizes & Scale

### Modular Scale (8px Grid Based)
```css
/* Typography scale tuned for extension popup */
--chu-xs: 0.75rem;     /* 12px - Labels, captions */
--chu-sm: 0.875rem;    /* 14px - Body secondary */
--chu-base: 1rem;      /* 16px - Body primary */
--chu-lg: 1.125rem;    /* 18px - Subheadings */
--chu-xl: 1.25rem;     /* 20px - Headings */
--chu-2xl: 1.5rem;     /* 24px - Main titles */
```

### Usage Guidelines
| Size | Usage | Context |
|------|-------|---------|
| 12px (xs) | Form labels, captions, footnotes | Supporting information |
| 14px (sm) | Secondary body text, metadata | Less important content |
| 16px (base) | Primary body text, buttons | Main content |
| 18px (lg) | Subheadings, large buttons | Section headers |
| 20px (xl) | Page headings, modal titles | Primary headings |
| 24px (2xl) | App title, main headers | Top-level headings |

## ⚖️ Font Weights

### Weight Scale
```css
--trong-luong-mong: 300;    /* Light - Rare usage */
--trong-luong-thuong: 400;  /* Regular - Body text */
--trong-luong-trung: 500;   /* Medium - Emphasized text */
--trong-luong-dam: 600;     /* Semi-bold - Headings */
--trong-luong-bold: 700;    /* Bold - Strong emphasis */
```

### Usage Rules
- **300 (Light)**: Chỉ cho large headings (24px+)
- **400 (Regular)**: Default cho body text
- **500 (Medium)**: Button text, emphasized content
- **600 (Semi-bold)**: Headings, section titles
- **700 (Bold)**: Strong emphasis, alerts (minimal usage)

## 📐 Line Heights

### Responsive Line Heights
```css
/* Optimal line heights for readability */
--line-height-chat: 1.2;    /* Headings */
--line-height-thuong: 1.5;  /* Body text */
--line-height-rong: 1.75;   /* Large text blocks */
```

### Implementation
```css
h1, h2, h3 { line-height: var(--line-height-chat); }
p, div { line-height: var(--line-height-thuong); }
.large-content { line-height: var(--line-height-rong); }
```

## 🏗️ Typography Hierarchy

### Heading Levels
```css
/* H1 - App Title, Main Popup Header */
.text-heading-1 {
  font-size: 1.5rem;        /* 24px */
  font-weight: 600;
  line-height: 2rem;        /* 32px */
  color: var(--mau-chu-chinh);
  margin-bottom: 1rem;      /* 16px */
}

/* H2 - Section Headers */
.text-heading-2 {
  font-size: 1.25rem;       /* 20px */
  font-weight: 600;
  line-height: 1.75rem;     /* 28px */
  color: var(--mau-chu-chinh);
  margin-bottom: 0.75rem;   /* 12px */
}

/* H3 - Subsection Headers */
.text-heading-3 {
  font-size: 1.125rem;      /* 18px */
  font-weight: 500;
  line-height: 1.75rem;     /* 28px */
  color: var(--mau-chu-chinh);
  margin-bottom: 0.5rem;    /* 8px */
}

/* H4 - Component Headers */
.text-heading-4 {
  font-size: 1rem;          /* 16px */
  font-weight: 500;
  line-height: 1.5rem;      /* 24px */
  color: var(--mau-chu-chinh);
  margin-bottom: 0.5rem;    /* 8px */
}
```

### Body Text Variants
```css
/* Primary Body */
.text-body {
  font-size: 1rem;          /* 16px */
  font-weight: 400;
  line-height: 1.5rem;      /* 24px */
  color: var(--mau-chu-chinh);
  margin-bottom: 1rem;      /* 16px */
}

/* Secondary Body */
.text-body-secondary {
  font-size: 0.875rem;      /* 14px */
  font-weight: 400;
  line-height: 1.25rem;     /* 20px */
  color: var(--mau-xam-trung);
  margin-bottom: 0.75rem;   /* 12px */
}

/* Small Text */
.text-small {
  font-size: 0.75rem;       /* 12px */
  font-weight: 400;
  line-height: 1rem;        /* 16px */
  color: var(--mau-xam-trung);
  margin-bottom: 0.5rem;    /* 8px */
}

/* Caption/Metadata */
.text-caption {
  font-size: 0.75rem;       /* 12px */
  font-weight: 400;
  line-height: 1rem;        /* 16px */
  color: var(--mau-xam-dam);
  font-style: italic;
}
```

### Interactive Text
```css
/* Button Text */
.text-button {
  font-size: 0.875rem;      /* 14px */
  font-weight: 500;
  line-height: 1.25rem;     /* 20px */
  text-align: center;
  letter-spacing: 0.025em;  /* Slight tracking */
}

/* Link Text */
.text-link {
  color: var(--mau-xanh-duong);
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color 0.2s ease;
}

.text-link:hover {
  text-decoration-color: var(--mau-xanh-duong);
}

/* Label Text */
.text-label {
  font-size: 0.75rem;       /* 12px */
  font-weight: 500;
  line-height: 1rem;        /* 16px */
  color: var(--mau-xam-dam);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

## 🎯 Extension Specific Typography

### Popup Interface
```css
/* Popup Header Title */
.popup-title {
  font-size: 1.125rem;      /* 18px */
  font-weight: 600;
  color: var(--mau-chu-chinh);
  margin: 0;
}

/* Popup Section */
.popup-section-title {
  font-size: 0.875rem;      /* 14px */
  font-weight: 500;
  color: var(--mau-xam-dam);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

/* Popup Body */
.popup-body {
  font-size: 0.875rem;      /* 14px */
  line-height: 1.4;
  color: var(--mau-chu-chinh);
}
```

### Notion Integration
```css
/* Notion Page Title */
.notion-page-title {
  font-size: 0.875rem;      /* 14px */
  font-weight: 500;
  color: var(--mau-chu-chinh);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Notion Property Label */
.notion-property-label {
  font-size: 0.75rem;       /* 12px */
  font-weight: 400;
  color: var(--mau-xam-trung);
  text-transform: capitalize;
}

/* Notion Content Preview */
.notion-content-preview {
  font-size: 0.75rem;       /* 12px */
  line-height: 1.3;
  color: var(--mau-xam-trung);
  font-family: var(--font-ma); /* Monospace for content */
}
```

### Content Script Overlay
```css
/* Modal Title */
.overlay-modal-title {
  font-size: 1.25rem;       /* 20px */
  font-weight: 600;
  color: var(--mau-chu-chinh);
  margin-bottom: 1rem;
}

/* Modal Body */
.overlay-modal-body {
  font-size: 1rem;          /* 16px */
  line-height: 1.5;
  color: var(--mau-chu-chinh);
}

/* Progress Text */
.overlay-progress-text {
  font-size: 0.875rem;      /* 14px */
  color: var(--mau-xam-trung);
  text-align: center;
}
```

## ♿ Accessibility Features

### Screen Reader Support
```css
/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--mau-chu-chinh);
  color: var(--mau-nen-chinh);
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
}

.skip-link:focus {
  top: 6px;
}
```

### High Contrast Support
```css
@media (prefers-contrast: high) {
  .text-body-secondary,
  .text-caption {
    color: var(--mau-chu-chinh);
    font-weight: 500;
  }
  
  .text-link {
    text-decoration: underline;
  }
}
```

### Font Size Preferences
```css
@media (prefers-reduced-motion: no-preference) {
  html {
    font-size: 16px; /* Base size */
  }
}

/* Large text preference */
@media (min-resolution: 2dppx) {
  html {
    font-size: 17px; /* Slightly larger on high-DPI */
  }
}
```

## 📱 Responsive Typography

### Extension Constraints
```css
/* Popup width constraints */
@media (max-width: 320px) {
  .popup-title {
    font-size: 1rem;        /* Smaller on narrow popups */
  }
  
  .text-body {
    font-size: 0.875rem;    /* Compact body text */
    line-height: 1.4;
  }
}

/* Content script max width */
@media (max-width: 400px) {
  .overlay-modal-title {
    font-size: 1.125rem;    /* Scale down on mobile */
  }
}
```

## 🛠️ Implementation Examples

### React Component
```typescript
import { CHU_VIET } from '@/shared/constants/thiet-ke-constants';

const TypographyExample: React.FC = () => {
  return (
    <div style={{ fontFamily: CHU_VIET.HE_THONG }}>
      <h1 className="text-heading-1">Copy To Notion</h1>
      <p className="text-body">Select content to save to Notion</p>
      <span className="text-caption">Last updated: 2 minutes ago</span>
    </div>
  );
};
```

### CSS Classes
```css
/* Utility classes for common patterns */
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-uppercase {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* State classes */
.text-muted {
  color: var(--mau-xam-trung);
}

.text-emphasized {
  font-weight: 500;
}

.text-strong {
  font-weight: 600;
}
```

## 🔍 Typography Checklist

### Design Review
- [ ] Font sizes tuân theo modular scale
- [ ] Line heights optimized cho readability
- [ ] Font weights consistent và meaningful
- [ ] Color contrast WCAG AA compliant
- [ ] Hierarchy rõ ràng và logical

### Implementation Review
- [ ] System fonts loading correctly
- [ ] Text responsive across popup sizes
- [ ] Accessibility features implemented
- [ ] Performance optimized (no web fonts)
- [ ] Cross-browser compatibility

### User Experience
- [ ] Text readable ở minimum popup size
- [ ] Information hierarchy intuitive
- [ ] Interactive text có proper feedback
- [ ] Error messages clear và helpful
- [ ] Loading states communicated clearly

---

**Complete Typography System cho Copy To Notion Extension** ✍️  
*Clear, accessible, Jobs/Ive minimalist typography*
