import { Controller, Post, Body, Get} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('shorten')
  async shortenUrl(@Body('url') longUrl: string): Promise<string> {
    return this.appService.generateShortUrl(longUrl);
  }

  @Get('longUrl')
  async getUrl(@Body('url') shortUrl: string): Promise<string> {
    return this.appService.getLongUrl(shortUrl);
  }
}
