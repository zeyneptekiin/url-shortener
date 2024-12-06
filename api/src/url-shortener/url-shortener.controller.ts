import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';

@Controller()
export class UrlShortenerController {
  constructor(private readonly appService: UrlShortenerService) {}

  @Post('shorten')
  @UseGuards(AuthGuard)
  async shortenUrl(@Body('url') longUrl: string): Promise<string> {
    return this.appService.generateShortUrl(longUrl);
  }

  @Get(':shortUrl')
  async redirectToLongUrl(
    @Param('shortUrl') shortUrl: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const fullShortUrl = `http://usrt.xyz/${shortUrl}`;
      const longUrl = await this.appService.getLongUrl(fullShortUrl);

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
