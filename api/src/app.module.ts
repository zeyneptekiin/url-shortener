import { Module } from '@nestjs/common';
import { UrlShortenerController } from './url-shortener/url-shortener.controller';
import { UrlShortenerService } from './url-shortener/url-shortener.service';
import { CouchbaseService } from './couch-base-adapter/couch-base-adapter.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { config } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [UrlShortenerController],
  providers: [UrlShortenerService, CouchbaseService],
})
export class AppModule {}
