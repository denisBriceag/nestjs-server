import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getApplication(): void {
    console.log('Application started');
  }
}
