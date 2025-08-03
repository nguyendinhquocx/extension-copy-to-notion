# PRP 03: Shared Types & Utilities Foundation - Nền Tảng Types và Utilities

## 🎯 Objective & Scope
**Primary Goal**: Xây dựng comprehensive TypeScript type system, shared utilities, constants và error handling foundation cho toàn bộ extension
**Scope Boundaries**: 
- ✅ INCLUDED: TypeScript interfaces, utility functions, constants, error handling patterns, Vietnamese naming conventions
- ❌ NOT INCLUDED: React components, API integration logic, UI interactions, business feature logic

**Success Criteria**: 
- TypeScript compilation hoàn hảo với strict mode
- Shared types cover all extension domains (Notion, content, popup, background)
- Utility functions handle common operations
- Error handling patterns established
- Vietnamese naming conventions consistent

## 📥 Input Context & Dependencies

### Required Previous Steps
- [x] **PRP 01**: Project foundation với TypeScript configuration
- [x] **PRP 02**: Design system với constants structure

### Input Artifacts
```
/previous_step_outputs/
├── tsconfig.json                   # TypeScript configuration ready
├── src/shared/constants/           # Design system constants
├── package.json                    # Notion API SDK installed
└── vite.config.ts                  # Build configuration
```

### Technical Context
- **Technology Stack**: TypeScript 5.0+ với strict mode, Notion API SDK types
- **Design Pattern**: Domain-driven type organization, utility-first approach
- **Vietnamese Conventions**: Interface names, method names, error messages
- **Performance Requirements**: Zero runtime overhead từ type system

## 🔨 Implementation Requirements

### Primary Deliverables
```typescript
// Expected file structure after completion
/shared_foundation_output/
├── src/shared/
│   ├── types/
│   │   ├── notion.ts               # Notion API type definitions
│   │   ├── extension.ts            # Extension-specific types
│   │   ├── trang-web.ts            # Web content types
│   │   ├── popup.ts                # Popup interface types
│   │   └── index.ts                # Type exports barrel
│   ├── utils/
│   │   ├── trich-xuat-text.ts      # Text extraction utilities
│   │   ├── dinh-dang-md.ts         # Markdown formatting utils
│   │   ├── xu-ly-loi.ts            # Error handling utilities
│   │   ├── storage-helpers.ts      # Chrome storage utilities
│   │   └── index.ts                # Utility exports barrel
│   ├── constants/
│   │   ├── notion-config.ts        # Notion API constants
│   │   ├── ui-constants.ts         # UI configuration constants
│   │   ├── extension-constants.ts  # Extension metadata constants
│   │   └── index.ts                # Constants exports barrel
│   └── enums/
│       ├── trang-thai.ts           # Status/state enums
│       ├── loai-noi-dung.ts        # Content type enums
│       └── index.ts                # Enum exports barrel
```

### Technical Specifications
```typescript
// src/shared/types/notion.ts - Notion API type definitions
export interface KetNoiNotion {
  api_key: string;
  database_id: string;
  workspace_id?: string;
  la_ket_noi_hop_le: boolean;
  ngay_ket_noi_cuoi: Date;
}

export interface NoiDungTrang {
  tieu_de: string;
  noi_dung: string;
  url: string;
  meta_data: MetaDataTrang;
  ngay_luu: Date;
  loai_noi_dung: LoaiNoiDung;
}

export interface MetaDataTrang {
  mo_ta?: string;
  anh_dai_dien?: string;
  tac_gia?: string;
  ngay_xuat_ban?: Date;
  tu_khoa: string[];
  domain: string;
  ngon_ngu: string;
}

export interface YeuCauLuuNotion {
  noi_dung: NoiDungTrang;
  cau_hinh: KetNoiNotion;
  tuy_chon_luu?: TuyChonLuuTrang;
}

export interface TuyChonLuuTrang {
  bao_gom_hinh_anh: boolean;
  dinh_dang_markdown: boolean;
  them_thu_vien_tags: boolean;
  tu_dong_phan_loai: boolean;
}

export interface KetQuaLuuNotion {
  thanh_cong: boolean;
  page_id?: string;
  url_notion?: string;
  thong_bao_loi?: string;
  thoi_gian_xu_ly: number;
}
```

```typescript
// src/shared/types/extension.ts - Extension-specific types
export interface TrangThaiExtension {
  dang_ket_noi: boolean;
  co_loi: boolean;
  thong_bao_hien_tai?: string;
  lan_su_dung_cuoi: Date;
}

export interface CauHinhNguoiDung {
  notion_api_key: string;
  database_id_mac_dinh: string;
  tu_dong_dong_popup: boolean;
  hien_thi_thong_bao: boolean;
  ngon_ngu_giao_dien: 'vi' | 'en';
  che_do_toi_gian: boolean;
}

export interface PhienLamViec {
  session_id: string;
  ngay_bat_dau: Date;
  so_trang_da_luu: number;
  thoi_gian_su_dung: number;
  loi_gap_phai: string[];
}

export interface ThongKeExtension {
  tong_so_trang_luu: number;
  tong_thoi_gian_su_dung: number;
  database_duoc_su_dung_nhieu: string;
  lan_cap_nhat_cuoi: Date;
  phien_ban_extension: string;
}
```

```typescript
// src/shared/types/trang-web.ts - Web content types
export interface PhanTuDuocChon {
  element: HTMLElement;
  so_thu_tu: number;
  noi_dung_text: string;
  loai_phan_tu: LoaiPhanTu;
  vi_tri: ViTriPhanTu;
  duong_dan_css: string;
}

export interface ViTriPhanTu {
  x: number;
  y: number;
  chieu_rong: number;
  chieu_cao: number;
  trong_viewport: boolean;
}

export interface NoiDungDaChon {
  cac_phan_tu: PhanTuDuocChon[];
  tong_so_ky_tu: number;
  ngay_chon: Date;
  url_trang: string;
  tieu_de_trang: string;
}

export interface TuyChonTrichXuat {
  bao_gom_hinh_anh: boolean;
  bao_gom_lien_ket: boolean;
  lam_sach_html: boolean;
  gioi_han_ky_tu?: number;
  loai_bo_quang_cao: boolean;
}
```

```typescript
// src/shared/utils/trich-xuat-text.ts - Text extraction utilities
export class TienIchTrichXuatText {
  /**
   * Làm sạch HTML và trích xuất text thuần
   */
  static lamSachHTML(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Loại bỏ script và style tags
    const scripts = temp.querySelectorAll('script, style, noscript');
    scripts.forEach(script => script.remove());
    
    // Lấy text content và format
    const text = temp.textContent || temp.innerText || '';
    return this.chuanHoaKhoangTrang(text);
  }

  /**
   * Chuẩn hóa khoảng trắng và dấu xuống dòng
   */
  static chuanHoaKhoangTrang(text: string): string {
    return text
      .replace(/\\s+/g, ' ')              // Gộp nhiều space thành 1
      .replace(/\\n\\s*\\n/g, '\\n\\n')    // Gộp nhiều newline thành 2
      .trim();
  }

  /**
   * Trích xuất metadata từ HTML head
   */
  static layMetaDataTuHead(): MetaDataTrang {
    const getMeta = (name: string): string => {
      const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      return meta?.getAttribute('content') || '';
    };

    return {
      mo_ta: getMeta('description') || getMeta('og:description'),
      anh_dai_dien: getMeta('og:image') || getMeta('twitter:image'),
      tac_gia: getMeta('author') || getMeta('article:author'),
      tu_khoa: getMeta('keywords').split(',').map(k => k.trim()).filter(Boolean),
      domain: window.location.hostname,
      ngon_ngu: document.documentElement.lang || 'vi'
    };
  }

  /**
   * Kiểm tra có phải nội dung chính của trang
   */
  static kiemTraNoiDungChinh(element: HTMLElement): boolean {
    const selectors = ['main', 'article', '[role="main"]', '.content', '#content'];
    return selectors.some(selector => 
      element.matches(selector) || element.closest(selector)
    );
  }

  /**
   * Ước tính thời gian đọc (words per minute)
   */
  static uocTinhThoiGianDoc(text: string): number {
    const so_tu = text.split(/\\s+/).length;
    const wpm = 200; // Average Vietnamese reading speed
    return Math.ceil(so_tu / wpm);
  }
}
```

```typescript
// src/shared/utils/xu-ly-loi.ts - Error handling utilities
export enum LoaiLoi {
  KET_NOI_NOTION = 'ket-noi-notion',
  TRICH_XUAT_NOI_DUNG = 'trich-xuat-noi-dung',
  LUU_STORAGE = 'luu-storage',
  QUYEN_HAN = 'quyen-han',
  MANG = 'mang',
  KHONG_XAC_DINH = 'khong-xac-dinh'
}

export interface ChiTietLoi {
  loai: LoaiLoi;
  thong_bao: string;
  thong_bao_chi_tiet?: string;
  ma_loi?: string;
  thoi_gian: Date;
  url_hien_tai?: string;
  stack_trace?: string;
}

export class QuanLyLoi {
  private static instance: QuanLyLoi;
  private lich_su_loi: ChiTietLoi[] = [];

  static getInstance(): QuanLyLoi {
    if (!QuanLyLoi.instance) {
      QuanLyLoi.instance = new QuanLyLoi();
    }
    return QuanLyLoi.instance;
  }

  /**
   * Ghi nhận lỗi và xử lý
   */
  ghi_nhan_loi(loi: Error | string, loai: LoaiLoi = LoaiLoi.KHONG_XAC_DINH): ChiTietLoi {
    const chi_tiet: ChiTietLoi = {
      loai,
      thong_bao: this.tao_thong_bao_loi(loi, loai),
      thong_bao_chi_tiet: loi instanceof Error ? loi.message : loi,
      ma_loi: loi instanceof Error ? loi.name : undefined,
      thoi_gian: new Date(),
      url_hien_tai: typeof window !== 'undefined' ? window.location.href : undefined,
      stack_trace: loi instanceof Error ? loi.stack : undefined
    };

    this.lich_su_loi.push(chi_tiet);
    this.gui_thong_bao_loi(chi_tiet);
    
    return chi_tiet;
  }

  /**
   * Tạo thông báo lỗi thân thiện cho user
   */
  private tao_thong_bao_loi(loi: Error | string, loai: LoaiLoi): string {
    switch (loai) {
      case LoaiLoi.KET_NOI_NOTION:
        return 'Không thể kết nối với Notion. Vui lòng kiểm tra API key và thử lại.';
      case LoaiLoi.TRICH_XUAT_NOI_DUNG:
        return 'Không thể trích xuất nội dung từ trang này.';
      case LoaiLoi.QUYEN_HAN:
        return 'Extension cần quyền truy cập để hoạt động trên trang này.';
      case LoaiLoi.MANG:
        return 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
      default:
        return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
    }
  }

  /**
   * Gửi thông báo lỗi đến UI
   */
  private gui_thong_bao_loi(chi_tiet: ChiTietLoi): void {
    // Sẽ được implement trong popup components
    console.error('[Copy To Notion]', chi_tiet);
  }

  /**
   * Lấy lịch sử lỗi cho debugging
   */
  lay_lich_su_loi(): ChiTietLoi[] {
    return [...this.lich_su_loi];
  }

  /**
   * Xóa lịch sử lỗi cũ
   */
  xoa_lich_su_loi(): void {
    this.lich_su_loi = [];
  }
}
```

### Design Requirements
- **Minimalist Principles**: Clean type definitions, không duplicate logic
- **Color Palette**: N/A - TypeScript types only
- **Typography**: N/A - Code organization only
- **Responsive Behavior**: N/A - Utilities prepare for responsive UI
- **Accessibility**: Error messages clear và helpful

### Vietnamese Integration
- **Naming Conventions**: 100% Vietnamese interface names, method names, properties
- **Documentation**: TypeScript comments hoàn toàn bằng tiếng Việt
- **User Messages**: Error messages natural Vietnamese, không technical jargon
- **Cultural Adaptation**: Error handling patterns respect Vietnamese user expectations

## ✅ Validation Checklist

### Technical Validation
- [ ] TypeScript compilation passes với strict mode enabled
- [ ] All types properly exported through barrel files
- [ ] Utility functions handle edge cases correctly
- [ ] Error handling covers all major failure scenarios
- [ ] No circular dependencies trong type definitions

### Design Validation  
- [ ] Type organization follows domain-driven design
- [ ] Interface names are descriptive và consistent
- [ ] Utility functions are pure và predictable
- [ ] Error messages are user-friendly và actionable
- [ ] Code structure supports future expansion

### Vietnamese Cultural Validation
- [ ] 100% Vietnamese naming convention compliance
- [ ] All TypeScript comments và documentation in Vietnamese
- [ ] Error messages are natural Vietnamese
- [ ] Type names reflect Vietnamese business domain
- [ ] Code organization supports Vietnamese team collaboration

### Integration Validation
- [ ] Types integrate seamlessly với Notion API SDK
- [ ] Utilities work correctly với extension APIs
- [ ] Error handling integrates với Chrome extension lifecycle
- [ ] Storage helpers work với Chrome storage API
- [ ] Ready for component implementation in next steps

## 📤 Expected Output Structure

### Generated Files
```
/step_03_output/
├── implementation/
│   ├── src/shared/types/ (all type files)
│   ├── src/shared/utils/ (all utility files)
│   ├── src/shared/constants/ (all constant files)
│   └── src/shared/enums/ (all enum files)
├── tests/
│   ├── utils.test.ts
│   └── error-handling.test.ts
├── documentation/
│   ├── type-system-guide.md
│   ├── utility-functions-reference.md
│   └── error-handling-guide.md
└── validation/
    ├── typescript_validation_results.md
    └── utility_test_results.json
```

### Documentation Requirements
- **Implementation Notes**: Type design decisions, utility function rationale
- **Usage Examples**: Cách sử dụng types và utilities trong components
- **Integration Guide**: How components sẽ leverage type system
- **Quality Metrics**: TypeScript coverage, utility function performance

## 🔄 Next Step Preparation

### Artifacts for Next Step
- Complete TypeScript type system covering all domains
- Utility functions ready for use trong background/content/popup
- Error handling patterns established cho user experience
- Vietnamese naming conventions consistent throughout

### Potential Issues & Solutions
- **Type Complexity**: Keep interfaces simple, use composition over inheritance
- **Circular Dependencies**: Use barrel exports carefully, separate concerns properly
- **Performance**: Utility functions should be lightweight, no heavy computations

## 🎨 AI Execution Guidance

### Optimal Approach
1. **Start với Core Types**: Notion types first, then extension-specific
2. **Build Utility Layer**: Focus on common operations, text processing
3. **Establish Error Patterns**: User-friendly messages, proper categorization
4. **Create Export Structure**: Clean barrel exports cho easy importing
5. **Document Everything**: Vietnamese docs với clear examples

### Common AI Pitfalls to Avoid
- Don't create overly complex type hierarchies
- Don't implement UI logic trong utilities (pure functions only)
- Don't skip Vietnamese naming conventions
- Don't create dependencies between utility functions
- Don't implement API integration logic yet

### Expected Implementation Time
- **Type System Setup**: 60-90 minutes cho comprehensive coverage
- **AI Generation Time**: 30-40 minutes với clear type guidance
- **Validation Time**: 20-30 minutes cho TypeScript verification
- **Documentation Time**: 25-35 minutes cho complete type documentation

---

**Ready for shared foundation implementation!** Tạo type system vững chắc với Vietnamese naming excellence! 🔧
