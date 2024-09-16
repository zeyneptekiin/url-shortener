import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('shorten')
  async shortenUrl(@Body('url') longUrl: string): Promise<string> {
    return this.appService.generateShortUrl(longUrl);
  }

  @Get('longUrl')
  async getLongUrl(@Query('shortUrl') shortUrl: string): Promise<string> {
    if (!shortUrl) {
      throw new Error('Short URL parameter is required');
    }
    console.log('Received shortUrl:', shortUrl);
    return this.appService.getLongUrl(shortUrl);
  }
}
