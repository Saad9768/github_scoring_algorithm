import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnHandledException } from './filter/unhandled-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['log', 'error', 'warn']
        : ['log', 'debug', 'error', 'verbose', 'warn'],
  });
  app.useGlobalFilters(new UnHandledException());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
