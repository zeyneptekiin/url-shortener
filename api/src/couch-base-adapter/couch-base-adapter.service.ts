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
  cluster: Cluster;
  private bucket: Bucket;
  private collection: Collection;
  private logger = new Logger(CouchbaseService.name);

  constructor() {
    this.connect();
  }

  async connect(): Promise<void> {
    try {
      this.cluster = await Cluster.connect('couchbase://172.18.0.2', {
        username: 'Administrator',
        password: '017985',
      });

      await this.createBucketIfNotExists('doc1');
      this.bucket = this.cluster.bucket('doc1');
      const scope = this.bucket.scope('_default');
      this.collection = scope.collection('_default');

      this.logger.log('Connected to Couchbase and collection set');
    } catch (error) {
      this.logger.error('Error connecting to Couchbase:', error);
      throw error;
    }
  }

  private async createBucketIfNotExists(bucketName: string): Promise<void> {
    try {
      const bucketManager = this.cluster.buckets();
      const existingBuckets = await bucketManager.getAllBuckets();

      const bucketExists = existingBuckets.some(
        (bucket) => bucket.name === bucketName,
      );

      if (!bucketExists) {
        await bucketManager.createBucket({
          name: bucketName,
          ramQuotaMB: 100,
        });
        this.logger.log(`Bucket "${bucketName}" created successfully.`);
      } else {
        this.logger.log(`Bucket "${bucketName}" already exists.`);
      }
    } catch (error) {
      this.logger.error('Error creating bucket:', error);
    }
  }

  async createShortUrl(longUrl: string): Promise<string> {
    try {
      if (!this.collection) {
        this.logger.error('Collection is not initialized');
        await this.connect();
      }

      const query = `SELECT shortUrl FROM \`doc1\` WHERE longUrl = $1 LIMIT 1`;
      const result = await this.cluster.query(query, { parameters: [longUrl] });

      if (result.rows.length > 0) {
        return result.rows[0].shortUrl;
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

      await this.collection.upsert(shortUrl, {
        clickCounter: 0,
        longUrl,
        shortUrl,
      });
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
    const shortenedBase62Id = base62Id.slice(0, 7);

    return `www.shrt.com/${shortenedBase62Id}`;
  }

  async getLongUrl(shortUrl: string): Promise<string> {
    try {
      if (!shortUrl) {
        throw new HttpException('Short URL parameter is required', 400);
      }

      const selectQuery = `
        SELECT longUrl, clickCounter
        FROM \`doc1\`
        WHERE shortUrl = $1
        LIMIT 1;
        `;

      const selectResult = await this.cluster.query(selectQuery, {
        parameters: [shortUrl],
      });

      if (selectResult.rows.length === 0) {
        throw new NotFoundException(
          `No mapping found for short URL: ${shortUrl}`,
        );
      }

      const { longUrl, clickCounter } = selectResult.rows[0];

      const formattedLongUrl = longUrl.startsWith('http')
        ? longUrl
        : `http://${longUrl}`;

      const updateQuery = `
        UPDATE \`doc1\`
        SET clickCounter = $1
        WHERE shortUrl = $2;
        `;

      await this.cluster.query(updateQuery, {
        parameters: [clickCounter + 1, shortUrl],
      });

      return formattedLongUrl;
    } catch (error) {
      throw new HttpException(
        `Error retrieving long URL: ${error.message}`,
        500,
      );
    }
  }
}
