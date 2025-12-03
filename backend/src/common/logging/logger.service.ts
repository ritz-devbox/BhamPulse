import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console({
          level: process.env.LOG_LEVEL || 'debug',
        }),
      ],
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, context }) => {
          return `${timestamp} [${level}]${context ? ' [' + context + ']' : ''} ${message}`;
        })
      ),
    });
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { context, trace });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug?(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose?(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }
}
