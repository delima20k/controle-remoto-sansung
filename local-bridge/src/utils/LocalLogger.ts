type Fields = Record<string, unknown>;

export class LocalLogger {
  info(message: string, fields: Fields = {}): void {
    this.write("info", message, fields);
  }

  warn(message: string, fields: Fields = {}): void {
    this.write("warn", message, fields);
  }

  error(message: string, fields: Fields = {}): void {
    this.write("error", message, fields);
  }

  private write(level: "info" | "warn" | "error", message: string, fields: Fields): void {
    const safeFields = this.sanitize(fields);
    process.stdout.write(`${JSON.stringify({ level, message, ...safeFields, time: new Date().toISOString() })}\n`);
  }

  private sanitize(fields: Fields): Fields {
    const safe: Fields = {};
    for (const [key, value] of Object.entries(fields)) {
      safe[key] = /token|secret|password|key|credential/i.test(key) ? "[redacted]" : value;
    }
    return safe;
  }
}
