import { Test, TestingModule } from '@nestjs/testing';
import { RepoServiceImpl } from './repo.service.impl';
import { ScoreServiceImpl } from '../../score/service/score.service.impl';
import { ConfigService } from '@nestjs/config';
import { RestServiceImpl } from '../../rest/service/rest.service.impl';
import { RepoQueryDto } from '../model/repo.dto';
import { Repository, GraphQLResponse, RESPONSE_ITEMS } from '../model/repo.interface';
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
  let githubApiToken: string;


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
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GITHUB_API_GRAPH_URL') return 'https://api.github.com/graphql';
              if (key === 'GITHUB_TOKEN') return '';
              return null;
            }),
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
    githubApiUrl = configService.get<string>('GITHUB_API_GRAPH_URL') || '';
    githubApiToken = configService.get<string>('GITHUB_TOKEN') || '';
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

    const mockGraphQLResponse: AxiosResponse<GraphQLResponse<RESPONSE_ITEMS>> = {
      data: {
        data: {
          search: {
            nodes: [
              {
                name: 'nestjs',
                stargazerCount: 5000,
                forkCount: 300,
                updatedAt: new Date('2024-02-19'),
                url: 'https://github.com/sassanix/Warracker',
              },
              {
                name: 'express',
                stargazerCount: 6000,
                forkCount: 400,
                updatedAt: new Date('2024-02-18'),
                url: 'https://github.com/Rfym21/Qwen2API',
              },
            ],
            pageInfo: {
              endCursor: 'Y3Vyc29yOjEw',
              hasNextPage: true,
            },
            repositoryCount: 53442875,
            totalPages: 1781430
          },
        },
        errors: [],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    const expectedRepositories: Repository[] = [
      {
        name: 'nestjs',
        stars: 5000,
        forks: 300,
        lastUpdated: new Date('2024-02-19'),
        score: 100,
        url: 'https://github.com/sassanix/Warracker',
      },
      {
        name: 'express',
        stars: 6000,
        forks: 400,
        lastUpdated: new Date('2024-02-18'),
        score: 100,
        url: 'https://github.com/Rfym21/Qwen2API',
      },
    ];

    const mockedOutput = {
      nodes: expectedRepositories,
      pageInfo: {
        endCursor: 'Y3Vyc29yOjEw',
        hasNextPage: true,
      },
      repositoryCount: 53442875,
      totalPages: 5344288,
    };

    jest.spyOn(restService, 'post').mockResolvedValue(mockGraphQLResponse);
    jest.spyOn(Utils, 'sortByKeys').mockImplementation((data) => data);

    const result = await repoService.fetchAndScoreRepos(query);

    expect(restService.post).toHaveBeenCalledWith(
      githubApiUrl,
      { query: expect.any(String) }, expect.objectContaining({
        Authorization: expect.stringMatching(/^Bearer /),
        'Content-Type': 'application/json',
      })
    );

    expect(scoreService.calculateScore).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockedOutput);
  });

  it('should call GitHub API with correct URL and headers', async () => {
    const date = new Date('2024-02-15');
    const query: RepoQueryDto = {
      language: 'javascript,java',
      sort: 'forks',
      order: 'asc',
      date,
      pageNumber: 2,
      pageSize: 5,
    };

    const expectedQuery = `query {
      search(
        query: "language:javascript,java,+created:>2024-02-15T00:00:00.000Z&sort=forks&order=asc"
        type: REPOSITORY
        first: 5, after: "Y3Vyc29yOjU="
      ) {
        repositoryCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          ... on Repository {
            name
            url
            stargazerCount
            forkCount
            updatedAt
          }
        }
      }
    }`.replace(/\s+/g, ' ').trim();


    const mockGraphQLResponse: AxiosResponse<GraphQLResponse<RESPONSE_ITEMS>> = {
      data: {
        data: {
          search: {
            nodes: [],
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
            repositoryCount: 0,
            totalPages: 0
          },
        },
        errors: [],
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    jest.spyOn(restService, 'post').mockResolvedValue(mockGraphQLResponse);

    await repoService.fetchAndScoreRepos(query);

    expect(restService.post).toHaveBeenCalledWith(githubApiUrl, { query: expectedQuery }, expect.objectContaining({
      Authorization: expect.stringMatching(/^Bearer /),
      'Content-Type': 'application/json',
    }));
  });
});
