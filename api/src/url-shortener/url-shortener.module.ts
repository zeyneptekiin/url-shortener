import { Module } from '@nestjs/common';
import { UrlShortenerController } from './url-shortener.controller';
import { UrlShortenerService } from './url-shortener.service';
import { CouchbaseService } from '../couch-base-adapter/couch-base-adapter.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [UrlShortenerController],
  providers: [UrlShortenerService, CouchbaseService, AuthGuard],
  exports: [UrlShortenerService],
})
export class UrlShortenerModule {}
