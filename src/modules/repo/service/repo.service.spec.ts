import { Test, TestingModule } from '@nestjs/testing';
import { RepoServiceImpl } from './repo.service.impl';
import { ScoreServiceImpl } from '../../score/service/score.service.impl';
import { ConfigService } from '@nestjs/config';
import { RestServiceImpl } from '../../rest/service/rest.service.impl';
import { RepoQueryDto } from '../model/repo.dto';
import { Repository, API_RESPONSE } from '../model/repo.interface';
import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Utils } from '../../../util';
import { Reflector } from '@nestjs/core';

describe('RepoServiceImpl', () => {
  let repoService: RepoServiceImpl;
  let scoreService: ScoreServiceImpl;
  let restService: RestServiceImpl;
  let configService: ConfigService;
  let githubApiUrl: string;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RepoServiceImpl,
        {
          provide: ScoreServiceImpl,
          useValue: {
            calculateScore: jest.fn().mockReturnValue(100),
          },
        },
        {
          provide: RestServiceImpl,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('https://api.github.com/search/repositories'),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        CacheInterceptor,
        Reflector,
      ],
    }).compile();

    repoService = moduleRef.get<RepoServiceImpl>(RepoServiceImpl);
    scoreService = moduleRef.get<ScoreServiceImpl>(ScoreServiceImpl);
    restService = moduleRef.get<RestServiceImpl>(RestServiceImpl);
    configService = moduleRef.get<ConfigService>(ConfigService);
    githubApiUrl = configService.get<string>('GITHUB_API_URL') || ''
  });

  it('should be defined', () => {
    expect(repoService).toBeDefined();
  });

  it('should fetch and score repositories correctly', async () => {

    const query: RepoQueryDto = {
      language: 'JavaScript',
      sort: 'stars',
      order: 'desc',
      date: new Date('2024-02-20'),
      pageNumber: 1,
      pageSize: 10,
    };

    const mockApiResponse: API_RESPONSE = {
      total_count: 2,
      incomplete_results: 0,
      items: [
        {
          name: 'nestjs',
          stargazers_count: 5000,
          forks_count: 300,
          updated_at: new Date('2024-02-19'),
        },
        {
          name: 'express',
          stargazers_count: 6000,
          forks_count: 400,
          updated_at: new Date('2024-02-18'),
        },
      ],
    };

    const mockAxiosResponse: AxiosResponse<API_RESPONSE> = {
      data: mockApiResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {},
        method: 'get',
        url: githubApiUrl,
      } as InternalAxiosRequestConfig,
    };

    const expectedRepositories: Repository[] = [
      { name: 'nestjs', stars: 5000, forks: 300, lastUpdated: new Date('2024-02-19'), score: 100 },
      { name: 'express', stars: 6000, forks: 400, lastUpdated: new Date('2024-02-18'), score: 100 },
    ];

    jest.spyOn(restService, 'get').mockResolvedValue(Promise.resolve(mockAxiosResponse));
    jest.spyOn(Utils, 'sortByKeys').mockImplementation((data) => data);

    const result = await repoService.fetchAndScoreRepos(query);

    expect(restService.get).toHaveBeenCalledWith(
      expect.stringContaining(githubApiUrl),
      { "X-GitHub-Api-Version": "2022-11-28" }
    );

    expect(scoreService.calculateScore).toHaveBeenCalledTimes(2);
    expect(result).toEqual(expectedRepositories);
  });

  it('should call GitHub API with correct URL and headers', async () => {
    const date = new Date('2024-02-15')
    const query: RepoQueryDto = {
      language: 'TypeScript',
      sort: 'forks',
      order: 'asc',
      date,
      pageNumber: 2,
      pageSize: 5,
    };

    const expectedUrl = `${githubApiUrl}?q=language:TypeScript created:>${date.toISOString()}&sort=forks&order=asc&page=2&per_page=5`;

    const mockAxiosResponse: AxiosResponse<API_RESPONSE> = {
      data: { total_count: 0, incomplete_results: 0, items: [] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {},
        method: 'get',
        url: expectedUrl,
      } as InternalAxiosRequestConfig,
    };

    jest.spyOn(restService, 'get').mockResolvedValue(Promise.resolve(mockAxiosResponse));

    await repoService.fetchAndScoreRepos(query);

    expect(restService.get).toHaveBeenCalledWith(expectedUrl, { "X-GitHub-Api-Version": "2022-11-28" });
  });
});
