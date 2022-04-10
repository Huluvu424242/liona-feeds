enum LogLevel {
  ERROR = "error",
  WARNING = "warn",
  DEBUG = "debug",
  INFO = "info",
  LOG = "log"
}

export class LogService {

  protected static isLoggingActive: boolean = true;

  public disableLogging(): void {
    LogService.isLoggingActive = false;
  }

  public enableLogging(): void {
    LogService.isLoggingActive = true;
  }

  public setLogging(enableLogging: boolean) {
    if (enableLogging) {
      this.enableLogging();
    } else {
      this.disableLogging();
    }
  }

  constructor(enableLogging: boolean = true) {
    LogService.isLoggingActive = enableLogging;
  }

  protected log(level: LogLevel, message: string, ...params: any[]) {
    if (console && LogService.isLoggingActive) {
      const methodName:string = level.valueOf();
      // @ts-ignore
      console[methodName](message, ...params);
    }
  }

  public logMessage(message: string, ...params: any[]) {
    this.log(LogLevel.LOG, message, ...params);
  }

  public errorMessage(message: string, ...params: any[]) {
    this.log(LogLevel.ERROR, message, ...params);
  }

  public warnMessage(message: string, ...params: any[]) {
    this.log(LogLevel.WARNING, message, ...params);
  }

  public debugMessage(message: string, ...params: any[]) {
    this.log(LogLevel.DEBUG, message, ...params);
  }

  public infoMessage(message: string, ...params: any[]) {
    this.log(LogLevel.INFO, message, ...params);
  }




}

export const logService: LogService = new LogService();
