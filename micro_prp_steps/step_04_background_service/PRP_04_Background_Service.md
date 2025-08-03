# PRP 04: Background Service Worker & Notion API Integration - Service Worker và API

## 🎯 Objective & Scope
**Primary Goal**: Xây dựng background service worker với Notion API integration hoàn chỉnh, tab management, và message passing system cho extension
**Scope Boundaries**: 
- ✅ INCLUDED: Service worker setup, Notion API client, tab management, message passing, Chrome storage integration
- ❌ NOT INCLUDED: Content script logic, popup UI, specific feature implementations, complex error UI

**Success Criteria**: 
- Service worker registers và hoạt động trong Manifest V3
- Notion API connection established và tested
- Message passing system hoạt động giữa background và content/popup
- Chrome storage operations work correctly
- Vietnamese naming conventions maintained

## 📥 Input Context & Dependencies

### Required Previous Steps
- [x] **PRP 01**: Project foundation với Manifest V3 setup
- [x] **PRP 02**: Design system với constants
- [x] **PRP 03**: Shared types và utilities foundation

### Input Artifacts
```
/previous_step_outputs/
├── manifest.json                   # Manifest V3 configured
├── src/shared/types/               # Complete type system
├── src/shared/utils/               # Utility functions ready
├── src/shared/constants/           # Constants defined
└── package.json                    # Notion SDK installed
```

### Technical Context
- **Technology Stack**: Manifest V3 Service Worker, Notion API SDK, Chrome Extension APIs
- **Design Pattern**: Message-driven architecture, single responsibility services
- **Vietnamese Conventions**: Service method names, API response handling
- **Performance Requirements**: <100ms API response handling, efficient tab management

## 🔨 Implementation Requirements

### Primary Deliverables
```typescript
// Expected file structure after completion
/background_service_output/
├── src/background/
│   ├── service-worker.ts           # Main service worker entry point
│   ├── xu-ly-api-notion.ts         # Notion API integration service
│   ├── quan-ly-tab.ts              # Tab management service
│   ├── xu-ly-tin-nhan.ts           # Message passing handler
│   ├── quan-ly-storage.ts          # Chrome storage operations
│   └── index.ts                    # Background exports barrel
├── src/shared/services/
│   ├── notion-client.ts            # Notion client wrapper
│   └── extension-bridge.ts         # Extension communication bridge
└── tests/background/
    ├── service-worker.test.ts
    ├── notion-api.test.ts
    └── message-passing.test.ts
```

### Technical Specifications
```typescript
// src/background/service-worker.ts - Main service worker
import { XuLyAPINotion } from './xu-ly-api-notion';
import { QuanLyTab } from './quan-ly-tab';
import { XuLyTinNhan } from './xu-ly-tin-nhan';
import { QuanLyStorage } from './quan-ly-storage';
import { QuanLyLoi, LoaiLoi } from '../shared/utils/xu-ly-loi';

class ServiceWorkerChinh {
  private xu_ly_api: XuLyAPINotion;
  private quan_ly_tab: QuanLyTab;
  private xu_ly_tin_nhan: XuLyTinNhan;
  private quan_ly_storage: QuanLyStorage;
  private quan_ly_loi: QuanLyLoi;

  constructor() {
    this.quan_ly_loi = QuanLyLoi.getInstance();
    this.quan_ly_storage = new QuanLyStorage();
    this.xu_ly_api = new XuLyAPINotion(this.quan_ly_storage);
    this.quan_ly_tab = new QuanLyTab();
    this.xu_ly_tin_nhan = new XuLyTinNhan(this.xu_ly_api, this.quan_ly_tab);
  }

  /**
   * Khởi tạo service worker khi extension start
   */
  async khoi_tao(): Promise<void> {
    try {
      console.log('[Copy To Notion] Service Worker bắt đầu khởi tạo...');
      
      // Đăng ký event listeners
      await this.dang_ky_event_listeners();
      
      // Khởi tạo các services
      await this.khoi_tao_services();
      
      // Kiểm tra connection Notion
      await this.kiem_tra_ket_noi_notion();
      
      console.log('[Copy To Notion] Service Worker khởi tạo thành công!');
    } catch (error) {
      this.quan_ly_loi.ghi_nhan_loi(error as Error, LoaiLoi.KHONG_XAC_DINH);
    }
  }

  /**
   * Đăng ký tất cả event listeners
   */
  private async dang_ky_event_listeners(): Promise<void> {
    // Extension lifecycle events
    chrome.runtime.onStartup.addListener(() => this.xu_ly_startup());
    chrome.runtime.onInstalled.addListener((details) => this.xu_ly_installed(details));
    
    // Tab events
    chrome.tabs.onActivated.addListener((info) => this.quan_ly_tab.xu_ly_tab_activated(info));
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => 
      this.quan_ly_tab.xu_ly_tab_updated(tabId, changeInfo, tab)
    );
    
    // Message passing
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>
      this.xu_ly_tin_nhan.xu_ly_tin_nhan(message, sender, sendResponse)
    );
    
    // Extension icon click
    chrome.action.onClicked.addListener((tab) => this.xu_ly_icon_click(tab));
  }

  /**
   * Khởi tạo các services
   */
  private async khoi_tao_services(): Promise<void> {
    await this.quan_ly_storage.khoi_tao();
    await this.xu_ly_api.khoi_tao();
  }

  /**
   * Kiểm tra kết nối Notion
   */
  private async kiem_tra_ket_noi_notion(): Promise<void> {
    const co_api_key = await this.quan_ly_storage.lay_notion_api_key();
    if (co_api_key) {
      await this.xu_ly_api.kiem_tra_ket_noi();
    }
  }

  /**
   * Xử lý extension startup
   */
  private xu_ly_startup(): void {
    console.log('[Copy To Notion] Extension startup detected');
  }

  /**
   * Xử lý extension installed/updated
   */
  private xu_ly_installed(details: chrome.runtime.InstalledDetails): void {
    if (details.reason === 'install') {
      console.log('[Copy To Notion] Extension installed for first time');
      this.mo_trang_chao_mung();
    } else if (details.reason === 'update') {
      console.log('[Copy To Notion] Extension updated to version', chrome.runtime.getManifest().version);
    }
  }

  /**
   * Xử lý click vào extension icon
   */
  private xu_ly_icon_click(tab: chrome.tabs.Tab): void {
    if (tab.id) {
      chrome.action.openPopup();
    }
  }

  /**
   * Mở trang chào mừng cho user mới
   */
  private mo_trang_chao_mung(): void {
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }
}

// Khởi tạo service worker
const service_worker = new ServiceWorkerChinh();
service_worker.khoi_tao();
```

```typescript
// src/background/xu-ly-api-notion.ts - Notion API integration
import { Client } from '@notionhq/client';
import { 
  KetNoiNotion, 
  NoiDungTrang, 
  YeuCauLuuNotion, 
  KetQuaLuuNotion,
  TuyChonLuuTrang 
} from '../shared/types/notion';
import { QuanLyStorage } from './quan-ly-storage';
import { QuanLyLoi, LoaiLoi } from '../shared/utils/xu-ly-loi';

export class XuLyAPINotion {
  private notion_client: Client | null = null;
  private quan_ly_storage: QuanLyStorage;
  private quan_ly_loi: QuanLyLoi;
  private ket_noi_hien_tai: KetNoiNotion | null = null;

  constructor(quan_ly_storage: QuanLyStorage) {
    this.quan_ly_storage = quan_ly_storage;
    this.quan_ly_loi = QuanLyLoi.getInstance();
  }

  /**
   * Khởi tạo Notion client
   */
  async khoi_tao(): Promise<void> {
    try {
      const api_key = await this.quan_ly_storage.lay_notion_api_key();
      if (api_key) {
        await this.tao_ket_noi(api_key);
      }
    } catch (error) {
      this.quan_ly_loi.ghi_nhan_loi(error as Error, LoaiLoi.KET_NOI_NOTION);
    }
  }

  /**
   * Tạo kết nối mới với Notion
   */
  async tao_ket_noi(api_key: string): Promise<boolean> {
    try {
      this.notion_client = new Client({
        auth: api_key,
        timeoutMs: 10000
      });

      // Test connection
      const kiem_tra = await this.kiem_tra_ket_noi();
      if (kiem_tra) {
        this.ket_noi_hien_tai = {
          api_key,
          database_id: await this.quan_ly_storage.lay_database_id_mac_dinh() || '',
          la_ket_noi_hop_le: true,
          ngay_ket_noi_cuoi: new Date()
        };

        await this.quan_ly_storage.luu_ket_noi_notion(this.ket_noi_hien_tai);
        return true;
      }
      
      return false;
    } catch (error) {
      this.quan_ly_loi.ghi_nhan_loi(error as Error, LoaiLoi.KET_NOI_NOTION);
      return false;
    }
  }

  /**
   * Kiểm tra kết nối Notion có hoạt động
   */
  async kiem_tra_ket_noi(): Promise<boolean> {
    if (!this.notion_client) return false;

    try {
      await this.notion_client.users.me();
      return true;
    } catch (error) {
      console.error('[Notion API] Connection test failed:', error);
      return false;
    }
  }

  /**
   * Lưu trang web vào Notion
   */
  async luu_trang_web(yeu_cau: YeuCauLuuNotion): Promise<KetQuaLuuNotion> {
    const thoi_gian_bat_dau = Date.now();
    
    try {
      if (!this.notion_client) {
        throw new Error('Chưa kết nối với Notion');
      }

      const { noi_dung, cau_hinh, tuy_chon_luu } = yeu_cau;
      
      // Chuẩn bị dữ liệu cho Notion page
      const properties = await this.chuan_bi_properties(noi_dung);
      const children = await this.chuan_bi_noi_dung(noi_dung, tuy_chon_luu);

      // Tạo page trong Notion
      const response = await this.notion_client.pages.create({
        parent: {
          type: 'database_id',
          database_id: cau_hinh.database_id
        },
        properties,
        children
      });

      const thoi_gian_xu_ly = Date.now() - thoi_gian_bat_dau;

      return {
        thanh_cong: true,
        page_id: response.id,
        url_notion: response.url,
        thoi_gian_xu_ly
      };

    } catch (error) {
      const thoi_gian_xu_ly = Date.now() - thoi_gian_bat_dau;
      const chi_tiet_loi = this.quan_ly_loi.ghi_nhan_loi(error as Error, LoaiLoi.KET_NOI_NOTION);

      return {
        thanh_cong: false,
        thong_bao_loi: chi_tiet_loi.thong_bao,
        thoi_gian_xu_ly
      };
    }
  }

  /**
   * Chuẩn bị properties cho Notion page
   */
  private async chuan_bi_properties(noi_dung: NoiDungTrang): Promise<any> {
    return {
      'Tiêu đề': {
        title: [
          {
            text: { content: noi_dung.tieu_de }
          }
        ]
      },
      'URL': {
        url: noi_dung.url
      },
      'Ngày lưu': {
        date: {
          start: noi_dung.ngay_luu.toISOString()
        }
      },
      'Domain': {
        rich_text: [
          {
            text: { content: noi_dung.meta_data.domain }
          }
        ]
      },
      'Tags': {
        multi_select: noi_dung.meta_data.tu_khoa.map(tag => ({ name: tag }))
      }
    };
  }

  /**
   * Chuẩn bị nội dung cho Notion page
   */
  private async chuan_bi_noi_dung(
    noi_dung: NoiDungTrang, 
    tuy_chon?: TuyChonLuuTrang
  ): Promise<any[]> {
    const blocks = [];

    // Thêm metadata block
    if (noi_dung.meta_data.mo_ta) {
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: [
            {
              type: 'text',
              text: { content: noi_dung.meta_data.mo_ta }
            }
          ]
        }
      });
    }

    // Thêm nội dung chính
    const paragraphs = noi_dung.noi_dung.split('\\n\\n');
    for (const paragraph of paragraphs) {
      if (paragraph.trim()) {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: { content: paragraph.trim() }
              }
            ]
          }
        });
      }
    }

    return blocks;
  }

  /**
   * Lấy danh sách databases
   */
  async lay_danh_sach_databases(): Promise<any[]> {
    if (!this.notion_client) return [];

    try {
      const response = await this.notion_client.search({
        filter: {
          value: 'database',
          property: 'object'
        }
      });

      return response.results;
    } catch (error) {
      this.quan_ly_loi.ghi_nhan_loi(error as Error, LoaiLoi.KET_NOI_NOTION);
      return [];
    }
  }

  /**
   * Lấy thông tin kết nối hiện tại
   */
  lay_ket_noi_hien_tai(): KetNoiNotion | null {
    return this.ket_noi_hien_tai;
  }

  /**
   * Ngắt kết nối Notion
   */
  ngat_ket_noi(): void {
    this.notion_client = null;
    this.ket_noi_hien_tai = null;
  }
}
```

```typescript
// src/background/quan-ly-tab.ts - Tab management service
import { TrangThaiExtension } from '../shared/types/extension';

export class QuanLyTab {
  private tab_hien_tai: chrome.tabs.Tab | null = null;
  private trang_thai_extension: Map<number, TrangThaiExtension> = new Map();

  /**
   * Xử lý khi tab được activate
   */
  xu_ly_tab_activated(info: chrome.tabs.TabActiveInfo): void {
    chrome.tabs.get(info.tabId, (tab) => {
      if (chrome.runtime.lastError) return;
      
      this.tab_hien_tai = tab;
      this.cap_nhat_trang_thai_tab(tab);
    });
  }

  /**
   * Xử lý khi tab được update
   */
  xu_ly_tab_updated(
    tabId: number, 
    changeInfo: chrome.tabs.TabChangeInfo, 
    tab: chrome.tabs.Tab
  ): void {
    if (changeInfo.status === 'complete' && tab.url) {
      this.cap_nhat_trang_thai_tab(tab);
    }
  }

  /**
   * Cập nhật trạng thái extension cho tab
   */
  private cap_nhat_trang_thai_tab(tab: chrome.tabs.Tab): void {
    if (!tab.id) return;

    const trang_thai: TrangThaiExtension = {
      dang_ket_noi: true,
      co_loi: false,
      lan_su_dung_cuoi: new Date()
    };

    this.trang_thai_extension.set(tab.id, trang_thai);
  }

  /**
   * Lấy tab hiện tại
   */
  lay_tab_hien_tai(): chrome.tabs.Tab | null {
    return this.tab_hien_tai;
  }

  /**
   * Lấy trạng thái extension cho tab
   */
  lay_trang_thai_tab(tabId: number): TrangThaiExtension | null {
    return this.trang_thai_extension.get(tabId) || null;
  }

  /**
   * Inject content script vào tab
   */
  async inject_content_script(tabId: number): Promise<boolean> {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['dist/content/content-script.js']
      });
      return true;
    } catch (error) {
      console.error('[Tab Management] Failed to inject content script:', error);
      return false;
    }
  }

  /**
   * Kiểm tra tab có thể injection content script
   */
  co_the_inject_script(tab: chrome.tabs.Tab): boolean {
    if (!tab.url) return false;
    
    const protected_schemes = ['chrome:', 'chrome-extension:', 'moz-extension:', 'edge:'];
    return !protected_schemes.some(scheme => tab.url!.startsWith(scheme));
  }
}
```

### Design Requirements
- **Minimalist Principles**: Clean service architecture, single responsibility
- **Color Palette**: N/A - Background service only
- **Typography**: N/A - No UI components
- **Responsive Behavior**: N/A - Service worker context
- **Accessibility**: N/A - Background processing only

### Vietnamese Integration
- **Naming Conventions**: 100% Vietnamese class names, method names, variable names
- **Documentation**: Service documentation hoàn toàn bằng tiếng Việt
- **User Messages**: Error messages natural Vietnamese (thông qua error utilities)
- **Cultural Adaptation**: Service design reflects Vietnamese development patterns

## ✅ Validation Checklist

### Technical Validation
- [ ] Service worker registers successfully trong Chrome extension
- [ ] Notion API connection establishes và authenticates
- [ ] Message passing works between background và content/popup
- [ ] Chrome storage operations complete successfully
- [ ] Tab management functions work correctly

### Design Validation  
- [ ] Service architecture follows single responsibility principle
- [ ] API integration is clean và efficient
- [ ] Error handling is comprehensive và user-friendly
- [ ] Message passing protocol is simple và reliable
- [ ] Storage operations are atomic và consistent

### Vietnamese Cultural Validation
- [ ] 100% Vietnamese naming convention compliance
- [ ] All service documentation in Vietnamese
- [ ] Error messages are natural Vietnamese
- [ ] Code organization supports Vietnamese team collaboration
- [ ] Service patterns reflect Vietnamese development practices

### Integration Validation
- [ ] Integrates seamlessly với Manifest V3 requirements
- [ ] Works correctly với Notion API rate limits
- [ ] Handles Chrome extension lifecycle properly
- [ ] Message passing protocol ready for content/popup integration
- [ ] Storage system ready for user configuration

## 📤 Expected Output Structure

### Generated Files
```
/step_04_output/
├── implementation/
│   ├── src/background/ (all service files)
│   └── src/shared/services/ (shared service utilities)
├── tests/
│   ├── service-worker.test.ts
│   └── notion-api.test.ts
├── documentation/
│   ├── service-worker-guide.md
│   ├── notion-api-reference.md
│   └── message-passing-protocol.md
└── validation/
    ├── service_validation_results.md
    └── api_integration_test_results.json
```

### Documentation Requirements
- **Implementation Notes**: Service architecture decisions, API integration patterns
- **Usage Examples**: Message passing examples, API usage patterns
- **Integration Guide**: How content script và popup sẽ communicate
- **Quality Metrics**: API response times, error rates, memory usage

## 🔄 Next Step Preparation

### Artifacts for Next Step
- Complete background service worker với message passing
- Notion API integration ready for content extraction
- Tab management system ready for content script injection
- Storage system ready for user preferences

### Potential Issues & Solutions
- **Manifest V3 Limitations**: Service worker lifecycle management - use proper event listeners
- **API Rate Limits**: Implement proper retry logic với exponential backoff
- **Message Passing Complexity**: Keep protocol simple, use typed messages

## 🎨 AI Execution Guidance

### Optimal Approach
1. **Start với Service Worker Foundation**: Basic registration và lifecycle
2. **Build Notion Integration**: API client với error handling
3. **Implement Message Passing**: Clear protocol for component communication
4. **Add Tab Management**: Injection và state tracking
5. **Test Integration**: Verify all services work together

### Common AI Pitfalls to Avoid
- Don't implement UI logic trong background service
- Don't create complex message passing protocols
- Don't skip error handling for API operations
- Don't forget Vietnamese naming conventions
- Don't implement content extraction logic here

### Expected Implementation Time
- **Service Worker Setup**: 90-120 minutes cho complete implementation
- **AI Generation Time**: 40-60 minutes với proper architecture guidance
- **Validation Time**: 30-40 minutes cho thorough testing
- **Documentation Time**: 30-40 minutes cho comprehensive service docs

---

**Ready for background service implementation!** Xây dựng backbone mạnh mẽ cho extension với Vietnamese excellence! ⚙️
