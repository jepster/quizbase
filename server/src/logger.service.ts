import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
  log(message: string, ...optionalParams: any[]): void {
    console.log(message, ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]): void {
    console.warn(message, ...optionalParams);
  }

  error(message: string, ...optionalParams: any[]): void {
    console.error(message, ...optionalParams);
  }
}
