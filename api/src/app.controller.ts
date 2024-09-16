import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ShortenUrlDto } from './dto/shorten-url.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('shorten')
  shortenUrl(@Body() shortenUrlDto: ShortenUrlDto): { shortUrl: string } {
    const shortUrl = this.appService.shortenUrl(shortenUrlDto.url);
    return { shortUrl };
  }
}
