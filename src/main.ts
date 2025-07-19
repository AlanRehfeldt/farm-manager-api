import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ConfigService } from '@nestjs/config';
import { Env } from './env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('NestJS Farm Manager API')
    .setDescription('Rest API for Farm Manager')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/swagger', app, document);

  app.use(
    '/docs',
    apiReference({
      theme: 'kepler',
      hideModels: true,
      spec: {
        content: document,
      },
      metaData: {
        title: 'Master data API docs',
      },
    }),
  );

  const configService = app.get<ConfigService<Env, true>>(ConfigService);
  const port = configService.get('SERVER_PORT', { infer: true });

  await app.listen(port);
}
bootstrap();
