import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: ['POST', 'GET'],
    allowedHeaders: ['Content-Type'],
  });

  await app.listen(3000);
}
bootstrap();
