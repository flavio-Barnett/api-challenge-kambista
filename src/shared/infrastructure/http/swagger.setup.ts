import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const SWAGGER_PATH = 'docs';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Kambista Exchange API')
    .setDescription('Currency exchange operations between PEN and USD')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth(
      'refresh_token',
      { type: 'apiKey', in: 'cookie', name: 'refresh_token' },
      'refresh_token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document);
}
