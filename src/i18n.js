const fs = require('fs');
const path = require('path');
const Store = require('electron-store');

class I18n {
  constructor() {
    this.store = new Store();
    this.currentLanguage = this.store.get('language', this.getSystemLanguage());
    this.translations = {};
    this.loadTranslations();
  }

  getSystemLanguage() {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (locale.startsWith('ja')) {
      return 'ja';
    }
    return 'en'; // デフォルトは英語
  }

  loadTranslations() {
    const localesDir = path.join(__dirname, 'locales');
    
    try {
      // 日本語翻訳を読み込み
      const jaPath = path.join(localesDir, 'ja.json');
      if (fs.existsSync(jaPath)) {
        this.translations.ja = JSON.parse(fs.readFileSync(jaPath, 'utf8'));
      }

      // 英語翻訳を読み込み
      const enPath = path.join(localesDir, 'en.json');
      if (fs.existsSync(enPath)) {
        this.translations.en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
      }
    } catch (error) {
      console.error('翻訳ファイルの読み込みエラー:', error);
      // フォールバック用の最小限の翻訳
      this.translations = {
        ja: { app: { title: "Superwhisper Launcher" } },
        en: { app: { title: "Superwhisper Launcher" } }
      };
    }
  }

  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language;
      this.store.set('language', language);
      return true;
    }
    return false;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  t(key) {
    const keys = key.split('.');
    let translation = this.translations[this.currentLanguage];

    if (!translation) {
      // フォールバック: 英語を試す
      translation = this.translations.en;
    }

    if (!translation) {
      return key; // 翻訳が見つからない場合はキー自体を返す
    }

    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        // フォールバック: 英語を試す
        let fallback = this.translations.en;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object') {
            fallback = fallback[fk];
          } else {
            return key;
          }
        }
        return fallback || key;
      }
    }

    return translation || key;
  }

  // 利用可能な言語リストを取得
  getAvailableLanguages() {
    return Object.keys(this.translations);
  }
}

module.exports = I18n;