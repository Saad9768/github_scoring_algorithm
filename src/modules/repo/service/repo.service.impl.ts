import { Injectable, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ScoreServiceImpl } from '../../score/service/score.service.impl';
import { ConfigService } from '@nestjs/config';
import { RestServiceImpl } from '../../rest/service/rest.service.impl';
import { RepoService } from './repo.service';
import { Utils } from '../../../util';
import { API_RESPONSE, PagingResponse, Repository } from '../model/repo.interface';
import { RepoQueryDto } from '../model/repo.dto';

@Injectable()
@UseInterceptors(CacheInterceptor)
export class RepoServiceImpl implements RepoService {
  constructor(
    private readonly scoreService: ScoreServiceImpl,
    private readonly restService: RestServiceImpl,
    private readonly configService: ConfigService
  ) { }

  async fetchAndScoreRepos({ language, date, sort, order, pageNumber, pageSize }: RepoQueryDto): Promise<PagingResponse<Repository>> {
    const response = await this.callGitHubAPI({ language, date, sort, order, pageNumber, pageSize });

    const repository: Repository[] =
      response.data.items
        .map(({ name, stargazers_count: stars, forks_count: forks, updated_at: lastUpdated, url }) => ({
          name: name,
          stars,
          forks,
          lastUpdated,
          score: this.scoreService.calculateScore(stars, forks, lastUpdated),
          url
        }));
    Utils.sortByKeys(repository, 'score', order === 'asc');
    return {
      inCompleteResult: response.data.incomplete_results,
      totalPages: Math.ceil(response.data.total_count / pageSize),
      totalElementsInPage: repository.length,
      totalElements: response.data.total_count,
      items: repository,
    };
  }

  private callGitHubAPI({ language, date, sort, order, pageNumber, pageSize }: RepoQueryDto) {

    const githubApiUrl = this.configService.get<string>('GITHUB_API_URL');
    const query = `language:${language} created:>${new Date(date).toISOString()}`;
    const url = `${githubApiUrl}?q=${query}&sort=${sort}&order=${order}&page=${pageNumber}&per_page=${pageSize}`;
    const headers = { "X-GitHub-Api-Version": "2022-11-28" }
    return this.restService.get<API_RESPONSE>(url, headers);
  }
}
