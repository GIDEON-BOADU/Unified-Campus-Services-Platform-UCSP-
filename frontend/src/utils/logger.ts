/**
 * Centralized logging utility with environment-based controls
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message), ...args);
    }
  }

  // API-specific logging
  apiCall(method: string, url: string, data?: any): void {
    this.debug(`API ${method.toUpperCase()} ${url}`, data);
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    if (this.shouldLog(level)) {
      const logMethod = level === LogLevel.ERROR ? console.error : console.log;
      logMethod(`API ${method.toUpperCase()} ${url} - ${status}`, data);
    }
  }

  // Component-specific logging
  componentMount(componentName: string, props?: any): void {
    this.debug(`Component ${componentName} mounted`, props);
  }

  componentUnmount(componentName: string): void {
    this.debug(`Component ${componentName} unmounted`);
  }

  // User action logging
  userAction(action: string, details?: any): void {
    this.info(`User action: ${action}`, details);
  }

  // Performance logging
  performance(operation: string, duration: number): void {
    this.info(`Performance: ${operation} took ${duration}ms`);
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions
export const logApiCall = (method: string, url: string, data?: any) => {
  logger.apiCall(method, url, data);
};

export const logApiResponse = (method: string, url: string, status: number, data?: any) => {
  logger.apiResponse(method, url, status, data);
};

export const logError = (message: string, error?: any) => {
  logger.error(message, error);
};

export const logInfo = (message: string, ...args: any[]) => {
  logger.info(message, ...args);
};

export const logDebug = (message: string, ...args: any[]) => {
  logger.debug(message, ...args);
};

// Production-safe console replacement
export const safeConsole = {
  log: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(message, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(message, ...args);
    }
  }
};
