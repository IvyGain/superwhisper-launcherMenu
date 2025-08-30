// アプリケーション定数

const APP_CONFIG = {
  name: 'Superwhisper Launcher',
  version: '1.0.0',
  author: 'モーリー',
  
  // ウィンドウ設定
  window: {
    width: 1000,
    height: 700,
    minWidth: 600,
    minHeight: 400
  },
  
  // ホットキー設定
  shortcuts: {
    main: 'CommandOrControl+Shift+W',
    modeKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
  },
  
  // パス設定
  paths: {
    modesFolder: ['Documents', 'superwhisper', 'modes']
  },
  
  // ファイル監視設定
  watcher: {
    stabilityThreshold: 1000,
    pollInterval: 100,
    debounceDelay: 500
  },
  
  // UI設定
  ui: {
    maxModesPerRow: 4,
    tileSize: 120,
    animationDuration: 300,
    notificationDuration: 3000
  },
  
  // Superwhisper URL スキーム
  schemes: {
    mode: 'superwhisper://mode?key=',
    record: 'superwhisper://record'
  }
};

const DEFAULT_ICONS = {
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

const EMOJI_CATEGORIES = {
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

// モード名・プロンプトからアイコンを推測するキーワードマップ
const ICON_KEYWORDS = {
  '👋': ['自己紹介', 'プロフィール', 'introduction', 'profile'],
  '📧': ['メール', 'mail', 'email'],
  '📝': ['ブログ', '記事', 'blog', 'article', 'note'],
  '👥': ['会議', 'ミーティング', 'meeting', 'conference'],
  '📊': ['プレゼン', '発表', 'presentation', 'slide'],
  '🌐': ['翻訳', 'translate', 'translation'],
  '📋': ['要約', 'まとめ', 'summary', 'summarize'],
  '💻': ['コード', 'プログラム', 'code', 'program', 'develop'],
  '🎨': ['デザイン', 'design', 'creative'],
  '🎵': ['音楽', 'music', 'song'],
  '📚': ['学習', '勉強', 'study', 'learn', 'education'],
  '📅': ['計画', '予定', 'plan', 'schedule'],
  '🔍': ['検索', '調査', 'search', 'research'],
  '💼': ['ビジネス', '商談', 'business', 'work'],
  '✨': ['クリエイティブ', '創作', 'creative', 'creation']
};

const ERROR_MESSAGES = {
  MODES_FOLDER_NOT_FOUND: 'Modesフォルダが見つかりません',
  MODE_FILE_READ_ERROR: 'モードファイルの読み込みエラー',
  TRAY_CREATION_ERROR: 'システムトレイの作成に失敗しました',
  FILE_WATCHER_ERROR: 'ファイル監視の設定に失敗しました',
  SHORTCUT_REGISTRATION_ERROR: 'ショートカットの登録に失敗しました',
  MODE_LAUNCH_ERROR: 'モードの起動に失敗しました'
};

module.exports = {
  APP_CONFIG,
  DEFAULT_ICONS,
  EMOJI_CATEGORIES,
  ICON_KEYWORDS,
  ERROR_MESSAGES
};