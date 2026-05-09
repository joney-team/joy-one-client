import {
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { flattenValidationErrors, PayloadException } from './app.exceptions';
import { logger, loggerBootstrap } from './app.logger';
import { AppModule } from './app.module';
import { configs, configLogs, PORT } from './config/config';
import { langBootstrap } from './lang/lang.bootstrap';

async function bootstrap() {
  configLogs();

  loggerBootstrap();

  await langBootstrap();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn'],
  });

  app.set('query parser', 'extended');
  app.enableCors();
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new PayloadException(
          errors.reduce((acc, cur) => {
            acc[cur.property] = Object.values(
              flattenValidationErrors([cur]),
            ).join(', ');
            return acc;
          }, {}),
        );
      },
    }),
  );

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // ======================= Swagger =======================
  const swaggerConfig = new DocumentBuilder()
    .setTitle(configs.APP_NAME.replace(/_/g, ' ').toUpperCase())
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    customSiteTitle: 'Document APIs',
  });

  await app.listen(PORT);
  logger.info(`Server is running: ${configs.API_URL}`);
}

bootstrap();
