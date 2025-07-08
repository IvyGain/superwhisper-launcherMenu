const { app, BrowserWindow, ipcMain, shell, globalShortcut, Tray, Menu, nativeImage } = require('electron');
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
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false, // 初期状態では非表示
    skipTaskbar: true,
    resizable: false,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    backgroundColor: '#00000000'
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
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0xF3, 0xFF, 0x61, 0x00, 0x00, 0x00,
      0x85, 0x49, 0x44, 0x41, 0x54, 0x38, 0x8D, 0x63, 0x60, 0x18, 0x05, 0x40,
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
      0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
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
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'ランチャーを開く',
      click: () => showWindow()
    },
    {
      label: 'モードを再読み込み',
      click: () => loadModes()
    },
    { type: 'separator' },
    {
      label: '設定',
      click: () => openSettings()
    },
    {
      label: '終了',
      click: () => app.quit()
    }
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
    // メインランチャーのショートカット
    globalShortcut.register('CommandOrControl+Shift+W', () => {
      showWindow();
    });

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
  const modesPath = path.join(require('os').homedir(), 'Documents', 'superwhisper', 'modes');
  
  if (fs.existsSync(modesPath)) {
    try {
      const watcher = chokidar.watch(modesPath, {
        persistent: true,
        ignoreInitial: true, // 初期スキャンを無視
        depth: 0, // サブディレクトリを監視しない
        awaitWriteFinish: {
          stabilityThreshold: 1000,
          pollInterval: 100
        }
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
  const modesPath = path.join(require('os').homedir(), 'Documents', 'superwhisper', 'modes');
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
            // カスタムアイコンの取得
            const customIcon = store.get(`icons.${mode.key}`, getDefaultIcon(mode.type));
            
            modesData.push({
              ...mode,
              fileName: file,
              icon: customIcon
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
function getDefaultIcon(type) {
  const iconMap = {
    'message': '💬',
    'email': '📧',
    'note': '📝',
    'voice': '🎤',
    'custom': '⚙️',
    'chat': '💭',
    'translation': '🌐',
    'summary': '📋',
    'code': '💻',
    'creative': '🎨'
  };
  
  return iconMap[type] || '🎯';
}

// インデックスによるモード起動
function launchModeByIndex(index) {
  if (modesData[index]) {
    launchMode(modesData[index].key);
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

// IPCイベントハンドラ
ipcMain.on('launch-mode', (event, modeKey) => {
  launchMode(modeKey);
});

ipcMain.on('get-modes', (event) => {
  event.reply('modes-updated', modesData);
});

ipcMain.on('update-icon', (event, modeKey, icon) => {
  store.set(`icons.${modeKey}`, icon);
  loadModes(); // モードを再読み込み
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