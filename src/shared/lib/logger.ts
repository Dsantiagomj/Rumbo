/**
 * Structured Logging System
 *
 * Provides centralized logging with:
 * - Structured context (key-value pairs)
 * - Log levels (error, warn, info, debug)
 * - Production-ready (sends to external service in prod)
 * - Development-friendly (console in dev)
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  error?: Error;
}

/**
 * Logger class for structured logging
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  /**
   * Format log entry for console output
   */
  private formatConsoleMessage(entry: LogEntry): string {
    const { level, message, context, timestamp } = entry;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Send log to external service (Sentry, Datadog, etc.)
   * Currently a placeholder - implement when integrating logging service
   */
  private sendToExternalService(entry: LogEntry): void {
    // TODO: Integrate with Sentry or other logging service
    // Example for Sentry:
    // if (entry.level === 'error' && entry.error) {
    //   Sentry.captureException(entry.error, {
    //     tags: { ...entry.context },
    //     level: 'error',
    //   });
    // }

    // For now, in production we still use console but with structured format
    if (!this.isDevelopment && !this.isTest) {
      // Structured JSON logging for production log aggregators
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    // Skip logs in test environment unless explicitly needed
    if (this.isTest && level !== 'error') {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      error,
    };

    // Development: Use console with nice formatting
    if (this.isDevelopment) {
      const consoleMethod =
        level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

      consoleMethod(this.formatConsoleMessage(entry));

      if (error) {
        consoleMethod('Error details:', error);
      }

      if (context) {
        consoleMethod('Context:', context);
      }
    }

    // Production: Send to external service
    if (!this.isDevelopment) {
      this.sendToExternalService(entry);
    }
  }

  /**
   * Log error level message
   *
   * @example
   * logger.error('Failed to save user', { userId: '123' }, error);
   */
  error(message: string, context?: LogContext, error?: Error): void {
    this.log('error', message, context, error);
  }

  /**
   * Log warning level message
   *
   * @example
   * logger.warn('Deprecated API usage', { endpoint: '/old-api' });
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Log info level message
   *
   * @example
   * logger.info('User logged in', { userId: '123', method: 'credentials' });
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Log debug level message (only in development)
   *
   * @example
   * logger.debug('Cache hit', { key: 'user:123', ttl: 3600 });
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }
}

/**
 * Default logger instance
 *
 * @example
 * import { logger } from '@/shared/lib/logger';
 *
 * try {
 *   await saveUser(user);
 * } catch (error) {
 *   logger.error('Failed to save user', { userId: user.id }, error);
 *   throw error;
 * }
 */
export const logger = new Logger();

/**
 * Create a logger with default context
 * Useful for domain-specific loggers
 *
 * @example
 * const importLogger = createLogger({ feature: 'import' });
 * importLogger.error('Parse failed', { fileName: 'statement.csv' });
 */
export function createLogger(defaultContext: LogContext) {
  return {
    error: (message: string, context?: LogContext, error?: Error) =>
      logger.error(message, { ...defaultContext, ...context }, error),
    warn: (message: string, context?: LogContext) =>
      logger.warn(message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) =>
      logger.info(message, { ...defaultContext, ...context }),
    debug: (message: string, context?: LogContext) =>
      logger.debug(message, { ...defaultContext, ...context }),
  };
}
