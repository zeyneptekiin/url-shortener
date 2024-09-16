import { Injectable } from '@nestjs/common';
import { CouchbaseService } from './couch-base-adapter/couch-base-adapter.service';

@Injectable()
export class AppService {
  constructor(private readonly couchbaseService: CouchbaseService) {}

  async generateShortUrl(longUrl: string): Promise<string> {
    return this.couchbaseService.createShortUrl(longUrl);
  }

  async getLongUrl(shortUrl: string): Promise<string> {
    return this.couchbaseService.getLongUrl(shortUrl);
  }
}
