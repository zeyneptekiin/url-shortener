import { Controller, Post, Body, Get, Res, Param } from '@nestjs/common';
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
    @Param('shortUrl') shortUrl: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const longUrl = await this.appService.getLongUrl(shortUrl);

      if (longUrl) {
        return res.redirect(longUrl);
      } else {
        res.status(404).send('URL not found');
      }
    } catch (error) {
      console.error(`Error redirecting short URL: ${shortUrl}`, error);
      res.status(500).send('Internal server error');
    }
  }

  @Get('health')
  async health() {
    return this.appService.healthCheck();
  }
}
