export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LoggerConfig {
  level: LogLevel;
  prefix?: string;
  timestamp?: boolean;
}

export class Logger {
  private config: LoggerConfig;
  private static instance: Logger;
  private useFileLogging = false;
  private fileStream: any = null;
  // Cache environment variables for performance
  private readonly isStdio = process.env.MCP_MODE === 'stdio';
  private readonly isDisabled = process.env.DISABLE_CONSOLE_OUTPUT === 'true';
  private readonly isHttp = process.env.MCP_MODE === 'http';
  private readonly isTest = process.env.NODE_ENV === 'test' || process.env.TEST_ENVIRONMENT === 'true';

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: LogLevel.INFO,
      prefix: 'n8n-mcp',
      timestamp: true,
      ...config,
    };
  }

  static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  private formatMessage(level: string, message: string): string {
    const parts: string[] = [];
    
    if (this.config.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }
    
    if (this.config.prefix) {
      parts.push(`[${this.config.prefix}]`);
    }
    
    parts.push(`[${level}]`);
    parts.push(message);
    
    return parts.join(' ');
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isTest) return false;
    if (this.isDisabled) return false;
    if (this.isStdio && level > LogLevel.ERROR) return false;
    return level <= this.config.level;
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return;

    const levelName = LogLevel[level];
    const formattedMessage = this.formatMessage(levelName, message);
    
    if (level === LogLevel.ERROR) {
      console.error(formattedMessage, ...args);
    } else if (level === LogLevel.WARN) {
      console.warn(formattedMessage, ...args);
    } else if (level === LogLevel.INFO) {
      console.info(formattedMessage, ...args);
    } else {
      console.log(formattedMessage, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }
}

// Create default logger instance
export const logger = new Logger();
