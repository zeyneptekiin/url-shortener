import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { base62Encode, bufferToBigInt } from './helpers/base62';
import { CouchbaseService } from './couch-base-adapter/couch-base-adapter.service';

@Injectable()
export class AppService {
  constructor(private readonly couchbaseService: CouchbaseService) {}

  async generateShortUrl(longUrl: string): Promise<string> {
    const uuid = uuidv4();
    const buffer = Buffer.from(uuid.replace(/-/g, ''), 'hex');
    const bigIntId = bufferToBigInt(buffer);
    const base62Id = base62Encode(bigIntId);

    const shortUrl = `www.xxx.com/${base62Id.padStart(7, '0')}`;

    await this.couchbaseService.createShortUrl(uuid, shortUrl, longUrl);

    return shortUrl;
  }

  async getLongUrl(shortUrl: string): Promise<string> {
    const longUrl = await this.couchbaseService.getLongUrl(shortUrl);
    return longUrl;
  }
}
