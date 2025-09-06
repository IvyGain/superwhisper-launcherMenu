const { ipcRenderer } = require('electron');

class SuperwhisperLauncherRenderer {
  constructor() {
    this.currentModes = [];
    this.elements = {
      modesGrid: document.getElementById('modesGrid'),
      settingsModal: document.getElementById('settingsModal'),
      iconSettings: document.getElementById('iconSettings')
    };
    
    // ドラッグ関連のプロパティ
    this.draggedElement = null;
    this.draggedKey = null;
    this.isDragging = false;
    
    this.init();
  }
  
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.requestModes();
        this.setupEventListeners();
      });
    } else {
      this.requestModes();
      this.setupEventListeners();
    }
    
    this.setupIpcListeners();
  }
  
  // Mac絵文字リスト（カテゴリ別）
  get emojiCategories() {
    return {
      '顔と感情': [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
        '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚',
        '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭',
        '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄',
        '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢'
      ],
      '人物': [
        '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟',
        '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎',
        '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
        '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓'
      ],
      '物体': [
        '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀',
        '📱', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️',
        '⏰', '⏲️', '⏱️', '⏳', '⌛', '📡', '🔋', '🔌', '💡', '🔦',
        '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭'
      ],
      '活動': [
        '🎯', '🎪', '🎨', '🎭', '🎵', '🎶', '🎼', '🎹', '🥁', '🎷',
        '🎺', '🎸', '🪕', '🎻', '🎤', '🎧', '📻', '🎬', '🎮', '🕹️',
        '🎲', '♠️', '♥️', '♦️', '♣️', '🃏', '🀄', '🎴', '🎊', '🎉'
      ],
      'ビジネス': [
        '💼', '📊', '📈', '📉', '📋', '📌', '📍', '📎', '🖇️', '📏',
        '📐', '✂️', '🗃️', '🗄️', '🗑️', '🔒', '🔓', '🔏', '🔐', '🔑',
        '🗝️', '🔨', '🪓', '⛏️', '⚒️', '🛠️', '🗺️', '⚔️', '🔫', '🪃'
      ],
      '自然': [
        '🌱', '🌿', '☘️', '🍀', '🎋', '🍃', '🍂', '🍁', '🌾', '🌺',
        '🌻', '🌹', '🥀', '🌷', '🌼', '🌸', '💐', '🍄', '🌰', '🎃',
        '🌍', '🌎', '🌏', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓'
      ],
      '食べ物': [
        '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
        '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
        '☕', '🫖', '🍵', '🧃', '🥤', '🧋', '🍶', '🍾', '🍷', '🍸'
      ]
    };
  }
  
  get emojiList() {
    return Object.values(this.emojiCategories).flat();
  }

  // IPCリスナーの設定
  setupIpcListeners() {
    ipcRenderer.on('modes-updated', (event, modes) => {
      console.log('modes-updated: モード更新', modes);
      this.currentModes = modes;
      this.renderModes(modes);
    });
  }

  // イベントリスナーの設定
  setupEventListeners() {
    // ESCキーでウィンドウを閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeApp();
      }
      
      // 数字キーでモード起動（1-9のみ）
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (this.currentModes[index]) {
          this.launchMode(this.currentModes[index].key);
        }
      }
    });
    
    // モーダルの外側をクリックで閉じる
    this.elements.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.elements.settingsModal) {
        this.closeSettings();
      }
    });
  }

  // モードデータの要求
  requestModes() {
    ipcRenderer.send('get-modes');
  }

  // モードの表示
  renderModes(modes) {
    if (modes.length === 0) {
      this.elements.modesGrid.innerHTML = `
        <div class="no-modes">
          <div class="icon">😕</div>
          <div class="title">モードが見つかりません</div>
          <div class="description">
            ~/Documents/superwhisper/modes フォルダを確認してください<br>
            または新しいモードを作成してください
          </div>
        </div>
      `;
      return;
    }

    this.elements.modesGrid.innerHTML = modes.map((mode, index) => {
      const shortcutKey = index < 9 ? (index + 1).toString() : '';
      
      return `
        <div class="mode-tile" 
             data-key="${mode.key}"
             >
          ${shortcutKey ? `<div class="mode-shortcut">${shortcutKey}</div>` : ''}
          <div class="mode-icon">${mode.icon}</div>
          <div class="mode-name">
            <div class="mode-name-text">${this.escapeHtml(mode.name)}</div>
          </div>
          <div class="mode-type">${this.escapeHtml(mode.type || 'custom')}</div>
        </div>
      `;
    }).join('');
    
    // イベントリスナーを設定
    this.setupTileEventListeners();
  }

  // タイルのイベントリスナー設定
  setupTileEventListeners() {
    const tiles = document.querySelectorAll('.mode-tile');
    console.log('setupTileEventListeners: タイル数=', tiles.length);
    
    tiles.forEach((tile, index) => {
      console.log(`タイル[${index}] key=${tile.dataset.key}, draggable=${tile.draggable}`);
      
      // クリックイベント - ドラッグ中は無効化
      tile.addEventListener('click', (e) => {
        if (!this.isDragging) {
          const key = tile.dataset.key;
          this.launchMode(key);
        }
      });
      
      // マウスダウンイベントでドラッグ準備
      tile.addEventListener('mousedown', (e) => {
        console.log('mousedown イベント発生', e.target);
        // 左クリックのみ
        if (e.button === 0) {
          this.prepareDrag(e, tile);
        }
      });
      
      // ドラッグイベント
      tile.addEventListener('dragstart', (e) => this.handleDragStart(e));
      tile.addEventListener('dragover', (e) => this.handleDragOver(e));
      tile.addEventListener('drop', (e) => this.handleDrop(e));
      tile.addEventListener('dragend', (e) => this.handleDragEnd(e));
      tile.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    });
  }

  // モードの起動
  launchMode(modeKey) {
    // 視覚的フィードバック
    const tile = document.querySelector(`[data-key="${modeKey}"]`);
    if (tile) {
      tile.classList.add('active');
      setTimeout(() => {
        tile.classList.remove('active');
      }, 300);
    }
    
    // メインプロセスにモード起動を通知
    ipcRenderer.send('launch-mode', modeKey);
    
    // 通知表示
    this.showNotification(`モード "${modeKey}" を起動しました`, 'success');
  }

  // アプリを閉じる
  closeApp() {
    if (window.require) {
      const { remote } = window.require('electron');
      if (remote && remote.getCurrentWindow) {
        remote.getCurrentWindow().hide();
      }
    }
  }

  // 設定画面を開く
  openSettings() {
    this.renderIconSettings();
    this.loadCurrentHotkeys();
    this.setupHotkeyListeners();
    this.setupSettingsUI();
    this.elements.settingsModal.style.display = 'flex';
  }

  // 現在のホットキー設定を読み込み
  loadCurrentHotkeys() {
    ipcRenderer.send('get-hotkeys');
    ipcRenderer.once('current-hotkeys', (event, hotkeys) => {
      const launcherInput = document.querySelector('.shortcut-input[data-key="launcher"]');
      const processAgainInput = document.querySelector('.shortcut-input[data-key="processAgain"]');
      if (launcherInput) launcherInput.value = hotkeys.launcher;
      if (processAgainInput) processAgainInput.value = hotkeys.processAgain;
    });
  }

  // 設定UIの初期化
  setupSettingsUI() {
    // ショートカット入力にdata-key属性を設定
    const inputs = document.querySelectorAll('.shortcut-input');
    if (inputs[0]) inputs[0].dataset.key = 'launcher';
    if (inputs[1]) inputs[1].dataset.key = 'processAgain';
    
    // Cmd+1-9ショートカットのトグル設定
    const toggle = document.getElementById('numberShortcutsToggle');
    if (toggle) {
      // 現在の設定を取得
      ipcRenderer.send('get-number-shortcuts-setting');
      ipcRenderer.once('current-number-shortcuts-setting', (event, enabled) => {
        toggle.checked = enabled;
        this.updateToggleLabel(toggle, enabled);
      });
      
      // 変更時の処理
      toggle.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        ipcRenderer.send('update-number-shortcuts', enabled);
        this.updateToggleLabel(toggle, enabled);
      });
    }
  }
  
  updateToggleLabel(toggle, enabled) {
    const label = toggle.parentElement.parentElement.querySelector('.toggle-label');
    if (label) {
      label.textContent = enabled ? '有効' : '無効';
    }
  }

  // ホットキー設定のリスナー設定
  setupHotkeyListeners() {
    const changeButtons = document.querySelectorAll('.shortcut-change-btn');
    changeButtons.forEach(btn => {
      btn.onclick = (e) => {
        const input = e.target.previousElementSibling;
        const key = input.dataset.key;
        this.captureHotkey(input, key);
      };
    });

    // 折りたたみヘッダーのクリックイベント
    const collapsibleHeader = document.querySelector('.collapsible-header');
    if (collapsibleHeader) {
      collapsibleHeader.onclick = () => {
        const collapsible = collapsibleHeader.parentElement;
        collapsible.classList.toggle('collapsed');
      };
    }
  }

  // ホットキーのキャプチャ
  captureHotkey(input, key) {
    input.value = 'キーを押してください...';
    input.classList.add('capturing');
    
    const handleKeyDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const keys = [];
      if (e.metaKey) keys.push('Cmd');
      if (e.altKey) keys.push('Option');
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.shiftKey) keys.push('Shift');
      
      if (e.key && e.key !== 'Meta' && e.key !== 'Alt' && e.key !== 'Control' && e.key !== 'Shift') {
        const keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        keys.push(keyName);
      }
      
      if (keys.length > 1 || (keys.length === 1 && keys[0] !== 'Escape')) {
        const shortcut = keys.join('+');
        input.value = shortcut;
        input.classList.remove('capturing');
        
        // ホットキーを更新
        ipcRenderer.send('update-hotkey', { key, shortcut });
        
        document.removeEventListener('keydown', handleKeyDown);
      } else if (keys[0] === 'Escape') {
        input.value = input.defaultValue || '';
        input.classList.remove('capturing');
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
  }

  // 設定画面を閉じる
  closeSettings() {
    this.elements.settingsModal.style.display = 'none';
  }

  // アイコン設定の表示
  renderIconSettings() {
    if (this.currentModes.length === 0) {
      this.elements.iconSettings.innerHTML = '<p>設定可能なモードがありません</p>';
      return;
    }
    
    // モードホットキーを取得
    ipcRenderer.send('get-mode-hotkeys');
    ipcRenderer.once('current-mode-hotkeys', (event, hotkeys) => {
      this.elements.iconSettings.innerHTML = this.currentModes.map((mode, index) => {
        const shortcutKey = index < 9 ? (index + 1).toString() : '';
        const customHotkey = hotkeys[mode.key] || '';
        
        return `
          <div class="icon-setting-item">
            <div class="mode-info">
              <div class="name">${this.escapeHtml(mode.name)}</div>
              <div class="type">${this.escapeHtml(mode.type || 'custom')} ${shortcutKey ? `• Cmd+${shortcutKey}` : ''}</div>
              <div class="hotkey-info">${customHotkey ? `カスタム: ${customHotkey}` : 'カスタムホットキーなし'}</div>
            </div>
            <div class="mode-controls">
              <button class="icon-picker" onclick="launcherRenderer.showEmojiPicker('${mode.key}', this)">
                ${mode.icon}
              </button>
              <div class="hotkey-controls">
                <button class="hotkey-btn" onclick="launcherRenderer.setModeHotkey('${mode.key}')">
                  ⌨️
                </button>
                ${customHotkey ? `<button class="remove-hotkey-btn" onclick="launcherRenderer.removeModeHotkey('${mode.key}')">×</button>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    });
  }

  // 絵文字ピッカーの表示
  showEmojiPicker(modeKey, button) {
    // 既存のピッカーを削除
    const existingPicker = document.querySelector('.emoji-picker');
    if (existingPicker) {
      existingPicker.remove();
    }
    
    const picker = this.createEmojiPicker(modeKey, button);
    document.body.appendChild(picker);
    
    // 外側をクリックで閉じる
    const closeHandler = (e) => {
      if (!picker.contains(e.target) && e.target !== button) {
        picker.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeHandler);
    }, 100);
  }
  
  // 絵文字ピッカーの作成
  createEmojiPicker(modeKey, button) {
    const picker = document.createElement('div');
    picker.className = 'emoji-picker';
    picker.style.cssText = `
      position: fixed;
      background: white;
      border: 1px solid #ddd;
      border-radius: 15px;
      padding: 0;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      z-index: 2000;
      max-width: 400px;
      max-height: 500px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;
    
    // ボタンの位置を取得
    const rect = button.getBoundingClientRect();
    picker.style.left = Math.max(10, rect.left - 200) + 'px';
    picker.style.top = Math.max(10, rect.bottom + 10) + 'px';
    
    // ヘッダー
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 15px;
      background: #f8f9fa;
      border-bottom: 1px solid #eee;
      font-weight: 600;
      color: #333;
    `;
    header.textContent = '絵文字を選択';
    picker.appendChild(header);
    
    // スクロール可能なコンテンツエリア
    const content = document.createElement('div');
    content.style.cssText = `
      overflow-y: auto;
      max-height: 400px;
      padding: 15px;
    `;
    
    // カテゴリ別に絵文字を表示
    Object.entries(this.emojiCategories).forEach(([category, emojis]) => {
      const categoryDiv = this.createEmojiCategory(category, emojis, modeKey, button, picker);
      content.appendChild(categoryDiv);
    });
    
    picker.appendChild(content);
    return picker;
  }
  
  // 絵文字カテゴリの作成
  createEmojiCategory(category, emojis, modeKey, button, picker) {
    const categoryDiv = document.createElement('div');
    categoryDiv.style.marginBottom = '20px';
    
    const categoryTitle = document.createElement('div');
    categoryTitle.textContent = category;
    categoryTitle.style.cssText = `
      font-size: 0.9em;
      font-weight: 600;
      color: #666;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #eee;
    `;
    categoryDiv.appendChild(categoryTitle);
    
    const emojiGrid = document.createElement('div');
    emojiGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 5px;
    `;
    
    emojis.forEach(emoji => {
      const emojiBtn = this.createEmojiButton(emoji, modeKey, button, picker);
      emojiGrid.appendChild(emojiBtn);
    });
    
    categoryDiv.appendChild(emojiGrid);
    return categoryDiv;
  }
  
  // 絵文字ボタンの作成
  createEmojiButton(emoji, modeKey, button, picker) {
    const emojiBtn = document.createElement('button');
    emojiBtn.textContent = emoji;
    emojiBtn.style.cssText = `
      font-size: 1.5em;
      border: none;
      background: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      transition: background 0.2s;
    `;
    
    emojiBtn.addEventListener('mouseenter', () => {
      emojiBtn.style.background = '#f0f0f0';
    });
    
    emojiBtn.addEventListener('mouseleave', () => {
      emojiBtn.style.background = 'none';
    });
    
    emojiBtn.addEventListener('click', () => {
      this.updateIcon(modeKey, emoji);
      button.textContent = emoji;
      picker.remove();
    });
    
    return emojiBtn;
  }

  // アイコンの更新
  updateIcon(modeKey, icon) {
    ipcRenderer.send('update-icon', modeKey, icon);
    this.showNotification('アイコンを更新しました', 'success');
  }

  // モードホットキー設定
  setModeHotkey(modeKey) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      backdrop-filter: blur(10px);
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: 30px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      border: 1px solid var(--color-border);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    `;
    
    content.innerHTML = `
      <h3 style="margin-bottom: 20px; color: var(--color-text-primary);">ホットキーを設定</h3>
      <p style="margin-bottom: 20px; color: var(--color-text-secondary);">キーの組み合わせを押してください</p>
      <input type="text" id="hotkeyInput" placeholder="例: Option+1" readonly style="
        width: 100%;
        padding: 15px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-surface-secondary);
        color: var(--color-text-primary);
        text-align: center;
        font-size: 16px;
        margin-bottom: 20px;
      ">
      <div>
        <button id="cancelBtn" style="
          background: var(--color-surface-secondary);
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
          padding: 10px 20px;
          border-radius: 6px;
          margin-right: 10px;
          cursor: pointer;
        ">キャンセル</button>
        <button id="saveBtn" disabled style="
          background: var(--color-primary);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          opacity: 0.5;
        ">保存</button>
      </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    const input = content.querySelector('#hotkeyInput');
    const saveBtn = content.querySelector('#saveBtn');
    const cancelBtn = content.querySelector('#cancelBtn');
    
    let capturedHotkey = '';
    
    const handleKeyDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const keys = [];
      if (e.metaKey) keys.push('Cmd');
      if (e.altKey) keys.push('Option');
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.shiftKey) keys.push('Shift');
      
      if (e.key && e.key !== 'Meta' && e.key !== 'Alt' && e.key !== 'Control' && e.key !== 'Shift') {
        const keyName = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        keys.push(keyName);
      }
      
      if (keys.length > 1) {
        capturedHotkey = keys.join('+');
        
        // ASCII文字のみかチェック
        if (!/^[\x00-\x7F]+$/.test(capturedHotkey)) {
          input.value = '無効なキーの組み合わせです';
          saveBtn.disabled = true;
          saveBtn.style.opacity = '0.5';
          return;
        }
        
        input.value = capturedHotkey;
        saveBtn.disabled = false;
        saveBtn.style.opacity = '1';
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    cancelBtn.onclick = () => {
      document.removeEventListener('keydown', handleKeyDown);
      modal.remove();
    };
    
    saveBtn.onclick = () => {
      if (capturedHotkey) {
        ipcRenderer.send('update-mode-hotkey', modeKey, capturedHotkey);
        this.showNotification('ホットキーを設定しました', 'success');
        document.removeEventListener('keydown', handleKeyDown);
        modal.remove();
        this.renderIconSettings();
      }
    };
    
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.removeEventListener('keydown', handleKeyDown);
        modal.remove();
      }
    };
  }

  // モードホットキー削除
  removeModeHotkey(modeKey) {
    ipcRenderer.send('remove-mode-hotkey', modeKey);
    this.showNotification('ホットキーを削除しました', 'success');
    this.renderIconSettings();
  }

  // ドラッグ準備
  prepareDrag(e, tile) {
    // ドラッグ可能に設定
    tile.setAttribute('draggable', 'true');
  }

  // ドラッグ&ドロップ処理
  handleDragStart(e) {
    console.log('handleDragStart: イベント発生', e);
    console.log('handleDragStart: ターゲット=', e.target);
    this.isDragging = true;
    this.draggedElement = e.target.closest('.mode-tile');
    this.draggedKey = this.draggedElement.dataset.key;
    console.log('handleDragStart: ドラッグ対象=', this.draggedKey);
    
    // ドラッグ中の視覚効果
    this.draggedElement.classList.add('dragging');
    
    // データ転送
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.draggedKey);
    
    // ドラッグイメージの設定
    const dragImage = this.draggedElement.cloneNode(true);
    dragImage.style.opacity = '0.7';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, e.offsetX, e.offsetY);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const targetTile = e.target.closest('.mode-tile');
    if (targetTile && targetTile !== this.draggedElement) {
      // ドロップターゲットの視覚効果
      document.querySelectorAll('.mode-tile.drag-over').forEach(tile => {
        tile.classList.remove('drag-over');
      });
      targetTile.classList.add('drag-over');
    }
  }

  handleDrop(e) {
    e.preventDefault();
    
    const targetTile = e.target.closest('.mode-tile');
    if (targetTile && targetTile !== this.draggedElement) {
      const targetKey = targetTile.dataset.key;
      
      // 現在の順序を取得
      const currentOrder = this.currentModes.map(mode => mode.key);
      const draggedIndex = currentOrder.indexOf(this.draggedKey);
      const targetIndex = currentOrder.indexOf(targetKey);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        // 配列を並び替え
        currentOrder.splice(draggedIndex, 1);
        currentOrder.splice(targetIndex, 0, this.draggedKey);
        
        // 順序をメインプロセスに保存
        ipcRenderer.send('update-mode-order', currentOrder);
        
        // 表示を更新
        this.reorderModes(currentOrder);
        
        this.showNotification('モードの順序を変更しました', 'success');
      }
    }
    
    // 視覚効果をクリア
    this.clearDragEffects();
  }

  handleDragEnd(e) {
    console.log('handleDragEnd: ドラッグ終了');
    // ドラッグ終了後の処理
    this.clearDragEffects();
    
    // 少し遅延してフラグをリセット（クリックイベントとの競合を避ける）
    setTimeout(() => {
      this.isDragging = false;
    }, 100);
  }
  
  handleDragLeave(e) {
    // ドラッグがタイルから離れた時
    const targetTile = e.target.closest('.mode-tile');
    if (targetTile && targetTile !== this.draggedElement) {
      targetTile.classList.remove('drag-over');
    }
  }

  clearDragEffects() {
    // すべての視覚効果をクリア
    document.querySelectorAll('.mode-tile').forEach(tile => {
      tile.classList.remove('dragging', 'drag-over');
      tile.style.pointerEvents = '';
      // ドラッグ可能属性をリセット
      tile.setAttribute('draggable', 'false');
    });
    
    this.draggedElement = null;
    this.draggedKey = null;
  }

  reorderModes(newOrder) {
    console.log('reorderModes: 新しい順序=', newOrder);
    // 新しい順序でモードを並び替え
    const reorderedModes = newOrder.map(key => 
      this.currentModes.find(mode => mode.key === key)
    ).filter(Boolean);
    
    // 順序にないモードがあれば末尾に追加
    this.currentModes.forEach(mode => {
      if (!newOrder.includes(mode.key)) {
        reorderedModes.push(mode);
      }
    });
    
    this.currentModes = reorderedModes;
    console.log('reorderModes: renderModesを呼び出します');
    this.renderModes(this.currentModes);
  }

  // HTMLエスケープ
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  // 通知表示
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      z-index: 3000;
      animation: slideInRight 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// グローバル関数（HTMLから呼び出し用）
let launcherRenderer;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  launcherRenderer = new SuperwhisperLauncherRenderer();
  window.launcherRenderer = launcherRenderer;
});

// HTMLから呼び出すための関数をグローバルに公開
window.openSettings = function() {
  if (launcherRenderer) launcherRenderer.openSettings();
}

window.closeSettings = function() {
  if (launcherRenderer) launcherRenderer.closeSettings();
}

window.closeApp = function() {
  if (launcherRenderer) launcherRenderer.closeApp();
}

// アニメーション用CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);