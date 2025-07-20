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
  createMenuBar();
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

// メニューバーの作成
function createMenuBar() {
  const template = [
    {
      label: 'Superwhisper Launcher',
      submenu: [
        {
          label: 'Superwhisper Launcherについて',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Superwhisper Launcherについて',
              message: 'Superwhisper Launcher',
              detail: `バージョン: ${app.getVersion()}\n\nSuperwhisperのモードを簡単に起動するためのランチャーアプリケーションです。`,
              buttons: ['OK'],
            });
          },
        },
        { type: 'separator' },
        {
          label: '設定...',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            openSettings();
          },
        },
        { type: 'separator' },
        {
          label: '終了',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: '表示',
      submenu: [
        {
          label: 'ランチャーを表示',
          accelerator: 'Alt+V',
          click: () => {
            showWindow();
          },
        },
        {
          label: 'モードを再読み込み',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            loadModes();
            if (mainWindow) {
              mainWindow.webContents.send('modes-updated', modesData);
            }
          },
        },
      ],
    },
    {
      label: 'ウィンドウ',
      submenu: [
        {
          label: '最小化',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            if (mainWindow) {
              mainWindow.minimize();
            }
          },
        },
        {
          label: '閉じる',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            if (mainWindow) {
              mainWindow.hide();
            }
          },
        },
      ],
    },
    {
      label: 'ヘルプ',
      submenu: [
        {
          label: 'GitHubリポジトリ',
          click: () => {
            shell.openExternal(
              'https://github.com/mashimaro/SuperwhisperLauncher'
            );
          },
        },
        {
          label: 'Superwhisper公式サイト',
          click: () => {
            shell.openExternal('https://superwhisper.com');
          },
        },
      ],
    },
  ];

  // macOS固有のメニュー調整
  if (process.platform === 'darwin') {
    // macOS特有のメニューアイテムを追加
    template[0].submenu.splice(
      2,
      0,
      {
        label: 'サービス',
        role: 'services',
        submenu: [],
      },
      { type: 'separator' },
      {
        label: 'Superwhisper Launcherを隠す',
        accelerator: 'CmdOrCtrl+H',
        role: 'hide',
      },
      {
        label: 'その他を隠す',
        accelerator: 'CmdOrCtrl+Shift+H',
        role: 'hideothers',
      },
      {
        label: 'すべてを表示',
        role: 'unhide',
      }
    );

    // ウィンドウメニューに追加の項目
    template[2].submenu.push(
      { type: 'separator' },
      {
        label: 'すべてを前面に移動',
        role: 'front',
      }
    );
  }

  // 開発モード用メニュー
  if (
    process.env.NODE_ENV === 'development' ||
    process.argv.includes('--dev')
  ) {
    template.push({
      label: '開発',
      submenu: [
        {
          label: '開発者ツール',
          accelerator: 'CmdOrCtrl+Alt+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.openDevTools();
            }
          },
        },
        {
          label: 'リロード',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          },
        },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
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
      processAgain: 'Alt+P',
      enableNumberKeys: true,
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

    // 数字キー1-9, 0でモード直接起動（オンオフ可能・個別割り当て対応）
    if (shortcuts.enableNumberKeys !== false) {
      // 個別割り当てがある場合はそれを使用、なければデフォルトの順序
      const numberKeyMappings = shortcuts.numberKeyMappings || {};

      for (let i = 1; i <= 9; i++) {
        const keyNumber = i.toString();
        const assignedModeKey = numberKeyMappings[keyNumber];

        globalShortcut.register(`CommandOrControl+${i}`, () => {
          if (assignedModeKey) {
            // 個別割り当てがある場合
            launchMode(assignedModeKey);
          } else {
            // デフォルトの順序（位置ベース）
            launchModeByIndex(i - 1);
          }
        });
      }

      // 0キーの処理
      const assignedModeKey0 = numberKeyMappings['0'];
      globalShortcut.register('CommandOrControl+0', () => {
        if (assignedModeKey0) {
          launchMode(assignedModeKey0);
        } else {
          launchModeByIndex(9);
        }
      });
    }

    // 個別モードのカスタムショートカット
    if (shortcuts.modes) {
      Object.entries(shortcuts.modes).forEach(([modeKey, shortcut]) => {
        if (shortcut && shortcut.trim()) {
          try {
            globalShortcut.register(shortcut, () => {
              launchMode(modeKey);
            });
          } catch (error) {
            console.error(
              `モード ${modeKey} のショートカット登録エラー:`,
              error
            );
          }
        }
      });
    }
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
    // 公式ドキュメントに基づく確実なアプローチ：Menu Bar → History → Right-click → Process Again
    const script = `
      tell application "System Events"
        try
          -- Superwhisperを起動して最前面に
          tell application "superwhisper" to activate
          delay 0.5
          
          -- Menu Bar の History メニューを開く
          tell application process "superwhisper"
            click menu item "History..." of menu 1 of menu bar item "superwhisper" of menu bar 1
            delay 1.0
            
            -- Historyウィンドウが開いたかチェック
            set windowCount to count of windows
            if windowCount > 0 then
              tell window 1
                -- 最新の録音（通常はリストの最初）にフォーカス
                set focused to true
                delay 0.3
                
                -- リスト内の最初のアイテムを確実に選択
                key code 126 -- Up arrow (to top)
                delay 0.2
                key code 125 -- Down arrow (first item)
                delay 0.3
                
                -- 右クリックでコンテキストメニューを開く
                key code 49 using {control down} -- Control+Space (right-click equivalent)
                delay 0.5
                
                -- Process Again を探してクリック
                try
                  click menu item "Process Again" of menu 1
                on error
                  -- "Process Again" が見つからない場合の代替案
                  -- メニューの全項目をチェック
                  set menuItems to name of every menu item of menu 1
                  repeat with itemName in menuItems
                    if itemName contains "Process" or itemName contains "Again" or itemName contains "再処理" then
                      click menu item itemName of menu 1
                      exit repeat
                    end if
                  end repeat
                end try
                
              end tell
            else
              error "Historyウィンドウが開きませんでした"
            end if
          end tell
          
          -- 成功通知
          display notification "プロセスアゲインを実行しました" with title "Superwhisper Launcher"
          
        on error errorMessage
          -- エラー時のフォールバック処理
          display notification "プロセスアゲインの自動実行に失敗しました。Historyを手動で開きます。" with title "Superwhisper Launcher"
          
          -- Historyメニューを開いてユーザーに委ねる
          try
            tell application process "superwhisper"
              click menu item "History..." of menu 1 of menu bar item "superwhisper" of menu bar 1
            end tell
          end try
        end try
      end tell
    `;

    require('child_process').exec(`osascript -e '${script}'`, (error) => {
      if (error) {
        console.error('プロセスアゲイン実行エラー:', error);
        // 最終フォールバック
        fallbackProcessAgain();
      } else {
        console.log('プロセスアゲインスクリプトを実行しました');
      }
    });
  } catch (error) {
    console.error('プロセスアゲイン実行エラー:', error);
    fallbackProcessAgain();
  }
}

// フォールバック方法：Historyメニューを開いてユーザーガイド表示
function fallbackProcessAgain() {
  try {
    // まずSuperwhisperを起動
    shell.openExternal('superwhisper://mode');

    setTimeout(() => {
      // Historyメニューを開く
      const openHistoryScript = `
        tell application "System Events"
          try
            tell application "superwhisper" to activate
            delay 0.5
            tell application process "superwhisper"
              click menu item "History..." of menu 1 of menu bar item "superwhisper" of menu bar 1
            end tell
            display notification "録音を右クリックして「Process Again」を選択してください" with title "Superwhisper Launcher" subtitle "手動操作が必要です"
          on error
            display notification "Superwhisperが見つかりません" with title "Superwhisper Launcher"
          end try
        end tell
      `;
      require('child_process').exec(`osascript -e '${openHistoryScript}'`);
    }, 1000);
  } catch (error) {
    console.error('フォールバック実行エラー:', error);
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
  if (mainWindow) {
    // ウィンドウを表示
    mainWindow.show();
    mainWindow.focus();

    // レンダラープロセスに設定画面を開くように通知
    mainWindow.webContents.send('open-settings');
  }
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
    shortcuts: store.get('shortcuts', {
      launcher: 'Alt+V',
      processAgain: 'Alt+P',
      enableNumberKeys: true,
    }),
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
