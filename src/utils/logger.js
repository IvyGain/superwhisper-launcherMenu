// ログ管理ユーティリティ

class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.logLevel = process.env.NODE_ENV === 'development' ? 'debug' : 'info';
  }
  
  static create(context) {
    return new Logger(context);
  }
  
  _formatMessage(level, message, extra = null) {
    const timestamp = new Date().toISOString();
    const contextInfo = `[${this.context}]`;
    const levelInfo = `[${level.toUpperCase()}]`;
    
    let formattedMessage = `${timestamp} ${contextInfo} ${levelInfo} ${message}`;
    
    if (extra) {
      formattedMessage += ` ${JSON.stringify(extra, null, 2)}`;
    }
    
    return formattedMessage;
  }
  
  debug(message, extra = null) {
    if (this.logLevel === 'debug') {
      console.log(this._formatMessage('debug', message, extra));
    }
  }
  
  info(message, extra = null) {
    console.log(this._formatMessage('info', message, extra));
  }
  
  warn(message, extra = null) {
    console.warn(this._formatMessage('warn', message, extra));
  }
  
  error(message, error = null) {
    const extra = error ? {
      message: error.message,
      stack: error.stack,
      ...(error.code && { code: error.code })
    } : null;
    
    console.error(this._formatMessage('error', message, extra));
  }
  
  success(message, extra = null) {
    console.log(`✅ ${this._formatMessage('success', message, extra)}`);
  }
  
  // 特定の操作の開始と終了をログに記録
  startOperation(operation) {
    this.debug(`Starting operation: ${operation}`);
    const startTime = Date.now();
    
    return {
      end: (success = true, result = null) => {
        const duration = Date.now() - startTime;
        const status = success ? 'completed' : 'failed';
        const message = `Operation ${operation} ${status} in ${duration}ms`;
        
        if (success) {
          this.success(message, result);
        } else {
          this.error(message, result);
        }
      }
    };
  }
}

// デフォルトロガーインスタンス
const defaultLogger = new Logger('Main');

module.exports = {
  Logger,
  logger: defaultLogger
};