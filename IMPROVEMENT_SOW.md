# Superwhisper Launcher 改善提案書（Statement of Work）

## エグゼクティブサマリー

Superwhisper Launcherは、現在シンプルで機能的なElectronアプリケーションとして動作していますが、ユーザビリティ、パフォーマンス、セキュリティ、開発者体験の観点から大きな改善の余地があります。本提案書では、5つの主要な改善エリアに焦点を当て、具体的な実装案をDiff形式で提示します。

## 改善提案一覧

### 1. 🔍 モード検索・フィルター機能

**目的**: 多数のモードから素早く目的のモードを見つけられるようにする

**実装内容**:
- リアルタイム検索バー
- カテゴリーフィルター
- 最近使用したモードの表示

```diff
<!-- src/index.html -->
@@ -20,6 +20,15 @@
     </div>
     
     <div class="content">
+      <!-- 検索・フィルター機能の追加 -->
+      <div class="search-container">
+        <input type="text" id="searchInput" placeholder="モードを検索..." class="search-input">
+        <select id="categoryFilter" class="category-filter">
+          <option value="">すべてのカテゴリー</option>
+        </select>
+      </div>
+      
       <div id="tilesContainer" class="tiles-container">
         <div class="loading">モードを読み込み中...</div>
       </div>
```

```diff
/* src/style.css */
@@ -100,6 +100,35 @@
   gap: 16px;
 }

+.search-container {
+  display: flex;
+  gap: 12px;
+  margin-bottom: 24px;
+}
+
+.search-input {
+  flex: 1;
+  padding: 12px 16px;
+  border: 1px solid var(--border-color);
+  border-radius: 8px;
+  font-size: 14px;
+  background: var(--background-color);
+  transition: border-color 0.2s;
+}
+
+.search-input:focus {
+  outline: none;
+  border-color: var(--primary-color);
+}
+
+.category-filter {
+  padding: 12px 16px;
+  border: 1px solid var(--border-color);
+  border-radius: 8px;
+  font-size: 14px;
+  background: var(--background-color);
+}
+
 .tiles-container {
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
```

```diff
// src/renderer.js
@@ -50,6 +50,42 @@
   }
 }

+// 検索・フィルター機能
+function initializeSearchAndFilter() {
+  const searchInput = document.getElementById('searchInput');
+  const categoryFilter = document.getElementById('categoryFilter');
+  
+  searchInput.addEventListener('input', filterModes);
+  categoryFilter.addEventListener('change', filterModes);
+}
+
+function filterModes() {
+  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
+  const selectedCategory = document.getElementById('categoryFilter').value;
+  const tiles = document.querySelectorAll('.tile');
+  
+  tiles.forEach(tile => {
+    const modeName = tile.querySelector('.tile-title').textContent.toLowerCase();
+    const category = tile.dataset.category || '';
+    
+    const matchesSearch = modeName.includes(searchTerm);
+    const matchesCategory = !selectedCategory || category === selectedCategory;
+    
+    tile.style.display = matchesSearch && matchesCategory ? '' : 'none';
+  });
+}
+
+// カテゴリーの自動検出と更新
+function updateCategories(modes) {
+  const categories = [...new Set(modes.map(m => m.category).filter(Boolean))];
+  const categoryFilter = document.getElementById('categoryFilter');
+  
+  categoryFilter.innerHTML = '<option value="">すべてのカテゴリー</option>';
+  categories.forEach(cat => {
+    categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
+  });
+}
+
 // Initialize when DOM is loaded
 document.addEventListener('DOMContentLoaded', () => {
   initializeApp();
+  initializeSearchAndFilter();
 });
```

### 2. 🌙 ダークモード対応

**目的**: ユーザーの好みや環境に応じたテーマ選択を可能にする

**実装内容**:
- システム設定に連動した自動切り替え
- 手動切り替えオプション
- スムーズなトランジション

```diff
/* src/style.css */
@@ -1,6 +1,39 @@
 :root {
+  /* ライトテーマ */
   --background-color: #ffffff;
   --text-color: #1d1d1f;
   --border-color: #d2d2d7;
   --primary-color: #007aff;
+  --tile-bg: #f5f5f7;
+  --tile-hover-bg: #e8e8ed;
+}
+
+/* ダークテーマ */
+[data-theme="dark"] {
+  --background-color: #1c1c1e;
+  --text-color: #f5f5f7;
+  --border-color: #38383a;
+  --primary-color: #0a84ff;
+  --tile-bg: #2c2c2e;
+  --tile-hover-bg: #3a3a3c;
+}
+
+/* システム設定に連動 */
+@media (prefers-color-scheme: dark) {
+  :root:not([data-theme="light"]) {
+    --background-color: #1c1c1e;
+    --text-color: #f5f5f7;
+    --border-color: #38383a;
+    --primary-color: #0a84ff;
+    --tile-bg: #2c2c2e;
+    --tile-hover-bg: #3a3a3c;
+  }
+}
+
+/* トランジション */
+* {
+  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
 }
```

```diff
<!-- src/index.html -->
@@ -80,6 +80,14 @@
           </label>
         </div>
         
+        <div class="settings-group">
+          <label class="settings-label">テーマ</label>
+          <select id="themeSelect" class="theme-select">
+            <option value="system">システム設定に従う</option>
+            <option value="light">ライト</option>
+            <option value="dark">ダーク</option>
+          </select>
+        </div>
+        
         <div class="modal-footer">
           <button class="button button-primary" onclick="saveSettings()">保存</button>
           <button class="button button-secondary" onclick="closeSettings()">キャンセル</button>
```

```diff
// src/renderer.js
@@ -200,6 +200,28 @@
   }
 }

+// テーマ管理
+function initializeTheme() {
+  const savedTheme = localStorage.getItem('theme') || 'system';
+  applyTheme(savedTheme);
+  
+  // システムテーマの変更を監視
+  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
+    if (localStorage.getItem('theme') === 'system') {
+      applyTheme('system');
+    }
+  });
+}
+
+function applyTheme(theme) {
+  if (theme === 'system') {
+    document.documentElement.removeAttribute('data-theme');
+  } else {
+    document.documentElement.setAttribute('data-theme', theme);
+  }
+  localStorage.setItem('theme', theme);
+}
+
 // Initialize when DOM is loaded
 document.addEventListener('DOMContentLoaded', () => {
   initializeApp();
+  initializeTheme();
 });
```

### 3. 🎯 ドラッグ＆ドロップによるタイル並び替え

**目的**: ユーザーが頻繁に使うモードを好みの位置に配置できるようにする

**実装内容**:
- HTML5 Drag and Drop API の実装
- 並び順の永続化
- ビジュアルフィードバック

```diff
// src/renderer.js
@@ -120,6 +120,7 @@
     tile.className = 'tile';
     tile.dataset.mode = mode.name;
     tile.dataset.path = mode.path;
+    tile.draggable = true;
     
     tile.innerHTML = `
       <div class="tile-icon">${mode.emoji || getDefaultEmoji()}</div>
@@ -127,10 +128,61 @@
     `;
     
     tile.addEventListener('click', () => launchMode(mode));
+    initializeDragAndDrop(tile);
     
     return tile;
   }
   
+  // ドラッグ＆ドロップ機能
+  function initializeDragAndDrop(tile) {
+    tile.addEventListener('dragstart', handleDragStart);
+    tile.addEventListener('dragover', handleDragOver);
+    tile.addEventListener('drop', handleDrop);
+    tile.addEventListener('dragend', handleDragEnd);
+  }
+  
+  let draggedElement = null;
+  
+  function handleDragStart(e) {
+    draggedElement = this;
+    this.classList.add('dragging');
+    e.dataTransfer.effectAllowed = 'move';
+    e.dataTransfer.setData('text/html', this.innerHTML);
+  }
+  
+  function handleDragOver(e) {
+    if (e.preventDefault) {
+      e.preventDefault();
+    }
+    e.dataTransfer.dropEffect = 'move';
+    
+    const afterElement = getDragAfterElement(e.currentTarget.parentNode, e.clientY);
+    if (afterElement == null) {
+      e.currentTarget.parentNode.appendChild(draggedElement);
+    } else {
+      e.currentTarget.parentNode.insertBefore(draggedElement, afterElement);
+    }
+    
+    return false;
+  }
+  
+  function handleDrop(e) {
+    if (e.stopPropagation) {
+      e.stopPropagation();
+    }
+    
+    saveModesOrder();
+    return false;
+  }
+  
+  function handleDragEnd(e) {
+    this.classList.remove('dragging');
+  }
+  
+  function saveModesOrder() {
+    const tiles = [...document.querySelectorAll('.tile')];
+    const order = tiles.map(tile => tile.dataset.mode);
+    localStorage.setItem('modesOrder', JSON.stringify(order));
+  }
+  
   tilesContainer.innerHTML = '';
   modes.forEach(mode => {
     tilesContainer.appendChild(createTile(mode));
```

```diff
/* src/style.css */
@@ -150,6 +150,15 @@
   transform: translateY(-2px);
 }

+.tile.dragging {
+  opacity: 0.5;
+  cursor: move;
+}
+
+.tile.drag-over {
+  border: 2px dashed var(--primary-color);
+}
+
 .tile-icon {
   font-size: 48px;
   margin-bottom: 8px;
```

### 4. 🚀 TypeScript化とモダンビルドシステム

**目的**: 型安全性の向上と開発者体験の改善

**実装内容**:
- TypeScript導入
- Webpack設定
- ESLint/Prettier設定

```diff
// package.json
@@ -10,11 +10,25 @@
     "dist": "electron-builder"
   },
   "devDependencies": {
-    "electron": "^28.0.0",
-    "electron-builder": "^24.9.1"
+    "@types/node": "^20.0.0",
+    "@typescript-eslint/eslint-plugin": "^6.0.0",
+    "@typescript-eslint/parser": "^6.0.0",
+    "electron": "^28.0.0",
+    "electron-builder": "^24.9.1",
+    "eslint": "^8.0.0",
+    "prettier": "^3.0.0",
+    "ts-loader": "^9.0.0",
+    "typescript": "^5.0.0",
+    "webpack": "^5.0.0",
+    "webpack-cli": "^5.0.0"
   },
   "dependencies": {
     "chokidar": "^3.5.3",
     "electron-store": "^8.1.0"
   }
+  "scripts": {
+    "dev": "webpack --mode development --watch",
+    "build": "webpack --mode production",
+    "lint": "eslint src --ext .ts,.tsx",
+    "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
+  }
 }
```

```diff
// tsconfig.json (新規ファイル)
+{
+  "compilerOptions": {
+    "target": "ES2020",
+    "module": "commonjs",
+    "lib": ["ES2020", "DOM"],
+    "outDir": "./dist",
+    "rootDir": "./src",
+    "strict": true,
+    "esModuleInterop": true,
+    "skipLibCheck": true,
+    "forceConsistentCasingInFileNames": true,
+    "resolveJsonModule": true,
+    "moduleResolution": "node",
+    "allowSyntheticDefaultImports": true
+  },
+  "include": ["src/**/*"],
+  "exclude": ["node_modules", "dist"]
+}
```

```diff
// src/types/index.ts (新規ファイル)
+export interface Mode {
+  name: string;
+  path: string;
+  emoji?: string;
+  category?: string;
+  description?: string;
+  lastUsed?: Date;
+}
+
+export interface Settings {
+  shortcut: string;
+  launchAtStartup: boolean;
+  theme: 'system' | 'light' | 'dark';
+  modesOrder?: string[];
+}
+
+export interface IpcChannels {
+  'get-modes': () => Mode[];
+  'launch-mode': (modePath: string) => void;
+  'update-settings': (settings: Settings) => void;
+  'get-settings': () => Settings;
+}
```

### 5. 🔒 セキュリティ強化

**目的**: Electronアプリケーションのセキュリティベストプラクティスの実装

**実装内容**:
- Context Isolation の有効化
- Node Integration の無効化
- Content Security Policy の設定

```diff
// src/main.js
@@ -50,8 +50,13 @@
     height: 600,
     show: false,
     webPreferences: {
-      nodeIntegration: true,
-      contextIsolation: false
+      nodeIntegration: false,
+      contextIsolation: true,
+      preload: path.join(__dirname, 'preload.js')
+    },
+    titleBarStyle: 'hiddenInset',
+    vibrancy: 'under-window',
+    visualEffectState: 'active'
   });
```

```diff
// src/preload.js (新規ファイル)
+const { contextBridge, ipcRenderer } = require('electron');
+
+// セキュアなAPI公開
+contextBridge.exposeInMainWorld('electronAPI', {
+  getModes: () => ipcRenderer.invoke('get-modes'),
+  launchMode: (modePath) => ipcRenderer.invoke('launch-mode', modePath),
+  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
+  getSettings: () => ipcRenderer.invoke('get-settings'),
+  onModesUpdate: (callback) => {
+    ipcRenderer.on('modes-updated', callback);
+    return () => ipcRenderer.removeListener('modes-updated', callback);
+  }
+});
```

```diff
<!-- src/index.html -->
@@ -4,6 +4,11 @@
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Superwhisper Launcher</title>
+  <meta http-equiv="Content-Security-Policy" content="
+    default-src 'self';
+    script-src 'self';
+    style-src 'self' 'unsafe-inline';
+    img-src 'self' data:;">
   <link rel="stylesheet" href="style.css">
 </head>
```

## 実装優先順位と工数見積もり

| 機能 | 優先度 | 見積工数 | 影響度 |
|------|--------|----------|--------|
| 1. 検索・フィルター | 高 | 4時間 | ユーザビリティ大幅向上 |
| 2. ダークモード | 中 | 3時間 | UX向上 |
| 3. ドラッグ＆ドロップ | 中 | 6時間 | カスタマイズ性向上 |
| 4. TypeScript化 | 高 | 8時間 | 保守性・品質向上 |
| 5. セキュリティ強化 | 最高 | 4時間 | セキュリティリスク軽減 |

## 追加の改善アイデア

### 将来的な機能拡張
- **音声コントロール**: 「Hey Superwhisper」でモード選択
- **統計・分析**: 使用頻度の可視化
- **クラウド同期**: 設定の複数デバイス間同期
- **プラグインシステム**: カスタムアクションの追加
- **AIアシスタント**: モード推薦機能

### パフォーマンス最適化
- **仮想スクロール**: 大量モード対応
- **遅延読み込み**: 起動時間の短縮
- **キャッシング**: モードアイコンのキャッシュ

### アクセシビリティ
- **スクリーンリーダー対応**: ARIA属性の追加
- **キーボードナビゲーション**: Tab順序の最適化
- **高コントラストモード**: 視認性の向上

## まとめ

これらの改善により、Superwhisper Launcherは単なるモードランチャーから、パワフルで使いやすい生産性ツールへと進化します。段階的な実装により、既存ユーザーに影響を与えることなく、着実に機能を向上させることができます。