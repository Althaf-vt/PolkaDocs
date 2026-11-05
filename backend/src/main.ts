import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AppExceptionFilter } from './common/filters/app-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Set global API prefix matching the v1 specification
  app.setGlobalPrefix('api/v1');

  // Enforce global request validation rules
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Attach standardized exception filter
  app.useGlobalFilters(new AppExceptionFilter());

  // Configure CORS
  const corsOrigin = configService.get<string>('cors.origin') || 'http://localhost:5173';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);
}
bootstrap();