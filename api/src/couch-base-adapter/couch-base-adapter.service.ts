import { Injectable, OnModuleInit } from '@nestjs/common';
import * as couchbase from 'couchbase';

@Injectable()
export class CouchbaseService implements OnModuleInit {
  private cluster: couchbase.Cluster;
  private bucket: couchbase.Bucket;
  private collection: couchbase.Collection;

  async onModuleInit() {
    this.cluster = new couchbase.Cluster('couchbase://localhost:8091');
    this.bucket = this.cluster.bucket('_default');
    this.collection = this.bucket.defaultCollection();
  }
  getCollection() {
    return this.collection;
  }
}
