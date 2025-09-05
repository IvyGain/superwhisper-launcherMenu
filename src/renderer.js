const { ipcRenderer } = require('electron');

class SuperwhisperLauncherRenderer {
  constructor() {
    this.currentModes = [];
    this.elements = {
      modesGrid: document.getElementById('modesGrid'),
      settingsModal: document.getElementById('settingsModal'),
      iconSettings: document.getElementById('iconSettings')
    };
    
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
      
      // 数字キーでモード起動
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (this.currentModes[index]) {
          this.launchMode(this.currentModes[index].key);
        }
      } else if (e.key === '0') {
        if (this.currentModes[9]) {
          this.launchMode(this.currentModes[9].key);
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
      const shortcutKey = index < 9 ? (index + 1).toString() : index === 9 ? '0' : '';
      
      return `
        <div class="mode-tile" onclick="launcherRenderer.launchMode('${mode.key}')" data-key="${mode.key}">
          ${shortcutKey ? `<div class="mode-shortcut">${shortcutKey}</div>` : ''}
          <div class="mode-icon">${mode.icon}</div>
          <div class="mode-name">${this.escapeHtml(mode.name)}</div>
          <div class="mode-type">${this.escapeHtml(mode.type || 'custom')}</div>
        </div>
      `;
    }).join('');
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
    
    this.elements.iconSettings.innerHTML = this.currentModes.map((mode, index) => {
      const shortcutKey = index < 9 ? (index + 1).toString() : index === 9 ? '0' : '';
      
      return `
        <div class="icon-setting-item">
          <div class="mode-info">
            <div class="name">${this.escapeHtml(mode.name)}</div>
            <div class="type">${this.escapeHtml(mode.type || 'custom')} ${shortcutKey ? `• Cmd+${shortcutKey}` : ''}</div>
          </div>
          <button class="icon-picker" onclick="launcherRenderer.showEmojiPicker('${mode.key}', this)">
            ${mode.icon}
          </button>
        </div>
      `;
    }).join('');
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
});

// HTMLから呼び出すための関数をグローバルに公開
function openSettings() {
  if (launcherRenderer) launcherRenderer.openSettings();
}

function closeSettings() {
  if (launcherRenderer) launcherRenderer.closeSettings();
}

function closeApp() {
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