# PRP 02: Minimalist Design System & Core Architecture - Hệ Thống Thiết Kế

## 🎯 Objective & Scope
**Primary Goal**: Xây dựng complete minimalist design system theo Jobs/Ive principles với Tailwind CSS, tạo core architecture constants và shared design patterns
**Scope Boundaries**: 
- ✅ INCLUDED: CSS design tokens, Tailwind configuration, global styles, typography system, spacing grid, color palette
- ❌ NOT INCLUDED: React components implementation, interactive behaviors, specific feature logic

**Success Criteria**: 
- Design system hoàn chỉnh với consistent tokens
- Tailwind classes generate properly cho minimalist aesthetic  
- Typography hierarchy clear và readable
- Color palette limited đúng Jobs/Ive philosophy
- 8px spacing grid system established

## 📥 Input Context & Dependencies

### Required Previous Steps
- [x] **PRP 01**: Project foundation với Vite + TypeScript + Tailwind setup completed

### Input Artifacts
```
/step_01_output/
├── tailwind.config.js          # Basic Tailwind configuration
├── src/styles/                 # Empty styles directory
├── package.json                # Dependencies installed
└── tsconfig.json              # TypeScript ready
```

### Technical Context
- **Technology Stack**: Tailwind CSS 3.3+ với custom design tokens
- **Design Pattern**: Jobs/Ive minimalist aesthetic - white space, subtle interactions
- **Vietnamese Conventions**: CSS class names, design token names in Vietnamese
- **Performance Requirements**: <5kb additional CSS bundle size

## 🔨 Implementation Requirements

### Primary Deliverables
```typescript
// Expected file structure after completion
/design_system_output/
├── tailwind.config.js              # Complete design system configuration
├── src/styles/
│   ├── globals.css                 # Global styles với design tokens
│   ├── components.css              # Component base styles
│   └── utilities.css               # Custom utility classes
├── src/shared/constants/
│   ├── thiet-ke-constants.ts       # Design system constants
│   └── mau-sac-palette.ts          # Color system definitions
└── documentation/
    ├── design-system-guide.md      # Usage documentation
    └── color-palette-reference.md   # Color reference guide
```

### Technical Specifications
```javascript
// tailwind.config.js - Complete Jobs/Ive inspired configuration
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './public/**/*.html'],
  theme: {
    extend: {
      colors: {
        // Core Minimalist Palette (Jobs/Ive inspired)
        'nen-chinh': '#ffffff',         // Pure white background
        'chu-chinh': '#000000',         // True black text
        'xam-nhat': '#f8f9fa',          // Subtle background
        'xam-nhe': '#e9ecef',           // Borders, dividers
        'xam-trung': '#6c757d',         // Secondary text
        'xam-dam': '#495057',           // Tertiary text
        
        // Accent Colors - Minimal Usage Only
        'xanh-duong': '#007bff',        // Primary actions only
        'do-canh-bao': '#dc3545',       // Errors only  
        'xanh-thanh-cong': '#28a745',   // Success states only
        'vang-chu-y': '#ffc107',        // Warnings only
      },
      fontFamily: {
        'he-thong': [
          '-apple-system', 
          'BlinkMacSystemFont', 
          'Segoe UI', 
          'Roboto', 
          'sans-serif'
        ],
        'ma': ['SF Mono', 'Monaco', 'Inconsolata', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],    // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
      },
      spacing: {
        // 8px grid system - Jobs/Ive principle
        '0.5': '0.125rem',  // 2px
        '1': '0.25rem',     // 4px  
        '2': '0.5rem',      // 8px
        '3': '0.75rem',     // 12px
        '4': '1rem',        // 16px
        '5': '1.25rem',     // 20px
        '6': '1.5rem',      // 24px
        '8': '2rem',        // 32px
        '10': '2.5rem',     // 40px
        '12': '3rem',       // 48px
        '16': '4rem',       // 64px
        '20': '5rem',       // 80px
        '24': '6rem',       // 96px
      },
      borderRadius: {
        'sm': '0.125rem',   // 2px
        'DEFAULT': '0.25rem', // 4px
        'md': '0.375rem',   // 6px
        'lg': '0.5rem',     // 8px
        'xl': '0.75rem',    // 12px
        '2xl': '1rem',      // 16px
      },
      boxShadow: {
        // Subtle shadows only - minimalist approach
        'nhe': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'trung': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lon': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        // Subtle animations only
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

```css
/* src/styles/globals.css - Global design system styles */
@tailwind base;
@tailwind components; 
@tailwind utilities;

/* CSS Custom Properties cho design consistency */
:root {
  /* Color System - Jobs/Ive Minimalist Palette */
  --mau-nen-chinh: theme('colors.nen-chinh');
  --mau-chu-chinh: theme('colors.chu-chinh');
  --mau-xam-nhat: theme('colors.xam-nhat');
  --mau-xam-nhe: theme('colors.xam-nhe');
  --mau-xam-trung: theme('colors.xam-trung');
  
  /* Typography System */
  --font-he-thong: theme('fontFamily.he-thong');
  --font-ma: theme('fontFamily.ma');
  
  /* Spacing Grid - 8px system */
  --khoang-cach-nho: theme('spacing.2');      /* 8px */
  --khoang-cach-trung: theme('spacing.4');    /* 16px */
  --khoang-cach-lon: theme('spacing.6');      /* 24px */
  --khoang-cach-xl: theme('spacing.8');       /* 32px */
  
  /* Border Radius */
  --bo-goc-nho: theme('borderRadius.sm');
  --bo-goc-trung: theme('borderRadius.DEFAULT');
  --bo-goc-lon: theme('borderRadius.lg');
}

/* Global Base Styles - Minimalist Foundation */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-he-thong);
  font-size: 16px;
  line-height: 1.5;
  color: var(--mau-chu-chinh);
  background-color: var(--mau-nen-chinh);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  background-color: inherit;
}

/* Typography Hierarchy - Clear và Consistent */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  color: var(--mau-chu-chinh);
  margin-bottom: var(--khoang-cach-trung);
}

h1 { font-size: theme('fontSize.2xl'); }
h2 { font-size: theme('fontSize.xl'); }
h3 { font-size: theme('fontSize.lg'); }
h4 { font-size: theme('fontSize.base'); }

p {
  margin-bottom: var(--khoang-cach-trung);
  color: var(--mau-chu-chinh);
}

/* Interactive Elements - Subtle Transitions */
button, 
a,
[role="button"] {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

button:hover,
a:hover,
[role="button"]:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

/* Focus States - Accessibility với Style */
button:focus,
a:focus,
input:focus,
textarea:focus {
  outline: 2px solid var(--mau-xanh-duong);
  outline-offset: 2px;
}

/* Scroll Behavior - Smooth UX */
html {
  scroll-behavior: smooth;
}

/* Selection Styling - Brand Consistent */
::selection {
  background-color: var(--mau-xanh-duong);
  color: white;
}
```

### Design Requirements
- **Minimalist Principles**: Extremely limited color palette, generous white space priority
- **Color Palette**: Maximum 8 colors total, primarily black/white/gray
- **Typography**: System font stack only, clear hierarchy, no decorative fonts
- **Responsive Behavior**: N/A for this step, preparing for future responsive implementation
- **Accessibility**: WCAG-compliant focus states, sufficient color contrast

### Vietnamese Integration
- **Naming Conventions**: Tailwind color names, CSS variables, constants using Vietnamese
- **Documentation**: Design system guide hoàn toàn bằng tiếng Việt
- **User Messages**: Color names và descriptions natural Vietnamese
- **Cultural Adaptation**: Design choices reflect Vietnamese aesthetic preferences while maintaining Jobs/Ive principles

## ✅ Validation Checklist

### Technical Validation
- [ ] Tailwind builds successfully với custom configuration
- [ ] CSS bundle size remains under 5kb additional
- [ ] All custom colors render correctly in browser
- [ ] Typography scales properly across different devices
- [ ] Animation keyframes work smoothly

### Design Validation  
- [ ] Color palette strictly limited to minimalist approach (max 8 colors)
- [ ] White space usage creates proper breathing room
- [ ] Typography hierarchy is visually clear và consistent
- [ ] Interactive states are subtle yet noticeable
- [ ] Overall aesthetic matches Jobs/Ive minimalist philosophy

### Vietnamese Cultural Validation
- [ ] 100% Vietnamese naming cho design tokens và CSS variables
- [ ] Design system documentation completely in Vietnamese
- [ ] Color names are natural Vietnamese terminology
- [ ] Cultural sensitivity in color choices và naming
- [ ] Team-friendly naming conventions

### Integration Validation
- [ ] Tailwind classes generate properly for all custom tokens
- [ ] CSS custom properties work correctly across browsers
- [ ] Design system integrates seamlessly với Vite build
- [ ] No conflicts với existing Tailwind defaults
- [ ] Ready for component implementation in next steps

## 📤 Expected Output Structure

### Generated Files
```
/step_02_output/
├── implementation/
│   ├── tailwind.config.js
│   ├── src/styles/globals.css
│   ├── src/styles/components.css
│   ├── src/styles/utilities.css
│   └── src/shared/constants/thiet-ke-constants.ts
├── documentation/
│   ├── design-system-guide.md
│   ├── color-palette-reference.md
│   └── typography-guide.md
└── validation/
    ├── design_checklist_results.md
    └── css_bundle_metrics.json
```

### Documentation Requirements
- **Implementation Notes**: Quyết định về color choices, spacing system rationale
- **Usage Examples**: Cách sử dụng design tokens trong components
- **Integration Guide**: How Step 03 sẽ leverage design system
- **Quality Metrics**: CSS bundle size, color contrast ratios, typography scales

## 🔄 Next Step Preparation

### Artifacts for Next Step
- Complete design system với consistent tokens established
- Global CSS styles applying minimalist principles
- TypeScript constants file với design system values
- Usage documentation để guide component implementation

### Potential Issues & Solutions
- **Color Contrast Issues**: Test all color combinations trong WCAG validator
- **Bundle Size Growth**: Monitor Tailwind output, use PurgeCSS if needed
- **Vietnamese Font Support**: Ensure system fonts handle Vietnamese diacritics properly

## 🎨 AI Execution Guidance

### Optimal Approach
1. **Start với Color Philosophy**: Establish Jobs/Ive color principles first
2. **Build Spacing Grid**: 8px system consistent throughout
3. **Create Typography Hierarchy**: Clear, readable, minimal decoration
4. **Add Subtle Interactions**: Hover states, focus states only
5. **Document Everything**: Vietnamese docs cho team collaboration

### Common AI Pitfalls to Avoid
- Don't add too many colors (maximum 8 total including grays)
- Don't create complex animations (subtle transitions only)
- Don't implement React components yet (CSS foundation only)
- Don't skip Vietnamese naming conventions
- Don't overcomplicate spacing system (8px grid sufficient)

### Expected Implementation Time
- **Design Token Setup**: 45-60 minutes cho comprehensive system
- **AI Generation Time**: 20-30 minutes với proper design guidance
- **Validation Time**: 15-20 minutes cho visual verification
- **Documentation Time**: 20-30 minutes cho complete documentation

---

**Ready for design system implementation!** Tạo foundation vững chắc cho minimalist aesthetic theo Jobs/Ive principles! 🎨
