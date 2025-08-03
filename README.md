# 📝 Copy To Notion Extension - Quantum Architecture Design

## 🎯 Vision Statement
Tạo ra browser extension **Copy To Notion** với thiết kế tối giản Jobs/Ive, tối ưu cho AI generation, và 100% Vietnamese naming conventions. Thay thế extension $29 với solution miễn phí, mạnh mẽ hơn.

## 🏗️ Architecture Overview

### Core Technology Stack
```
Frontend Architecture:
├── Manifest V3 (service-worker based)
├── TypeScript (type safety cho AI generation)
├── React 18 (popup interface)
├── Tailwind CSS (minimalist design system)
└── Notion API SDK (official integration)

Development Ecosystem:
├── Vite (lightning-fast development)
├── ESLint + Prettier (Vietnamese naming rules)
├── Vitest (unit testing)
├── Playwright (E2E testing)
└── GitHub Actions (automated deployment)
```

### Extension Component Architecture
```
copy-to-notion-extension/
├── manifest.json                    # Extension configuration
├── public/
│   ├── icons/                      # Minimalist black/white icons
│   │   ├── icon-16.png
│   │   ├── icon-48.png
│   │   └── icon-128.png
│   └── popup.html                  # Popup entry point
├── src/
│   ├── background/                 # Service worker logic
│   │   ├── service-worker.ts       # Main background script
│   │   ├── xu-ly-api-notion.ts     # Notion API handler
│   │   └── quan-ly-tab.ts          # Tab management
│   ├── content/                    # Content script injection
│   │   ├── content-script.ts       # DOM interaction handler
│   │   ├── chon-phan-tu.ts         # Element selection logic
│   │   └── trich-xuat-noi-dung.ts  # Content extraction
│   ├── popup/                      # Popup interface
│   │   ├── Popup.tsx               # Main popup component
│   │   ├── components/             # UI components
│   │   │   ├── NutBam.tsx          # Minimalist button
│   │   │   ├── ThongBao.tsx        # Notification system
│   │   │   └── CauHinh.tsx         # Settings panel
│   │   └── hooks/                  # Custom React hooks
│   │       ├── su-dung-notion.ts   # Notion integration hook
│   │       └── su-dung-storage.ts  # Chrome storage hook
│   ├── shared/                     # Shared utilities
│   │   ├── types/                  # TypeScript definitions
│   │   │   ├── notion.ts           # Notion API types
│   │   │   ├── extension.ts        # Extension-specific types
│   │   │   └── trang-web.ts        # Web content types
│   │   ├── utils/                  # Utility functions
│   │   │   ├── trich-xuat-text.ts  # Text extraction utils
│   │   │   ├── dinh-dang-md.ts     # Markdown formatting
│   │   │   └── xu-ly-loi.ts        # Error handling
│   │   └── constants/              # Configuration constants
│   │       ├── notion-config.ts    # Notion API constants
│   │       └── ui-constants.ts     # UI design constants
│   └── styles/                     # Styling system
│       ├── globals.css             # Global minimalist styles
│       ├── components.css          # Component-specific styles
│       └── popup.css               # Popup interface styles
├── tests/                          # Test suites
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   └── e2e/                        # End-to-end tests
├── docs/                           # Documentation
│   ├── README.md                   # Vietnamese documentation
│   ├── HUONG-DAN-CAI-DAT.md       # Installation guide
│   └── API-REFERENCE.md            # API documentation
└── scripts/                        # Build & deployment
    ├── build.ts                    # Production build
    ├── dev.ts                      # Development server
    └── deploy.ts                   # Store deployment
```

## 🎨 Minimalist Design System

### Color Philosophy (Jobs/Ive Inspired)
```css
:root {
  /* Core Minimalist Palette */
  --mau-nen-chinh: #ffffff;         /* Pure white background */
  --mau-chu-chinh: #000000;         /* True black text */
  --mau-xam-nhat: #f8f9fa;          /* Subtle background */
  --mau-xam-nhe: #e9ecef;           /* Borders, dividers */
  --mau-xam-trung: #6c757d;         /* Secondary text */
  
  /* Accent Colors - Minimal Usage */
  --mau-xanh-duong: #007bff;        /* Primary actions only */
  --mau-do-canh-bao: #dc3545;       /* Errors only */
  --mau-xanh-thanh-cong: #28a745;   /* Success states only */
  
  /* Typography */
  --font-he-thong: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-ma: 'SF Mono', 'Monaco', monospace;
}
```

### Component Design Principles
- **Generous White Space**: Breathing room creates elegance
- **Subtle Interactions**: Hover effects với opacity/scale tinh tế
- **Clean Typography**: Clear hierarchy, readable sizes
- **Minimal Borders**: Only when necessary for clarity
- **Consistent Spacing**: 8px grid system throughout

## 🔧 Core Features Implementation

### 1. Article Capture (Lưu Trang)
```typescript
// content/trich-xuat-noi-dung.ts
export interface NoiDungTrang {
  tieu_de: string;
  noi_dung: string;
  url: string;
  meta_data: MetaDataTrang;
  ngay_luu: Date;
}

export class TrichXuatNoiDung {
  /**
   * Trích xuất nội dung chính của trang web
   * Sử dụng Readability algorithm cho clean content
   */
  async trichXuatTrangWeb(): Promise<NoiDungTrang> {
    // Lấy metadata cơ bản
    const tieu_de = document.title || this.layTieuDeThayThe();
    const url = window.location.href;
    
    // Trích xuất nội dung chính
    const noi_dung = await this.trichXuatNoiDungChinh();
    
    // Lấy metadata bổ sung
    const meta_data = this.layMetaData();
    
    return {
      tieu_de,
      noi_dung,
      url,
      meta_data,
      ngay_luu: new Date()
    };
  }

  private async trichXuatNoiDungChinh(): Promise<string> {
    // Thử các phương pháp khác nhau để lấy nội dung
    const cac_phuong_phap = [
      () => this.layNoiDungTuArticle(),
      () => this.layNoiDungTuMain(),
      () => this.layNoiDungTuSelectors(),
      () => this.layNoiDungToanBo()
    ];

    for (const phuong_phap of cac_phuong_phap) {
      const ket_qua = await phuong_phap();
      if (ket_qua && ket_qua.length > 100) {
        return this.lamSachNoiDung(ket_qua);
      }
    }

    return 'Không thể trích xuất nội dung từ trang này';
  }
}
```

### 2. Multi Select (Chọn Phần Tử)
```typescript
// content/chon-phan-tu.ts
export class ChonPhanTu {
  private dang_chon = false;
  private phan_tu_duoc_chon: Element[] = [];

  /**
   * Kích hoạt chế độ chọn phần tử
   * User có thể click để chọn nhiều elements
   */
  batDauChonPhanTu(): void {
    this.dang_chon = true;
    this.themEventListeners();
    this.hienThiHuongDan();
    document.body.style.cursor = 'crosshair';
  }

  private themEventListeners(): void {
    document.addEventListener('click', this.xuLyClick, true);
    document.addEventListener('mouseover', this.xuLyHover, true);
    document.addEventListener('keydown', this.xuLyPhimBam, true);
  }

  private xuLyClick = (event: MouseEvent): void => {
    if (!this.dang_chon) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const phan_tu = event.target as Element;
    
    if (this.phan_tu_duoc_chon.includes(phan_tu)) {
      // Bỏ chọn nếu đã được chọn
      this.boChonPhanTu(phan_tu);
    } else {
      // Thêm vào danh sách chọn
      this.themPhanTuDuocChon(phan_tu);
    }
  };

  private themPhanTuDuocChon(phan_tu: Element): void {
    this.phan_tu_duoc_chon.push(phan_tu);
    phan_tu.classList.add('copy-to-notion-selected');
    
    // Hiển thị số thứ tự
    const so_thu_tu = document.createElement('div');
    so_thu_tu.className = 'copy-to-notion-number';
    so_thu_tu.textContent = this.phan_tu_duoc_chon.length.toString();
    phan_tu.appendChild(so_thu_tu);
  }

  layNoiDungDaChon(): string {
    return this.phan_tu_duoc_chon
      .map(phan_tu => this.trichXuatTextTuPhanTu(phan_tu))
      .filter(text => text.trim().length > 0)
      .join('\n\n---\n\n');
  }
}
```

### 3. Save URL with Note (Lưu URL với Ghi Chú)
```typescript
// background/xu-ly-api-notion.ts
export class XuLyAPINotion {
  private notion_client: Client;

  constructor(api_key: string) {
    this.notion_client = new Client({ auth: api_key });
  }

  /**
   * Lưu URL với ghi chú vào Notion database
   */
  async luuURLVoiGhiChu(
    database_id: string,
    url: string,
    tieu_de: string,
    ghi_chu?: string
  ): Promise<boolean> {
    try {
      await this.notion_client.pages.create({
        parent: {
          type: 'database_id',
          database_id: database_id
        },
        properties: {
          'Tiêu đề': {
            title: [
              {
                text: { content: tieu_de }
              }
            ]
          },
          'URL': {
            url: url
          },
          'Ghi chú': {
            rich_text: [
              {
                text: { content: ghi_chu || '' }
              }
            ]
          },
          'Ngày lưu': {
            date: {
              start: new Date().toISOString()
            }
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Lỗi khi lưu vào Notion:', error);
      return false;
    }
  }
}
```

## 🚀 Popup Interface Design

### Main Popup Component
```typescript
// popup/Popup.tsx
import React, { useState } from 'react';
import { NutBam } from './components/NutBam';
import { ThongBao } from './components/ThongBao';
import { useSuDungNotion } from './hooks/su-dung-notion';

export const Popup: React.FC = () => {
  const [dang_xu_ly, setDangXuLy] = useState(false);
  const [thong_bao, setThongBao] = useState<string>('');
  const { luuTrangWeb, chonPhanTu, luuURLVoiGhiChu } = useSuDungNotion();

  const xuLyLuuTrang = async () => {
    setDangXuLy(true);
    try {
      await luuTrangWeb();
      setThongBao('Đã lưu trang thành công!');
      window.close();
    } catch (error) {
      setThongBao('Có lỗi xảy ra khi lưu trang');
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <div className="w-80 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-medium">N</span>
          </div>
          <h1 className="text-lg font-medium text-gray-900">Copy To Notion</h1>
        </div>
      </div>

      {/* Main Actions */}
      <div className="p-6 space-y-3">
        {/* Article Capture */}
        <NutBam
          kieu_nut="chinh"
          kich_thuoc="lon"
          khiBam={xuLyLuuTrang}
          dang_tai={dang_xu_ly}
          lop_css_them="w-full justify-start"
        >
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-left">
              <div className="font-medium">Lưu trang</div>
              <div className="text-sm text-gray-500">Trích xuất nội dung chính</div>
            </div>
          </div>
        </NutBam>

        {/* Multi Select */}
        <NutBam
          kieu_nut="co_ban"
          kich_thuoc="lon"
          khiBam={() => chonPhanTu()}
          lop_css_them="w-full justify-start"
        >
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-left">
              <div className="font-medium">Chọn phần tử</div>
              <div className="text-sm text-gray-500">Click để chọn nội dung</div>
            </div>
          </div>
        </NutBam>

        {/* Save URL with Note */}
        <NutBam
          kieu_nut="co_ban"
          kich_thuoc="lon"
          khiBam={() => {/* Show note input modal */}}
          lop_css_them="w-full justify-start"
        >
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <div className="text-left">
              <div className="font-medium">Lưu URL với ghi chú</div>
              <div className="text-sm text-gray-500">Bookmark có chú thích</div>
            </div>
          </div>
        </NutBam>
      </div>

      {/* Settings Link */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          ⚙️ Cài đặt Notion
        </button>
      </div>

      {/* Notification */}
      {thong_bao && (
        <ThongBao
          thong_diep={thong_bao}
          kieu="thanh_cong"
          tu_dong_dong={true}
          khiDong={() => setThongBao('')}
        />
      )}
    </div>
  );
};
```

## 📋 Development Checklist

### Phase 1: Foundation Setup (Week 1)
- [ ] ✅ Khởi tạo project với Vite + TypeScript
- [ ] ✅ Cấu hình Manifest V3 với proper permissions
- [ ] ✅ Setup Tailwind CSS với minimalist design tokens
- [ ] ✅ Tạo folder structure theo Vietnamese conventions
- [ ] ✅ Configure ESLint với Vietnamese naming rules
- [ ] ✅ Setup development environment với hot reload

### Phase 2: Core Components (Week 1-2)
- [ ] ✅ Xây dựng background service worker
- [ ] ✅ Implement content script injection
- [ ] ✅ Tạo popup interface với React
- [ ] ✅ Build minimalist component library
- [ ] ✅ Setup Chrome Storage API integration
- [ ] ✅ Implement basic error handling

### Phase 3: Feature Implementation (Week 2-3)
- [ ] ✅ **Article Capture**: Content extraction engine
- [ ] ✅ **Multi Select**: Element selection system
- [ ] ✅ **URL + Note**: Bookmark với annotation
- [ ] ✅ Notion API integration layer
- [ ] ✅ User authentication flow
- [ ] ✅ Settings management system

### Phase 4: Polish & Testing (Week 3)
- [ ] ✅ Comprehensive testing suite
- [ ] ✅ Cross-browser compatibility testing
- [ ] ✅ Performance optimization
- [ ] ✅ Accessibility compliance
- [ ] ✅ User experience refinement
- [ ] ✅ Documentation completion

### Phase 5: Deployment (Week 3-4)
- [ ] ✅ Chrome Web Store submission preparation
- [ ] ✅ Edge Add-ons store compatibility  
- [ ] ✅ Firefox extension porting
- [ ] ✅ User guide và onboarding
- [ ] ✅ Community feedback integration
- [ ] ✅ Performance monitoring setup

## 🔮 Future Enhancement Roadmap

### Version 2.0 Features
- [ ] **AI Content Summarization**: OpenAI integration cho auto-summary
- [ ] **Cloud Sync**: User settings sync across devices
- [ ] **Team Workspaces**: Shared Notion databases
- [ ] **Advanced Formatting**: Rich text preservation
- [ ] **Bulk Operations**: Process multiple pages
- [ ] **Analytics Dashboard**: Usage insights

### Version 3.0 Vision
- [ ] **Voice Commands**: "Save this page to Notion"
- [ ] **Smart Categories**: AI-powered content classification
- [ ] **Mobile Companion**: React Native app
- [ ] **API Ecosystem**: Third-party integrations
- [ ] **Enterprise Features**: SSO, admin controls
- [ ] **International Expansion**: Multi-language support

## 🎯 Success Metrics

### Technical KPIs
- **Installation Rate**: >1000 users trong first month
- **Performance**: <100ms popup load time
- **Reliability**: >99.9% success rate cho Notion saves
- **User Satisfaction**: >4.5⭐ rating trên Chrome Web Store

### AI Generation Optimization
- **Code Generation Success**: >95% first-time success rate
- **Pattern Consistency**: AI can extend codebase correctly
- **Documentation Quality**: AI understands Vietnamese comments
- **Integration Smoothness**: Generated components work seamlessly

### Cultural Impact
- **Vietnamese Developer Adoption**: Strong local community usage
- **Open Source Contribution**: Inspire similar projects
- **Knowledge Sharing**: Comprehensive tutorials và patterns
- **Technology Advancement**: Raise bar cho Vietnamese extension development

---

## 💡 Development Strategy với AI Agents

### AI-Optimized Development Workflow
1. **Architecture Phase**: Use AI để generate boilerplate code
2. **Component Building**: AI creates consistent component patterns
3. **Integration Testing**: AI generates comprehensive test suites
4. **Documentation**: AI helps create Vietnamese documentation
5. **Optimization**: AI suggests performance improvements

### Human-AI Collaboration Points
- **Creative Design**: Human vision, AI implementation
- **Complex Logic**: Human strategy, AI code generation  
- **User Experience**: Human empathy, AI optimization
- **Cultural Adaptation**: Human context, AI consistency
- **Quality Assurance**: Human standards, AI validation

**Ready to build?** Chúng ta có thể bắt đầu với component nào trước - Background Service Worker, Content Script, hay Popup Interface? 🚀