# 🎤 Superwhisper Launcher

Enhanced visual tile-based launcher for Superwhisper modes with modern UI, search functionality, and advanced customization options.

## ✨ Features

### 🎨 Enhanced UI & UX
- **Beautiful Grid Layout**: Responsive tile-based mode display
- **Search & Filter**: Real-time mode search and category filtering
- **Dark Mode Support**: System preference detection with manual override
- **Drag & Drop Reordering**: Intuitive tile reordering with visual feedback
- **Improved Text Display**: Better handling of long mode titles with wrapping

### ⚡ Powerful Functionality
- **Global Hotkeys**: 
  - `Cmd+Shift+W` - Open launcher
  - `Cmd+1-9/0` - Direct mode launch
  - `ESC` - Close launcher
- **Icon Customization**: Rich emoji picker with categorized selection
- **Auto Mode Detection**: Monitors `~/Documents/superwhisper/modes`
- **One-Click Launch**: Click tile to launch mode
- **Settings Management**: Comprehensive settings panel with shortcuts configuration

### 🔒 Security & Performance
- **Context Isolation**: Enhanced Electron security with isolated contexts
- **IPC Security**: Secure communication between main and renderer processes
- **Memory Efficient**: Optimized rendering and state management
- **Error Handling**: Robust error handling for all operations

## 🚀 Quick Start

### Option 1: Use Pre-built Installer (Recommended)
1. Download `Superwhisper-Launcher-2.0.0.dmg` from releases
2. Double-click to mount the DMG
3. Drag "Superwhisper Launcher.app" to Applications folder
4. Launch from Applications or Launchpad

### Option 2: Development Setup
```bash
# Install dependencies
npm install

# Start development
npm start

# Build for production
npm run build:mac

# Create installer
npm run package
```

## 📁 Project Structure

```
SuperwhisperLauncher-Clean/
├── src/
│   ├── main.js         # Electron main process with security enhancements
│   ├── preload.js      # Secure bridge between main and renderer
│   ├── renderer.js     # Enhanced frontend with search, D&D, themes
│   ├── index.html      # Modern UI layout with CSP
│   ├── style.css       # Enhanced styling with themes and animations
│   └── types/
│       └── index.ts    # TypeScript definitions
├── dist/               # Built application files
├── dist-simple/        # Packaged .app file
├── package.json        # Dependencies & enhanced build scripts
├── tsconfig.json       # TypeScript configuration
├── .eslintrc.js        # Code quality configuration
└── Superwhisper-Launcher-2.0.0.dmg  # Ready-to-install DMG
```

## 🎯 Usage

### Basic Operation
1. **Launch**: Open from Applications or use global hotkey `Cmd+Shift+W`
2. **Search**: Type in search box to filter modes
3. **Filter**: Use category dropdown to filter by type
4. **Launch Modes**: Click tiles or use number keys (1-9/0)
5. **Reorder**: Drag and drop tiles to customize layout

### Customization
1. **Settings**: Click ⚙️ button to open settings panel
2. **Icons**: Click any icon button to open emoji picker
3. **Theme**: Choose between Light, Dark, or System preference
4. **Shortcuts**: Record custom keyboard shortcuts

### Advanced Features
- **Category Filtering**: Automatically categorizes modes
- **Persistent Settings**: Remembers your preferences and tile order
- **Responsive Design**: Adapts to different screen sizes
- **Keyboard Navigation**: Full keyboard support for accessibility

## 🔧 Technical Improvements (v2.0.0)

### Security Enhancements
- **Context Isolation**: Enabled for better security
- **Node Integration**: Disabled in renderer process
- **Preload Script**: Secure API exposure with `contextBridge`
- **CSP Headers**: Content Security Policy implementation

### Modern Development Stack
- **TypeScript**: Type safety and better development experience
- **ESLint & Prettier**: Code quality and consistent formatting
- **Electron Builder**: Professional packaging and distribution
- **Multi-platform Support**: Ready for macOS, Windows, and Linux

### Performance Optimizations
- **Efficient Rendering**: Optimized DOM manipulation
- **Memory Management**: Proper event listener cleanup
- **Lazy Loading**: Improved startup performance
- **State Management**: Centralized settings and mode management

## 🎨 UI/UX Enhancements

### Visual Improvements
- **Modern Design**: Clean, professional interface
- **Smooth Animations**: Enhanced user feedback
- **Visual Feedback**: Hover states and interaction indicators
- **Accessibility**: Better contrast and keyboard navigation

### Functionality Additions
- **Real-time Search**: Instant filtering as you type
- **Smart Categorization**: Automatic mode organization
- **Drag & Drop**: Intuitive reordering with visual cues
- **Toast Notifications**: User feedback for all actions

## 📱 Platform Support

- **macOS**: Native .app and .dmg installer (Apple Silicon & Intel)
- **Windows**: NSIS installer (.exe) - Ready for build
- **Linux**: AppImage format - Ready for build

## 🔄 Version History

### v2.0.0 (Latest)
- ✅ Search and filter functionality
- ✅ Dark mode support with system preference detection
- ✅ Drag & drop tile reordering
- ✅ Enhanced security with context isolation
- ✅ TypeScript migration and modern tooling
- ✅ Improved UI for long mode titles
- ✅ Professional DMG installer

### v1.0.0
- Basic tile-based launcher
- System tray integration
- Global hotkeys
- Icon customization

---

## 📝 インストール・使用方法（日本語）

### 🎯 簡単インストール
1. **DMGファイルをダウンロード**: `Superwhisper-Launcher-2.0.0.dmg`
2. **DMGをマウント**: ダブルクリックでディスクイメージを開く
3. **アプリをインストール**: 「Superwhisper Launcher.app」をApplicationsフォルダにドラッグ
4. **起動**: LaunchpadまたはApplicationsフォルダから起動

### 🔧 開発者向けセットアップ
```bash
# 依存関係をインストール
npm install

# 開発モードで起動
npm start

# 本番用ビルド
npm run build:mac
```

### 📋 必要な環境
- **macOS**: 10.12以上（Apple Silicon & Intel対応）
- **Superwhisperモード**: `~/Documents/superwhisper/modes`フォルダに配置
- **開発する場合**: Node.js 18以上、npm

### 🎮 使用方法
1. **ランチャーを開く**: `Cmd+Shift+W`または手動起動
2. **モード検索**: 上部の検索ボックスでフィルタリング
3. **カテゴリ選択**: ドロップダウンでカテゴリ別表示
4. **モード起動**: タイルクリックまたは数字キー（1-9/0）
5. **並び替え**: ドラッグ&ドロップで自由にレイアウト変更

### ⚙️ カスタマイズ
- **設定画面**: ⚙️ボタンで設定パネルを開く
- **アイコン変更**: 各モードのアイコンボタンから絵文字選択
- **テーマ切替**: ライト/ダーク/システム設定
- **ショートカット**: キーボードショートカットのカスタマイズ

### ❓ よくある質問
**Q: モードが表示されない**
A: `~/Documents/superwhisper/modes`フォルダにモードファイルがあることを確認してください

**Q: ショートカットが効かない**
A: macOSのアクセシビリティ権限を確認し、必要に応じてアプリを許可してください

**Q: 設定が保存されない**
A: アプリの読み書き権限を確認し、再起動を試してください

---

🚀 **Built with ❤️ for efficient Superwhisper workflow automation**

*Version 2.0.0 - Enhanced, Secure, Modern*