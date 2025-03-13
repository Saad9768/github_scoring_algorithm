import { Controller, Get, InternalServerErrorException, Query, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { RepoQueryDto } from '../model/repo.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { RepoServiceImpl } from '../service/repo.service.impl';
import { seconds } from '@nestjs/throttler';

@UseInterceptors(CacheInterceptor)
@Controller('repos')
export class RepoController {
  constructor(private readonly repoService: RepoServiceImpl) { }

  @Get()
  @CacheTTL(seconds(90))
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRepositories(@Query() query: RepoQueryDto) {
    try {
      return this.repoService.fetchAndScoreRepos(query);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
