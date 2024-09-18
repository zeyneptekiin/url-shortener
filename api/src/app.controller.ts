import { Controller, Post, Body, Get, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('shorten')
  async shortenUrl(@Body('url') longUrl: string): Promise<string> {
    return this.appService.generateShortUrl(longUrl);
  }

  @Get(':shortUrl')
  async redirectToLongUrl(
    @Query('shortUrl') shortUrl: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const longUrl = await this.appService.getLongUrl(shortUrl);
      return res.redirect(longUrl);
    } catch (error) {
      res.status(404).send('URL not found');
    }
  }
}
