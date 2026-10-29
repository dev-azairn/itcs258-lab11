import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ConsoleLogger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
      logger: new ConsoleLogger({
      prefix: 'nest-lab',
    }),
  });

  const config = new DocumentBuilder()
                    .setTitle('Hotel Booking System API')
                    .setDescription('Include information about the Room and Booking management APIs, and mention rate limiting (100 requests per minute)')
                    .setVersion('1.0.0')
                    .addTag('rooms')
                    .addTag('bookings')
                    .build();

  const document = SwaggerModule.createDocument(app, config); // OpenAPI doc
  SwaggerModule.setup('api', app, document); 

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
