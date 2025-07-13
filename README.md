# 🎤 Superwhisper Launcher

Visual tile-based launcher for Superwhisper modes with system tray integration.

## ✨ Features

- **4×4 Grid Layout**: Beautiful tile-based mode display
- **System Tray**: Background operation with tray icon
- **Global Hotkeys**: 
  - `Cmd+Shift+W` - Open launcher
  - `Cmd+1-9/0` - Direct mode launch
- **Icon Customization**: Set custom emoji icons for each mode
- **Auto Mode Detection**: Monitors `~/Documents/superwhisper/modes`
- **One-Click Launch**: Click tile to launch mode + start recording
- **Error Handling**: Robust error handling for all operations

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development
npm start

# Build for production
npm run build:mac
```

## 📁 Project Structure

```
SuperwhisperLauncher-Clean/
├── src/
│   ├── main.js         # Electron main process (improved error handling)
│   ├── index.html      # UI layout
│   ├── style.css       # Enhanced styling with animations
│   └── renderer.js     # Frontend logic with notifications
├── package.json        # Dependencies & scripts
└── README.md          # This file
```

## 🎯 Usage

1. **Background Launch**: App runs in system tray
2. **Quick Access**: Use `Cmd+Shift+W` to open launcher
3. **Mode Selection**: Click tiles or use number keys (1-9/0)
4. **Customization**: Click settings gear to change icons

## 🔧 Technical Improvements

- **Native Image Icons**: Uses Electron's nativeImage for tray icons
- **Error Recovery**: Graceful fallbacks for all operations
- **Enhanced UI**: Improved animations and visual feedback
- **Better UX**: Clear error messages and loading states

## 🎨 UI Enhancements

- **Visual Feedback**: Tile animations on interaction
- **Toast Notifications**: User feedback for actions
- **Responsive Design**: Works on different screen sizes
- **Modern Design**: Glass morphism and smooth transitions

---

## 📝 インストール・起動方法（日本語ガイド）

### 1. 必要な環境
- **Node.js**（推奨バージョン: 18以上）
- **npm**（Node.jsに同梱）
- **Git**（GitHubからクローンする場合）

### 2. インストール手順
1. このリポジトリをダウンロードまたはクローンします。
   - ダウンロード: [Code] → [Download ZIP] で取得し、解凍してください。
   - または、ターミナルで以下を実行：
     ```bash
     git clone https://github.com/IvyGain/superwhisper-launcherMenu.git
     cd superwhisper-launcherMenu
     ```
2. 依存パッケージをインストールします：
   ```bash
   npm install
   ```

### 3. アプリの起動
```bash
npm start
```
- 初回起動時、必要なモードファイルが `~/Documents/superwhisper/modes` に存在することを確認してください。
- アプリが起動し、システムトレイに常駐します。

### 4. よくある質問
- **インストーラーはありますか？**
  - 現時点ではインストーラー（.dmg等）はありません。上記手順でソースから起動してください。
  - 将来的にインストーラー配布を予定しています。
- **Node.jsが無い場合は？**
  - [Node.js公式サイト](https://nodejs.org/ja/) からインストールしてください。
- **起動できない場合は？**
  - ターミナルのエラーメッセージを確認し、`npm install` の実行やNode.jsのバージョンを見直してください。

---

Built with ❤️ for efficient Superwhisper workflow automation.