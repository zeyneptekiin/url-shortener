import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  shortenUrl(originalUrl: string): string {
    const generatedUuid = uuidv4();
    const shortUrl = `www.xxx.com/${generatedUuid}`;
    return shortUrl;
  }
}
