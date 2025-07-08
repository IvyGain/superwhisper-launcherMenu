const { ipcRenderer } = require('electron');

// DOM要素
const modesGrid = document.getElementById('modesGrid');
const settingsModal = document.getElementById('settingsModal');
const iconSettings = document.getElementById('iconSettings');

// モードデータ
let currentModes = [];

// Mac絵文字リスト（カテゴリ別）
const emojiCategories = {
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
        '🗝️', '🔨', '🪓', '⛏️', '⚒️', '🛠️', '🗡️', '⚔️', '🔫', '🪃'
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

// 全絵文字をフラット化
const emojiList = Object.values(emojiCategories).flat();

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    requestModes();
    setupEventListeners();
});

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
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettings();
        }
    });
}

// モードデータの要求
function requestModes() {
    ipcRenderer.send('get-modes');
}

// IPCからのモードデータ更新
ipcRenderer.on('modes-updated', (event, modes) => {
    currentModes = modes;
    renderModes(modes);
});

// モードの表示
function renderModes(modes) {
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

    modesGrid.innerHTML = modes.map((mode, index) => {
        const shortcutKey = index < 9 ? (index + 1).toString() : index === 9 ? '0' : '';
        
        return `
            <div class="mode-tile" onclick="launchMode('${mode.key}')" data-key="${mode.key}">
                ${shortcutKey ? `<div class="mode-shortcut">${shortcutKey}</div>` : ''}
                <div class="mode-icon">${mode.icon}</div>
                <div class="mode-name">${escapeHtml(mode.name)}</div>
                <div class="mode-type">${escapeHtml(mode.type || 'custom')}</div>
            </div>
        `;
    }).join('');
}

// モードの起動
function launchMode(modeKey) {
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
    showNotification(`モード "${modeKey}" を起動しました`, 'success');
}

// アプリを閉じる
function closeApp() {
    if (window.require) {
        const { remote } = window.require('electron');
        if (remote && remote.getCurrentWindow) {
            remote.getCurrentWindow().hide();
        }
    }
}

// 設定画面を開く
function openSettings() {
    renderIconSettings();
    settingsModal.style.display = 'flex';
}

// 設定画面を閉じる
function closeSettings() {
    settingsModal.style.display = 'none';
}

// アイコン設定の表示
function renderIconSettings() {
    if (currentModes.length === 0) {
        iconSettings.innerHTML = '<p>設定可能なモードがありません</p>';
        return;
    }
    
    iconSettings.innerHTML = currentModes.map((mode, index) => {
        const shortcutKey = index < 9 ? (index + 1).toString() : index === 9 ? '0' : '';
        
        return `
            <div class="icon-setting-item">
                <div class="mode-info">
                    <div class="name">${escapeHtml(mode.name)}</div>
                    <div class="type">${escapeHtml(mode.type || 'custom')} ${shortcutKey ? `• Cmd+${shortcutKey}` : ''}</div>
                </div>
                <button class="icon-picker" onclick="showEmojiPicker('${mode.key}', this)">
                    ${mode.icon}
                </button>
            </div>
        `;
    }).join('');
}

// 絵文字ピッカーの表示
function showEmojiPicker(modeKey, button) {
    // 既存のピッカーを削除
    const existingPicker = document.querySelector('.emoji-picker');
    if (existingPicker) {
        existingPicker.remove();
    }
    
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
    Object.entries(emojiCategories).forEach(([category, emojis]) => {
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
}

// アイコンの更新
function updateIcon(modeKey, icon) {
    ipcRenderer.send('update-icon', modeKey, icon);
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