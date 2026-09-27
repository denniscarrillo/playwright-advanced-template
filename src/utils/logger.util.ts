import { createRequire } from 'module';
import env from '@/../env.config';

const require = createRequire(import.meta.url);
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const { combine, timestamp, printf, colorize, errors, uncolorize } = winston.format;

// Worker identifier from Playwright environment
const workerIndex = process.env.TEST_PARALLEL_INDEX ?? process.env.TEST_WORKER_INDEX ?? 'main';
const workerTag = `W#${workerIndex}`;

// Custom format for console and file outputs
const logFormat = printf(({ timestamp, level, message, stack, context }: { timestamp: string; level: string; message: string; stack?: string; context?: string }) => {
  const contextLabel = context ? ` [${context}]` : '';
  const logMessage = stack || message;
  return `${timestamp} [${level}] [${workerTag}]${contextLabel}: ${logMessage}`;
});

// Daily rotate file transport dedicated per worker (avoids OS file-lock race conditions)
const workerFileRotateTransport = new DailyRotateFile({
  filename: `logs/workers/worker-${workerIndex}-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: combine(
    uncolorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
});

// Daily rotate file transport for errors per worker
const errorFileRotateTransport = new DailyRotateFile({
  filename: `logs/errors/error-worker-${workerIndex}-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: combine(
    uncolorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
});

// Base logger configuration
export const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
    }),
    workerFileRotateTransport,
    errorFileRotateTransport,
  ],
});

/**
 * Creates a child logger with a specific context (e.g. project name, test title, class or component name)
 */
export const createLogger = (context: string) => {
  return logger.child({ context });
};

export type Logger = typeof logger;
