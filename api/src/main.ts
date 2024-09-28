import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: frontendUrl,
    methods: ['POST', 'GET'],
    allowedHeaders: ['Content-Type'],
  });

  await app.listen(5001);
}
bootstrap();
