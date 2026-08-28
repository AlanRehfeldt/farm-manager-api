import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { Env } from './env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<Env, true>>(ConfigService);

  app.use(cookieParser());

  app.enableCors({
    origin: configService.get('CORS_ORIGIN', { infer: true }),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('NestJS Farm Manager API')
    .setDescription(
      'REST API for Farm Manager. Authentication uses httpOnly cookies (access + refresh); send credentials on cross-origin requests.',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/swagger', app, document);

  app.use(
    '/docs',
    apiReference({
      theme: 'kepler',
      hideModels: true,
      content: document,
      metaData: {
        title: 'Farm Manager API docs',
      },
    }),
  );

  const port = configService.get('SERVER_PORT', { infer: true });

  await app.listen(port);
}
void bootstrap();
