import { Controller, Get, Query, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { RepoQueryDto } from '../model/repo.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { RepoServiceImpl } from '../service/repo.service.impl';

@Controller('repos')
export class RepoController {
  constructor(private readonly repoService: RepoServiceImpl) { }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRepositories(@Query() query: RepoQueryDto) {
    return this.repoService.fetchAndScoreRepos(query);
  }
}
