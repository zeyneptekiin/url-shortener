import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Cluster, Bucket, Collection, DocumentNotFoundError } from 'couchbase';
import { base62Encode, bufferToBigInt } from '../helpers/base62';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CouchbaseService implements OnModuleInit {
  cluster: Cluster;
  private bucket: Bucket;
  private collection: Collection;
  private readonly logger = new Logger(CouchbaseService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  public async connect(): Promise<void> {
    try {
      const connectionUrl = this.configService.get<string>('COUCHBASE_URL');
      const userName = this.configService.get<string>('COUCHBASE_USERNAME');
      const password = this.configService.get<string>('COUCHBASE_PASSWORD');

      this.logger.log(`Connecting to Couchbase with URL: ${connectionUrl}`);

      this.cluster = await Cluster.connect(connectionUrl, {
        username: userName,
        password: password,
      });

      this.logger.log(`Connected to Couchbase successfully.`);

      this.bucket = this.cluster.bucket('doc1');
      const scope = this.bucket.scope('_default');
      this.collection = scope.collection('_default');

      this.logger.log('Couchbase collection initialized.');
    } catch (error) {
      this.logger.error('Error connecting to Couchbase:', error.message);
      throw new HttpException('Couchbase connection failed', 500);
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

  private generateNewShortUrl(): string {
    const uuid = uuidv4();
    const buffer = Buffer.from(uuid.replace(/-/g, ''), 'hex');
    const bigIntId = bufferToBigInt(buffer);
    const base62Id = base62Encode(bigIntId);
    const shortenedBase62Id = base62Id.slice(0, 7);

    return `https://usrt.xyz/${shortenedBase62Id}`;
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
      this.logger.error('Error retrieving long URL:', error);
      throw new HttpException(
        `Error retrieving long URL: ${error.message}`,
        500,
      );
    }
  }
}
