// エラーハンドリングユーティリティ

const { Logger } = require('./logger');
const { ERROR_MESSAGES } = require('../config/constants');

class ErrorHandler {
  constructor() {
    this.logger = Logger.create('ErrorHandler');
  }
  
  // 安全な関数実行（エラーをキャッチして適切に処理）
  async safeExecute(operation, fallbackValue = null, context = 'Unknown') {
    try {
      const result = await operation();
      return { success: true, data: result, error: null };
    } catch (error) {
      this.logger.error(`Error in ${context}`, error);
      return { success: false, data: fallbackValue, error };
    }
  }
  
  // 同期版
  safeExecuteSync(operation, fallbackValue = null, context = 'Unknown') {
    try {
      const result = operation();
      return { success: true, data: result, error: null };
    } catch (error) {
      this.logger.error(`Error in ${context}`, error);
      return { success: false, data: fallbackValue, error };
    }
  }
  
  // ファイル操作エラーの処理
  handleFileError(error, filePath, operation = 'file operation') {
    const errorInfo = {
      operation,
      filePath,
      errorCode: error.code,
      errorMessage: error.message
    };
    
    let userMessage = `ファイル操作でエラーが発生しました: ${operation}`;
    
    switch (error.code) {
      case 'ENOENT':
        userMessage = `ファイルまたはフォルダが見つかりません: ${filePath}`;
        break;
      case 'EACCES':
        userMessage = `ファイルへのアクセス権限がありません: ${filePath}`;
        break;
      case 'EMFILE':
        userMessage = 'システムリソースが不足しています';
        break;
      default:
        break;
    }
    
    this.logger.error(userMessage, errorInfo);
    return { userMessage, errorInfo };
  }
  
  // JSON パースエラーの処理
  handleJsonError(error, filePath, content) {
    const errorInfo = {
      operation: 'JSON parse',
      filePath,
      contentLength: content?.length || 0,
      errorMessage: error.message
    };
    
    const userMessage = `設定ファイルの形式が正しくありません: ${filePath}`;
    
    this.logger.error(userMessage, errorInfo);
    return { userMessage, errorInfo };
  }
  
  // アプリケーション起動エラーの処理
  handleAppStartupError(error, component) {
    const errorInfo = {
      component,
      errorMessage: error.message,
      stack: error.stack
    };
    
    const userMessage = `アプリケーションの起動に失敗しました: ${component}`;
    
    this.logger.error(userMessage, errorInfo);
    return { userMessage, errorInfo };
  }
  
  // ネットワークエラーの処理
  handleNetworkError(error, url) {
    const errorInfo = {
      operation: 'network request',
      url,
      errorCode: error.code,
      errorMessage: error.message
    };
    
    let userMessage = 'ネットワークエラーが発生しました';
    
    switch (error.code) {
      case 'ENOTFOUND':
        userMessage = 'インターネット接続を確認してください';
        break;
      case 'ECONNREFUSED':
        userMessage = 'サーバーに接続できません';
        break;
      case 'ETIMEDOUT':
        userMessage = '接続がタイムアウトしました';
        break;
      default:
        break;
    }
    
    this.logger.error(userMessage, errorInfo);
    return { userMessage, errorInfo };
  }
  
  // 不明なエラーの処理
  handleUnknownError(error, context = 'Unknown operation') {
    const errorInfo = {
      context,
      errorMessage: error.message,
      stack: error.stack,
      errorType: error.constructor.name
    };
    
    const userMessage = '予期しないエラーが発生しました';
    
    this.logger.error(userMessage, errorInfo);
    return { userMessage, errorInfo };
  }
  
  // エラー通知の表示（レンダラープロセス用）
  showErrorNotification(message, duration = 5000) {
    // この関数は実際にはレンダラープロセスで実装される
    // ここではログ出力のみ
    this.logger.warn(`Error notification: ${message}`);
  }
}

// デフォルトエラーハンドラーインスタンス
const errorHandler = new ErrorHandler();

module.exports = {
  ErrorHandler,
  errorHandler
};