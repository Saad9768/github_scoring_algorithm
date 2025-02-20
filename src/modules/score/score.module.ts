import { Module } from '@nestjs/common';
import { ScoreServiceImpl } from './service/score.service.impl';

@Module({
  providers: [ScoreServiceImpl],
  exports: [ScoreServiceImpl],
})
export class ScoreModule { }
