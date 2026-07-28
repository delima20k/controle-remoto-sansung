import * as logger from "firebase-functions/logger";

type LogFields = Record<string, unknown>;

export class SecureLogger {
  static info(message: string, fields: LogFields = {}): void {
    logger.info(message, this.sanitize(fields));
  }

  static warn(message: string, fields: LogFields = {}): void {
    logger.warn(message, this.sanitize(fields));
  }

  static error(message: string, fields: LogFields = {}): void {
    logger.error(message, this.sanitize(fields));
  }

  static sanitize(fields: LogFields): LogFields {
    const sanitized: LogFields = {};
    for (const [key, value] of Object.entries(fields)) {
      if (this.isSensitiveKey(key)) {
        sanitized[key] = "[redacted]";
      } else if (value instanceof Error) {
        sanitized[key] = { name: value.name, message: value.message };
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        sanitized[key] = this.sanitize(value as LogFields);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private static isSensitiveKey(key: string): boolean {
    return /token|secret|authorization|password|credential|key/i.test(key);
  }
}
