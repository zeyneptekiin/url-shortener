import { Global, Module } from '@nestjs/common';
import { CouchbaseService } from './couch-base-adapter.service';

@Global()
@Module({
  providers: [CouchbaseService],
  exports: [CouchbaseService],
})
export class CouchBaseAdapterModule {}
