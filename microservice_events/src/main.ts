import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Enable CORS for gateway and frontend access
  app.enableCors({
    origin: ['http://localhost:8085', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*',
    credentials: true,
  });

  // Build the OpenAPI document
  const config = new DocumentBuilder()
    .setTitle('Events Service API')
    .setDescription('API de gestion des événements — microservice NestJS (port 3000)')
    .setVersion('1.0')
    .addTag('events', 'Gestion des événements')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // NestJS Swagger UI — accessible directement sur ce service
  SwaggerModule.setup('api', app, document);

  // Expose OpenAPI JSON at /v3/api-docs for Spring Cloud Gateway aggregation
  // This makes the SpringDoc gateway proxy route work seamlessly
  const express = app.getHttpAdapter().getInstance();
  express.get('/v3/api-docs', (_req, res) => {
    res.json(document);
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Events Service running on: http://localhost:${port}`);
  console.log(`Swagger UI:  http://localhost:${port}/api`);
  console.log(`OpenAPI JSON (gateway-compatible): http://localhost:${port}/v3/api-docs`);
}
bootstrap();
