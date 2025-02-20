import { Module } from '@nestjs/common';
import { RestServiceImpl } from './service/rest.service.impl';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    })
  ],
  providers: [RestServiceImpl],
  exports: [RestServiceImpl],
})
export class RestModule { }
