import { Test, TestingModule } from '@nestjs/testing';
import { RepoController } from './repo.controller';
import { RepoService } from '../service/repo.service';
import { RepoQueryDto } from '../model/repo.dto';
import { Repository } from '../model/repo.interface';
import { validate } from 'class-validator';
import { RepoServiceImpl } from '../service/repo.service.impl';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';

describe('RepoController', () => {
  let repoController: RepoController;
  let repoService: RepoService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [RepoController],
      providers: [
        {
          provide: RepoServiceImpl,
          useValue: {
            fetchAndScoreRepos: jest.fn().mockResolvedValue([
              { name: 'nestjs', stars: 1000, forks: 500, lastUpdated: '2024-02-19', score: 95 },
            ]),
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

    const mockResponse: Repository[] = [
      { name: 'nestjs', stars: 5000, forks: 300, lastUpdated: new Date('2024-02-19'), score: 95 },
      { name: 'express', stars: 6000, forks: 400, lastUpdated: new Date('2024-02-18'), score: 97 },
    ];

    jest.spyOn(repoService, 'fetchAndScoreRepos').mockResolvedValue(mockResponse);

    const result = await repoController.getRepositories(query);

    expect(repoService.fetchAndScoreRepos).toHaveBeenCalledWith(query);
    expect(result).toEqual(mockResponse);
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

    it('should fail if pageNumber is less than 1', async () => {
      const invalidDto = new RepoQueryDto();
      invalidDto.language = 'Python';
      invalidDto.sort = 'stars';
      invalidDto.order = 'asc';
      invalidDto.date = new Date('2024-02-20');
      invalidDto.pageNumber = 0;

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
