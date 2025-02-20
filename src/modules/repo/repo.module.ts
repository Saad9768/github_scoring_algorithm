import { Module } from '@nestjs/common';
import { RepoServiceImpl } from './service/repo.service.impl';
import { RepoController } from './controller/repo.controller';
import { ScoreModule } from '../score/score.module';
import { RestModule } from '../rest/rest.module';

@Module({
  imports: [
    ScoreModule,
    RestModule
  ],
  controllers: [RepoController],
  providers: [RepoServiceImpl],
})
export class RepoModule { }
