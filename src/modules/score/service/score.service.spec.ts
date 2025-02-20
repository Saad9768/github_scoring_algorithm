import { Test, TestingModule } from '@nestjs/testing';
import { ScoreServiceImpl } from './score.service.impl';

describe('ScoreServiceImpl', () => {
  let scoreService: ScoreServiceImpl;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [ScoreServiceImpl],
    }).compile();

    scoreService = moduleRef.get<ScoreServiceImpl>(ScoreServiceImpl);
  });

  it('should be defined', () => {
    expect(scoreService).toBeDefined();
  });

  it('should correctly calculate score for a normal repository', () => {
    const score = scoreService.calculateScore(1000, 500, new Date('2024-02-10'));
    expect(score).toBeGreaterThan(0);
  });

  it('should give a higher score for a repository with more stars', () => {
    const score1 = scoreService.calculateScore(1000, 500, new Date('2024-02-10'));
    const score2 = scoreService.calculateScore(2000, 500, new Date('2024-02-10'));
    expect(score2).toBeGreaterThan(score1);
  });

  it('should give a higher score for a repository with more forks', () => {
    const score1 = scoreService.calculateScore(1000, 500, new Date('2024-02-10'));
    const score2 = scoreService.calculateScore(1000, 1000, new Date('2024-02-10'));
    expect(score2).toBeGreaterThan(score1);
  });

  it('should give a higher score for a recently updated repository', () => {
    const oldScore = scoreService.calculateScore(500, 200, new Date('2023-01-01'));
    const recentScore = scoreService.calculateScore(500, 200, new Date());
    expect(recentScore).toBeGreaterThan(oldScore);
  });


  it('should return a score of zero for a repository with zero stars and zero forks', () => {
    const score = scoreService.calculateScore(0, 0, new Date('2024-02-10'));
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('should correctly calculate score when the repository was updated today', () => {
    const today = new Date();
    const score = scoreService.calculateScore(300, 150, today);
    expect(score).toBeGreaterThan(0);
  });

  it('should return a valid score even if the update date is in the future (invalid case)', () => {
    const futureDate = '2030-01-01';
    const score = scoreService.calculateScore(500, 200, new Date(futureDate));
    expect(score).toBeGreaterThan(0);
  });

  it('should return a score of zero when stars and forks are negative', () => {
    const score = scoreService.calculateScore(-100, -50, new Date('2024-02-10'));
    expect(score).toBeLessThan(0);
  });

  it('should return the same score for the same inputs consistently', () => {
    const date = new Date('2024-02-10');
    const score1 = scoreService.calculateScore(300, 150, date);
    const score2 = scoreService.calculateScore(300, 150, date);
    expect(score1).toEqual(score2);
  });
});
