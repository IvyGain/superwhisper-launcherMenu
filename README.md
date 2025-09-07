# 🎤 Superwhisper Launcher / Superwhisper ランチャー

[English](#english) | [日本語](#japanese)

---

## English

A visual tile-based launcher for Superwhisper modes with intuitive drag & drop reordering and global shortcuts.

### ✨ Features

- **🎨 Visual Tile Display**: Browse and launch Superwhisper modes with attractive tiles
- **📱 Drag & Drop Reordering**: Customize the order of modes by dragging tiles
- **⌨️ Global Shortcuts**: 
  - `Option+V`: Open launcher
  - `Option+P`: Execute ProcessAgain
  - `Cmd+1-9`: Direct mode launch (toggleable)
- **🎯 One-Click Launch**: Click any tile to instantly launch that mode
- **🔧 Customizable**: Change icons and set individual hotkeys for each mode
- **💡 Active Mode Highlighting**: Currently active Superwhisper mode is highlighted in green
- **🌐 Multi-language**: Supports both English and Japanese interfaces

### 📦 Installation

1. Download the latest DMG file from [Releases](https://github.com/IvyGain/superwhisper-launcherMenu/releases)
2. Open the DMG file and drag "Superwhisper Launcher" to Applications folder
3. Launch the application from Applications

### ⚙️ Requirements

- **macOS**: 10.12 Sierra or later
- **Architecture**: Apple Silicon (M1/M2/M3) native support
- **Superwhisper**: Must be installed beforehand
- **Modes**: Superwhisper mode files in `~/Documents/superwhisper/modes`

### 🚀 Usage

#### Basic Operations
- **Launch modes**: Click tiles or use `Cmd+1-9`
- **Open launcher**: Press `Option+V`
- **ProcessAgain**: Press `Option+P`
- **Close launcher**: Press `ESC`
- **Reorder modes**: Drag and drop tiles

#### Settings
Access settings by clicking the ⚙️ button in the top-right corner:

- **Shortcuts**: Customize global hotkeys
- **Cmd+1-9 Toggle**: Enable/disable number shortcuts
- **Icons**: Change tile icons with emoji picker
- **Individual Hotkeys**: Set custom hotkeys for specific modes
- **Language**: Switch between English and Japanese

### 🔧 Advanced Features

#### ProcessAgain Integration
Executes the last Superwhisper transcription again using multiple methods:
1. Alfred-SuperWhisper workflow (recommended)
2. GUI automation fallback

#### Active Mode Detection
The launcher automatically detects and highlights the currently active Superwhisper mode with a green glow.

### 🛠️ Development

#### Quick Start
```bash
# Install dependencies
npm install

# Start development
npm start

# Build for production
npm run build
```

#### Built with
- **Electron**: Cross-platform desktop framework
- **Node.js**: JavaScript runtime
- **electron-store**: Persistent settings storage
- **chokidar**: File system watching for real-time updates

#### Project Structure
```
SuperwhisperLauncher-Clean/
├── src/
│   ├── main.js          # Main process
│   ├── renderer.js      # UI logic
│   ├── i18n.js          # Internationalization
│   ├── index.html       # UI layout
│   ├── style.css        # Styling
│   └── locales/         # Translation files
│       ├── en.json      # English translations
│       └── ja.json      # Japanese translations
├── assets/              # App icons and resources
├── package.json         # Dependencies & scripts
└── README.md           # This file
```

### 🤝 Contributing

Issues and pull requests are welcome! Please report bugs or suggest features on the [GitHub repository](https://github.com/IvyGain/superwhisper-launcherMenu).

### 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## Japanese

Superwhisperモードを視覚的なタイルで表示し、直感的なドラッグ&ドロップとグローバルショートカットで操作できるランチャーアプリです。

### ✨ 主な機能

- **🎨 ビジュアルタイル表示**: Superwhisperモードを美しいタイルで表示・起動
- **📱 ドラッグ&ドロップ並び替え**: タイルをドラッグしてモードの順序をカスタマイズ
- **⌨️ グローバルショートカット**:
  - `Option+V`: ランチャーを開く
  - `Option+P`: ProcessAgainを実行
  - `Cmd+1-9`: モードの直接起動（ON/OFF切り替え可能）
- **🎯 ワンクリック起動**: タイルをクリックするだけでモードを即座に起動
- **🔧 カスタマイズ可能**: アイコン変更と各モードの個別ホットキー設定
- **💡 アクティブモード強調**: 現在アクティブなSuperwhisperモードを緑色でハイライト
- **🌐 多言語対応**: 日本語・英語のインターフェースに対応

### 📦 インストール方法

1. [リリースページ](https://github.com/IvyGain/superwhisper-launcherMenu/releases)から最新のDMGファイルをダウンロード
2. DMGファイルを開き、「Superwhisper Launcher」をApplicationsフォルダにドラッグ
3. Applicationsからアプリケーションを起動

### ⚙️ 動作要件

- **macOS**: 10.12 Sierra 以降
- **アーキテクチャ**: Apple Silicon (M1/M2/M3) ネイティブ対応
- **Superwhisper**: 事前にインストールが必要
- **モードファイル**: `~/Documents/superwhisper/modes` にSuperwhisperモードファイルが必要

### 🚀 使用方法

#### 基本操作
- **モード起動**: タイルをクリックまたは`Cmd+1-9`を使用
- **ランチャーを開く**: `Option+V`を押す
- **ProcessAgain**: `Option+P`を押す
- **ランチャーを閉じる**: `ESC`を押す
- **モード並び替え**: タイルをドラッグ&ドロップ

#### 設定
右上の⚙️ボタンをクリックして設定にアクセス：

- **ショートカット**: グローバルホットキーをカスタマイズ
- **Cmd+1-9トグル**: 数字ショートカットの有効/無効
- **アイコン**: 絵文字ピッカーでタイルアイコンを変更
- **個別ホットキー**: 特定モード用のカスタムホットキーを設定
- **言語設定**: 日本語と英語を切り替え

### 🔧 高度な機能

#### ProcessAgain統合
複数の方法で最後のSuperwhisper転写を再実行：
1. Alfred-SuperWhisperワークフロー（推奨）
2. GUI自動化フォールバック

#### アクティブモード検出
現在アクティブなSuperwhisperモードを自動検出し、緑色のグローで強調表示します。

### 🛠️ 開発

#### クイックスタート
```bash
# 依存関係をインストール
npm install

# 開発環境で起動
npm start

# プロダクション用ビルド
npm run build
```

#### 使用技術
- **Electron**: クロスプラットフォームデスクトップフレームワーク
- **Node.js**: JavaScriptランタイム
- **electron-store**: 永続化設定ストレージ
- **chokidar**: リアルタイム更新用のファイルシステム監視

#### プロジェクト構造
```
SuperwhisperLauncher-Clean/
├── src/
│   ├── main.js          # メインプロセス
│   ├── renderer.js      # UIロジック
│   ├── i18n.js          # 国際化
│   ├── index.html       # UIレイアウト
│   ├── style.css        # スタイリング
│   └── locales/         # 翻訳ファイル
│       ├── en.json      # 英語翻訳
│       └── ja.json      # 日本語翻訳
├── assets/              # アプリアイコンとリソース
├── package.json         # 依存関係とスクリプト
└── README.md           # このファイル
```

### 🤝 貢献について

Issues・Pull Requestを歓迎します！バグ報告や機能提案は[GitHubリポジトリ](https://github.com/IvyGain/superwhisper-launcherMenu)までお願いします。

### 📄 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)をご覧ください。

---

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>