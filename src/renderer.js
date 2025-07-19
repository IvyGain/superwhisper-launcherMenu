// DOM要素（DOMContentLoaded後に取得）
let modesGrid;
let settingsModal;
let iconSettings;

// モードデータ
let currentModes = [];
let draggedElement = null;
let settings = {};

// Mac絵文字リスト（カテゴリ別）
const emojiCategories = {
  顔と感情: [
    '😀',
    '😃',
    '😄',
    '😁',
    '😆',
    '😅',
    '🤣',
    '😂',
    '🙂',
    '🙃',
    '😉',
    '😊',
    '😇',
    '🥰',
    '😍',
    '🤩',
    '😘',
    '😗',
    '☺️',
    '😚',
    '😙',
    '🥲',
    '😋',
    '😛',
    '😜',
    '🤪',
    '😝',
    '🤑',
    '🤗',
    '🤭',
    '🤫',
    '🤔',
    '🤐',
    '🤨',
    '😐',
    '😑',
    '😶',
    '😏',
    '😒',
    '🙄',
    '😬',
    '🤥',
    '😔',
    '😪',
    '🤤',
    '😴',
    '😷',
    '🤒',
    '🤕',
    '🤢',
  ],
  人物: [
    '👋',
    '🤚',
    '🖐️',
    '✋',
    '🖖',
    '👌',
    '🤏',
    '✌️',
    '🤞',
    '🤟',
    '🤘',
    '🤙',
    '👈',
    '👉',
    '👆',
    '🖕',
    '👇',
    '☝️',
    '👍',
    '👎',
    '👊',
    '✊',
    '🤛',
    '🤜',
    '👏',
    '🙌',
    '👐',
    '🤲',
    '🤝',
    '🙏',
    '👶',
    '🧒',
    '👦',
    '👧',
    '🧑',
    '👱',
    '👨',
    '🧔',
    '👩',
    '🧓',
  ],
  物体: [
    '💻',
    '⌨️',
    '🖥️',
    '🖨️',
    '🖱️',
    '🖲️',
    '💽',
    '💾',
    '💿',
    '📀',
    '📱',
    '📞',
    '☎️',
    '📟',
    '📠',
    '📺',
    '📻',
    '🎙️',
    '🎚️',
    '🎛️',
    '⏰',
    '⏲️',
    '⏱️',
    '⏳',
    '⌛',
    '📡',
    '🔋',
    '🔌',
    '💡',
    '🔦',
    '📧',
    '📨',
    '📩',
    '📤',
    '📥',
    '📦',
    '📫',
    '📪',
    '📬',
    '📭',
  ],
  活動: [
    '🎯',
    '🎪',
    '🎨',
    '🎭',
    '🎵',
    '🎶',
    '🎼',
    '🎹',
    '🥁',
    '🎷',
    '🎺',
    '🎸',
    '🪕',
    '🎻',
    '🎤',
    '🎧',
    '📻',
    '🎬',
    '🎮',
    '🕹️',
    '🎲',
    '♠️',
    '♥️',
    '♦️',
    '♣️',
    '🃏',
    '🀄',
    '🎴',
    '🎊',
    '🎉',
  ],
  ビジネス: [
    '💼',
    '📊',
    '📈',
    '📉',
    '📋',
    '📌',
    '📍',
    '📎',
    '🖇️',
    '📏',
    '📐',
    '✂️',
    '🗃️',
    '🗄️',
    '🗑️',
    '🔒',
    '🔓',
    '🔏',
    '🔐',
    '🔑',
    '🗝️',
    '🔨',
    '🪓',
    '⛏️',
    '⚒️',
    '🛠️',
    '🗡️',
    '⚔️',
    '🔫',
    '🪃',
  ],
  自然: [
    '🌱',
    '🌿',
    '☘️',
    '🍀',
    '🎋',
    '🍃',
    '🍂',
    '🍁',
    '🌾',
    '🌺',
    '🌻',
    '🌹',
    '🥀',
    '🌷',
    '🌼',
    '🌸',
    '💐',
    '🍄',
    '🌰',
    '🎃',
    '🌍',
    '🌎',
    '🌏',
    '🌕',
    '🌖',
    '🌗',
    '🌘',
    '🌑',
    '🌒',
    '🌓',
  ],
  食べ物: [
    '🍎',
    '🍐',
    '🍊',
    '🍋',
    '🍌',
    '🍉',
    '🍇',
    '🍓',
    '🫐',
    '🍈',
    '🍒',
    '🍑',
    '🥭',
    '🍍',
    '🥥',
    '🥝',
    '🍅',
    '🍆',
    '🥑',
    '🥦',
    '☕',
    '🫖',
    '🍵',
    '🧃',
    '🥤',
    '🧋',
    '🍶',
    '🍾',
    '🍷',
    '🍸',
  ],
};

// 全絵文字をフラット化（将来の拡張用）
// const emojiList = Object.values(emojiCategories).flat();

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
  // DOM要素の取得
  modesGrid = document.getElementById('modesGrid');
  settingsModal = document.getElementById('settingsModal');
  iconSettings = document.getElementById('iconSettings');

  // 検索とフィルター機能の初期化
  initializeSearchAndFilter();
  // テーマの初期化
  initializeTheme();
  // 設定の読み込み
  await loadSettings();
  // モードデータの取得
  await requestModes();
  // イベントリスナーの設定
  setupEventListeners();
});

// 検索・フィルター機能の初期化
function initializeSearchAndFilter() {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');

  if (searchInput) {
    searchInput.addEventListener('input', filterModes);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterModes);
  }
}

// モードのフィルタリング
function filterModes() {
  const searchTerm =
    document.getElementById('searchInput')?.value.toLowerCase() || '';
  const selectedCategory =
    document.getElementById('categoryFilter')?.value || '';
  const tiles = document.querySelectorAll('.mode-tile');

  tiles.forEach((tile) => {
    const modeName =
      tile.querySelector('.mode-name')?.textContent.toLowerCase() || '';
    const category = tile.dataset.category || '';

    const matchesSearch = modeName.includes(searchTerm);
    const matchesCategory = !selectedCategory || category === selectedCategory;

    tile.style.display = matchesSearch && matchesCategory ? '' : 'none';
  });
}

// カテゴリーの更新
function updateCategories(modes) {
  const categories = [...new Set(modes.map((m) => m.category).filter(Boolean))];
  const categoryFilter = document.getElementById('categoryFilter');

  if (categoryFilter) {
    categoryFilter.innerHTML = '<option value="">すべてのカテゴリー</option>';
    categories.forEach((cat) => {
      categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
  }
}

// テーマ管理
function initializeTheme() {
  const savedTheme = settings.theme || 'system';
  applyTheme(savedTheme);

  // システムテーマの変更を監視
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    });
}

function applyTheme(theme) {
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

// イベントリスナーの設定
function setupEventListeners() {
  // ESCキーでウィンドウを閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeApp();
    }

    // 数字キーでモード起動
    if (e.key >= '1' && e.key <= '9') {
      const index = parseInt(e.key) - 1;
      if (currentModes[index]) {
        launchMode(currentModes[index].key);
      }
    } else if (e.key === '0') {
      if (currentModes[9]) {
        launchMode(currentModes[9].key);
      }
    }
  });

  // モーダルの外側をクリックで閉じる
  settingsModal?.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeSettings();
    }
  });
}

// 設定の読み込み
async function loadSettings() {
  try {
    settings = await window.electronAPI.getSettings();

    // ショートカット設定の表示
    const launcherInput = document.getElementById('launcherShortcut');
    if (launcherInput && settings.shortcuts) {
      launcherInput.value = settings.shortcuts.launcher.replace(
        'CommandOrControl',
        'Cmd'
      ).replace('Alt', 'Option');
    }

    const processAgainInput = document.getElementById('processAgainShortcut');
    if (processAgainInput && settings.shortcuts) {
      processAgainInput.value = (settings.shortcuts.processAgain || '未設定').replace(
        'CommandOrControl',
        'Cmd'
      ).replace('Alt', 'Option');
    }

    // テーマ設定の表示
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect && settings.theme) {
      themeSelect.value = settings.theme;
    }

    applyTheme(settings.theme || 'system');
  } catch (error) {
    console.error('設定の読み込みエラー:', error);
  }
}

// モードデータの要求
async function requestModes() {
  try {
    const modes = await window.electronAPI.getModes();
    currentModes = modes;

    // 並び順の適用
    if (settings.modesOrder && settings.modesOrder.length > 0) {
      currentModes.sort((a, b) => {
        const indexA = settings.modesOrder.indexOf(a.key);
        const indexB = settings.modesOrder.indexOf(b.key);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }

    renderModes(currentModes);
    updateCategories(currentModes);
  } catch (error) {
    console.error('モード取得エラー:', error);
  }
}

// モード更新の監視
if (window.electronAPI.onModesUpdate) {
  window.electronAPI.onModesUpdate((event, modes) => {
    currentModes = modes;
    renderModes(modes);
    updateCategories(modes);
  });
}

// モードの表示
function renderModes(modes) {
  if (!modesGrid) return;

  if (modes.length === 0) {
    modesGrid.innerHTML = `
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

  modesGrid.innerHTML = modes
    .map((mode, index) => {
      const shortcutKey =
        index < 9 ? (index + 1).toString() : index === 9 ? '0' : '';

      return `
            <div class="mode-tile" data-key="${mode.key}" data-category="${mode.category || ''}" draggable="true">
                ${shortcutKey ? `<div class="mode-shortcut">${shortcutKey}</div>` : ''}
                <div class="mode-icon">${mode.icon}</div>
                <div class="mode-name">${escapeHtml(mode.name)}</div>
                <div class="mode-type">${escapeHtml(mode.type || 'custom')}</div>
            </div>
        `;
    })
    .join('');

  // クリックイベントとドラッグイベントの設定
  document.querySelectorAll('.mode-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      const modeKey = tile.dataset.key;
      launchMode(modeKey);
    });

    // ドラッグ＆ドロップイベント
    initializeDragAndDrop(tile);
  });
}

// ドラッグ＆ドロップ機能
function initializeDragAndDrop(tile) {
  tile.addEventListener('dragstart', handleDragStart);
  tile.addEventListener('dragover', handleDragOver);
  tile.addEventListener('dragenter', handleDragEnter);
  tile.addEventListener('dragleave', handleDragLeave);
  tile.addEventListener('drop', handleDrop);
  tile.addEventListener('dragend', handleDragEnd);
}

function handleDragStart(e) {
  draggedElement = this;
  this.classList.add('dragging');
  modesGrid.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);

  // ドラッグ開始時のフィードバック
  setTimeout(() => {
    if (draggedElement) {
      draggedElement.style.transform = 'rotate(5deg) scale(1.05)';
    }
  }, 0);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';

  const afterElement = getDragAfterElement(modesGrid, e.clientX, e.clientY);
  if (afterElement == null) {
    modesGrid.appendChild(draggedElement);
  } else {
    modesGrid.insertBefore(draggedElement, afterElement);
  }

  return false;
}

function handleDragEnter(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  if (this !== draggedElement) {
    this.classList.add('drop-zone');
  }
}

function handleDragLeave() {
  if (this !== draggedElement) {
    this.classList.remove('drop-zone');
  }
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (e.preventDefault) {
    e.preventDefault();
  }

  // ドロップゾーンのクリア
  document.querySelectorAll('.mode-tile').forEach((tile) => {
    tile.classList.remove('drop-zone');
  });

  saveModesOrder();
  showNotification('モードの順序を更新しました', 'success');
  return false;
}

function handleDragEnd() {
  this.classList.remove('dragging');
  modesGrid.classList.remove('dragging');

  // すべてのドラッグ関連クラスをクリア
  document.querySelectorAll('.mode-tile').forEach((tile) => {
    tile.classList.remove('drop-zone', 'drag-over');
  });

  // スタイルをリセット
  if (draggedElement) {
    draggedElement.style.transform = '';
  }

  draggedElement = null;
}

function getDragAfterElement(container, x, y) {
  const draggableElements = [
    ...container.querySelectorAll('.mode-tile:not(.dragging)'),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const centerX = box.left + box.width / 2;
      const centerY = box.top + box.height / 2;

      // グリッドレイアウトを考慮した距離計算
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );

      // より近い要素を選択
      if (distance < closest.distance) {
        return { distance: distance, element: child };
      } else {
        return closest;
      }
    },
    { distance: Number.POSITIVE_INFINITY }
  ).element;
}

async function saveModesOrder() {
  const tiles = [...document.querySelectorAll('.mode-tile')];
  const order = tiles.map((tile) => tile.dataset.key);

  settings.modesOrder = order;

  try {
    await window.electronAPI.updateSettings({ modesOrder: order });
  } catch (error) {
    console.error('並び順の保存に失敗しました:', error);
    showNotification('並び順の保存に失敗しました', 'error');
  }
}

// モードの起動
async function launchMode(modeKey) {
  // 視覚的フィードバック
  const tile = document.querySelector(`[data-key="${modeKey}"]`);
  if (tile) {
    tile.classList.add('active');
    setTimeout(() => {
      tile.classList.remove('active');
    }, 300);
  }

  // メインプロセスにモード起動を通知
  await window.electronAPI.launchMode(modeKey);

  // 通知表示
  showNotification(`モード "${modeKey}" を起動しました`, 'success');
}

// アプリを閉じる
function closeApp() {
  console.log('closeApp called'); // デバッグ用
  window.close();
}

// 設定画面を開く
function openSettings() {
  console.log('openSettings called'); // デバッグ用
  if (!settingsModal) {
    settingsModal = document.getElementById('settingsModal');
  }
  if (settingsModal) {
    renderModeSettings();
    settingsModal.style.display = 'flex';
  } else {
    console.error('settingsModal not found');
  }
}

// 設定画面を閉じる
function closeSettings() {
  if (!settingsModal) {
    settingsModal = document.getElementById('settingsModal');
  }
  if (settingsModal) {
    settingsModal.style.display = 'none';
  }
}

// 設定の保存
async function saveSettings() {
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    settings.theme = themeSelect.value;
    await window.electronAPI.updateSettings({ theme: themeSelect.value });
    applyTheme(themeSelect.value);
  }

  showNotification('設定を保存しました', 'success');
  closeSettings();
}

// モード設定の表示
function renderModeSettings() {
  const modeSettings = document.getElementById('modeSettings');
  if (!modeSettings) return;

  if (currentModes.length === 0) {
    modeSettings.innerHTML = '<p>設定可能なモードがありません</p>';
    return;
  }

  modeSettings.innerHTML = currentModes
    .map((mode, index) => {
      const defaultShortcutKey =
        index < 9 ? (index + 1).toString() : index === 9 ? '0' : '';
      const customShortcut = settings.shortcuts?.modes?.[mode.key] || '';

      return `
            <div class="mode-setting-item">
                <div class="mode-header">
                    <button class="mode-icon-display" onclick="showEmojiPicker('${mode.key}', this)">
                        ${mode.icon}
                    </button>
                    <div class="mode-info">
                        <div class="name">${escapeHtml(mode.name)}</div>
                        <div class="type">${escapeHtml(mode.type || 'custom')}</div>
                    </div>
                </div>
                <div class="mode-controls">
                    ${defaultShortcutKey ? `
                    <div class="mode-control-row">
                        <label>デフォルト:</label>
                        <span class="default-shortcut">Cmd+${defaultShortcutKey}</span>
                    </div>
                    ` : ''}
                    <div class="mode-control-row">
                        <label>カスタム:</label>
                        <div class="shortcut-input-wrapper">
                            <input 
                                type="text" 
                                id="mode_${mode.key}_shortcut" 
                                class="shortcut-input" 
                                value="${customShortcut}"
                                readonly 
                                placeholder="未設定"
                            />
                            <button class="shortcut-btn" onclick="recordShortcut('mode_${mode.key}')">
                                ${customShortcut ? '変更' : '設定'}
                            </button>
                            ${customShortcut ? `
                            <button class="shortcut-btn shortcut-btn-clear" onclick="clearModeShortcut('${mode.key}')">
                                削除
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    })
    .join('');
}

// 絵文字ピッカーの表示
window.showEmojiPicker = function (modeKey, button) {
  // 既存のピッカーを削除
  const existingPicker = document.querySelector('.emoji-picker');
  if (existingPicker) {
    existingPicker.remove();
  }

  const picker = document.createElement('div');
  picker.className = 'emoji-picker';
  picker.style.cssText = `
        position: fixed;
        background: var(--background-color);
        border: 1px solid var(--border-color);
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
        background: var(--tile-bg);
        border-bottom: 1px solid var(--border-color);
        font-weight: 600;
        color: var(--text-color);
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
  Object.entries(emojiCategories).forEach(([category, emojis]) => {
    const categoryDiv = document.createElement('div');
    categoryDiv.style.marginBottom = '20px';

    const categoryTitle = document.createElement('div');
    categoryTitle.textContent = category;
    categoryTitle.style.cssText = `
            font-size: 0.9em;
            font-weight: 600;
            color: var(--text-color);
            opacity: 0.7;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--border-color);
        `;
    categoryDiv.appendChild(categoryTitle);

    const emojiGrid = document.createElement('div');
    emojiGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 5px;
        `;

    emojis.forEach((emoji) => {
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
        emojiBtn.style.background = 'var(--tile-hover-bg)';
      });
      emojiBtn.addEventListener('mouseleave', () => {
        emojiBtn.style.background = 'none';
      });
      emojiBtn.addEventListener('click', () => {
        updateIcon(modeKey, emoji);
        button.textContent = emoji;
        picker.remove();
      });
      emojiGrid.appendChild(emojiBtn);
    });

    categoryDiv.appendChild(emojiGrid);
    content.appendChild(categoryDiv);
  });

  picker.appendChild(content);
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
};

// アイコンの更新
async function updateIcon(modeKey, icon) {
  const icons = settings.icons || {};
  icons[modeKey] = icon;
  await window.electronAPI.updateSettings({ icons });
  showNotification('アイコンを更新しました', 'success');
}

// HTMLエスケープ
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

// 通知表示
function showNotification(message, type = 'info') {
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

// ショートカット記録の状態管理
let recordingShortcut = null;
let recordingKeys = [];

// ショートカットの記録
window.recordShortcut = function (type) {
  const button = document.querySelector(
    `button[onclick="recordShortcut('${type}')"]`
  );
  let input;
  
  if (type.startsWith('mode_')) {
    input = document.getElementById(`${type}_shortcut`);
  } else {
    input = document.getElementById(`${type}Shortcut`);
  }

  if (!button || !input) return;

  if (recordingShortcut) {
    // 既に記録中の場合はキャンセル
    stopRecording();
    return;
  }

  recordingShortcut = type;
  recordingKeys = [];

  button.textContent = '記録中...';
  button.disabled = true;
  input.style.borderColor = '#ff4757';
  input.value = 'キーを押してください';

  // キーボードイベントリスナー
  document.addEventListener('keydown', handleShortcutKeydown);
  document.addEventListener('keyup', handleShortcutKeyup);

  // 10秒後にタイムアウト
  setTimeout(() => {
    if (recordingShortcut) {
      showNotification('ショートカット記録がタイムアウトしました', 'error');
      stopRecording();
    }
  }, 10000);
};

function handleShortcutKeydown(e) {
  if (!recordingShortcut) return;

  e.preventDefault();
  e.stopPropagation();

  const key = e.key;

  // 修飾キーの処理
  if (key === 'Control' || key === 'Meta' || key === 'Alt' || key === 'Shift') {
    if (!recordingKeys.includes(key)) {
      recordingKeys.push(key);
    }
    updateShortcutDisplay();
    return;
  }

  // 通常キーの処理
  if (!recordingKeys.includes(key)) {
    recordingKeys.push(key);
  }

  updateShortcutDisplay();

  // 修飾キー + 通常キーの組み合わせができた場合、記録終了
  const hasModifier = recordingKeys.some((k) =>
    ['Control', 'Meta', 'Alt', 'Shift'].includes(k)
  );
  const hasNormalKey = recordingKeys.some(
    (k) => !['Control', 'Meta', 'Alt', 'Shift'].includes(k)
  );

  if (hasModifier && hasNormalKey) {
    setTimeout(() => {
      finishRecording();
    }, 100);
  }
}

function handleShortcutKeyup(e) {
  if (!recordingShortcut) return;

  e.preventDefault();
  e.stopPropagation();
}

function updateShortcutDisplay() {
  let input;
  if (recordingShortcut.startsWith('mode_')) {
    input = document.getElementById(`${recordingShortcut}_shortcut`);
  } else {
    input = document.getElementById(`${recordingShortcut}Shortcut`);
  }
  if (!input) return;

  const displayKeys = recordingKeys.map((key) => {
    switch (key) {
    case 'Meta':
      return 'Cmd';
    case 'Control':
      return 'Ctrl';
    case 'Alt':
      return 'Alt';
    case 'Shift':
      return 'Shift';
    default:
      return key.toUpperCase();
    }
  });

  input.value = displayKeys.join('+');
}

async function finishRecording() {
  if (!recordingShortcut || recordingKeys.length === 0) {
    stopRecording();
    return;
  }

  const shortcutString = recordingKeys
    .map((key) => {
      switch (key) {
      case 'Meta':
        return 'CommandOrControl';
      case 'Control':
        return 'CommandOrControl';
      case 'Alt':
        return 'Alt';
      case 'Shift':
        return 'Shift';
      default:
        return key.toUpperCase();
      }
    })
    .join('+');

  // 設定を更新
  const shortcuts = settings.shortcuts || {};
  
  if (recordingShortcut.startsWith('mode_')) {
    const modeKey = recordingShortcut.replace('mode_', '');
    if (!shortcuts.modes) shortcuts.modes = {};
    shortcuts.modes[modeKey] = shortcutString;
  } else {
    shortcuts[recordingShortcut] = shortcutString;
  }
  
  await window.electronAPI.updateSettings({ shortcuts });

  showNotification('ショートカットを更新しました', 'success');
  stopRecording();
}

function stopRecording() {
  if (!recordingShortcut) return;

  document.removeEventListener('keydown', handleShortcutKeydown);
  document.removeEventListener('keyup', handleShortcutKeyup);

  const button = document.querySelector(
    `button[onclick="recordShortcut('${recordingShortcut}')"]`
  );
  let input;
  if (recordingShortcut.startsWith('mode_')) {
    input = document.getElementById(`${recordingShortcut}_shortcut`);
  } else {
    input = document.getElementById(`${recordingShortcut}Shortcut`);
  }

  if (button) {
    button.textContent = '変更';
    button.disabled = false;
  }

  if (input) {
    input.style.borderColor = 'var(--border-color)';
  }

  // 現在の設定を再表示
  loadSettings();

  recordingShortcut = null;
  recordingKeys = [];
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

// プロセスアゲインの実行
async function executeProcessAgain() {
  try {
    await window.electronAPI.processAgain();
    showNotification('プロセスアゲインを実行しました', 'success');
  } catch (error) {
    console.error('プロセスアゲイン実行エラー:', error);
    showNotification('プロセスアゲインの実行に失敗しました', 'error');
  }
}

// モードショートカットの削除
window.clearModeShortcut = async function (modeKey) {
  const shortcuts = settings.shortcuts || {};
  if (shortcuts.modes && shortcuts.modes[modeKey]) {
    delete shortcuts.modes[modeKey];
    await window.electronAPI.updateSettings({ shortcuts });
    showNotification('ショートカットを削除しました', 'success');
    renderModeSettings(); // 設定画面を更新
  }
};

// window関数をグローバルに公開
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.saveSettings = saveSettings;
window.closeApp = closeApp;
window.executeProcessAgain = executeProcessAgain;
