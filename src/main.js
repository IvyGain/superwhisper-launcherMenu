const { app, BrowserWindow, ipcMain, shell, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const Store = require('electron-store');
const I18n = require('./i18n');
const { DEFAULT_ICONS, ICON_KEYWORDS } = require('./config/constants');

class SuperwhisperLauncher {
  constructor() {
    this.store = new Store();
    this.i18n = new I18n();
    this.mainWindow = null;
    this.tray = null;
    this.modesData = [];
    this.loadModesTimeout = null;
    this.fileWatcher = null;
    this.registeredModeHotkeys = [];
    this.numberShortcutsRegistered = false;
    
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
      titleBarStyle: 'hiddenInset'
    });

    this.mainWindow.loadFile('src/index.html');
    
    // 開発者ツールを開く（デバッグ用）
    // this.mainWindow.webContents.openDevTools();
    
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
        label: this.i18n.t('tray.title'),
        enabled: false
      },
      { type: 'separator' },
      {
        label: this.i18n.t('tray.showLauncher'),
        click: () => this.showWindow()
      },
      {
        label: this.i18n.t('tray.reloadModes'),
        click: () => this.loadModes()
      },
      { type: 'separator' },
      {
        label: this.i18n.t('tray.settings'),
        click: () => this.openSettings()
      },
      {
        label: this.i18n.t('tray.quit'),
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
      // ランチャー表示のホットキー
      const launcherHotkey = this.store.get('hotkeys.launcher', 'Option+V');
      this.registerShortcut(launcherHotkey, () => {
        this.showWindow();
      });
      

      // ProcessAgainのホットキー
      const processAgainHotkey = this.store.get('hotkeys.processAgain', 'Option+P');
      this.registerShortcut(processAgainHotkey, () => {
        this.launchProcessAgain();
      });

      // モード直接起動のホットキー（Cmd+1-9のみ、オン/オフ設定を確認）
      const numberShortcutsEnabled = this.store.get('hotkeys.numberShortcuts', true);
      this.updateNumberShortcuts(numberShortcutsEnabled);

      // カスタムモードホットキー
      this.setupModeHotkeys();
    } catch (error) {
      console.log('グローバルショートカット設定エラー:', error);
    }
  }

  // モード個別ホットキーの設定
  setupModeHotkeys() {
    try {
      // 既存のモードホットキーを記録からクリア
      if (this.registeredModeHotkeys) {
        this.registeredModeHotkeys.forEach(hotkey => {
          try {
            // ASCII文字のみのホットキーのみ解除を試行
            if (/^[\x00-\x7F]+$/.test(hotkey)) {
              const electronShortcut = hotkey
                .replace('Option', 'Alt')
                .replace('Cmd', 'CommandOrControl');
              globalShortcut.unregister(electronShortcut);
            }
          } catch (e) {
            console.log('ホットキー解除エラー:', e);
          }
        });
      }
      this.registeredModeHotkeys = [];

      // 各モードのカスタムホットキーを登録
      this.modesData.forEach(mode => {
        const hotkey = this.store.get(`modeHotkeys.${mode.key}`, '');
        if (hotkey) {
          const success = this.registerShortcut(hotkey, () => {
            this.launchMode(mode.key);
          });
          if (success) {
            this.registeredModeHotkeys.push(hotkey);
          } else {
            // 無効なホットキーは削除
            this.store.delete(`modeHotkeys.${mode.key}`);
          }
        }
      });
    } catch (error) {
      console.log('モードホットキー設定エラー:', error);
    }
  }

  // ショートカット登録ヘルパー
  registerShortcut(shortcut, callback) {
    try {
      // 無効な文字をチェック（ASCII文字のみ許可）
      if (!/^[\x00-\x7F]+$/.test(shortcut)) {
        console.log(`無効なホットキーをスキップ: ${shortcut}`);
        return false;
      }
      
      // macOSのキー名をElectronの形式に変換
      const electronShortcut = shortcut
        .replace('Option', 'Alt')
        .replace('Cmd', 'CommandOrControl');
      
      if (globalShortcut.isRegistered(electronShortcut)) {
        globalShortcut.unregister(electronShortcut);
      }
      
      globalShortcut.register(electronShortcut, callback);
      console.log(`ショートカット登録: ${shortcut} -> ${electronShortcut}`);
      return true;
    } catch (error) {
      console.error(`ショートカット登録エラー: ${shortcut}`, error);
      return false;
    }
  }

  // ProcessAgainを直接起動
  launchProcessAgain() {
    try {
      console.log('ProcessAgainを起動中...');
      
      // 方法1: Alfred-SuperWhisperワークフローを使用（最も推奨）
      this.tryAlfredProcessAgain().then(success => {
        if (!success) {
          console.log('Alfred方式が失敗、GUI自動化にフォールバック');
          this.tryGUIProcessAgain();
        }
      });
      
    } catch (error) {
      console.error('ProcessAgain起動エラー:', error);
      this.tryGUIProcessAgain();
    }
  }

  // Alfred-SuperWhisperワークフローを使用したProcessAgain
  async tryAlfredProcessAgain() {
    try {
      const { exec } = require('child_process');
      
      // Alfred Workflowを使用したProcessAgain実行
      const alfredScript = `
        tell application id "com.runningwithcrayons.Alfred"
          to run trigger "sw" in workflow "com.ognistik.alfred-superwhisper" 
          with argument "processLast"
        end tell
      `;
      
      return new Promise((resolve) => {
        exec(`osascript -e '${alfredScript}'`, (error, stdout, stderr) => {
          if (error) {
            console.log('Alfred Workflow方式が利用できません:', error.message);
            resolve(false);
          } else {
            console.log('Alfred WorkflowでProcessAgainを実行しました');
            resolve(true);
          }
        });
      });
      
    } catch (error) {
      console.log('Alfred Workflow実行エラー:', error);
      return false;
    }
  }

  // GUI自動化によるProcessAgain（フォールバック）
  tryGUIProcessAgain() {
    try {
      const { exec } = require('child_process');
      
      // 改良されたGUI自動化スクリプト
      const guiScript = `
        tell application "SuperWhisper"
          activate
        end tell
        delay 0.3
        
        tell application "System Events"
          tell process "SuperWhisper"
            set frontmost to true
            
            -- メニューバーからProcess Againを選択を試行
            try
              click menu item "Process Again" of menu "Edit" of menu bar 1
              return true
            on error
              try
                -- キーボードショートカット Cmd+Shift+R を試行
                keystroke "r" using {command down, shift down}
                return true
              on error
                try
                  -- 代替ショートカット Cmd+R を試行
                  keystroke "r" using {command down}
                  return true
                on error
                  return false
                end try
              end try
            end try
          end tell
        end tell
      `;
      
      exec(`osascript -e '${guiScript}'`, (error, stdout, stderr) => {
        if (error) {
          console.error('GUI自動化ProcessAgain実行エラー:', error);
          this.showProcessAgainError();
        } else {
          console.log('GUI自動化でProcessAgainを実行しました');
        }
      });
      
    } catch (error) {
      console.error('GUI ProcessAgain実行エラー:', error);
      this.showProcessAgainError();
    }
  }

  // ProcessAgain実行エラーの通知
  showProcessAgainError() {
    console.log('ProcessAgain実行に失敗しました。以下を確認してください:');
    console.log('1. SuperWhisperが起動していること');
    console.log('2. アクセシビリティ権限が付与されていること'); 
    console.log('3. Alfred Powerpack + alfred-superwhisperワークフローがインストールされていること（推奨）');
    console.log('手動でSuperWhisperのメニュー > Edit > Process Againを選択してください');
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

      // カスタム順序を適用
      this.applyCustomOrder();
      this.sendModesToWindow(this.modesData);
      console.log(`${this.modesData.length}個のモードを読み込みました`);
    } catch (error) {
      console.error('モード読み込みエラー:', error);
    }
  }

  // カスタム順序を適用
  applyCustomOrder() {
    const customOrder = this.store.get('modeOrder', []);
    if (customOrder.length === 0) return;

    const orderedModes = [];
    const remainingModes = [...this.modesData];

    // 保存された順序に従って配置
    customOrder.forEach(key => {
      const modeIndex = remainingModes.findIndex(mode => mode.key === key);
      if (modeIndex !== -1) {
        orderedModes.push(remainingModes.splice(modeIndex, 1)[0]);
      }
    });

    // 残りのモードを末尾に追加
    orderedModes.push(...remainingModes);
    this.modesData = orderedModes;
  }
  
  sendModesToWindow(modes) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('modes-updated', modes);
    }
  }

  // モードタイプに基づくデフォルトアイコン
  getDefaultIcon(type, modeName = '', prompt = '') {
    // モード名やプロンプトから推測
    if (modeName || prompt) {
      const text = (modeName + ' ' + prompt).toLowerCase();
      
      // キーワードマップから該当するアイコンを検索
      for (const [icon, keywords] of Object.entries(ICON_KEYWORDS)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          return icon;
        }
      }
    }
    
    return DEFAULT_ICONS[type] || '🎯';
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
    // ショートカット設定の更新
    ipcMain.on('update-hotkey', (event, { key, shortcut }) => {
      try {
        this.store.set(`hotkeys.${key}`, shortcut);
        // 個別にホットキーを再登録（全体を再登録しない）
        this.updateSpecificHotkey(key, shortcut);
        event.reply('hotkey-updated', { key, shortcut });
      } catch (error) {
        console.error('ホットキー更新エラー:', error);
        event.reply('hotkey-error', { key, error: error.message });
      }
    });

    // 現在のホットキー設定を取得
    ipcMain.on('get-hotkeys', (event) => {
      const hotkeys = {
        launcher: this.store.get('hotkeys.launcher', 'Option+V'),
        processAgain: this.store.get('hotkeys.processAgain', 'Option+P')
      };
      event.reply('current-hotkeys', hotkeys);
    });
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

    ipcMain.on('update-mode-hotkey', (event, modeKey, hotkey) => {
      this.store.set(`modeHotkeys.${modeKey}`, hotkey);
      this.setupModeHotkeys();
      event.reply('mode-hotkey-updated', { modeKey, hotkey });
    });

    ipcMain.on('get-mode-hotkeys', (event) => {
      const hotkeys = {};
      this.modesData.forEach(mode => {
        hotkeys[mode.key] = this.store.get(`modeHotkeys.${mode.key}`, '');
      });
      event.reply('current-mode-hotkeys', hotkeys);
    });

    ipcMain.on('remove-mode-hotkey', (event, modeKey) => {
      this.store.delete(`modeHotkeys.${modeKey}`);
      this.setupModeHotkeys();
      event.reply('mode-hotkey-removed', modeKey);
    });

    ipcMain.on('update-mode-order', (event, orderedKeys) => {
      this.store.set('modeOrder', orderedKeys);
      console.log('モード順序を保存しました:', orderedKeys);
    });

    ipcMain.on('get-number-shortcuts-setting', (event) => {
      const enabled = this.store.get('hotkeys.numberShortcuts', true);
      event.reply('current-number-shortcuts-setting', enabled);
    });

    ipcMain.on('update-number-shortcuts', (event, enabled) => {
      this.store.set('hotkeys.numberShortcuts', enabled);
      console.log('Cmd+1-9ショートカット設定を更新:', enabled);
      
      // 数字ショートカットのみを個別に管理
      this.updateNumberShortcuts(enabled);
    });

    // 言語設定関連
    ipcMain.on('get-current-language', (event) => {
      event.reply('current-language', this.i18n.getCurrentLanguage());
    });

    ipcMain.on('set-language', (event, language) => {
      if (this.i18n.setLanguage(language)) {
        // トレイメニューを更新
        if (this.tray) {
          const contextMenu = this.createContextMenu();
          this.tray.setContextMenu(contextMenu);
        }
        event.reply('language-changed', language);
      } else {
        event.reply('language-error', 'Invalid language');
      }
    });

    ipcMain.on('get-translations', (event) => {
      const currentLang = this.i18n.getCurrentLanguage();
      const translations = this.i18n.translations[currentLang] || {};
      event.reply('translations', translations);
    });
  }

  // 特定のホットキーを更新
  updateSpecificHotkey(key, shortcut) {
    try {
      // 既存のホットキーを解除
      const oldShortcut = this.store.get(`hotkeys.${key}`, '');
      if (oldShortcut) {
        const oldElectronShortcut = oldShortcut
          .replace('Option', 'Alt')
          .replace('Cmd', 'CommandOrControl');
        if (globalShortcut.isRegistered(oldElectronShortcut)) {
          globalShortcut.unregister(oldElectronShortcut);
        }
      }
      
      // 新しいホットキーを登録
      if (key === 'launcher') {
        this.registerShortcut(shortcut, () => {
          this.showWindow();
        });
      } else if (key === 'processAgain') {
        this.registerShortcut(shortcut, () => {
          this.launchProcessAgain();
        });
      }
      
      console.log(`ホットキー更新成功: ${key} -> ${shortcut}`);
    } catch (error) {
      console.error(`ホットキー更新エラー: ${key}`, error);
      throw error;
    }
  }

  // 数字ショートカットの個別管理
  updateNumberShortcuts(enabled) {
    try {
      // 既存の数字ショートカットを解除
      if (this.numberShortcutsRegistered) {
        for (let i = 1; i <= 9; i++) {
          try {
            globalShortcut.unregister(`CommandOrControl+${i}`);
          } catch (e) {
            console.log(`Cmd+${i}の解除でエラー:`, e);
          }
        }
        this.numberShortcutsRegistered = false;
      }

      // 有効な場合は登録
      if (enabled) {
        for (let i = 1; i <= 9; i++) {
          globalShortcut.register(`CommandOrControl+${i}`, () => {
            this.launchModeByIndex(i - 1);
          });
        }
        this.numberShortcutsRegistered = true;
        console.log('Cmd+1-9ショートカットを登録しました');
      } else {
        console.log('Cmd+1-9ショートカットを無効にしました');
      }
    } catch (error) {
      console.error('数字ショートカット更新エラー:', error);
    }
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
      } else {
        this.showWindow();
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