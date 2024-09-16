import { Injectable, Logger } from '@nestjs/common';
import { Cluster, Bucket, Collection } from 'couchbase';

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

  async saveUrlMapping(shortUrl: string, longUrl: string): Promise<void> {
    try {
      if (!this.collection) {
        this.logger.error('Collection is not initialized');
        await this.connect();
      }

      await this.collection.upsert(shortUrl, { longUrl });
      this.logger.log('URL mapping saved successfully');
    } catch (error) {
      this.logger.error('Error saving URL mapping:', error);
      throw error;
    }
  }
}
