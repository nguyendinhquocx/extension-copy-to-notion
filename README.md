# Copy To Notion Extension

> Browser extension để sao chép nội dung trang web vào Notion với thiết kế tối giản theo phong cách Jobs/Ive

## 🎯 Tính năng chính

- **Lưu trang web**: Trích xuất nội dung chính của trang và lưu vào Notion
- **Chọn phần tử**: Click để chọn nhiều phần tử trên trang  
- **Lưu URL với ghi chú**: Bookmark nhanh với annotation
- **Thiết kế tối giản**: Interface clean theo phong cách Jobs/Ive
- **Vietnamese First**: Hoàn toàn bằng tiếng Việt

## 🚀 Cài đặt Development

### Yêu cầu hệ thống
- Node.js 18+ 
- npm hoặc yarn
- Chrome Browser (cho development)

### Khởi tạo project

```bash
# Clone repository
git clone https://github.com/nguyendinhquocx/extension-copy-to-notion.git
cd extension-copy-to-notion

# Cài đặt dependencies 
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
```

### Load extension vào Chrome

1. Mở Chrome → Settings → Extensions → Developer mode: ON
2. Click "Load unpacked" → Chọn folder `dist`
3. Extension sẽ xuất hiện trong toolbar

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Build Tool**: Vite với @crxjs/vite-plugin
- **Extension**: Manifest V3
- **API**: Notion API SDK oficial
- **Testing**: Vitest + Playwright
- **Linting**: ESLint với Vietnamese naming conventions

## 📁 Cấu trúc project

```
src/
├── background/          # Service worker logic
├── content/            # Content script injection  
├── popup/              # React popup interface
├── shared/             # Types, utilities, constants
└── styles/             # Global minimalist styles
```

## 🎨 Design System

Extension sử dụng design system tối giản theo nguyên tắc Jobs/Ive:

- **Color Palette**: Chỉ 8 màu (trắng, đen, xám, blue accent)
- **Typography**: System fonts, hierarchy rõ ràng
- **Spacing**: Grid 8px consistent
- **Interactions**: Subtle transitions, purposeful animations

## 🔧 Development Commands

```bash
# Development
npm run dev              # Vite dev server
npm run type-check       # TypeScript checking
npm run lint             # ESLint validation
npm run lint:fix         # Auto-fix linting issues

# Testing  
npm run test             # Unit tests với Vitest
npm run test:ui          # Test UI với Vitest

# Production
npm run build            # Production build
npm run preview          # Preview production build
npm run package          # Package cho Chrome Web Store
```

## 📝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/ten-tinh-nang`
3. Commit với Vietnamese messages: `git commit -m "Thêm tính năng XYZ"`
4. Push branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

### Code Standards

- **Vietnamese Naming**: Variables, functions, classes đều dùng tiếng Việt
- **TypeScript Strict**: Strict mode enabled, no `any` types
- **Testing**: Minimum 90% test coverage
- **Documentation**: Vietnamese comments cho business logic

## 🌟 Roadmap

### Version 1.0 (Current)
- [x] Project foundation với Vite + TypeScript
- [ ] Minimalist design system
- [ ] Background service worker
- [ ] Content script engine
- [ ] Popup interface
- [ ] Core features implementation

### Version 1.1
- [ ] Performance optimization
- [ ] Cross-browser support (Firefox, Edge)
- [ ] Improved error handling
- [ ] User onboarding

### Version 2.0
- [ ] AI content summarization
- [ ] Bulk operations
- [ ] Team workspaces
- [ ] Advanced formatting

## 📄 License

MIT License - xem [LICENSE](./LICENSE) để biết thêm chi tiết.

## 🤝 Hỗ trợ

- **Issues**: [GitHub Issues](https://github.com/nguyendinhquocx/extension-copy-to-notion/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nguyendinhquocx/extension-copy-to-notion/discussions)
- **Email**: nguyendinhquocx@gmail.com

---

**Được phát triển với ❤️ bởi Vietnamese developers cho cộng đồng Việt Nam** 🇻🇳
