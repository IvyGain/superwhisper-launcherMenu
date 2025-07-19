const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  globalShortcut,
  Tray,
  Menu,
  nativeImage,
} = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const Store = require('electron-store');

// 設定ストア
const store = new Store();

// グローバル変数
let mainWindow;
let tray;
let modesData = [];

// アプリケーションの準備完了時
app.whenReady().then(() => {
  createWindow();
  createTray();
  setupGlobalShortcuts();
  watchModesFolder();
  loadModes();
});

// メインウィンドウの作成
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false, // 初期状態では非表示
    skipTaskbar: true,
    resizable: true, // リサイズ可能に
    frame: false,
    alwaysOnTop: true,
    transparent: false,
    backgroundColor: '#ffffff',
    titleBarStyle: 'hidden',
  });

  mainWindow.loadFile('src/index.html');

  // ウィンドウが閉じられたときの処理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // ウィンドウが非アクティブになったときに隠す
  mainWindow.on('blur', () => {
    if (mainWindow) {
      mainWindow.hide();
    }
  });
}

// システムトレイの作成
function createTray() {
  try {
    // 16x16のシンプルなアイコンを作成
    const iconBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0xf3, 0xff, 0x61, 0x00, 0x00, 0x00,
      0x85, 0x49, 0x44, 0x41, 0x54, 0x38, 0x8d, 0x63, 0x60, 0x18, 0x05, 0x40,
      0x00, 0x00, 0x81, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    const trayIcon = nativeImage.createFromBuffer(iconBuffer);
    tray = new Tray(trayIcon);
  } catch (error) {
    console.log('トレイアイコン作成エラー:', error);
    // エラーの場合はアイコンなしでトレイを作成
    try {
      tray = new Tray(nativeImage.createEmpty());
    } catch (fallbackError) {
      console.log('トレイ作成失敗:', fallbackError);
      return; // トレイ作成を諦める
    }
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Superwhisper Launcher',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'ランチャーを開く',
      click: () => showWindow(),
    },
    {
      label: 'モードを再読み込み',
      click: () => loadModes(),
    },
    { type: 'separator' },
    {
      label: '設定',
      click: () => openSettings(),
    },
    {
      label: '終了',
      click: () => app.quit(),
    },
  ]);

  tray.setToolTip('Superwhisper Launcher');
  tray.setContextMenu(contextMenu);

  // トレイアイコンクリックでウィンドウを表示
  tray.on('click', () => {
    showWindow();
  });
}

// ウィンドウを表示
function showWindow() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
}

// グローバルショートカットの設定
function setupGlobalShortcuts() {
  try {
    // 既存のショートカットを削除
    globalShortcut.unregisterAll();

    // 設定から現在のショートカットを取得
    const shortcuts = store.get('shortcuts', {
      launcher: 'Alt+V',
      processAgain: 'Alt+R',
    });

    // メインランチャーのショートカット
    globalShortcut.register(shortcuts.launcher, () => {
      showWindow();
    });

    // プロセスアゲインのショートカット
    if (shortcuts.processAgain) {
      globalShortcut.register(shortcuts.processAgain, () => {
        executeProcessAgain();
      });
    }

    // 数字キー1-9, 0でモード直接起動
    for (let i = 1; i <= 9; i++) {
      globalShortcut.register(`CommandOrControl+${i}`, () => {
        launchModeByIndex(i - 1);
      });
    }
    globalShortcut.register('CommandOrControl+0', () => {
      launchModeByIndex(9);
    });
  } catch (error) {
    console.log('グローバルショートカット設定エラー:', error);
  }
}

// モードフォルダの監視
function watchModesFolder() {
  const modesPath = path.join(
    require('os').homedir(),
    'Documents',
    'superwhisper',
    'modes'
  );

  if (fs.existsSync(modesPath)) {
    try {
      const watcher = chokidar.watch(modesPath, {
        persistent: true,
        ignoreInitial: true, // 初期スキャンを無視
        depth: 0, // サブディレクトリを監視しない
        awaitWriteFinish: {
          stabilityThreshold: 1000,
          pollInterval: 100,
        },
      });

      watcher.on('change', (path) => {
        if (path.endsWith('.json')) {
          console.log('モードファイル変更:', path);
          debounceLoadModes();
        }
      });

      watcher.on('add', (path) => {
        if (path.endsWith('.json')) {
          console.log('モードファイル追加:', path);
          debounceLoadModes();
        }
      });

      watcher.on('unlink', (path) => {
        if (path.endsWith('.json')) {
          console.log('モードファイル削除:', path);
          debounceLoadModes();
        }
      });

      console.log('ファイル監視開始:', modesPath);
    } catch (error) {
      console.log('ファイル監視エラー:', error);
    }
  } else {
    console.log('Modesフォルダが見つかりません:', modesPath);
  }
}

// デバウンス機能付きモード読み込み
let loadModesTimeout;
function debounceLoadModes() {
  clearTimeout(loadModesTimeout);
  loadModesTimeout = setTimeout(() => {
    loadModes();
  }, 500);
}

// モードファイルの読み込み
function loadModes() {
  const modesPath = path.join(
    require('os').homedir(),
    'Documents',
    'superwhisper',
    'modes'
  );
  modesData = [];

  if (!fs.existsSync(modesPath)) {
    console.log('Modes folder not found:', modesPath);
    // ウィンドウにエラー状態を送信
    if (mainWindow) {
      mainWindow.webContents.send('modes-updated', []);
    }
    return;
  }

  try {
    const files = fs.readdirSync(modesPath);

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(modesPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const mode = JSON.parse(content);

          if (mode.key && mode.name) {
            // カスタムアイコンの取得（モード名とプロンプトを考慮）
            const customIcon = store.get(
              `icons.${mode.key}`,
              getDefaultIcon(mode.type, mode.name, mode.prompt)
            );

            modesData.push({
              ...mode,
              fileName: file,
              icon: customIcon,
            });
          }
        } catch (error) {
          console.error(`Error reading mode file ${file}:`, error);
        }
      }
    }

    // ウィンドウにモードデータを送信
    if (mainWindow) {
      mainWindow.webContents.send('modes-updated', modesData);
    }

    console.log(`${modesData.length}個のモードを読み込みました`);
  } catch (error) {
    console.error('モード読み込みエラー:', error);
  }
}

// モードタイプに基づくデフォルトアイコン
function getDefaultIcon(type, modeName = '', prompt = '') {
  // より詳細な絵文字マッピング
  const iconMap = {
    message: '💬',
    email: '📧',
    note: '📝',
    voice: '🎤',
    custom: '⚙️',
    chat: '💭',
    translation: '🌐',
    summary: '📋',
    code: '💻',
    creative: '🎨',
    writing: '✍️',
    business: '💼',
    social: '🤝',
    learning: '📚',
    music: '🎵',
    design: '🎨',
    presentation: '📊',
    meeting: '👥',
    planning: '📅',
    research: '🔍',
  };

  // モード名やプロンプトから推測
  if (modeName || prompt) {
    const text = (modeName + ' ' + prompt).toLowerCase();

    if (text.includes('自己紹介') || text.includes('プロフィール')) return '👋';
    if (text.includes('メール') || text.includes('mail')) return '📧';
    if (text.includes('ブログ') || text.includes('記事')) return '📝';
    if (text.includes('会議') || text.includes('ミーティング')) return '👥';
    if (text.includes('プレゼン') || text.includes('発表')) return '📊';
    if (text.includes('翻訳') || text.includes('translate')) return '🌐';
    if (text.includes('要約') || text.includes('まとめ')) return '📋';
    if (text.includes('コード') || text.includes('プログラム')) return '💻';
    if (text.includes('デザイン') || text.includes('design')) return '🎨';
    if (text.includes('音楽') || text.includes('music')) return '🎵';
    if (text.includes('学習') || text.includes('勉強')) return '📚';
    if (text.includes('計画') || text.includes('予定')) return '📅';
    if (text.includes('検索') || text.includes('調査')) return '🔍';
    if (text.includes('ビジネス') || text.includes('商談')) return '💼';
    if (text.includes('クリエイティブ') || text.includes('創作')) return '✨';
  }

  return iconMap[type] || '🎯';
}

// インデックスによるモード起動
function launchModeByIndex(index) {
  if (modesData[index]) {
    launchMode(modesData[index].key);
  }
}

// プロセスアゲインの実行
function executeProcessAgain() {
  try {
    // AppleScriptを使用してSuperwhisperのHistoryを開き、最新の項目を再処理
    const script = `
      tell application "System Events"
        try
          tell application "Superwhisper" to activate
          delay 0.5
          keystroke "h" using {command down}
          delay 1
          key code 125
          delay 0.2
          keystroke return using {control down}
          delay 0.5
          click menu item "Process Again" of menu 1 of application process "Superwhisper"
        on error errorMessage
          display notification "プロセスアゲインの実行に失敗しました" with title "Superwhisper Launcher"
        end try
      end tell
    `;
    require('child_process').exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
      if (error) {
        console.error('プロセスアゲイン実行エラー:', error);
      } else {
        console.log('プロセスアゲインを実行しました');
      }
    });
  } catch (error) {
    console.error('プロセスアゲイン実行エラー:', error);
  }
}

// モードの起動
function launchMode(modeKey) {
  try {
    // Superwhisperを起動
    shell.openExternal(`superwhisper://mode?key=${modeKey}`);

    // 録音を開始
    setTimeout(() => {
      shell.openExternal('superwhisper://record');
    }, 500);

    console.log(`モード起動: ${modeKey}`);

    // ウィンドウを隠す
    if (mainWindow) {
      mainWindow.hide();
    }
  } catch (error) {
    console.error('モード起動エラー:', error);
  }
}

// 設定画面を開く
function openSettings() {
  console.log('設定画面 - 実装予定');
}

// IPCイベントハンドラ - handle を使用してセキュアに
ipcMain.handle('launch-mode', async (event, modeKey) => {
  launchMode(modeKey);
});

ipcMain.handle('get-modes', async () => {
  return modesData;
});

ipcMain.handle('update-settings', async (event, settings) => {
  if (settings.icons) {
    Object.entries(settings.icons).forEach(([key, icon]) => {
      store.set(`icons.${key}`, icon);
    });
    loadModes();
  }
  if (settings.shortcuts) {
    store.set('shortcuts', settings.shortcuts);
    setupGlobalShortcuts();
  }
  if (settings.theme) {
    store.set('theme', settings.theme);
  }
  if (settings.modesOrder) {
    store.set('modesOrder', settings.modesOrder);
  }
});

ipcMain.handle('get-settings', async () => {
  return {
    shortcuts: store.get('shortcuts', { launcher: 'Alt+V', processAgain: 'Alt+R' }),
    theme: store.get('theme', 'system'),
    modesOrder: store.get('modesOrder', []),
    icons: store.get('icons', {}),
  };
});

ipcMain.handle('show-open-dialog', async () => {
  const { dialog } = require('electron');
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  });
  return result;
});

ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('get-app-version', async () => {
  return app.getVersion();
});

ipcMain.handle('process-again', async () => {
  executeProcessAgain();
});

// アプリケーションの終了処理
app.on('window-all-closed', () => {
  // macOSでは明示的に終了しない限りアプリを終了しない
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-quit', () => {
  // グローバルショートカットの解除
  globalShortcut.unregisterAll();
});

// 旧APIとの互換性のためのイベントリスナー
ipcMain.on('modes-updated-request', (event) => {
  event.reply('modes-updated', modesData);
});
