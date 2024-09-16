import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cluster, Bucket, Collection, DocumentNotFoundError } from 'couchbase';
import { base62Encode, bufferToBigInt } from '../helpers/base62';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CouchbaseService {
  private bucket: Bucket;
  private collection: Collection;
  private logger = new Logger(CouchbaseService.name);

  constructor() {
    this.connect();
  }

  async connect(): Promise<void> {
    try {
      const cluster = await Cluster.connect('couchbase://localhost', {
        username: 'Administrator',
        password: '017985',
      });

      this.bucket = cluster.bucket('doc1');
      const scope = this.bucket.scope('_default');
      this.collection = scope.collection('_default');

      this.logger.log('Connected to Couchbase and collection set');
    } catch (error) {
      this.logger.error('Error connecting to Couchbase:', error);
      throw error;
    }
  }

  async createShortUrl(longUrl: string): Promise<string> {
    try {
      if (!this.collection) {
        this.logger.error('Collection is not initialized');
        await this.connect();
      }

      let existingMapping;
      try {
        existingMapping = await this.collection.get(longUrl);
        return existingMapping.content.shortUrl;
      } catch (err) {
        if (!(err instanceof DocumentNotFoundError)) {
          this.logger.error('Error retrieving long URL mapping:', err);
          throw err;
        }
      }

      let shortUrl: string;
      do {
        shortUrl = this.generateNewShortUrl();
        try {
          await this.collection.get(shortUrl);
        } catch (err) {
          if (err instanceof DocumentNotFoundError) {
            break;
          } else {
            this.logger.error('Error checking short URL:', err);
            throw err;
          }
        }
      } while (true);

      await this.collection.upsert(shortUrl, { longUrl });
      this.logger.log(
        `URL mapping saved successfully with shortUrl: ${shortUrl}`,
      );
      return shortUrl;
    } catch (error) {
      this.logger.error('Error saving URL mapping:', error);
      throw error;
    }
  }

  generateNewShortUrl(): string {
    const uuid = uuidv4();
    const buffer = Buffer.from(uuid.replace(/-/g, ''), 'hex');
    const bigIntId = bufferToBigInt(buffer);
    const base62Id = base62Encode(bigIntId);

    return `www.xxx.com/${base62Id.padStart(7, '0')}`;
  }

  async getLongUrl(shortUrl: string): Promise<string> {
    try {
      if (!shortUrl) {
        throw new HttpException('Short URL parameter is required', 400);
      }

      const result = await this.collection.get(shortUrl);
      return result.content.longUrl;
    } catch (error) {
      if (error instanceof DocumentNotFoundError) {
        this.logger.error(`No mapping found for short URL: ${shortUrl}`);
        throw new NotFoundException(
          `No mapping found for short URL: ${shortUrl}`,
        );
      } else {
        this.logger.error(
          `Error getting long URL for short URL ${shortUrl}: ${error.message}`,
        );
        throw new HttpException(
          `Error retrieving long URL: ${error.message}`,
          500,
        );
      }
    }
  }
}
