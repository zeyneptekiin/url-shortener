import { Injectable, Logger } from '@nestjs/common';
import { CouchbaseService } from './couch-base-adapter/couch-base-adapter.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly couchbaseService: CouchbaseService) {}

  async generateShortUrl(longUrl: string): Promise<string> {
    return this.couchbaseService.createShortUrl(longUrl);
  }

  async getLongUrl(shortUrl: string): Promise<string> {
    return this.couchbaseService.getLongUrl(shortUrl);
  }

  @Cron('*/5 * * * *')
  async checkHealth() {
    try {
      this.logger.log('Health check running...');

      const isCouchbaseHealthy = await this.checkCouchbaseHealth();

      if (isCouchbaseHealthy) {
        this.logger.log('Couchbase is healthy');
      } else {
        this.logger.error(
          'Couchbase is not healthy, please check the connection.',
        );
      }
    } catch (error) {
      this.logger.error('Health check failed:', error);
    }
  }

  private async checkCouchbaseHealth(): Promise<boolean> {
    try {
      await this.couchbaseService.cluster.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('Couchbase health check failed:', error);
      return false;
    }
  }
}
