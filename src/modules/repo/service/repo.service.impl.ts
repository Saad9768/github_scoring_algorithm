import { Injectable, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ScoreServiceImpl } from '../../score/service/score.service.impl';
import { ConfigService } from '@nestjs/config';
import { RestServiceImpl } from '../../rest/service/rest.service.impl';
import { RepoService } from './repo.service';
import { Utils } from '../../../util';
import { GraphQLResponse, RESPONSE_ITEMS, Repository } from '../model/repo.interface';
import { RepoQueryDto } from '../model/repo.dto';
import { AxiosHeaders } from 'axios';

@Injectable()
@UseInterceptors(CacheInterceptor)
export class RepoServiceImpl implements RepoService {
  constructor(
    private readonly scoreService: ScoreServiceImpl,
    private readonly restService: RestServiceImpl,
    private readonly configService: ConfigService
  ) { }

  async fetchAndScoreRepos({ language, date, sort, order, pageNumber, pageSize }: RepoQueryDto) {
    const response = await this.callGitHubAPIGraphQL({ language, date, sort, order, pageNumber, pageSize });
    const repository: Repository[] =
      response.nodes
        .map(({ name, stargazerCount: stars, forkCount: forks, updatedAt: lastUpdated, url }) => ({
          name,
          url,
          stars,
          forks,
          lastUpdated,
          score: this.scoreService.calculateScore(stars, forks, lastUpdated),
        }));
    Utils.sortByKeys(repository, 'score', order === 'asc');
    return {
      nodes: repository,
      pageInfo: response.pageInfo,
      repositoryCount: response.repositoryCount,
      totalPages: Math.ceil(response.repositoryCount / pageSize)
    };
  }

  private async callGitHubAPIGraphQL({ language, date, sort, order, pageNumber, pageSize }: RepoQueryDto) {
    const githubApiUrlGraphQL = this.configService.get<string>('GITHUB_API_GRAPH_URL') || '';
    const fieldSelections = ['name', 'url', 'stargazerCount', 'forkCount', 'updatedAt'].map((field) => field).join('\n');
    const query = `language:${language},+created:>${new Date(date).toISOString()}&sort=${sort}&order=${order}`;

    const afterCursor =
      pageNumber > 1
        ? `, after: "${btoa(`cursor:${(pageNumber - 1) * pageSize}`)}" `
        : '';

    const graphqlQuery = `query {
          search(
            query: "${query}"
            type: REPOSITORY
            first: ${pageSize}${afterCursor}
          ) {
            repositoryCount
            pageInfo {
              endCursor
              hasNextPage
            }
            nodes {
              ... on Repository {
                ${fieldSelections}
              }
            }
          }
        }`.replace(/\s+/g, ' ').trim();

    const token = this.configService.get<string>('GITHUB_TOKEN') || '';
    const headers = new AxiosHeaders();
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');
    const { data } = await this.restService.post<GraphQLResponse<RESPONSE_ITEMS>>(githubApiUrlGraphQL, { query: graphqlQuery }, headers)
    return { nodes: data.data.search.nodes, pageInfo: data.data.search.pageInfo, repositoryCount: data.data.search.repositoryCount };
  }

}
