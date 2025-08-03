# PRP 01: Project Foundation & Development Setup - Khởi Tạo Dự Án

## 🎯 Objective & Scope
**Primary Goal**: Khởi tạo project structure hoàn chỉnh với Vite + TypeScript + extension boilerplate, thiết lập development environment và build pipeline cơ bản
**Scope Boundaries**: 
- ✅ INCLUDED: Project scaffolding, package.json, tsconfig, Vite config, basic folder structure, Manifest V3 setup
- ❌ NOT INCLUDED: React components, UI implementation, Notion API integration, complex business logic

**Success Criteria**: 
- Project compiles successfully với TypeScript
- Vite dev server chạy không lỗi
- Manifest V3 được load thành công trong Chrome Extensions
- Folder structure hoàn chỉnh theo Vietnamese naming conventions

## 📥 Input Context & Dependencies

### Required Previous Steps
- [ ] N/A - This is the foundation step

### Input Artifacts
```
/project_requirements/
├── PRP.md              # Complete project specification
├── Master_Plan.md      # Overall decomposition strategy
└── Design_System.md    # Minimalist design guidelines
```

### Technical Context
- **Technology Stack**: Vite + TypeScript + React 18 + Tailwind CSS
- **Target Platform**: Manifest V3 Browser Extensions (Chrome, Edge, Firefox)  
- **Design Pattern**: Minimalist Jobs/Ive aesthetic principles
- **Vietnamese Conventions**: Method names, variables, comments in Vietnamese
- **Performance Requirements**: <50ms build time for development

## 🔨 Implementation Requirements

### Primary Deliverables
```typescript
// Expected file structure after completion
copy-to-notion-extension/
├── package.json                    # Dependencies với proper scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build setup cho extensions  
├── tailwind.config.js              # Minimalist design tokens
├── eslint.config.js                # Vietnamese naming rules
├── manifest.json                   # Manifest V3 configuration
├── public/
│   ├── popup.html                  # Popup entry point
│   └── icons/                      # Placeholder icons
├── src/
│   ├── background/                 # Service worker directory
│   ├── content/                    # Content scripts directory  
│   ├── popup/                      # Popup interface directory
│   ├── shared/                     # Shared utilities directory
│   └── styles/                     # Global styles directory
├── scripts/
│   ├── build.ts                    # Production build script
│   └── dev.ts                      # Development server script
└── README.md                       # Vietnamese documentation
```

### Technical Specifications
```json
// package.json - Key dependencies
{
  "name": "copy-to-notion-extension",
  "version": "1.0.0",
  "description": "Browser extension để copy content vào Notion với thiết kế tối giản",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@notionhq/client": "^2.2.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.45.0", 
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.5",
    "vitest": "^0.34.0"
  }
}
```

```json
// manifest.json - Manifest V3 configuration
{
  "manifest_version": 3,
  "name": "Copy To Notion",
  "description": "Sao chép nội dung trang web vào Notion với thiết kế tối giản",
  "version": "1.0.0",
  "permissions": [
    "activeTab",
    "storage",
    "scripting"
  ],
  "host_permissions": [
    "https://api.notion.com/*"
  ],
  "background": {
    "service_worker": "dist/background/service-worker.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["dist/content/content-script.js"],
      "css": ["dist/content/content-script.css"]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Copy To Notion"
  },
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png", 
    "128": "icons/icon-128.png"
  }
}
```

### Design Requirements
- **Minimalist Principles**: Clean folder structure, no unnecessary complexity
- **Color Palette**: Placeholder icons using pure black/white only  
- **Typography**: System font stack configuration in Tailwind
- **Responsive Behavior**: N/A for this foundation step
- **Accessibility**: Proper semantic HTML structure in popup.html

### Vietnamese Integration
- **Naming Conventions**: All Vietnamese script names, directory comments
- **Documentation**: README.md hoàn toàn bằng tiếng Việt với technical clarity
- **User Messages**: Manifest description và name bằng tiếng Việt
- **Cultural Adaptation**: Package.json description reflects Vietnamese development approach

## ✅ Validation Checklist

### Technical Validation
- [ ] `npm install` chạy thành công không có warning
- [ ] `npm run dev` khởi động Vite dev server
- [ ] `npm run build` tạo ra dist/ folder với proper extension files
- [ ] `npm run lint` passes với zero warnings
- [ ] TypeScript compilation không có lỗi

### Design Validation  
- [ ] Folder structure tuân thủ minimalist principles
- [ ] File naming conventions consistent và clean
- [ ] No unnecessary configuration complexity
- [ ] Build output structure optimal cho extension loading
- [ ] Icon placeholders follow pure black/white aesthetic

### Vietnamese Cultural Validation
- [ ] 100% Vietnamese naming trong scripts và comments
- [ ] README.md documentation completely in Vietnamese
- [ ] Package.json description natural Vietnamese
- [ ] Manifest.json text appropriate cho Vietnamese users
- [ ] Development workflow supports Vietnamese team practices

### Integration Validation
- [ ] Vite config properly handles extension builds
- [ ] Tailwind config integrates seamlessly với build process
- [ ] ESLint config enforces Vietnamese naming patterns
- [ ] TypeScript config supports extension development patterns
- [ ] Build scripts generate proper extension structure

## 📤 Expected Output Structure

### Generated Files
```
/step_01_output/
├── implementation/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── eslint.config.js
│   ├── manifest.json
│   ├── public/popup.html
│   └── src/ (folder structure)
├── scripts/
│   ├── build.ts
│   └── dev.ts
├── documentation/
│   ├── README.md
│   └── SETUP-GUIDE.md
└── validation/
    ├── checklist_results.md
    └── build_verification.json
```

### Documentation Requirements
- **Implementation Notes**: Quyết định về Vite config, TypeScript setup
- **Usage Examples**: Commands để run development và build production
- **Integration Guide**: Cách Step 02 sẽ build lên foundation này
- **Quality Metrics**: Build time, bundle size baseline measurements

## 🔄 Next Step Preparation

### Artifacts for Next Step
- Hoàn chỉnh project structure với working build pipeline
- Tailwind config với minimalist design tokens ready
- TypeScript config optimized cho extension development
- Vietnamese naming conventions established trong codebase

### Potential Issues & Solutions
- **Vite Extension Build Issue**: Extension builds require special handling cho service workers và content scripts - sử dụng @crxjs/vite-plugin
- **TypeScript Path Resolution**: Extension context có thể gây path issues - configure tsconfig.json với proper baseUrl
- **Vietnamese ESLint Rules**: Custom rules cho Vietnamese naming - tạo custom ESLint plugin

## 🎨 AI Execution Guidance

### Optimal Approach
1. **Start với Package.json**: Thiết lập dependencies trước, sau đó configs
2. **Focus on Extension-Specific Setup**: Vite config phải handle Manifest V3 properly
3. **Establish Vietnamese Patterns**: Naming conventions từ đầu sẽ consistent throughout
4. **Validate Build Pipeline**: Mỗi config change phải test với build command
5. **Document Decisions**: Explain tại sao chọn specific Vite plugins, TypeScript settings

### Common AI Pitfalls to Avoid
- Don't implement React components trong step này
- Don't add Notion API logic yet
- Don't create complex build optimizations
- Don't skip Vietnamese naming conventions
- Don't overcomplicate initial Vite configuration

### Expected Implementation Time
- **Setup Time**: 30-45 minutes cho experienced developer
- **AI Generation Time**: 15-20 minutes với proper prompting
- **Validation Time**: 10-15 minutes cho full checklist
- **Documentation Time**: 15-20 minutes cho comprehensive docs

---

**Ready for AI execution!** Tạo foundation vững chắc cho Copy To Notion Extension với Vietnamese development excellence! 🚀
