const { app, BrowserWindow, ipcMain, shell, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const Store = require('electron-store');

class SuperwhisperLauncher {
  constructor() {
    this.store = new Store();
    this.mainWindow = null;
    this.tray = null;
    this.modesData = [];
    this.loadModesTimeout = null;
    this.fileWatcher = null;
    
    this.init();
  }
  
  init() {
    app.whenReady().then(() => {
      this.createWindow();
      this.createTray();
      this.setupGlobalShortcuts();
      this.watchModesFolder();
      this.loadModes();
      // アプリ起動時にウィンドウを表示
      this.showWindow();
    });
    
    this.setupAppEventHandlers();
    this.setupIpcHandlers();
  }


  // メインウィンドウの作成
  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1000,
      height: 700,
      minWidth: 600,
      minHeight: 400,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      show: false,
      skipTaskbar: true,
      resizable: true,
      frame: false,
      alwaysOnTop: true,
      transparent: true,
      backgroundColor: '#00000000',
      titleBarStyle: 'hidden'
    });

    this.mainWindow.loadFile('src/index.html');
    
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    this.mainWindow.on('blur', () => {
      if (this.mainWindow) {
        this.mainWindow.hide();
      }
    });
  }

  // システムトレイの作成
  createTray() {
    try {
      const trayIcon = this.createTrayIcon();
      this.tray = new Tray(trayIcon);
    } catch (error) {
      console.log('トレイアイコン作成エラー:', error);
      try {
        this.tray = new Tray(nativeImage.createEmpty());
      } catch (fallbackError) {
        console.log('トレイ作成失敗:', fallbackError);
        return;
      }
    }

    const contextMenu = this.createContextMenu();
    this.tray.setToolTip('Superwhisper Launcher');
    this.tray.setContextMenu(contextMenu);
    
    this.tray.on('click', () => {
      this.showWindow();
    });
  }
  
  createTrayIcon() {
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
    return nativeImage.createFromBuffer(iconBuffer);
  }
  
  createContextMenu() {
    return Menu.buildFromTemplate([
      {
        label: 'Superwhisper Launcher',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'ランチャーを開く',
        click: () => this.showWindow()
      },
      {
        label: 'モードを再読み込み',
        click: () => this.loadModes()
      },
      { type: 'separator' },
      {
        label: '設定',
        click: () => this.openSettings()
      },
      {
        label: '終了',
        click: () => app.quit()
      }
    ]);
  }

  // ウィンドウを表示
  showWindow() {
    if (this.mainWindow) {
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  // グローバルショートカットの設定
  setupGlobalShortcuts() {
    try {
      globalShortcut.register('CommandOrControl+Shift+W', () => {
        this.showWindow();
      });

      for (let i = 1; i <= 9; i++) {
        globalShortcut.register(`CommandOrControl+${i}`, () => {
          this.launchModeByIndex(i - 1);
        });
      }
      globalShortcut.register('CommandOrControl+0', () => {
        this.launchModeByIndex(9);
      });
    } catch (error) {
      console.log('グローバルショートカット設定エラー:', error);
    }
  }

  // モードフォルダの監視
  watchModesFolder() {
    const modesPath = this.getModesPath();
    
    if (!fs.existsSync(modesPath)) {
      console.log('Modesフォルダが見つかりません:', modesPath);
      return;
    }

    try {
      this.fileWatcher = chokidar.watch(modesPath, {
        persistent: true,
        ignoreInitial: true,
        depth: 0,
        awaitWriteFinish: {
          stabilityThreshold: 1000,
          pollInterval: 100
        }
      });

      const handleFileChange = (filePath) => {
        if (filePath.endsWith('.json')) {
          console.log('モードファイル変更:', filePath);
          this.debounceLoadModes();
        }
      };

      this.fileWatcher.on('change', handleFileChange);
      this.fileWatcher.on('add', handleFileChange);
      this.fileWatcher.on('unlink', handleFileChange);
      
      console.log('ファイル監視開始:', modesPath);
    } catch (error) {
      console.log('ファイル監視エラー:', error);
    }
  }
  
  getModesPath() {
    return path.join(require('os').homedir(), 'Documents', 'superwhisper', 'modes');
  }

  // デバウンス機能付きモード読み込み
  debounceLoadModes() {
    clearTimeout(this.loadModesTimeout);
    this.loadModesTimeout = setTimeout(() => {
      this.loadModes();
    }, 500);
  }

  // モードファイルの読み込み
  loadModes() {
    const modesPath = this.getModesPath();
    this.modesData = [];

    if (!fs.existsSync(modesPath)) {
      console.log('Modes folder not found:', modesPath);
      this.sendModesToWindow([]);
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
              const customIcon = this.store.get(`icons.${mode.key}`, this.getDefaultIcon(mode.type, mode.name, mode.prompt));
              
              this.modesData.push({
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

      this.sendModesToWindow(this.modesData);
      console.log(`${this.modesData.length}個のモードを読み込みました`);
    } catch (error) {
      console.error('モード読み込みエラー:', error);
    }
  }
  
  sendModesToWindow(modes) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('modes-updated', modes);
    }
  }

  // モードタイプに基づくデフォルトアイコン
  getDefaultIcon(type, modeName = '', prompt = '') {
  // より詳細な絵文字マッピング
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
    'creative': '🎨',
    'writing': '✍️',
    'business': '💼',
    'social': '🤝',
    'learning': '📚',
    'music': '🎵',
    'design': '🎨',
    'presentation': '📊',
    'meeting': '👥',
    'planning': '📅',
    'research': '🔍'
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
  launchModeByIndex(index) {
    if (this.modesData[index]) {
      this.launchMode(this.modesData[index].key);
    }
  }

  // モードの起動
  launchMode(modeKey) {
    try {
      shell.openExternal(`superwhisper://mode?key=${modeKey}`);
      
      setTimeout(() => {
        shell.openExternal('superwhisper://record');
      }, 500);
      
      console.log(`モード起動: ${modeKey}`);
      
      if (this.mainWindow) {
        this.mainWindow.hide();
      }
    } catch (error) {
      console.error('モード起動エラー:', error);
    }
  }

  // 設定画面を開く
  openSettings() {
    console.log('設定画面 - 実装予定');
  }

  // IPCイベントハンドラの設定
  setupIpcHandlers() {
    ipcMain.on('launch-mode', (event, modeKey) => {
      this.launchMode(modeKey);
    });

    ipcMain.on('get-modes', (event) => {
      event.reply('modes-updated', this.modesData);
    });

    ipcMain.on('update-icon', (event, modeKey, icon) => {
      this.store.set(`icons.${modeKey}`, icon);
      this.loadModes();
    });
  }

  // アプリケーションイベントハンドラの設定
  setupAppEventHandlers() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (this.mainWindow === null) {
        this.createWindow();
      }
    });

    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
      if (this.fileWatcher) {
        this.fileWatcher.close();
      }
    });
  }
}

// アプリケーションのインスタンスを作成
new SuperwhisperLauncher();