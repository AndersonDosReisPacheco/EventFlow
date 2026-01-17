// src/utils/logger.ts - Versão corrigida
type LogLevel = "error" | "warn" | "info" | "http" | "debug";

class SimpleLogger {
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace("T", " ").substring(0, 23);
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = this.getTimestamp();
    const levelUpper = level.toUpperCase().padEnd(5);
    return `${timestamp} ${levelUpper}: ${message}`;
  }

  error(message: string, ...meta: any[]): void {
    // @ts-ignore
    console.error(this.formatMessage("error", message), ...meta);
  }

  warn(message: string, ...meta: any[]): void {
    // @ts-ignore
    console.warn(this.formatMessage("warn", message), ...meta);
  }

  info(message: string, ...meta: any[]): void {
    // @ts-ignore
    console.info(this.formatMessage("info", message), ...meta);
  }

  http(message: string, ...meta: any[]): void {
    // @ts-ignore
    console.log(this.formatMessage("http", message), ...meta);
  }

  debug(message: string, ...meta: any[]): void {
    // @ts-ignore
    if (process.env.NODE_ENV === "development") {
      // @ts-ignore
      console.debug(this.formatMessage("debug", message), ...meta);
    }
  }
}

const Logger = new SimpleLogger();
export default Logger;
