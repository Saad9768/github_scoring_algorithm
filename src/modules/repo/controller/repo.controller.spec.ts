import { Test, TestingModule } from '@nestjs/testing';
import { RepoController } from './repo.controller';
import { RepoService } from '../service/repo.service';
import { RepoQueryDto } from '../model/repo.dto';
import {  Repository } from '../model/repo.interface';
import { validate } from 'class-validator';
import { RepoServiceImpl } from '../service/repo.service.impl';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';

describe('RepoController', () => {
  let repoController: RepoController;
  let repoService: RepoServiceImpl;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [RepoController],
      providers: [
        {
          provide: RepoServiceImpl,
          useValue: {
            fetchAndScoreRepos: jest.fn().mockResolvedValue({
              nodes: [
                {
                  "name": "react",
                  "url": "https://github.com/facebook/react",
                  "stars": 233118,
                  "forks": 47873,
                  "lastUpdated": "2025-03-11T23:08:08Z",
                  "score": 130945.9
                }
              ], pageInfo: {
                endCursor: "Y3Vyc29yOjEw",
                hasNextPage: true
              }
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

    repoController = moduleRef.get<RepoController>(RepoController);
    repoService = moduleRef.get<RepoServiceImpl>(RepoServiceImpl);
  });

  it('should be defined', () => {
    expect(repoController).toBeDefined();
  });

  it('should call fetchAndScoreRepos with correct parameters and return repositories', async () => {
    const query: RepoQueryDto = {
      language: 'JavaScript',
      sort: 'stars',
      order: 'desc',
      date: new Date('2024-02-20'),
      pageNumber: 1,
      pageSize: 10,
    };

    const mockRepository: Repository[] = [
      {
        "name": "react",
        "url": "https://github.com/facebook/react",
        "stars": 233118,
        "forks": 47873,
        "lastUpdated": new Date("2025-03-11T23:08:08Z"),
        "score": 130945.9
      },
      {
        "name": "bootstrap",
        "url": "https://github.com/twbs/bootstrap",
        "stars": 171742,
        "forks": 79046,
        "lastUpdated": new Date("2025-03-11T22:13:51Z"),
        "score": 109609.8
      }
    ];
    const mockedOutput = {
      nodes: mockRepository,
      pageInfo: {
        endCursor: "Y3Vyc29yOjEw",
        hasNextPage: true
      }
    }
    jest.spyOn(repoService, 'fetchAndScoreRepos').mockResolvedValue(mockedOutput);

    const result = await repoController.getRepositories(query);

    expect(repoService.fetchAndScoreRepos).toHaveBeenCalledWith(query);
    expect(result).toEqual(mockedOutput);
  });

  describe('DTO Validation', () => {
    it('should pass with valid input', async () => {
      const validDto = new RepoQueryDto();
      validDto.language = 'TypeScript';
      validDto.sort = 'stars';
      validDto.order = 'asc';
      validDto.date = new Date('2024-02-20')
      validDto.pageNumber = 1;
      validDto.pageSize = 10;

      const errors = await validate(validDto);
      expect(errors.length).toBe(0);
    });

    it('should fail if language is missing', async () => {
      const invalidDto = new RepoQueryDto();
      invalidDto.sort = 'stars';
      invalidDto.order = 'asc';
      invalidDto.date = new Date('2024-02-20');

      const errors = await validate(invalidDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === 'language')).toBe(true);
    });

    it('should fail if sort is not "stars" or "forks"', async () => {
      const invalidDto = new RepoQueryDto();
      invalidDto.language = 'Python';
      invalidDto.sort = 'invalid';
      invalidDto.order = 'asc';
      invalidDto.date = new Date('2024-02-20');

      const errors = await validate(invalidDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === 'sort')).toBe(true);
    });

    it('should fail if order is not "asc" or "desc"', async () => {
      const invalidDto = new RepoQueryDto();
      invalidDto.language = 'Python';
      invalidDto.sort = 'stars';
      invalidDto.order = 'invalid';
      invalidDto.date = new Date('2024-02-20');

      const errors = await validate(invalidDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === 'order')).toBe(true);
    });

    it('should fail if pageNumber is less than 0', async () => {
      const invalidDto = new RepoQueryDto();
      invalidDto.language = 'Python';
      invalidDto.sort = 'stars';
      invalidDto.order = 'asc';
      invalidDto.date = new Date('2024-02-20');
      invalidDto.pageNumber = -1;

      const errors = await validate(invalidDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === 'pageNumber')).toBe(true);
    });

    it('should fail if pageSize is more than 30', async () => {
      const invalidDto = new RepoQueryDto();
      invalidDto.language = 'Python';
      invalidDto.sort = 'stars';
      invalidDto.order = 'asc';
      invalidDto.date = new Date('2024-02-20');
      invalidDto.pageSize = 50;

      const errors = await validate(invalidDto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === 'pageSize')).toBe(true);
    });
  });
});
