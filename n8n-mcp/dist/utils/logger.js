export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (LogLevel = {}));
export class Logger {
    config;
    static instance;
    useFileLogging = false;
    fileStream = null;
    // Cache environment variables for performance
    isStdio = process.env.MCP_MODE === 'stdio';
    isDisabled = process.env.DISABLE_CONSOLE_OUTPUT === 'true';
    isHttp = process.env.MCP_MODE === 'http';
    isTest = process.env.NODE_ENV === 'test' || process.env.TEST_ENVIRONMENT === 'true';
    constructor(config) {
        this.config = {
            level: LogLevel.INFO,
            prefix: 'n8n-mcp',
            timestamp: true,
            ...config,
        };
    }
    static getInstance(config) {
        if (!Logger.instance) {
            Logger.instance = new Logger(config);
        }
        return Logger.instance;
    }
    formatMessage(level, message) {
        const parts = [];
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
    shouldLog(level) {
        if (this.isTest)
            return false;
        if (this.isDisabled)
            return false;
        if (this.isStdio && level > LogLevel.ERROR)
            return false;
        return level <= this.config.level;
    }
    log(level, message, ...args) {
        if (!this.shouldLog(level))
            return;
        const levelName = LogLevel[level];
        const formattedMessage = this.formatMessage(levelName, message);
        if (level === LogLevel.ERROR) {
            console.error(formattedMessage, ...args);
        }
        else if (level === LogLevel.WARN) {
            console.warn(formattedMessage, ...args);
        }
        else if (level === LogLevel.INFO) {
            console.info(formattedMessage, ...args);
        }
        else {
            console.log(formattedMessage, ...args);
        }
    }
    error(message, ...args) {
        this.log(LogLevel.ERROR, message, ...args);
    }
    warn(message, ...args) {
        this.log(LogLevel.WARN, message, ...args);
    }
    info(message, ...args) {
        this.log(LogLevel.INFO, message, ...args);
    }
    debug(message, ...args) {
        this.log(LogLevel.DEBUG, message, ...args);
    }
}
// Create default logger instance
export const logger = new Logger();
//# sourceMappingURL=logger.js.map