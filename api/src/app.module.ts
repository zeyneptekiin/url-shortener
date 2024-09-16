import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CouchbaseService } from './couch-base-adapter/couch-base-adapter.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, CouchbaseService],
})
export class AppModule {}
